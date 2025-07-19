ClassicRoyal – Modern E-Commerce Platform

Welcome to ClassicRoyal, a powerful and scalable modern e-commerce platform built with **React, **Firebase, and **Uploadcare*. This app allows users to browse, search, and purchase items, while admins can upload products, manage orders, and track delivery — all from an elegant UI.

Live Demo → [https://online-store-delta-beige.vercel.app](https://online-store-delta-beige.vercel.app)





 User Features
- Sign Up / Sign In (Email & Password)
- Add to Bag (Cart)
-  Wishlist with modal prompts
-  Real-time Search Modal
- Track Orders with Delivery ETA
- Session Persistence using sessionStorage
-  Personalized Welcome Toasts


Admin Features
-  Product Upload (with dynamic image fetching via *Pixabay* and upload to *Uploadcare*)
-  Firestore-based product metadata storage
-  Order Management: Update Status, Set ETA, Verify Delivery Code
- Delete Orders after delivery
-  Admin-only access to upload and product edit routes

---



 Category        Stack                                     

 *Frontend*     React + Vite + TailwindCSS                
 *Auth*          Firebase Authentication                   
 *Database*      Firebase Firestore                        
 *Storage*       Uploadcare (for permanent image hosting)  
 *Image Source*  Pixabay API (image search)                
 *Hosting*       Vercel                                     
 *State*        React Context API                         
 *Utilities*     react-hot-toast, react-icons, axios       





bash:
git clone https://github.com/your-username/classicroyal.git
cd classicroyal
npm install
npm run dev
