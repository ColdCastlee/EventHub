# EventHub — Event & Participant Management System

## 📌 Overview

EventHub is a full-stack web application designed to manage events and participants.  
It allows users to create events, manage participants, and register participants to events.

The project demonstrates:

- relational data modeling
- REST API design and implementation
- frontend–backend integration
- backend technology comparison
- full-stack application deployment

---

## 🧱 System Architecture

### Main Stack

- Frontend: React (Single Page Application)
- Backend: Django REST Framework
- Database: PostgreSQL

### Secondary Backend (Comparison)

- Backend: Node.js (Express)
- Database: SQLite

---

## ⚙️ Features

### Event Management
- Create events
- Update events
- Delete events
- List events
- Filter events by date and status

### Participant Management
- Create participants
- Update participants
- Delete participants
- List participants

### Registration System
- Register participants to events
- Many-to-many relationship between participants and events
- Prevent duplicate registrations

---

## 🔁 Backend Comparison

To explore different backend technologies, we implemented a secondary backend using Node.js.

| Feature            | Django REST         | Node.js (Express)     |
|------------------|------------------|----------------------|
| Structure        | Structured        | Flexible             |
| ORM              | Built-in ORM      | Raw SQL              |
| Development Speed| Fast              | Moderate             |
| Scalability      | Good              | High (async)         |
| Database         | PostgreSQL        | SQLite               |

The Node.js backend replicates the same core logic:
- event management
- participant management
- registration system

This allows a direct comparison between structured and lightweight backend approaches.

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/eventhub.git
cd eventhub
