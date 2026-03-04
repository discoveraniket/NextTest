# 🗄️ NexTest Database Documentation

This document explains the architectural choices made in the NexTest schema and how they support the project's evolution from Phase 1 to Phase 5.

---

## 🏗️ Relational Hierarchy
The data follows a strictly normalized path to ensure scalability:
`Exams` → `Exam Sessions (Years)` → `Subjects` → `Questions`

This allows you to add a new "JEE 2025" session by simply adding one row to `exam_sessions` and linking new subjects to it, without duplicating exam metadata.

---

## 🗺️ Roadmap Support

### Phase 1: Core Dashboard
*   **Dynamic Listing**: The dashboard queries `exam_sessions` joined with `exams` to show cards for "JEE 2024," "NEET 2024," etc.
*   **Data Consistency**: Marking schemes (correct/negative marks) are stored at the `session` level, allowing different rules for different exams.

### Phase 2: User Profile & History
*   **`attempts` Table**: Every time a user clicks "Submit," we record a row here. The dashboard can then query `SELECT * FROM attempts WHERE user_id = current_user` to show history.
*   **`profiles` Table**: Stores persistent user data like Roll Numbers and names, replacing hardcoded strings.

### Phase 3: Analytics & Insights (The "Gold" Layer)
*   **`attempt_responses` Table**: This is the most critical table. It stores exactly what the user did for every question.
    *   **Topic Strength**: By joining `attempt_responses` with `questions` and `subjects`, we can calculate accuracy percentages per subject.
    *   **Time Management**: `time_spent_seconds` allows you to tell the user: *"You spent 4 minutes on Question 5 and still got it wrong."*

### Phase 4: Motivation & Engagement
*   **`streak_count` & `total_points`**: The `profiles` table is ready to track daily practice streaks and "XP" earned from correct answers.

---

### Phase 5: Content Expansion
*   **`JSONB` Options**: Storing options as `JSONB` in the `questions` table means you can easily support different question types (4-option, 5-option, True/False) without changing the database structure.
*   **`difficulty_level`**: Enables "Smart Practice" modes where users can choose to practice only 'hard' questions.

---

## 🛠️ Implementation Strategy
1.  **Paste SQL**: Copy the contents of `DATABASE_SCHEMA.sql` into the Supabase SQL Editor.
2.  **Foreign Keys**: All tables use `ON DELETE CASCADE`. If you delete an exam session, all its associated subjects and questions are automatically cleaned up.
3.  **Security**: Use Supabase **Row Level Security (RLS)** to ensure users can only see their own `attempts` and `profiles`.
