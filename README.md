
# RI Medicare

RI Medicare is a comprehensive healthcare management platform connecting patients, hospitals, administrators, and sales teams.

## Features

- Multi-role authentication system (Patient, Hospital, Admin, Sales, CRM)
- Health card management
- Loan applications and processing
- Hospital registration and management
- Patient management
- Transaction tracking
- Notification system

## Tech Stack

### Frontend
- React with TypeScript
- React Router for navigation
- Tailwind CSS for styling
- Shadcn UI components
- React Query for data fetching

### Backend
- Node.js with Express
- MongoDB for database
- JWT for authentication
- REST API architecture

## Setup Instructions

### Frontend Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```
4. Update the MongoDB connection string in `.env`:
   ```
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/rimedicare?retryWrites=true&w=majority
   ```
5. Start the backend server:
   ```
   npm run dev
   ```
6. (Optional) Seed the database with demo data:
   ```
   node seed.js
   ```

## Demo Login Credentials

Use these credentials to test the application:

- **Patient**: patient@demo.com / demo123
- **Hospital**: hospital@demo.com / demo123
- **Admin**: admin@demo.com / demo123
- **Sales**: sales@demo.com / demo123
- **CRM**: crm@demo.com / demo123

## API Documentation

See `backend/README.md` for detailed API documentation.

## Integration Guide

See `BACKEND_INTEGRATION.md` for information on connecting the frontend and backend.

## Deployment

### Frontend
The frontend can be built for production using:
```
npm run build
```

### Backend
For production deployment of the backend:
1. Set environment variables for production
2. Build and start using:
```
npm start
```

## License

This project is proprietary and not licensed for public use.
