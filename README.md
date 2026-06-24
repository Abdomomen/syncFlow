# SyncFlow 🌊

SyncFlow is a modern, enterprise-tier full-stack web application designed for comprehensive **Task and Subscription Management**. Built with Next.js (App Router) and MongoDB, it provides a seamless and visually stunning dashboard interface to keep track of workflow projects and active software licenses, with full PWA (Progressive Web App) support.

## 🚀 Features

- **Robust Authentication:** Secure JWT-based registration, login, and silent token refreshing. Hydration-safe state handling ensures uninterrupted user sessions.
- **Task Pipeline:** Easily create, edit, mark as complete, or delete your daily tasks.
- **Subscription Tracking:** Log all your active subscriptions and monitor their costs, billing cycles, and upcoming renewal dates visually.
- **Advanced Dynamic Search:** Powerful regex-backed search functionality allowing sub-string and case-insensitive matching across tasks and subscriptions instantaneously.
- **Modern Dashboard UI:** Built with sleek colors, custom layouts, hover micro-interactions, dark-mode aesthetics, and a responsive custom sidebar & topbar layout.
- **PWA Ready:** Installable application that behaves natively on both desktop and mobile platforms with pre-configured Service Worker endpoints and Web Manifests.
- **Optimized Data State:** Relies on Zustand persisting mechanisms to gracefully retain the user state alongside secure HttpOnly API backend endpoints.

## 🛠 Tech Stack

- **Frontend:** React, Next.js (App Router), Zustand (Client side state + persist)
- **Backend:** Next.js Serverless API Routes
- **Database:** MongoDB, Mongoose
- **Styling:** Vanilla CSS, Tailwind CSS Utility Classes
- **Authentication:** JWT (JSON Web Tokens) with Next.js Headers & Cookies Middleware
- **Data Fetching:** Custom Centralized Fetching Middleware

## 📦 Getting Started

### 1. Requirements

Ensure you have the following installed to run this project:

- [Node.js](https://nodejs.org/) (v16.14 or later)
- [MongoDB](https://www.mongodb.com/) (Local string or Atlas URI)

### 2. Environment Variables

Create a `.env` or `.env.local` file in the root of the project with the following shape:

```env
# MongoDB Connection String
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/syncflow?retryWrites=true&w=majority

# JWT Secrets for Auth
SECRET_KEY=your_jwt_access_secret_here
NEXT_PUBLIC_URL=http://localhost:3000
```

_(Adjust the variables above depending on what you defined inside `./app/services/db/connectDb.js` or jwt configs)_

### 3. Installation

```bash
# Clone this repository
git clone https://github.com/Abdomomen/syncFlow.git

# Enter the project directory
cd syncFlow

# Install standard dependencies
npm install

# Start the development server
npm run dev
```

### 4. Open Application

Navigate to [http://localhost:3000](http://localhost:3000) using your web browser.

## 🧑‍💻 Usage

1. Head to `/register` and set up an account safely.
2. Sign in via `/login`.
3. Explore `/dashboard/tasks` and `/dashboard/subscriptions` to start syncing your workflow!

---

_Developed & Designed to showcase Enterprise Tier dashboard experiences._
