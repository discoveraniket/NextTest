# 📘 NexTest: Architectural Blueprint & Roadmap

## 🏛️ Architectural Blueprint (Refined)

1. **Reference Standard**: All UI and logic strictly adhere to the patterns defined in `CBT_EXAM_STRUCTURE.md` (TCS iON/NTA style).
2. **Tech Stack**: 
   - **Frontend**: React (v19) + TypeScript + Vite.
   - **Routing**: React Router (v7) for multi-page flow.
   - **Styling**: Tailwind CSS (v4) with semantic theme variables in `index.css`.
   - **Icons**: Lucide React.
3. **Data Driven**: Currently driven by `src/questions.json`. Any schema changes must be reflected in `types.ts`. Future state will migrate to a relational database (Supabase/PostgreSQL).
4. **State Engine**: 
   - Global state managed via **React Context** (`ExamContext.tsx`).
   - Handles navigation (`goToQuestion`), response management (`selectOption`, `clearResponse`), and session lifecycle (`submitExam`, `resetExam`).
   - Includes `isSubmitted` state to toggle between Exam and Result views.
5. **Multi-Page Flow**:
   - `/login`: Professional candidate entry portal.
   - `/dashboard`: Exam selection and performance history overview.
   - `/instructions`: Mandatory proctored-style rules and marking scheme.
   - `/exam/:id`: The core CBT simulation engine.
6. **Responsive Design**: 
   - Mobile-friendly layout using a "Stack-on-Mobile, Side-by-Side-on-Desktop" strategy.
   - Persistent fixed desktop layout for "Real Exam" feel, while allowing scrolling on small screens.

---

## ✅ Completed Milestones

### Core Infrastructure
- [x] Cleaned redundant boilerplate and files.
- [x] Setup Git repository and initial commit.
- [x] Configured Vitest + React Testing Library suite.
- [x] Created root-level orchestration (`package.json`, `.bat`, `.ps1`) for one-click development and testing.

### UI & UX (NexTest Rebranding)
- [x] Implemented professional **Login Page**.
- [x] Implemented **Candidate Dashboard** with exam selection cards.
- [x] Implemented **Instructions Page** with dynamic marking scheme display.
- [x] Refactored **Exam Engine** to support multi-page routing.
- [x] Enhanced **Status Summary** with larger live counts and green tick-mark consistency.
- [x] Made the entire application **Mobile Responsive**.

### Results System
- [x] Implemented `submitExam` logic with auto-submit on timer expiry.
- [x] Created **Tabbed Result Dashboard**:
  - **Scorecard Tab**: High-level stats and Subject-wise performance bars.
  - **Question Paper Tab**: Detailed row-by-row accuracy breakdown.
- [x] Fixed "White Screen" bug by ensuring proper state variable declarations.
- [x] Fixed "Desktop Scrolling" issue on result pages.

---

## 🚀 Feature Roadmap (Updated)

### Phase 1: Data Normalization & Persistence (Current Focus)
- [ ] **Database Setup**: Connect Supabase (PostgreSQL) to replace local JSON.
- [ ] **Dynamic Listing**: Fetch exams and years from the database instead of `questions.json` imports.
- [ ] **Result Storage**: Save the `examState` and final score to an `attempts` table upon submission.
- [ ] **Real Authentication**: Connect the Login page to Supabase Auth.

### Phase 2: User Profile & History
- [ ] **Attempt History**: Display real past attempts on the Dashboard.
- [ ] **Resume Session**: Allow candidates to resume an exam if they accidentally close the browser (LocalStorage sync).
- [ ] **Profile Management**: Allow users to update their placeholder info (Joymalya Majee).

### Phase 3: Analytics & Insights
- [ ] **Performance Trends**: Line charts showing score improvement over multiple attempts.
- [ ] **Time Analysis**: Track time spent per question to identify "Time Wasters."
- [ ] **Weak Topic Alerts**: Suggest subjects that need more focus based on accuracy.

### Phase 4: Content Expansion
- [ ] **Multi-Exam Support**: Add more question sets (NEET, RRB, JEE).
- [ ] **Image Support**: Update `QuestionCanvas` to render diagrams/images from URLs.
- [ ] **Virtual Keypad**: Implement a standard CBT on-screen keypad for numerical questions.

---

## 🛠️ Lifecycle & Process Principles
- **Validation First**: Every logic change in `ExamContext` must be verified by `npm run test`.
- **Modularity**: Components must remain pure; keep business logic inside hooks/context.
- **Audit Ready**: No Git commits without explicit user approval (as per `GEMINI.md`).
