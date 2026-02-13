BlessFeed

BlessFeed is a real-time breathing and reflection platform built using the MERN stack.
It delivers a focused two-minute guided breathing session with live presence tracking and session-based reflection.

This project emphasizes architectural clarity, real-time synchronization, and production-oriented full-stack design rather than feature overload.

Live Demo

Frontend
https://blessfeed-1.onrender.com

Backend
https://blessfeed-backend.onrender.com

Tech Stack
Frontend

React (Vite)

Tailwind CSS

Framer Motion

Socket.IO Client

Axios

Backend

Node.js

Express.js

MongoDB

Mongoose

JWT Authentication

Socket.IO

Deployment

Render (Frontend and Backend)

Key Features
Secure Authentication

JWT-based registration and login

Protected routes with custom middleware

Token-based API authorization

Persistent session handling via localStorage

Real-Time System Architecture

WebSocket communication using Socket.IO

Live active-user presence tracking

Real-time breathing session synchronization

Event-driven communication between clients

Breathing Session Engine

Two-minute guided inhale/exhale cycle

Pause and resume functionality

Real-time broadcast of session state

Server-side session lifecycle tracking

Reflection and Data Layer

Interactive mood intensity slider

Dynamic UI color adaptation based on user input

Weekly reflection visualization

MongoDB-backed session persistence

Periodic backend updates during active sessions

Performance Considerations

Optimized re-renders using React hooks (useMemo, controlled state updates)

Socket lifecycle management with proper cleanup

Structured event listener handling

Reduced unnecessary API calls

Architecture Overview
Frontend Architecture

Component-based modular structure

Clear separation between public and protected routes

Centralized authentication guard

Real-time state management integrated with WebSocket layer

UI state synchronized with backend session updates

Backend Architecture

RESTful API for authentication and session management

Middleware-driven JWT validation

Dedicated Socket.IO layer for real-time events

MongoDB schema design for session persistence

Separation of concerns between routes, middleware, and models

REST API Endpoints
Authentication

POST /api/auth/register
POST /api/auth/login

Session Management

POST /api/session/create
POST /api/session/update
POST /api/session/complete
GET /api/session/my

Real-Time Events (Socket.IO)
Client Emits

breathing:start

breathing:pause

breathing:stop

Server Broadcasts

presence:sync

sync:status

breathing:started

breathing:paused

breathing:stopped

What This Project Demonstrates

End-to-end MERN stack implementation

Real-time event-driven system design

WebSocket and REST API integration

JWT-based authentication architecture

State synchronization across multiple clients

Clean route protection strategy

Deployment of full-stack application to cloud environment

Future Enhancements

Production-grade input validation (Joi or Zod)

Role-based access control

Rate limiting and security hardening

Unit and integration testing

Docker containerization

CI/CD pipeline integration

Local Setup
Frontend
cd vite-project
npm install
npm run dev

Backend
cd backend
npm install
npm run dev


Create a .env file inside backend:

MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret

Engineering Focus

BlessFeed was built to demonstrate:

Real-time distributed state handling

Secure authentication flow design

Clean separation of frontend and backend responsibilities

Event-driven architecture using WebSockets

Production-aware full-stack development practices

The project intentionally prioritizes architectural quality and system behavior over excessive features.
