import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { FaTimes, FaTrash } from "react-icons/fa";

const OrdersModal = ({ onClose }) => {
  const [orders, setOrders] = useState([]);
  const [selectedETAOrder, setSelectedETAOrder] = useState(null);
  const [etaInput, setEtaInput] = useState("");

  const [selectedDeliveredOrder, setSelectedDeliveredOrder] = useState(null);
  const [deliveryCode, setDeliveryCode] = useState("");
  const [codeError, setCodeError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      const snap = await getDocs(collection(db, "orders"));
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setOrders(data);
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      const ordersSnap = await getDocs(collection(db, "orders"));
      const ordersData = ordersSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const usersSnap = await getDocs(collection(db, "users"));
      const usersData = usersSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Merge user info into orders
      const mergedOrders = ordersData.map((order) => {
        const user = usersData.find(
          (u) => u.id === order.userId || u.email === order.email
        );
        return {
          ...order,
          customerName: user?.name || "N/A",
          customerEmail: user?.email || "N/A",
          customerPhone: user?.phone || "N/A",
          customerAddress: user?.address || "N/A",
        };
      });

      setOrders(mergedOrders);
    };

    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, status, order) => {
    if (status === "on the way") {
      if (order.eta) {
        alert("ETA already set. Cannot modify.");
        return;
      }
      setSelectedETAOrder(orderId);
    } else if (status === "delivered") {
      setSelectedDeliveredOrder(orderId);
      setDeliveryCode("");
      setCodeError("");
    } else {
      await updateDoc(doc(db, "orders", orderId), {
        deliveryStatus: status,
      });
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, deliveryStatus: status } : o
        )
      );
    }
  };

  const handleETASave = async () => {
    if (!etaInput.trim()) return alert("ETA required");

    const ms = parseETAToMs(etaInput.trim());
    if (!ms) return alert("Invalid ETA format");

    const etaTimestamp = Timestamp.fromDate(new Date(Date.now() + ms));

    const orderRef = doc(db, "orders", selectedETAOrder);
    await updateDoc(orderRef, {
      deliveryStatus: "on the way",
      eta: etaTimestamp,
    });

    setOrders((prev) =>
      prev.map((order) =>
        order.id === selectedETAOrder
          ? { ...order, deliveryStatus: "on the way", eta: etaTimestamp }
          : order
      )
    );

    setSelectedETAOrder(null);
    setEtaInput("");
    alert("ETA saved. Cannot modify again.");
  };

  const parseETAToMs = (text) => {
    const lower = text.toLowerCase();
    const num = parseInt(lower);
    if (lower.includes("minute")) return num * 60 * 1000;
    if (lower.includes("hour")) return num * 60 * 60 * 1000;
    if (lower.includes("day")) return num * 24 * 60 * 60 * 1000;
    if (lower.includes("week")) return num * 7 * 24 * 60 * 60 * 1000;
    if (lower.includes("month")) return num * 30 * 24 * 60 * 60 * 1000;
    if (lower.includes("year")) return num * 365 * 24 * 60 * 60 * 1000;
    return 0;
  };

  const handleDeliveryCodeSubmit = async () => {
    if (!deliveryCode.trim()) {
      setCodeError("Please enter a delivery code.");
      return;
    }

    try {
      const codesCollection = collection(db, "codes");
      const codesSnapshot = await getDocs(codesCollection);

      const matchedCodeDoc = codesSnapshot.docs.find(
        (doc) => doc.data().code === deliveryCode.trim()
      );

      if (!matchedCodeDoc) {
        setCodeError("Invalid or expired delivery code.");
        return;
      }

      const orderRef = doc(db, "orders", selectedDeliveredOrder);
      await updateDoc(orderRef, {
        deliveryStatus: "delivered",
      });

      await deleteDoc(doc(db, "codes", matchedCodeDoc.id));

      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedDeliveredOrder
            ? { ...o, deliveryStatus: "delivered" }
            : o
        )
      );

      setSelectedDeliveredOrder(null);
      alert("Delivery status set to Delivered and code removed.");
    } catch (err) {
      console.error("Error validating delivery code:", err);
      setCodeError("Something went wrong. Try again.");
    }
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "orders", id));
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-600";
      case "approved":
        return "text-green-600";
      case "on the way":
        return "text-blue-600";
      case "rejected":
        return "text-red-600";
      case "delivered":
        return "text-gray-800";
      default:
        return "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-start pt-10 overflow-y-auto">
      <div className="bg-white rounded-md w-[95%] max-h-[90vh] p-6 overflow-auto relative shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-red-600"
        >
          <FaTimes size={20} />
        </button>
        <h2 className="text-xl font-bold mb-4 text-center">Admin Orders</h2>

        <table className="min-w-[1100px] border text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              
              <th className="p-2 border">Customer Name</th>
              <th className="p-2 border">Customer Email</th>
              <th className="p-2 border">Customer Number</th>
              <th className="p-2 border">Customer Addr</th>
              <th className="p-2 border">Item</th>
              <th className="p-2 border">Image</th>
              <th className="p-2 border">Price</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Delivery</th>
              <th className="p-2 border">ETA</th>
              <th className="p-2 border">Seen?</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const isETAInput = selectedETAOrder === order.id;
              const isDelivered = order.deliveryStatus === "delivered";
              const isCodeInput = selectedDeliveredOrder === order.id;

              return (
                <tr key={order.id} className="border-t align-top">
                   <td className="p-2 border">{order.customerName || "N/A"}</td>
                  <td className="p-2 border">{order.customerEmail || "N/A"}</td>
                  <td className="p-2 border">{order.customerPhone || "N/A"}</td>
                  <td className="p-2 border">{order.customerAddress || "N/A"}</td> 
                  {/* <td className="p-2 border">{order.name || "N/A"}</td> */}
                  <td className="p-2 border">{order.itemName || order.name}</td>
                  <td className="p-2 border">
                    <img
                      src={order.imageUrl}
                      alt={order.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  </td>
                  <td className="p-2 border">
                    ₦{Number(order.price).toLocaleString()}
                  </td>
                  <td
                    className={`p-2 border font-semibold ${
                      order.status === "available"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {order.status}
                  </td>
                  <td className="p-2 border">
                    {order.orderedAt?.toDate
                      ? order.orderedAt.toDate().toLocaleString()
                      : "N/A"}
                  </td>
                  <td className="p-2 border">
                    <select
                      value={order.deliveryStatus || "pending"}
                      className={`px-2 py-1 rounded ${getStatusColor(
                        order.deliveryStatus
                      )}`}
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value, order)
                      }
                      disabled={isDelivered}
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="on the way">On the way</option>
                      
                      <option value="delivered">Delivered</option>
                    </select>

                    {isETAInput && !order.eta && (
                      <div className="mt-2 flex flex-col gap-1">
                        <input
                          type="text"
                          value={etaInput}
                          onChange={(e) => setEtaInput(e.target.value)}
                          placeholder='e.g. "30 minutes", "1 week"'
                          className="border px-2 py-1 text-sm rounded"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedETAOrder(null)}
                            className="text-xs text-gray-600 hover:underline"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleETASave}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                          >
                            Go
                          </button>
                        </div>
                      </div>
                    )}

                    {isCodeInput && (
                      <div className="mt-2 flex flex-col gap-1">
                        <input
                          type="text"
                          value={deliveryCode}
                          onChange={(e) => setDeliveryCode(e.target.value)}
                          placeholder="Enter delivery code"
                          className="border px-2 py-1 text-sm rounded"
                        />
                        {codeError && (
                          <span className="text-red-500 text-xs">
                            {codeError}
                          </span>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedDeliveredOrder(null)}
                            className="text-xs text-gray-600 hover:underline"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleDeliveryCodeSubmit}
                            className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                          >
                            Go
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="p-2 border">
                    {order.eta?.toDate
                      ? order.eta.toDate().toLocaleString()
                      : "—"}
                  </td>
                  <td>
                    {order.customerSeen === "yes" ? (
                      <span className="text-green-600 font-bold">Yes</span>
                    ) : (
                        <span className="text-red-600 font-bold">No</span>
                    )
                    }
                  </td>
                  <td className="p-2 border text-center">
                    {isDelivered && (
                      <button
                        onClick={() => handleDelete(order.id)}
                        className="text-red-600 hover:text-red-800"
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
      </div>
    </div>
  );
};

export default OrdersModal;
