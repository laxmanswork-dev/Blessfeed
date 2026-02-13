BlessFeed

BlessFeed is a real-time mood and breathing synchronization application built using the MERN stack. The application is designed to provide a focused two-minute guided breathing experience with live presence tracking and session-based reflection.

The core philosophy of this project is to build fewer features but implement them with strong architecture, real-time communication, and production-level thinking.

Live Demo

Frontend: https://blessfeed-1.onrender.com

Backend: https://blessfeed-backend.onrender.com

Tech Stack

Frontend:

React (Vite)

Tailwind CSS

Framer Motion

Socket.IO Client

Axios

Backend:

Node.js

Express.js

MongoDB

Mongoose

JWT Authentication

Socket.IO

Deployment:

Render (Frontend and Backend)

Core Features
1. Secure Authentication

JWT-based login and registration

Protected routes using custom middleware

Token validation on API requests

Persistent authentication using localStorage

2. Real-Time Presence System

Socket.IO integration

Active user count tracking

Real-time connection status updates

Event-based synchronization between users

3. Breathing Session Engine

Two-minute guided breathing cycle

Inhale and exhale timing logic

Pause and resume functionality

Live broadcast of breathing session state

Session creation and completion tracking

4. Reflection System

Interactive intensity slider

Dynamic UI color adaptation based on mood value

Weekly reflection visualization

Session history stored in MongoDB

Server-side session updates every few seconds

5. Performance-Oriented Design

Optimized re-renders using useMemo

Controlled socket lifecycle management

Structured event cleanup

Minimal unnecessary API calls

Architecture Overview

Frontend:

Component-based architecture

Separation of protected and public routes

Centralized authentication guard

Modular state management inside Home component

Backend:

REST API for authentication and session management

Middleware-based JWT validation

Socket layer for real-time communication

MongoDB schema for storing user sessions and mood values

API Endpoints

Authentication:

POST /api/auth/register

POST /api/auth/login

Session:

POST /api/session/create

POST /api/session/update

POST /api/session/complete

GET /api/session/my

Real-Time Events (Socket.IO)

Client Emits:

breathing:start

breathing:pause

breathing:stop

Server Broadcasts:

presence:sync

sync:status

breathing:started

breathing:paused

breathing:stopped

What This Project Demonstrates

Full MERN stack integration

Real-time event architecture

State synchronization between multiple clients

Authentication flow implementation

Clean UI interaction logic

Backend and frontend deployment handling

Structured component and route management

Future Improvements

Role-based access control

Rate limiting

Production-grade validation (Joi or Zod)

Unit and integration tests

Docker-based deployment

CI/CD pipeline

Installation (Local Setup)

Frontend:

cd vite-project
npm install
npm run dev


Backend:

cd backend
npm install
npm run dev


Create a .env file in backend:

MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret

Project Purpose

This project was built to demonstrate real-time system understanding, secure authentication design, and production-oriented full-stack development thinking as a MERN developer.

It focuses on architecture clarity, state management discipline, and real-time communication rather than feature overload.
