import React, { useEffect, useState } from "react";
import {
  FaTimes,
  FaTrash,
  FaCopy,
} from "react-icons/fa";
import { formatDistanceToNowStrict, format } from "date-fns";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../contexts/AuthContext";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  addDoc,
} from "firebase/firestore";

const UserOrdersModal = ({ onClose }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [codesMap, setCodesMap] = useState({});
  const [forceUpdate, setForceUpdate] = useState(0);

  useEffect(() => {
    if (!user) return;
    console.log("logged in user email", user?.email)

    const fetchOrdersAndCodes = async () => {
      const q = query(
        collection(db, "orders"),
        where("email", "==", user.email)
      );
      const snapshot = await getDocs(q);
      console.log("orders fetched", snapshot.docs.length);
      snapshot.docs.forEach((doc) => console.log(doc.data()))
      const fetchedOrders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        
      }));
      setOrders(fetchedOrders);

      const codesQuery = query(
        collection(db, "codes"),
        where("userId", "==", user.uid)
      );
      const codesSnapshot = await getDocs(codesQuery);
      const map = {};
      codesSnapshot.forEach((doc) => {
        const data = doc.data();
        map[data.itemId] = data.code;
      });
      setCodesMap(map);
    };

    fetchOrdersAndCodes();
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => setForceUpdate((f) => f + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-700 font-semibold";
      case "pending":
        return "bg-yellow-100 text-yellow-800 font-semibold";
      case "on the way":
        return "bg-blue-100 text-blue-800 font-semibold";
      case "rejected":
        return "bg-red-100 text-red-700 font-semibold";
      case "delivered":
        return "bg-green-500 text-white font-semibold";
      default:
        return "bg-white text-black";
    }
  };

  const generateUniqueCode = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  };

 const handleDeleteItem = async (orderId) => {
   await deleteDoc(doc(db, "orders", orderId));
   setOrders((prev) => prev.filter((o) => o.id !== orderId));
   
 };

  const handleGenerateCode = async (orderId, itemKey) => {
    const uniqueCode = generateUniqueCode();
    try {
      await addDoc(collection(db, "codes"), {
        code: uniqueCode,
        userId: user.uid,
        orderId,
        itemId: itemKey,
        createdAt: new Date(),
      });

      await updateDoc(doc(db, "orders", orderId), {
        customerSeen: "yes",
      });

      setCodesMap((prev) => ({
        ...prev,
        [itemKey]: uniqueCode,
      }));
    } catch (err) {
      console.error("Failed to generate code or update customerSeen:", err);
    }
  };

  const handleCopy = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      alert("Code copied to clipboard!");
    } catch (err) {
      alert("Failed to copy code.");
    }
  };

  const renderETA = (etaTimestamp) => {
    const now = new Date();
    const etaDate = etaTimestamp?.toDate?.();
    if (!etaDate || etaDate < now) return "Your package is here!";
    return formatDistanceToNowStrict(etaDate, { addSuffix: true });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-start pt-20 z-50 overflow-y-auto">
      <div className="bg-white max-w-6xl w-full max-h-[90vh] overflow-x-auto rounded-lg shadow-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-red-500 hover:text-red-700"
        >
          <FaTimes size={18} />
        </button>

        <h2 className="text-2xl font-bold mb-4 text-center">My Orders</h2>

        {orders.length === 0 ? (
          <p className="text-center text-black font-bold">
            You have no orders yet.
          </p>
        ) : (
          <table className="w-full table-auto border-collapse text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Item</th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Price</th>
                <th className="p-2 border">Item status</th>
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Delivery status</th>
                <th className="p-2 border">Code</th>
                <th className="p-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const codeExists = codesMap[order.id];
                const isDelivered =
                  order.deliveryStatus?.toLowerCase() === "delivered";

                return (
                  <tr key={order.id} className="border-t">
                    <td className="p-2 border">
                      <a
                        href={order.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src={order.imageUrl}
                          alt={order.name}
                          className="w-16 h-16 object-cover rounded hover:scale-105 transition"
                        />
                      </a>
                    </td>
                    <td className="p-2 border">{order.name}</td>
                    <td className="p-2 border">
                      ₦{Number(order.price).toLocaleString()}
                    </td>
                    <td
                      className={`p-2 border text-sm font-medium ${
                        order.status?.toLowerCase() === "out of stock"
                          ? "text-red-600"
                          : order.status?.toLowerCase() === "available"
                          ? "text-green-700"
                          : "text-gray-600"
                      }`}
                    >
                      {order.status || "N.A"}
                    </td>
                    <td className="p-2 border text-xs text-gray-600">
                      {order.orderedAt?.toDate
                        ? format(order.orderedAt.toDate(), "PPP p")
                        : "N/A"}
                    </td>
                    <td className="p-2 border text-center">
                      {order.deliveryStatus?.toLowerCase() === "on the way" ? (
                        (() => {
                          const etaDate = order.eta?.toDate?.();
                          const now = new Date();
                          const isPast = etaDate && etaDate < now;

                          return isPast ? (
                            <span className="text-green-700 font-semibold text-xs">
                              Your package is here!
                            </span>
                          ) : (
                            <div className="flex flex-col items-center justify-center gap-1">
                              <span className="text-xs font-semibold text-white bg-blue-600 px-2 py-1 rounded">
                                On the way
                              </span>
                              <span className="text-[11px] text-blue-800 font-bold">
                                {renderETA(order.eta)}
                              </span>
                            </div>
                          );
                        })()
                      ) : (
                        <span className={getStatusColor(order.deliveryStatus)}>
                          {order.deliveryStatus || "pending"}
                        </span>
                      )}
                    </td>
                    <td className="p-2 border text-center">
                      {codeExists ? (
                        <span className="flex items-center gap-1 justify-center font-mono">
                          {codeExists}
                          <FaCopy
                            onClick={() => handleCopy(codeExists)}
                            className="text-blue-600 cursor-pointer hover:text-blue-800"
                            title="Copy code"
                          />
                        </span>
                      ) : order.deliveryStatus?.toLowerCase() ===
                        "on the way" ? (
                        <button
                          onClick={() => handleGenerateCode(order.id, order.id)}
                          className="text-blue-500 hover:underline text-xs"
                        >
                          Generate Code
                        </button>
                      ) : (
                        <span className="text-gray-400 italic text-xs">
                          Access Denied.
                        </span>
                      )}
                    </td>
                    <td className="p-2 border text-center">
                      {isDelivered && (
                        <button
                          onClick={() => handleDeleteItem(order.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete this item"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default UserOrdersModal;