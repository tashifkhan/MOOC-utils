# MOOC Utils

A collection of utilities designed to enhance the experience for MOOC courses

## Projects

### 1. [Assignment Solver](assignment-solver/)
**Type:** Chrome Extension  
**Tech:** JavaScript, Gemini API

A powerful Chrome extension that leverages Google's Gemini AI to assist with online assignments.

**Key Features:**
- **AI-Powered:** Extracts and analyzes questions directly from the page.
- **Modes:** Offers both **Study Hints** (for learning) and **Auto-Solve** (for automation).
- **Versatile:** Handles single-choice, multi-choice, fill-in-the-blank, and image-based questions.
- **Privacy:** Client-side only operation using your own Gemini API key.

[Read full documentation →](assignment-solver/README.md)

### 2. [Notice Reminders](notice-reminders/)
**Type:** CLI Tool + API Backend  
**Tech:** Python 3.12+, FastAPI, Tortoise ORM, HTTPX, BeautifulSoup

A command-line tool and FastAPI backend to keep track of course updates without navigating the web UI.

**Key Features:**
- **Course Search:** Quickly find courses on Swayam/NPTEL by keyword.
- **Announcements:** Fetch and parse the latest announcements for specific courses.
- **Interactive:** Simple, user-friendly terminal interface.
- **Email OTP Auth:** Login/signup via one-time email codes with JWT cookies.

[Read full documentation →](notice-reminders/README.md)

### 3. [Website](website/)
**Type:** Web App (Landing + Dashboard)  
**Tech:** Next.js (App Router), React, TypeScript, Tailwind, TanStack Query

Marketing site and dashboard for Notice Reminders and Assignment Solver.

**Key Features:**
- **OTP Login:** Email-based login/signup backed by the Notice Reminders API.
- **Dashboard:** Manage subscriptions, notifications, and profile settings.
- **Public Search:** Search and browse courses without authentication.

[Read full documentation →](website/README.md)

## Getting Started

Each project is independent. Please navigate to the respective directory and follow the installation instructions in its README.

```bash
# For Assignment Solver
cd assignment-solver

# For Notice Reminders
cd notice-reminders

# For Website
cd website
```
