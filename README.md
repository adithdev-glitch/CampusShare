# Campus Resource Exchange Platform (CampusShare)

A full-stack, college-only resource-sharing system where students can list, discover, borrow, and return equipment (Arduino kits, scientific calculators, engineering textbooks, sports gear, hostel essentials) from classmates to reduce expenses and waste.

---

## Technical Stack
- **Frontend:** React.js, Tailwind CSS v4, Axios, Lucide Icons, React Router.
- **Backend:** Node.js, Express, MongoDB (Mongoose), JSON Web Tokens (JWT), Nodemailer.

---

## Key Features
1. **Nodemailer OTP Verification**: 6-digit email OTP generated and sent to student college emails during registration and unverified logins.
2. **Explore Marketplace**: Multi-attribute filtering (category, owner department, condition, availability, max duration) with live search and custom sorting.
3. **QR Transaction Verification**: Graphical step-by-step QR code scanners simulated inside the UI to transition statuses safely from *Approved* ➔ *Borrowed* ➔ *Returned*.
4. **Campus Sustainability Impact**: Live tracking of aggregate student savings (in Indian Rupees ₹), items diverted from trash, and carbon offset equivalents.
5. **Dynamic Profiles & Badges**: Recalculates awards dynamically on profile pages (e.g. *Trusted Lender*, *Active Sharer*, *Responsible Borrower*) based on successful swaps.
6. **Admin Control Desk**: Analytic graphs, moderation controls to delete user accounts, and dashboard listing removal.

---

## Directory Structure
- `server/` - Node/Express backend database schemas, routers, controllers, email templates, and seeder utility.
- `frontend/` - React frontend app, contexts, component modals, router links, and styles.

---

## Prerequisites
- Node.js (v18.0.0 or higher recommended)
- MongoDB running locally or a remote MongoDB Atlas database cluster URI.

---

## Installation & Setup

### 1. Set Up Express Backend
Navigate to the server directory, install dependencies, and configure `.env` variables:
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory (we have already created one with default values). Edit the MongoDB URI or JWT secret if needed:
```env
PORT=5001
MONGO_URI=mongodb+srv://Campus:MANASVIDB@campus.t01g7dk.mongodb.net/?appName=Campus
JWT_SECRET=your_jwt_super_secret_key_here
FRONTEND_URL=http://localhost:5173

# Nodemailer SMTP Configuration
EMAIL_USER=manasvisharadmali@gmail.com
EMAIL_PASS=ssrewjwwglzamnht
```

### 2. Seed Mock Database Data
To immediately populate the platform with 15 realistic Indian college students (across departments like CSE, ECE, IT, Civil, EEE), 30 listable resources (equipped with images), 10 transaction histories, and 10 reviews:
```bash
npm run seed
```

### 3. Start Backend Development Server
```bash
npm run dev
```
*(The server will boot on port `5001` and connect to your MongoDB database)*

### 4. Set Up React Frontend App
Open a separate terminal, navigate to the frontend directory, and install dependencies:
```bash
cd ../frontend
npm install
```

### 5. Start Frontend Development Server
```bash
npm run dev
```
*(The client will boot on port `5173`)*

---

## Demo Testing Walkthrough

1. Open **http://localhost:5173** in your browser.
2. Sign in with standard college credentials.
   - **For student access**: Use `aarav.sharma@college.edu` and password `password123`.
   - **For administrator access**: Use `admin.user@college.edu` and password `password123`.
3. Try the borrowing cycle:
   - **Student A** lists an Arduino kit under *Share Resource*.
   - **Student B** searches "Arduino", clicks *View Details*, and submits a borrowing request.
   - **Student A** accepts the request from the *Incoming Requests* tab in *My Listings*.
   - **Student B** gets a pickup QR code in *My Borrowings*. Click "Simulate Scan" to transition status to **Borrowed**.
   - **Student B** clicks "Return Resource" once done. Click "Simulate Scan" to transition status to **Returned**.
   - Both students rate their experience, which updates user profile scores instantly.

---

## Resume Project Description

Copy and paste this section directly into your resume's **Projects** section:

### **CampusShare – Peer-to-Peer Resource Exchange Platform**
Developed a full-stack peer-to-peer resource exchange platform with JWT-based OTP authentication
• Integrated Razorpay payment gateway to split rental fees (90% net earnings to lenders and 10% commission to admins)
• Implemented transaction logging with simulated QR code scan verification for secure resource transitions
• Designed responsive admin panel featuring custom HSL SVG graph charts, page explorer, and paginated tables
• Built user profile console displaying active badges, bank withdrawals log, and chronological payment ledger
• Deployed application utilizing MongoDB database and Vite React client
