# 📘 NexTest: Architectural Blueprint & Roadmap

## 🏛️ Architectural Blueprint (Refined)

1. **Reference Standard**: All UI and logic strictly adhere to the patterns defined in `CBT_EXAM_STRUCTURE.md` (TCS iON/NTA style).
2. **Tech Stack**: 
   - **Frontend**: React (v19) + TypeScript + Vite.
   - **Backend**: Supabase (PostgreSQL) for all exam data and user persistence.
   - **Routing**: React Router (v7) for multi-page flow.
   - **Styling**: Tailwind CSS (v4) with semantic theme variables in `index.css`.
   - **Icons**: Lucide React.
3. **Data Driven**: The application is fully driven by Supabase. Local `questions.json` is deprecated and kept only for reference/seeding. Any schema changes are documented in `DATABASE_SCHEMA.sql`.
4. **State Engine**: 
   - Global state managed via **React Context** (`ExamContext.tsx`).
   - Dynamic initialization via `initializeSession(id)` which fetches subjects and questions on-demand.
   - Session lifecycle: `Login` -> `Dashboard` -> `Instructions` -> `Exam` -> `Result`.
5. **Security & Deployment**:
   - Environment variables (`VITE_SUPABASE_*`) are managed via `.env` locally and Render Environment Dashboard in production.
   - Row Level Security (RLS) is enabled on all PostgreSQL tables.

---

## ✅ Completed Milestones

### Core Infrastructure & Backend
- [x] Cleaned redundant boilerplate and files.
- [x] Configured Vitest + React Testing Library suite.
- [x] Established **Supabase Relational Schema** (Exams, Sessions, Subjects, Questions).
- [x] Implemented **Data Seeder** utility to migrate JSON data to the cloud.
- [x] Centralized TypeScript interfaces in `types.ts` for build stability.

### UI, UX & Rebranding
- [x] Full rebranding to **NexTest**: Browser title, scripts (`Start-NexTest.ps1`), and internal references.
- [x] Implemented professional **Login Page** and **Dynamic Dashboard**.
- [x] Implemented **Instructions Page** with live marking scheme fetching.
- [x] Made the entire application **Mobile Responsive**.
- [x] Refactored **Result Dashboard** into a tabbed interface with Subject-wise analytics.

### Build & Stability
- [x] Resolved all TypeScript `null` safety and type mismatch errors.
- [x] Verified production build (`tsc -b && vite build`) passes successfully.
- [x] Enabled scrolling on Result page for both Desktop and Mobile.

---

## 🚀 Feature Roadmap (Updated)

### Phase 1: Persistence & Authentication (Current Focus)
- [ ] **Real Authentication**: Replace the mock login form with Supabase Auth (Email/Password).
- [ ] **Result Storage**: Implement `saveAttempt` to store `examState` and scores in the `attempts` and `attempt_responses` tables.
- [ ] **User Profiles**: Link logged-in users to their `profiles` table to display real names/rolls.

### Phase 2: User History & Experience
- [ ] **Attempt History**: Show a list of past exam scores on the Dashboard.
- [ ] **Review Mode**: Allow users to click on a past attempt to see their "Question Paper" breakdown.
- [ ] **Session Recovery**: Auto-save progress to LocalStorage to prevent data loss on accidental refresh.

### Phase 3: Analytics & Insights
- [ ] **Visual Trends**: Performance charts showing growth across multiple sessions.
- [ ] **Time Tracking**: Log `time_spent_seconds` per question to identify performance bottlenecks.
- [ ] **Subject Weakness Report**: Automated alerts for subjects with < 50% accuracy.

### Phase 4: Advanced Content
- [ ] **Image/Diagram Support**: Support for URL-based images in `QuestionCanvas`.
- [ ] **Numerical Questions**: Add support for non-MCQ questions with a virtual keypad.
- [ ] **Multiple Exam Sets**: Add more diverse question sets (NEET, RRB, GATE).

---

## 🛠️ Lifecycle & Process Principles
- **Type Safety First**: No `any` types; always update `types.ts` before implementing new data features.
- **Backend-Sync**: Ensure RLS policies in Supabase are updated when adding new user-specific tables.
- **Audit Ready**: No Git commits without explicit user approval (as per `GEMINI.md`).
