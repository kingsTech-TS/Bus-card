<div align="center">

# 🚀 Business Card Generator SaaS

**Design, customize, and export professional business cards — powered by a canvas editor and AI.**

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-backend-009688?logo=fastapi&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Core Features](#-core-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Available Scripts](#-available-scripts)

---

## 🧭 Overview

A modern, scalable Business Card Generator built with **Next.js 16 (App Router)** and **FastAPI**. It gives users a complete set of tools to design, customize, and export professional business cards using advanced canvas manipulation and AI-driven content generation.

---

## 🌟 Core Features

| Feature | Description |
| :--- | :--- |
| 🎨 **Advanced Canvas Editor** | Powered by Konva.js for seamless drag-and-drop manipulation of text, images, and dynamic shapes. |
| 🔐 **Secure Authentication** | FastAPI OAuth2 Password Bearer with JWT access tokens and HTTP-only refresh cookies. |
| 🤖 **AI Integration** | Generate business taglines, design feedback, and professional text tones right from the editor. |
| 🗃️ **Templates & Brand Kits** | Save brand colors, typography, logos, and custom templates for instant reuse across cards. |
| ⬇️ **High-Quality Exports** | Asynchronous background rendering of crisp PNGs and PDFs, with progress polling in the UI. |
| 🛡️ **Admin Dashboard** | Role-based access to an analytics panel for usage, recently active users, and system metrics. |

---

## 🛠 Tech Stack

### Frontend

| Category | Technology |
| :--- | :--- |
| Framework | Next.js 16 (App Router, Turbopack) · React 19 |
| Language & Styling | TypeScript · Tailwind CSS v4 |
| State Management | Zustand (client stores) · TanStack Query (server caching) |
| UI Components | shadcn/ui · Base UI · Lucide icons · Framer Motion |
| Forms & Validation | React Hook Form · Zod |
| Canvas | Konva · react-konva |

### Backend

| Category | Technology |
| :--- | :--- |
| Framework | Python · FastAPI |
| Database | MongoDB Atlas |
| Validation | Pydantic models |
| Hosted at | [b-card-u68j.onrender.com](https://b-card-u68j.onrender.com) |

---

## 📁 Project Structure

```text
src/
├── app/
│   ├── (admin)/        # Admin dashboard & user management
│   ├── (protected)/    # Dashboard, cards, editor, templates, brand kit, assets, profile
│   ├── (public)/       # Landing, login, signup, password reset
│   └── api/auth/       # Refresh-token cookie route handlers
├── components/         # Auth, cards, editor, layout, templates & shadcn/ui components
├── hooks/              # TanStack Query hooks (cards, AI, export, autosave, ...)
├── providers/          # Query & theme providers
├── services/           # Axios API client and per-resource services
├── store/              # Zustand stores (auth, editor, ui)
└── proxy.ts            # Route protection
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) **18+**
- npm (bundled with Node.js)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Bus-card
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables** in a `.env` file at the project root:

   ```bash
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser. 🎉

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Run the production build |
| `npm run lint` | Lint the codebase with ESLint |

---

<div align="center">

Made with ❤️ 
</div>
