# 📄 AI-Powered Batch Assignment Evaluator

An intelligent web application that automatically evaluates student assignments in bulk using AI. It fetches PDF submissions from a Google Drive folder, evaluates each one against custom criteria using the **Groq LLaMA 3.1** model, and exports the results — marks and feedback — into a downloadable Excel report.

---

## 🚀 Features

- 📁 **Google Drive Integration** — Automatically fetches all PDF files from a shared Google Drive folder
- 🤖 **AI Evaluation** — Uses Groq's LLaMA 3.1 8B model to evaluate each assignment against your custom criteria
- 📊 **Excel Report Export** — Generates a downloadable `.xlsx` file with file name, marks, and detailed feedback for every student
- 🌐 **Web UI** — Clean glassmorphism-styled frontend; no command-line needed
- ⚡ **Batch Processing** — Evaluates multiple PDFs in a single click

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express.js |
| AI Model | Groq API (LLaMA 3.1 8B Instant) |
| Google Drive | Google Drive API v3 (Service Account) |
| PDF Parsing | `pdf-parse` |
| Excel Export | `ExcelJS` |
| Frontend | HTML, CSS (Glassmorphism) |
| File Upload | `Multer` |

---

## 📂 Project Structure

```
assignment-evaluator/
├── server.js           # Main Express server — core logic
├── Com.js              # Alternate single-file version (Gemini API)
├── index.html          # Main frontend UI
├── web.html            # Alternate lightweight UI
├── style.css           # Stylesheet
├── credentials.json    # Google Service Account credentials (do NOT commit)
├── criteria.txt        # Sample evaluation criteria
├── results.xlsx        # Sample output report
└── package.json        # Project dependencies
```

---

## ⚙️ Setup & Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/assignment-evaluator.git
cd assignment-evaluator
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add your API keys

Open `server.js` and replace the placeholder with your Groq API key:

```js
const GROQ_API_KEY = "your_groq_api_key_here";
```

Get your free Groq API key at: [https://console.groq.com](https://console.groq.com)

### 4. Set up Google Drive API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project and enable the **Google Drive API**
3. Create a **Service Account** and download the credentials as `credentials.json`
4. Place `credentials.json` in the project root
5. Share your Google Drive folder with the service account email (with **Viewer** access)

### 5. Start the server

```bash
npm start
```

The app will be live at: **http://localhost:3000**

---

## 🖥️ How to Use

1. Open **http://localhost:3000** in your browser
2. **Paste** your Google Drive folder link (the folder containing student PDFs)
3. **Upload** a `.txt` file with your evaluation criteria (e.g., rubric, marking scheme)
4. Click **Evaluate**
5. Wait for the AI to process all submissions
6. The `results.xlsx` file will automatically download with:
   - Student file name
   - Marks awarded
   - Detailed AI feedback

---

## 📋 Criteria File Format

Your criteria file should be a plain `.txt` file describing how assignments should be judged. Example:

```
- Proper problem statement (20 marks)
- Correct algorithm implementation (40 marks)
- Code quality and comments (20 marks)
- Output and test cases (20 marks)
```

---

## 📊 Sample Output (results.xlsx)

| File Name | Marks | Feedback |
|---|---|---|
| student1.pdf | 82 | Good implementation. Algorithm is correct but lacks comments. |
| student2.pdf | 65 | Problem statement is incomplete. Output screenshots are missing. |

---

## ⚠️ Important Notes

- **Do not commit** `credentials.json` or your `GROQ_API_KEY` to GitHub. Add them to `.gitignore`.
- Each PDF is trimmed to the first **4000 characters** for AI evaluation to stay within token limits.
- The app processes PDFs **sequentially** (one by one) to avoid API rate limits.

---

## 🔒 .gitignore (Recommended)

Create a `.gitignore` file with the following:

```
node_modules/
uploads/
credentials.json
results.xlsx
.env
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙌 Acknowledgements

- [Groq](https://groq.com/) — Ultra-fast LLaMA 3.1 inference
- [Google Drive API](https://developers.google.com/drive) — File access
- [ExcelJS](https://github.com/exceljs/exceljs) — Excel generation
- [pdf-parse](https://www.npmjs.com/package/pdf-parse) — PDF text extraction
