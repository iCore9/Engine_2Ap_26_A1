# PRD: Robokoshal InnovateR Platform

## Problem Statement
Build a production-ready interactive website/web app for Robokoshal Tech Innovation and InnovateR for pitching universities, academic partners, investors, and institutional decision-makers.

## Architecture
- **Frontend**: React + Tailwind CSS + Recharts + Shadcn UI
- **Backend**: FastAPI + MongoDB
- **Auth**: JWT Bearer tokens, bcrypt passwords, RBAC
- **Fonts**: Outfit (headings) + IBM Plex Sans (body)
- **Theme**: Light-futuristic, white/sky-blue/cyan/orange

## What's Been Implemented (Initial Build - Feb 2026)

### Backend (server.py)
- JWT auth system with bcrypt, Bearer token auth
- Role-based access: super_admin, team_editor, external_viewer
- Admin user management (create/disable/delete)
- Team members CRUD
- Portfolio items CRUD
- Programs CRUD (B.Tech, Diploma, Partner Diploma)
- Finance settings per program (with OPEX items)
- Lab planner items CRUD + bulk update
- Testimonials CRUD
- Startup seeding (admin, team, portfolio, programs, finance, lab items, testimonials)

### Frontend Sections
1. **Hero** - Cursor spotlight, InnovateR logo, floating stat cards, rotating taglines, CTAs
2. **About/Team** - 4 team members with pseudo-3D tilt cards, skills badges, skills progression ladder
3. **Portfolio** - 5 robots with tilt cards, category filter, detail modal
4. **Programs** - B.Tech/Diploma/Partner tabs, curriculum accordion, fee structure
5. **Finance Dashboard** - Interactive sliders, Recharts (Bar/Line/Pie), P&L table, OPEX breakdown, Indian formatting
6. **Lab Setup Planner** - Lean/Recommended/Flagship presets, category accordion, cost summary, bar chart
7. **University Partnership** - Benefits, revenue model, 120-day timeline, CTAs
8. **Testimonials** - Carousel with navigation
9. **Admin Panel** - User management (create/role/disable/delete), Team/Portfolio/Programs/Testimonials view

### Key Features
- Indian number formatting (₹ Lakhs / Crores)
- Compounding batch revenue model (Year 1-4 growth)
- 3-party revenue split for Partner Diploma
- Glassmorphism navbar
- Cursor spotlight effect
- Floating animation cards

## Admin Credentials
- Email: robokoshal@gmail.com
- Password: robo@KOSHAL()149#
- Role: super_admin

## Default Program Data
- B.Tech IRS: 60 seats, ₹2,40,550/yr, 4yr, Univ:60% / Robo:40%
- Diploma: 30 seats, ₹1,20,000/yr, 2yr, Univ:55% / Robo:45%
- Partner Diploma: 40 seats, ₹1,50,000/yr, 2yr, Univ:50% / Robo:30% / Partner:20%

## P0 Backlog (Next Priority)
1. Inline admin editing of programs, OPEX items, team cards from main site
2. Export to PDF / printable proposal snapshot
3. Portfolio image upload functionality
4. Testimonials add from admin panel (not just delete)
5. Add team member form in admin panel

## P1 Features
- Presentation mode (full-screen kiosk style)
- Shareable finance scenario link
- Dark mode toggle
- Mobile optimization (responsive fine-tuning)
- Custom domain deployment instructions

## P2 Features
- Interactive lab floor plan hotspots
- Product catalog with downloadable specs
- Multi-language support (Hindi)
