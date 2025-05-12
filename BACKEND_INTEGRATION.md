
# Backend Integration Guide for RI Medicare

This document outlines how to connect the React frontend with the Node.js/MongoDB backend.

## Overview

The backend server is a Node.js Express application with MongoDB as the database. It provides REST API endpoints for authentication, user management, health cards, loans, transactions, and more.

## Setup Instructions

### 1. Start the Backend Server

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Edit the .env file and add your MongoDB Atlas connection string
# MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/rimedicare?retryWrites=true&w=majority

# Start the development server
npm run dev
```

The server will start on port 5000 by default.

### 2. Seed Demo Data (Optional)

To populate the database with demo data:

```bash
node seed.js
```

This creates demo users, hospitals, health cards, loans, transactions, and notifications.

### 3. Connecting Frontend to Backend

The frontend is already configured to connect to the backend at `http://localhost:5000/api`. This connection is set up in `src/services/api.ts`.

## Demo Login Credentials

All demo accounts use the password: `demo123`

- Patient: `patient@demo.com`
- Hospital: `hospital@demo.com`
- Admin: `admin@demo.com`
- Sales: `sales@demo.com`
- CRM: `crm@demo.com`

## Frontend Integration Points

1. **Authentication**: The frontend uses the `useAuth` hook to handle user authentication through the backend.

2. **API Service**: The `apiRequest` function in `src/services/api.ts` handles all API requests, automatically including authentication tokens.

3. **Protected Routes**: The `ProtectedRoute` component requires authentication and can check for specific user roles.

4. **Notifications**: The `useNotifications` hook fetches notifications from the backend API.

## API Endpoints

### Authentication
- `POST /api/auth` - Login user
- `GET /api/auth` - Get logged-in user data

### Users
- `POST /api/users` - Register a new user
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile

### Hospitals
- `GET /api/hospitals` - Get all hospitals
- `POST /api/hospitals` - Add new hospital
- `GET /api/hospitals/:id` - Get hospital by ID
- `PUT /api/hospitals/:id` - Update hospital

### Health Cards
- `GET /api/health-cards` - Get all health cards for a user
- `POST /api/health-cards` - Create a health card (admin only)
- `GET /api/health-cards/:id` - Get health card by ID

### Loans
- `GET /api/loans` - Get all loans for a user
- `POST /api/loans` - Apply for a loan
- `PUT /api/loans/:id/approve` - Approve a loan application (admin only)

### Transactions
- `GET /api/transactions` - Get all transactions for a user
- `POST /api/transactions` - Create a transaction (hospital or admin)

### Notifications
- `GET /api/notifications` - Get all notifications for a user
- `POST /api/notifications` - Create a notification (admin only)
- `PUT /api/notifications/:id/read` - Mark notification as read

## Developing New Features

When developing new features:

1. Create the necessary API endpoints in the backend
2. Create or update models as needed
3. Create service functions in the frontend to connect to these endpoints
4. Use these services in your React components
