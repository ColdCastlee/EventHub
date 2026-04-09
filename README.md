# 📌 EventHub — Event & Participant Management System

## 📖 Overview

EventHub is a full-stack web application designed to manage events and participants efficiently.

It allows users to:
- create and manage events
- manage participant profiles
- register participants to events

This project demonstrates key concepts in modern web development, including:

- relational data modeling
- REST API design and implementation
- frontend–backend integration
- backend technology comparison
- full-stack deployment

---

## 🧱 System Architecture

### 🔹 Main Stack

- **Frontend**: React (Single Page Application)
- **Backend**: Django REST Framework
- **Database**: PostgreSQL

### 🔹 Secondary Backend (Comparison)

- **Backend**: Node.js (Express)
- **Database**: SQLite

### 🔄 Architecture Flow

React (Frontend)
      ↓
Django REST API
      ↓
PostgreSQL

Optional comparison:
React → Node.js API → SQLite

---

## ⚙️ Features

### 🎯 Event Management

- Create events
- Update events
- Delete events
- List all events
- Filter events by:
  - date
  - status (upcoming / completed)

---

### 👤 Participant Management

- Create participant profiles
- Update participants
- Delete participants
- List participants

---

### 🔗 Registration System

- Register participants to events
- Many-to-many relationship:
  - One participant → multiple events
  - One event → multiple participants
- Prevent duplicate registrations

---

### 🔐 Authentication & Roles

- JWT-based authentication
- Role-based access:
  - **Admin**: full access (CRUD + registration management)
  - **Viewer**: read-only access

---

## 🗄️ Database Design

### Main Entities

- **Event**
  - id
  - title
  - date
  - status

- **Participant**
  - id
  - name
  - email

- **Registration**
  - id
  - event_id (FK)
  - participant_id (FK)

### ⚠️ Constraint

- A participant **cannot register twice** for the same event

---

## 🔁 Backend Comparison

To explore different backend technologies, we implemented a secondary backend using Node.js.

| Feature            | Django REST         | Node.js (Express)     |
|------------------|------------------|----------------------|
| Structure        | Highly structured | Flexible             |
| ORM              | Built-in ORM      | Raw SQL              |
| Development Speed| Fast              | Moderate             |
| Scalability      | Good              | High (async)         |
| Database         | PostgreSQL        | SQLite               |

👉 Both backends implement:
- event management
- participant management
- registration system

---

## 📡 API Endpoints (Django)

### Events
GET     /api/events/
POST    /api/events/
PUT     /api/events/{id}/
DELETE  /api/events/{id}/

### Participants
GET     /api/participants/
POST    /api/participants/
PUT     /api/participants/{id}/
DELETE  /api/participants/{id}/

### Registrations
GET     /api/registrations/
POST    /api/registrations/
DELETE  /api/registrations/{id}/

---

## 🚀 Deployment

### 🌐 Frontend

- Hosted on: Render
- URL：https://eventhub-frontend-5sdg.onrender.com

### 🔧 Backend (Django)

- Hosted on: Render
- URL: https://eventhub-gbu9.onrender.com

### 🗄️ Database

- PostgreSQL (Render / external provider)

---

## 🛠️ Installation & Setup

### 1️⃣ Clone the repository

git clone https://github.com/ColdCastlee/EventHub.git
cd EventHub

---

### 2️⃣ Backend (Django)

cd backend-django

pip install -r requirements.txt

python manage.py migrate
python manage.py runserver

---

### 3️⃣ Frontend (React)

cd frontend

npm install
npm start

---

### 4️⃣ Node.js Backend (optional)

cd backend-node

npm install
node server.js

---

## 📁 Project Structure

EventHub/
│
├── frontend/               # React SPA
├── backend-django/        # Django REST API
├── backend-node/          # Node.js (comparison)
│
├── README.md
└── report.pdf

---

## 💡 Key Technical Highlights

- RESTful API design with Django REST Framework
- Many-to-many relationship modeling
- JWT authentication system
- Role-based permission control
- Frontend–backend separation (SPA architecture)
- Backend comparison (Django vs Node.js)
- Full deployment (production-ready app)

---

## 👥 Team

- Xiangrui Feng  
- Fallou Diouf  

---

## 📄 License

This project is developed for academic purposes (Université Paris Cité — Web Programming 2026).

---

## ✅ TODO (Future Improvements)

- UI/UX improvements
- Pagination & search
- Email notifications
- Advanced filtering
- Docker deployment

---


## 🙌 Acknowledgements

- Université Paris Cité  
- Dr. Alla Jammine  
