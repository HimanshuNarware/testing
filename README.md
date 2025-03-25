# MediConnect - Healthcare Appointment Platform

## Table of Contents
1. [Introduction](#introduction)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Installation](#installation)
6. [Environment Variables](#environment-variables)
7. [API Endpoints](#api-endpoints)
8. [Frontend Pages](#frontend-pages)
9. [Application Flow](#application-flow)
10. [Services](#services)
11. [Authentication](#authentication)
12. [Data Models](#data-models)
13. [Contributing](#contributing)

## Introduction

MediConnect is a comprehensive healthcare platform designed to connect patients with doctors. It enables users to find healthcare professionals, schedule appointments, manage medical records, and engage with a community of healthcare providers and patients.

The application provides a seamless experience for both patients and doctors with specialized dashboards, appointment management, and communication tools.

## Features

### For Patients
- Find doctors based on specialty, location, insurance, and availability
- Book, reschedule, or cancel appointments
- View medical history and records
- Access prescriptions and treatment plans
- Leave reviews and ratings for doctors
- Participate in health forums and community discussions
- View educational video content

### For Doctors
- Manage profile and availability
- View and manage appointment schedules
- Access patient medical records
- Issue prescriptions and treatment plans
- Publish blog posts and educational content
- Engage with patient reviews and feedback

## Technology Stack

### Frontend
- **Framework**: React.js with Vite
- **Routing**: Wouter
- **State Management**: TanStack Query (React Query)
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Shadcn UI Components
- **Styling**: Tailwind CSS

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Architecture**: MVC (Model-View-Controller)
- **Data Storage**: In-memory storage (Memory Store)
- **Authentication**: JWT-based authentication

## Project Structure

```
project-root/
├── client/               # Frontend code
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── context/      # React context providers
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions and constants
│   │   ├── pages/        # Page components
│   │   ├── App.jsx       # Main application component
│   │   ├── index.css     # Global styles
│   │   └── main.jsx      # Entry point
│   └── index.html        # HTML template
├── server/               # Backend code
│   ├── controllers/      # Request handlers
│   ├── models/           # Data models
│   ├── routes/           # API routes
│   ├── services/         # Service layer (e.g., recommendation engine)
│   ├── index.js          # Server entry point
│   ├── storage.js        # Storage implementation
│   └── vite.js           # Vite configuration for backend
├── shared/               # Shared code between frontend and backend
│   └── schema.js         # Data schema definitions
├── .env                  # Environment variables
├── package.json          # Project dependencies and scripts
└── README.md             # Project documentation
```

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Install and Run the Application

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/mediconnect.git
   cd mediconnect
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. The application will be available at http://localhost:5000

### Client-Only Development

If you want to work only on the frontend:

```bash
# Navigate to the client directory
cd client

# Install client dependencies
npm install

# Start the client development server
npm run dev
```

### Server-Only Development

If you want to work only on the backend:

```bash
# Navigate to the server directory
cd server

# Install server dependencies
npm install

# Start the server in development mode
npm run dev
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=5000                     # Server port
NODE_ENV=development          # Environment (development, production)
JWT_SECRET=your_jwt_secret    # Secret key for JWT token generation
```

## API Endpoints

### User Management
- `POST /api/login` - User login
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PATCH /api/users/:id` - Update user information

### Doctor Management
- `GET /api/doctors` - Get all doctors (with filtering)
- `GET /api/doctors/:id` - Get doctor by ID
- `GET /api/doctors/user/:userId` - Get doctor profile by user ID
- `POST /api/doctors` - Create doctor profile
- `PATCH /api/doctors/:id` - Update doctor profile

### Appointment Management
- `GET /api/appointments/doctor/:doctorId` - Get appointments by doctor
- `GET /api/appointments/patient/:patientId` - Get appointments by patient
- `POST /api/appointments` - Create new appointment
- `PATCH /api/appointments/:id` - Update appointment status

### Reviews
- `GET /api/reviews/doctor/:doctorId` - Get reviews for a doctor
- `POST /api/reviews` - Create a new review

### Community & Content
- `GET /api/forum/topics` - Get all forum topics
- `GET /api/forum/topics/:id` - Get a forum topic with replies
- `POST /api/forum/topics` - Create a new forum topic
- `POST /api/forum/replies` - Add a reply to a forum topic
- `GET /api/blog/posts` - Get all blog posts
- `GET /api/blog/posts/:id` - Get a blog post by ID
- `POST /api/blog/posts` - Create a new blog post
- `GET /api/videos` - Get all video reels
- `GET /api/videos/:id` - Get video by ID
- `POST /api/videos` - Create a new video

### Medical Records & Prescriptions
- `GET /api/medical-records/patient/:patientId` - Get medical records for a patient
- `POST /api/medical-records` - Create a new medical record
- `GET /api/prescriptions/patient/:patientId` - Get prescriptions for a patient
- `POST /api/prescriptions` - Create a new prescription
- `PATCH /api/prescriptions/:id` - Update prescription status

## Frontend Pages

1. **Home (`/`)** - Landing page with hero section, featured doctors, and platform features
2. **Login (`/login`)** - User login page
3. **Signup (`/signup`)** - New user registration
4. **Find Doctors (`/find-doctors`)** - Search and filter doctors
5. **Doctor Profile (`/doctor/:id`)** - Individual doctor profile with reviews and appointment booking
6. **Patient Dashboard (`/dashboard`)** - Patient dashboard with appointments, medical records
7. **Doctor Dashboard (`/doctor-dashboard`)** - Doctor dashboard to manage appointments and patients
8. **Appointments (`/appointments`)** - View and manage appointments
9. **Community (`/community`)** - Forum discussions and blog posts
10. **Video Reels (`/videos`)** - Educational healthcare videos
11. **Not Found (`*`)** - 404 page for invalid routes

## Application Flow

```
┌─────────────────┐     ┌────────────────────┐     ┌───────────────────┐
│                 │     │                    │     │                   │
│  User browses   │────▶│ Search & Filter    │────▶│ View Doctor       │
│  Homepage       │     │ Doctors            │     │ Profiles          │
│                 │     │                    │     │                   │
└─────────────────┘     └────────────────────┘     └───────────────────┘
                                                            │
                                                            ▼
┌─────────────────┐     ┌────────────────────┐     ┌───────────────────┐
│                 │     │                    │     │                   │
│  Login/Signup   │◀───▶│ Authentication     │◀────│ Book              │
│                 │     │                    │     │ Appointment       │
│                 │     │                    │     │                   │
└─────────────────┘     └────────────────────┘     └───────────────────┘
        │                                                   │
        ▼                                                   ▼
┌─────────────────┐     ┌────────────────────┐     ┌───────────────────┐
│                 │     │                    │     │                   │
│  Patient        │────▶│ View & Manage      │────▶│ View Medical      │
│  Dashboard      │     │ Appointments       │     │ Records           │
│                 │     │                    │     │                   │
└─────────────────┘     └────────────────────┘     └───────────────────┘
                                                            │
                                                            ▼
┌─────────────────┐     ┌────────────────────┐     ┌───────────────────┐
│                 │     │                    │     │                   │
│  Doctor         │────▶│ View Patient       │────▶│ Update Treatment  │
│  Dashboard      │     │ Appointments       │     │ & Prescriptions   │
│                 │     │                    │     │                   │
└─────────────────┘     └────────────────────┘     └───────────────────┘
        │
        ▼
┌─────────────────┐     ┌────────────────────┐
│                 │     │                    │
│  Community      │────▶│ Health Content     │
│  Engagement     │     │ & Education        │
│                 │     │                    │
└─────────────────┘     └────────────────────┘
```

## Services

### Backend Services

#### Storage Service
The application uses an in-memory storage service (`MemStorage`) that implements the `IStorage` interface. This service provides CRUD operations for all data entities.

#### Authentication Service
Authentication is handled through the `AuthContext` provider in the frontend, which communicates with the backend authentication endpoints for login and user verification.

### Frontend Services

#### API Service
The frontend uses `apiRequest` function and TanStack Query hooks to communicate with the backend API endpoints.

#### Form Service
Form handling is managed through React Hook Form with Zod for validation schemas.

#### Toast Notifications
User feedback is provided through the toast notification system implemented with the `useToast` hook.

## Authentication

Authentication is implemented using JWT (JSON Web Tokens):

1. User logs in with username and password
2. Backend validates credentials and returns user data
3. Frontend stores user data in localStorage
4. Protected routes check authentication status through the `ProtectedRoute` component
5. Token validation is performed on API requests for secured endpoints

## Data Models

The application uses the following data models (defined in `shared/schema.js`):

1. **User**: Basic user information and authentication details
2. **DoctorProfile**: Professional information for healthcare providers
3. **Appointment**: Patient-doctor appointment details
4. **Review**: Patient reviews for doctors
5. **ForumTopic**: Community discussion topics
6. **ForumReply**: Replies to forum topics
7. **BlogPost**: Health articles and educational content
8. **VideoReel**: Educational video content
9. **MedicalRecord**: Patient medical history
10. **Prescription**: Medication and treatment prescriptions

## Contributing

1. Fork the repository
2. Create a new branch for your feature
3. Commit your changes
4. Push to your branch
5. Create a pull request

---

© 2025 MediConnect - Healthcare Appointment Platform