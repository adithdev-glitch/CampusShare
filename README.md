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



## Demo Testing Walkthrough

1. Open **http://localhost:5173** in your browser.
2. Sign in with standard college credentials.
3. Try the borrowing cycle:
   - **Student A** lists an Arduino kit under *Share Resource*.
   - **Student B** searches "Arduino", clicks *View Details*, and submits a borrowing request.
   - **Student A** accepts the request from the *Incoming Requests* tab in *My Listings*.
   - **Student B** gets a pickup QR code in *My Borrowings*. Click "Simulate Scan" to transition status to **Borrowed**.
   - **Student B** clicks "Return Resource" once done. Click "Simulate Scan" to transition status to **Returned**.
   - Both students rate their experience, which updates user profile scores instantly.
