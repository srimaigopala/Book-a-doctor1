🩺 Book-A-Doctor – Online Doctor Appointment Booking System

Book-A-Doctor is a full-stack MERN application that allows patients to find doctors, schedule appointments, and manage bookings online. Doctors can manage their appointments, while administrators can monitor users, doctors, and appointment records through a dedicated dashboard.

🎥 Demo Video

https://drive.google.com/file/d/1dwDObWU71Zg6lupEyDUmBiVa0dRZl17h/view?usp=drivesdk

---

**✨ Features**

**Patient Features**

• User Registration & Login
• Secure JWT Authentication
• Browse Available Doctors
• View Doctor Details
• Book Appointments
• Cancel Appointments
• View Appointment History
• Manage Profile

**Doctor Features**

• Doctor Registration
• Doctor Dashboard
• View Assigned Appointments
• Manage Consultation Schedule
• Update Appointment Status
• View Patient Information

**Admin Features**

• Admin Login
• Dashboard Analytics
• Manage Doctors
• Manage Patients
• Monitor Appointments
• Approve / Reject Appointments
• View System Statistics

---

**🛠 Tech Stack**

**Frontend**

• React.js
• Vite
• Tailwind CSS
• Axios
• React Router DOM
• Lucide React Icons

**Backend**

• Node.js
• Express.js
• MongoDB Atlas
• Mongoose
• JWT Authentication
• bcryptjs

---

**📁 Project Structure**

```text
Book-A-Doctor
│
├── client
├── server
└── README.md
```

---

**🔐 Authentication**

• JWT Authentication
• Protected Routes
• Role-Based Access Control
• Password Hashing using bcryptjs

**Roles**

• Patient
• Doctor
• Admin

---

**📅 Appointment Workflow**

1. Patient registers and logs in.
2. Patient browses doctors.
3. Patient books an appointment.
4. Appointment is stored in MongoDB.
5. Doctor/Admin can view appointments.
6. Appointment status can be Pending, Approved, Rejected, or Cancelled.

---

**📊 Modules Implemented**

• Authentication Module
• Patient Management Module
• Doctor Management Module
• Appointment Management Module
• Admin Dashboard Module
• Doctor Dashboard Module

---

**🚀 Installation**

**Clone Repository**

```bash
git clone https://github.com/srimaigopala/Book-a-doctor1.git
```

**Backend Setup**

```bash
cd server
npm install
npm run dev
```

Backend URL:

```bash
http://localhost:5000
```

**Frontend Setup**

```bash
cd client
npm install
npm run dev
```

Frontend URL:

```bash
http://localhost:5173
```

---

**🚀 Future Enhancements**

• Online Payments
• Video Consultation
• Email Notifications
• Prescription Management
• Medical Reports Upload
• Appointment Reminders
• AI-Based Doctor Recommendation
