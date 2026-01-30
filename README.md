# Blessfeed

Blessfeed is a minimal, privacy-first emotional stabilization app built with the MERN stack.
It helps users pause, regulate emotional intensity, and release mental pressure without accounts, tracking, or stored personal data.

## Purpose

The goal of Blessfeed is to create a calm, low-friction space for emotional regulation.
The app avoids social feeds, notifications, and identity-based features to reduce cognitive load and protect user privacy.

## How the App Works

1. Resonance  
   The user sets their current emotional intensity.
   This action starts an anonymous session on the backend.

2. Circle (Real-Time Presence)  
   Users can tap into a shared pulse using WebSockets.
   There is no chat or identity — only real-time presence.

3. Feed (Zero-Data Release)  
   Users can release a thought.
   The text is processed momentarily on the server and immediately discarded.
   Only a derived signal is stored, never the content.

4. Breathe  
   A guided breathing interaction tied to the session state.

## Architecture

Frontend:
- React + Vite
- Framer Motion for animation
- Socket.io client for real-time events

Backend:
- Node.js + Express
- MongoDB for anonymous session metadata
- Socket.io for real-time presence
- REST APIs for session lifecycle

## Why There Is No Authentication

Authentication is intentionally excluded.
Users can open the app and begin immediately without creating accounts or sharing identity.

Each session is anonymous and short-lived.
This design prioritizes privacy, simplicity, and intentional UX over feature count.

## Live Demo

Frontend:
https://blessfeed.vercel.app

Backend API:
https://blessfeed.onrender.com

## What This Project Demonstrates

- Full-stack MERN development
- Clean API and session lifecycle design
- Real-time systems using WebSockets
- Privacy-first architecture decisions
- Product thinking beyond basic CRUD apps
