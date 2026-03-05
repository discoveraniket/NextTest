# Standard Structure and Logic for Indian CBT Exam Web Applications

This document outlines the general structure, layout, and logic of Computer-Based Test (CBT) applications used in major Indian competitive exams (e.g., JEE, NEET, GATE, Banking). This serves as the guiding principle for the CBT Exam Simulator project.

## 1\. Visual Layout (The Exam Console)

The interface is typically divided into four distinct functional zones:

### A. Top Header

* **Exam/Candidate Info:** Displays the exam name, candidate's name, and profile photograph.
* **Section Tabs:** Horizontal tabs allowing candidates to switch between different subjects or sections (e.g., Physics, Chemistry, Mathematics).
* **Timer:** A prominent countdown clock (usually top-right) showing the remaining time. It must be synced with the server.

### B. Main Question Area (Left/Center)

* **Question Text:** Displays the question, including any associated images, equations, or diagrams.
* **Options:** Multiple-choice options (Radio buttons for single-correct, Checkboxes for multiple-correct).
* **Virtual Numeric Keypad:** For Numerical Answer Type (NAT) questions, a virtual keypad is provided as physical keyboards are typically disabled.

### C. Question Palette (Right Sidebar)

* **Navigation Grid:** A grid of buttons representing every question in the current section.
* **Status Color Coding (Critical Logic):**

  * ⬜ **White:** Not Visited (Candidate has not opened the question).
  * 🟥 **Red:** Visited but Not Answered (Candidate has viewed but not selected an option).
  * 🟩 **Green:** Answered (The answer is saved and will be considered for evaluation).
  * 🟪 **Purple:** Marked for Review (Candidate wants to revisit; answer not selected).
  * 🟪✅ **Purple with Tick:** Answered \& Marked for Review (The answer is selected and *will* be evaluated even if not revisited).

### D. Action Footer (Bottom Bar)

* **Save \& Next:** Saves the current response and moves to the next question.
* **Clear Response:** Deselects the chosen option for the current question.
* **Mark for Review \& Next:** Flags the question for later review and moves to the next question.
* **Previous/Next:** Simple navigation buttons to move between questions without necessarily saving.

---

## 2\. Functional Logic \& State Management

### A. Persistence Logic

* **State Sync:** Every "Save \& Next" action must trigger an API call to persist the candidate's response to the server.
* **Resumption:** If a terminal fails, the candidate must be able to log in on another machine and resume from the exact state (timer and answers) where they left off.

### B. Navigation \& Timing

* **Sequential \& Direct Access:** Candidates can move linearly (Next/Back) or jump to any question via the Palette.
* **Sectional Constraints:** Implement logic for both "Free Movement" (jump between subjects anytime) and "Sectional Timers" (cannot move to the next subject until the current one's time expires).
* **Auto-Submit:** When the timer reaches `00:00`, the system must automatically lock the exam and submit all "Saved" and "Answered \& Marked for Review" responses.

### C. Evaluation Rules

* **Positive Marks:** Awarded for correct answers.
* **Negative Marks:** Deducted for incorrect MCQ answers (usually not applicable for NAT questions).
* **Unanswered/Marked for Review:** Zero marks (unless "Answered \& Marked for Review").

---

## 3\. Security \& Integrity Logic (The "Kiosk" Environment)

* **Input Blocking:** Disable physical keyboard inputs (except for specific allowed fields), right-click menus, and common shortcuts (`Ctrl+C`, `Ctrl+V`, `Alt+Tab`, `F12`).
* **Full-Screen Mode:** The application should ideally run in a forced full-screen/kiosk mode to prevent window switching.

---

## 4\. User Flow (The Lifecycle)

1. **Login Screen:** Secure entry using Hall Ticket Number and Password.
2. **Instruction Page:** Mandatory reading period (often with a "Next" button that only activates after a delay).
3. **Declaration:** A checkbox confirming the candidate has read and understood the rules.
4. **Main Exam Console:** The core testing phase starts here.
5. **Summary Screen:** Displayed after the timer ends or a manual "Submit" click (if allowed), showing counts of Answered, Unanswered, and Marked questions.
6. **Final Submission:** Final confirmation and exit.
