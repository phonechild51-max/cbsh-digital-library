# CBSH Digital Library

A production-grade digital library and quiz management system for C.B.S.H College, built with vanilla HTML/CSS/JavaScript and powered by [InsForge](https://insforge.com) for backend services.

## ✨ Features

### 🔐 Authentication

- Email/password login with session management
- Registration with ID card upload & email verification
- Password recovery with OTP flow
- Role-based access control (Admin, Teacher, Student)
- Inactivity auto-logout & token refresh

### 👩‍💼 Admin Panel

- **Dashboard** — 8 stat cards, 4 Chart.js charts, recent activity feed
- **User Approval** — Tabbed view (Pending/Verified/Approved/Denied), ID preview
- **Material Management** — DataTables view, download & delete actions
- **Quiz Management** — Overview with attempt stats, delete
- **Student Tracking** — Filterable quiz attempt tracking
- **Activity Logs** — Full audit trail with status badges
- **Announcements** — Create, target roles, set priority
- **Reports** — PDF generation (Users, Materials, Quizzes, Activity)
- **Settings** — Site name, maintenance mode, upload limits, danger zone

### 👨‍🏫 Teacher Panel

- **Dashboard** — Personal stats, download trends, materials by subject
- **Upload Material** — Drag-and-drop with preview, progress bar
- **My Materials** — Grid/list toggle, edit, delete with storage cleanup
- **Create Quiz** — Full builder with question add/edit/delete modal
- **My Quizzes** — Tabbed cards (All/Published/Draft/Expired), publish flow
- **Quiz Analytics** — Score distribution chart, pass/fail doughnut, DataTable
- **Announcements** — Create & manage teacher announcements
- **Profile** — Avatar upload, edit name, change password

### 👩‍🎓 Student Panel

- **Dashboard** — Score trend chart, pass/fail doughnut, downloads, announcements
- **Browse Materials** — Search, filter (subject/semester/type), sort, bookmarks
- **Preview Material** — In-browser PDF viewing (PDF.js), image zoom, page nav
- **My Downloads** — Download history with re-download links
- **Bookmarks** — Saved materials grid
- **Available Quizzes** — Card-based with attempts remaining & best score
- **Quiz Instructions** — Details, rules, attempt count before starting
- **Take Quiz** — Full engine: countdown timer, question navigation, auto-submit
- **Quiz Results** — Score summary, pass/fail badge, answer review
- **Announcements** — Feed with priority icons & time-ago display
- **Profile** — Avatar, stats sidebar, password change

## 🛠 Tech Stack

| Layer        | Technology                               |
| ------------ | ---------------------------------------- |
| Frontend     | HTML5, CSS3, Vanilla JavaScript (ES6+)   |
| UI Framework | Bootstrap 5 (CDN)                        |
| Backend      | InsForge (Auth, Database, Storage)       |
| Charts       | Chart.js                                 |
| Tables       | jQuery DataTables                        |
| Modals       | SweetAlert2                              |
| PDF Preview  | PDF.js (Mozilla)                         |
| PDF Reports  | jsPDF + html2canvas                      |
| Icons        | Bootstrap Icons                          |
| Fonts        | Google Fonts (DM Sans, DM Serif Display) |

## 📁 Project Structure

```
cbsh-digital-library/
├── index.html              # Login page
├── register.html           # Registration
├── verify-email.html       # OTP verification
├── forgot-password.html    # Password recovery
├── reset-password.html     # Password reset
├── css/
│   ├── theme.css           # Design system & component styles
│   └── responsive.css      # Mobile/tablet/print breakpoints
├── js/
│   ├── config.js           # InsForge credentials & app config
│   ├── insforge.js         # REST API wrapper
│   ├── auth.js             # Session management & route guards
│   ├── main.js             # Layout builder & utilities
│   ├── theme-toggle.js     # Dark/light mode
│   └── notifications.js    # Notification bell & polling
├── assets/images/          # Logo, default avatar
├── admin/                  # 9 admin pages
├── teacher/                # 8 teacher pages
└── student/                # 11 student pages
```

## 🎨 Design

- **Theme:** Refined academic luxury with dark mode
- **Colors:** Amber-gold (`#D4922A`) and steel-blue (`#2A6DD4`) on dark backgrounds
- **Typography:** DM Sans (body), DM Serif Display (headings)
- **Components:** Glassmorphism cards, smooth animations, micro-interactions

## 🔑 Admin Credentials

```
Email:    admin@cbsh.edu
Password: q1w2e3r4t5swag@Q
```

## 📄 License

This project is proprietary software for C.B.S.H College.
