# RAS Brother Tour & Travels 🚗✨

> **Premium Local Car Rental, Wedding Convoy & Event Transportation Marketplace**

RAS Brother Tour & Travels is a modern, full-stack event car rental marketplace built for wedding convoys, luxury rentals, local trips, and business travel. It includes live proximity suggestions for wedding venues, bulk convoy booking with advance UPI payment, fleet owner listing management, and a comprehensive real-time admin monitoring console.

---

## 🌟 Key Features

- 💍 **Wedding Convoy & Bulk Fleet Booking**: Book multiple cars in one checkout (e.g. Groom Luxury Car + Baraat SUVs) with unified route dispatch.
- 📍 **Venue Near-Me Suggestions**: Calculates distance from wedding pickup points and highlights closest cars.
- 🏢 **Fleet Owner Portal**:
  - Add & edit vehicle listings, specs, and photos.
  - Set manual search placement (City, garage address, service radius).
  - Assign chauffeurs and verify trip start security OTPs.
  - Review customer UPI payment receipts and confirm bookings.
- 💳 **Fixed UPI Payment & Advance System**:
  - QR Code payment (`rasbrother@upi`) for 20% advance booking confirmation.
  - UTR 12-digit transaction number input and receipt screenshot upload.
  - Balance payable on ride dispatch.
- 🛡️ **Platform Administrator Console**:
  - Real-time fleet booking monitoring, live on-road tracking, and KPI stats.
  - Instant customer communication via 1-click WhatsApp and phone call links.
  - Payment proof preview modal to verify bank receipts.
  - Fleet dispatch sheet printer for daily operations.
  - Vendor KYC verification and coupon management.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide React, Canvas Confetti.
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT Authentication, Multer, Helmet, Rate Limiter.
- **Deployment**: Production-ready unified Express SPA serving (`client/dist`).

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone <repo-url>
cd ras-brother-tour-travels

# Install all dependencies (backend & frontend)
npm run install:all
```

### 2. Environment Setup
Create a `.env` file in `server/`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/rasbrother
JWT_SECRET=your_jwt_secret_key_here
CLIENT_URL=http://localhost:5173
```

### 3. Run Development Servers
```bash
# Terminal 1: Backend
npm run dev:server

# Terminal 2: Frontend
npm run dev:client
```

### 4. Build for Production
```bash
npm run build
npm start
```
The app will be accessible at `http://localhost:5000`.

---

## 📄 License
Licensed under the ISC License. Copyright &copy; 2026 RAS Brother Tour & Travels.
