# CBSH Digital Library — Setup Guide

## Prerequisites

- A modern web browser (Chrome, Firefox, Edge)
- An InsForge account with a project
- A static file server (e.g., Live Server VS Code extension)

## Step 1: Configure InsForge Credentials

Edit `js/config.js` and set your InsForge project URL and anon key:

```javascript
const CBSH_CONFIG = {
  INSFORGE_URL: "https://your-project.insforge.com",
  INSFORGE_ANON_KEY: "your-anon-key-here",
  STORAGE_BUCKET: "cbsh-library",
  // ... rest of config
};
```

## Step 2: Database Tables

The following tables should exist in your InsForge project:

| Table           | Purpose                      |
| --------------- | ---------------------------- |
| `users`         | User profiles and roles      |
| `materials`     | Uploaded study materials     |
| `quizzes`       | Quiz configurations          |
| `questions`     | Quiz questions (MCQ)         |
| `quiz_attempts` | Student quiz attempt records |
| `bookmarks`     | Student material bookmarks   |
| `downloads`     | Download tracking            |
| `notifications` | User notifications           |
| `announcements` | Admin/teacher announcements  |
| `activity_logs` | System audit trail           |
| `settings`      | System configuration         |

## Step 3: Storage Bucket

Create a private bucket named `cbsh-library` via InsForge MCP or dashboard.

## Step 4: Admin Account

Create the first admin user directly in the database:

```sql
INSERT INTO users (name, email, role, status, email_verified)
VALUES ('CBSH Admin', 'admin@cbsh.edu', 'admin', 'approved', true);
```

Then register via InsForge Auth with the same email and set the password.

## Step 5: Run the Project

Open `index.html` with a local server:

```bash
# Using VS Code Live Server extension:
# Right-click index.html → Open with Live Server

# Or use any static server:
npx serve .
```

## Step 6: Add CSS/JS Includes

For responsive design and notifications, ensure each page includes:

```html
<!-- In <head> -->
<link rel="stylesheet" href="../css/responsive.css" />

<!-- Before </body> -->
<script src="../js/notifications.js"></script>
```

Then call `Notifications.init()` after `App.initLayout()`.

## Seeded Example Data

The project comes with pre-seeded data for testing:

- **5 Materials:** Linear Algebra, Organic Chemistry, Data Structures, Thermodynamics, Cell Biology
- **5 Quizzes:** Math, Physics, Chemistry, CS, Biology (5 questions each, all published)

> **Note:** Seeded materials have placeholder file keys. Upload real files via the teacher panel.

## Troubleshooting

| Issue                  | Solution                                             |
| ---------------------- | ---------------------------------------------------- |
| Login fails            | Check InsForge credentials in `js/config.js`         |
| "Not authorized" error | Ensure user has correct role and is approved         |
| Files won't upload     | Check `cbsh-library` bucket exists and is accessible |
| PDF preview blank      | Ensure PDF.js CDN is loading, check browser console  |
| Charts not showing     | Verify Chart.js CDN link and data exists in tables   |
