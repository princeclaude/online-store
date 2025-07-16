import { db } from "../firebase/firebaseConfig";
import {
  collection,
  addDoc,
  deleteDoc,
  query,
  getDoc,
  where,
  getDocs,
  doc,
  Timestamp,
} from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { PaystackButton } from "react-paystack";
import { useBag } from "../contexts/BagContext";
import toast from "react-hot-toast";

const PaystackButtonWrapper = ({ amount, email, items, onSuccess, onClose }) => {
  const { user } = useAuth();
  const { fetchBagItems } = useBag();
  

  const generateOrderId = () => {
    const now = new Date();
    const datePart = now.toISOString().split("T")[0].replace(/-/g, "");
    const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `ORD-${datePart}-${randomPart}`;
  };

  const handleSuccess = async () => {
    try {
      const userRef = doc(db, "users", user.email);
      const userSnap = await getDoc(userRef);

      let name = "Unknown";
      let phone = "N/A";
      let address = "N/A";

      if (userSnap.exists()) {
        const userData = userSnap.data();
        name = userData.name || name;
        phone = userData.phone || phone;
        address = userData.address || address;
      }

      // Fetch bag items with their document IDs
      const bagQuery = query(
        collection(db, "bag"),
        where("userId", "==", user.uid)
      );
      const bagSnap = await getDocs(bagQuery);
      const bagItems = bagSnap.docs.map((doc) => ({
        docId: doc.id, // needed for delete
        ...doc.data(),
      }));

      const itemsToOrder =
        items === "all"
          ? bagItems
          : bagItems.filter((b) => b.name === items.name); // handle single-item purchase

      for (const item of itemsToOrder) {
        const orderId = generateOrderId();

        await addDoc(collection(db, "orders"), {
          orderId,
          userId: user?.uid || "guest",
          email: user.email,
          phone,
          address,
          deliveryStatus: "pending",
          orderedAt: Timestamp.now(),
          imageUrl: item.imageUrl,
          name: item.name,
          customerSeen: "No",
          price: item.price,
          status: item.status,
        });

        // ✅ Delete using the bag document ID
        await deleteDoc(doc(db, "bag", item.docId));
      }

      fetchBagItems(); // Refresh bag count
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("⚠ Error completing order:", err);
      toast.error("Order processing failed. Please contact support.");
    }
  };
  return (
    <PaystackButton
      email={email}
      amount={amount}
      publicKey="pk_test_037aa11d956317719544ae5a9da5e7d64dd1c70a"
      onSuccess={handleSuccess}
      onClose={onClose}
      text="Pay Now"
      className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
    />
  );
};

export default PaystackButtonWrapper;