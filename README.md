# NextTest

A highly responsive Computer-Based Test (CBT) simulator built with React, Vite, and Tailwind CSS (v4). It replicates the standard interface used in exams like TCS iON and NTA.

## ✨ Features

- **Standard Interface**: 5-status color-coded question palette.
- **Dynamic Content**: Data-driven question loading from `questions.json`.
- **Exam Logic**: Supports Save & Next, Mark for Review, and Clear Response.
- **Real-time Summary**: Live table showing question status counts.
- **Robust Testing**: Comprehensive test suite using Vitest and React Testing Library.
- **One-Click Startup**: Windows PowerShell launcher for developers.

## 🛠️ Tech Stack

- **Frontend**: React (v19), Vite, Tailwind CSS (v4)
- **State Management**: React Context API
- **Icons**: Lucide React
- **Testing**: Vitest, React Testing Library

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (Latest LTS recommended)

### Local Development
1. Clone the repository.
2. Run the one-click launcher (Windows):
   ```powershell
   ./Start-CBT-Simulator.ps1
   ```
   *Or manually:*
   ```bash
   cd App
   npm install
   npm run dev
   ```

### Running Tests
- Use the root batch file: `runTests.bat`
- Or manually: `cd App && npm test`

## 🌍 Hosting on Render.com

To host this as a **Static Site** on [Render](https://render.com/):

1. **Connect** your GitHub repository.
2. **Build Filter**: Set to `App` (optional, but good for root projects).
3. **Build Command**: `cd App && npm install && npm run build`
4. **Publish Directory**: `App/dist`
5. **Add Environment Variable**: `NODE_VERSION` set to `20` or higher.

## 📄 License
This project is licensed under the MIT License.
