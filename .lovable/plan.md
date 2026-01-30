
# MenTOR - Mentor Connecting Platform

A modern, end-to-end mentor-connecting platform with role-based experiences for users and mentors, featuring a soft pink/pastel design system, token-based payments, and seamless booking flows.

---

## 🎨 Design System
- **Primary Color**: Pink/Rose (#F43F5E) for CTAs and accents
- **Soft pastel backgrounds** with rounded cards and subtle shadows
- **Clean typography** with consistent spacing
- **Modern sidebar navigation** for dashboard views
- **Currency**: Indian Rupees (₹)

---

## 📄 Public Pages

### 1. Landing Page
- Hero section with value proposition: "Connect 1-1 With Industry Mentors"
- CTA button: "Book a 1-on-1 Call"
- Featured mentors carousel with photos, roles, hourly rates
- "Our Mentoring Areas" section with category badges
- Benefits grid (9 key selling points)
- Testimonials carousel with real user stories
- FAQ accordion section
- Navigation: Browse Mentors, How it Works, Register as Mentor, Sign Up

### 2. Browse Mentors Page
- Left sidebar with filters: Search, Category checkboxes, Experience level radio buttons
- Quick filter chips at the top (Design, SDE, Management, JEE, etc.)
- Mentor cards showing: Photo, name, role, company, bio preview, experience years, hourly rate, rating, favorite button
- "Book 1-On-1 Call" CTA on each card
- Pagination controls at bottom

### 3. Mentor Profile Page (Public View)
- Header card with photo, name, title, location, skill badges
- Introduction text section
- Professional Experience section with job history and skills
- Education & Qualifications section
- Achievements & Highlights section
- Sidebar: Quick booking card with price, session count, rating, "Book Call" button
- "View All Services" link
- Recent Reviews section with ratings

---

## 🔐 Authentication

### 4. Sign Up / Login
- Split layout: Left side with branded illustration, Right side with form
- Minimal form: Name, Email, Password, Confirm Password
- Toggle between Sign Up and Login
- "Already have account? Login" link

---

## 👤 User Journey (Learner)

### 5. User Profile (Lightweight)
- Simple profile with name, email, avatar
- Edit basic details
- View booking history
- Simple wallet showing token balance

### 6. Service Selection Page
- "Book a session" header with mentor info
- Grid of service cards: Title, description, duration, price
- "Book Now" button on each service

### 7. Date & Time Selection
- Calendar picker on the left
- Time slot grid on the right showing available times
- "Book Call" confirmation button

### 8. Booking Confirmation
- Summary of selected service, date/time
- Token deduction from wallet
- External meeting link provided by mentor
- Confirmation message

### 9. User Wallet
- Token balance display
- Add tokens / top-up option
- Transaction history (purchases and bookings)

---

## 🎓 Mentor Journey

### 10. Register as Mentor (Onboarding Flow)
Multi-step wizard triggered from "Register as Mentor":
- **Step 1**: Basic profile (name, photo, headline, location)
- **Step 2**: Professional experience & skills
- **Step 3**: Education & achievements
- **Step 4**: Service configuration (add services with name, description, duration, price)
- **Step 5**: Set availability (weekly schedule)
- Completion unlocks mentor dashboard

### 11. Mentor Dashboard
- Welcome header with quick stats: Today's Sessions, Total Earnings
- Recent Activity feed (sessions completed, ratings, payments)
- Upcoming Meetings list with:
  - Client name, service type, date/time/duration
  - Status badges (Confirmed, Pending)
  - Action buttons: Join Meeting, Accept, Reschedule, Decline
- Sidebar navigation: Home, Bookings, Calendar, Payouts, Wallet

### 12. Mentor Bookings Page
- Full list of all bookings
- Filter by status (Upcoming, Completed, Cancelled)
- Meeting details with client info
- External meeting link management

### 13. Mentor Calendar View
- Monthly/weekly calendar showing scheduled sessions
- Click to view session details

### 14. Mentor Wallet & Payouts
- Total Earnings card with monthly earnings trend
- Available Balance with "Withdraw Funds" button
- Payment Methods section (add/edit bank details)
- Withdrawal History list with amounts and status

### 15. Mentor Profile Edit
- Quick access from dashboard "Edit Profile" button
- Edit all sections: Introduction, Experience, Education, Achievements
- Manage services: Add, edit, delete, set pricing/duration
- Social sharing option to share profile link

---

## 🔄 Core Flows

### User Booking Flow
1. Browse mentors → 2. View profile → 3. Select service → 4. Pick date/time → 5. Confirm (deduct tokens) → 6. Get meeting link

### Mentor Onboarding Flow
1. Click "Register as Mentor" → 2. Complete multi-step form → 3. Access dashboard

### Session Management Flow
1. User books → 2. Mentor receives pending request → 3. Mentor accepts/declines → 4. Both get meeting link → 5. Session happens → 6. User can rate/review

---

## ⚙️ Backend Requirements (Lovable Cloud)

### Database Tables
- **profiles**: User details (id, name, email, avatar, role)
- **user_roles**: Role management (user, mentor)
- **mentor_profiles**: Extended mentor info (bio, skills, location)
- **experiences**: Work history for mentors
- **education**: Educational background
- **achievements**: Awards and highlights
- **services**: Mentor service offerings (name, description, duration, price)
- **availability**: Weekly time slots
- **bookings**: Session bookings with status
- **reviews**: Ratings and feedback
- **wallets**: Token balances
- **transactions**: Token purchases and usage
- **payout_methods**: Mentor bank/payment details
- **withdrawals**: Payout history

### Authentication
- Email/password sign-up and login
- Role-based access (user vs mentor)
- Session management

---

## 📱 Responsive Design
- Mobile-friendly layouts for all pages
- Collapsible sidebar on mobile for dashboard
- Touch-friendly calendar and time pickers
