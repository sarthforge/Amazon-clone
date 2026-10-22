# 🛒 Amazon Clone — React SPA

A fully-featured, responsive e-commerce single-page application inspired by Amazon.in, built with **React 18**, **React Router v6**, and the **Context API**. This project simulates a real-world shopping experience — from browsing and filtering products to cart management, checkout, order tracking, and more.

🔗 **Live Demo:** [https://amazon-clone-blush-ten.vercel.app/](https://amazon-clone-blush-ten.vercel.app/)

---

## 📸 Preview

<img width="800" height="436" alt="AMAZON_CLONE" src="https://github.com/user-attachments/assets/fd854629-0951-4dad-9489-1deb3d07c311" />


---

## ✨ Features

### 🛍️ Shopping Experience
- Product listing with live data from [FakeStoreAPI](https://fakestoreapi.com/)
- Category filtering, price range & customer rating filters
- Product sorting (price, rating, featured)
- Debounced live search with autocomplete suggestions
- Infinite scroll with skeleton loading placeholders
- Product details page with full description and customer reviews
- Star-rating review system with dynamic average calculation

### 🛒 Cart & Checkout
- Add to Cart / Remove / Update Quantity
- **Save for Later** — move items between Cart and a saved list
- Wishlist system with persistent storage
- Multi-step checkout with:
  - Saved address book (multiple addresses per user)
  - Payment methods: Cash on Delivery, Card, UPI (with input validation)
  - Promo code / discount system (`WELCOME10`, `SAVE50`, `FREESHIP`)
- Protected checkout route (requires login)

### 📦 Order Management
- Order history with search/filter by Order ID or product name
- Simulated order status lifecycle: **Placed → Shipped → Delivered**
- **Order Cancellation** with confirmation step (only for unshipped orders)

### 🔐 Authentication
- Register / Login / Logout with localStorage-based session persistence
- Protected routes with redirect-back-after-login flow

### 🎨 UI/UX
- **Dark Mode** toggle (persisted, CSS variable–based theming)
- Fully **mobile responsive** (hamburger drawer navigation, adaptive grids)
- Global toast notification system
- Skeleton loading screens for perceived performance

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| Frontend Framework | React 18 |
| Routing | React Router v6 (HashRouter) |
| State Management | Context API (Cart, Wishlist, Auth, Theme, Toast) |
| Icons | Lucide React |
| Build Tool | Vite |
| Styling | Custom CSS with CSS Variables (Dark Mode) |
| Data Source | [FakeStoreAPI](https://fakestoreapi.com/) |
| Persistence | localStorage |
| Deployment | Vercel |

---

## 📂 Project Structure

```
src/
├── components/         # Reusable UI components (Header, Footer, ProductCard, etc.)
├── context/            # Global state providers (Cart, Auth, Wishlist, Theme, Toast)
├── pages/              # Route-level pages (Home, Cart, Checkout, Orders, etc.)
├── utils/              # Helper functions (e.g., order status simulation)
├── styles/
│   └── global.css      # Centralized styling with CSS variables
├── App.jsx             # Route definitions
└── main.jsx            # App entry point & provider tree
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/sarthforge/amazon-clone.git
cd amazon-clone

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173` (or the next available port).

### Build for Production

```bash
npm run build
```

---

## 🧭 Routes

| Path | Page | Access |
|---|---|---|
| `/` | Home (product listing) | Public |
| `/product/:id` | Product Details | Public |
| `/cart` | Shopping Cart | Public |
| `/wishlist` | Wishlist | Public |
| `/login` | Login / Register | Public |
| `/checkout` | Checkout | Protected |
| `/orders` | Order History | Protected |

---

## 🗺️ Roadmap

- [x] Core shopping experience (browse, filter, sort, search)
- [x] Cart, Wishlist, and Checkout flow
- [x] Authentication & Protected Routes
- [x] Order history with simulated status tracking
- [x] Save for Later
- [x] Order Cancellation
- [x] Dark Mode
- [x] Mobile Responsive Design
- [x] Skeleton Loading Screens
- [x] Infinite Scroll
- [x] Deployed to Vercel
- [ ] Unit Testing (Vitest + React Testing Library)
- [ ] Spring Boot REST API Backend Integration

---

## 👨‍💻 About This Project

This project was built as part of a learning journey toward becoming a **Java Full Stack Developer**. It began as a vanilla JavaScript clone and was fully refactored into a modern React SPA with reusable components, centralized state management, and client-side routing — architected to later integrate with a Spring Boot REST API backend.

---

## 📄 License

This project is for educational/portfolio purposes only and is not affiliated with Amazon.com, Inc.
