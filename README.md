
# 🗂️ NoteVault

**NoteVault** is a secure, modern note-taking web application built using the **MERN stack**.  
It allows users to create, organize, and manage notes with support for attachments, custom tags, reminders, and version history.

This project is designed as a **real-world portfolio application**, focusing on clean architecture, security, and scalability.

---

## ✨ Features

- 🔐 Secure user authentication (JWT)
- 📝 Create, edit, and delete notes
- 📎 Attach images, PDFs, and documents
- 🏷️ Custom tags for better organization
- ⏰ Reminders for important notes
- 🕘 Version history to track and restore changes
- 🖼️ OCR support (extract text from images)
- ⚡ Fast, clean, and responsive UI
- 🤖 AI-ready architecture for future features

---

## 🛠 Tech Stack

### Frontend
- React (Create React App)
- Bootstrap
- React Router

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Multer (file uploads)

---

## 📂 Project Structure

```

notevault/
│
├── src/                      # Frontend (React)
│   ├── components/
│   ├── context/
│   └── App.js
│
├── notevaultBackend/         # Backend (Node + Express)
│   ├── routes/
│   ├── middleware/
│   ├── uploads/
│   ├── db.js
│   ├── index.js
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md

````

---

## 🚀 Getting Started (Local Setup)

Follow these steps **in order** to avoid common setup issues.

---

### 1️⃣ Clone the repository

```bash
git clone https://github.com/Sahilkalambe22/notevault.git
cd notevault
````

---

### 2️⃣ Install dependencies

#### Frontend dependencies

From the **project root directory**:

```bash
npm install
```

This installs all required frontend packages into `node_modules`.

---

#### Backend dependencies

Move into the backend folder:

```bash
cd notevaultBackend
npm install
```

🔹 `node_modules` folders are **not uploaded to GitHub**
🔹 You **must** run `npm install` separately for frontend and backend

---

### 3️⃣ Environment Variables (`.env` setup)

The backend requires environment variables to run.

#### Create a `.env` file inside `notevaultBackend/`

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Example (local MongoDB):

```env
MONGO_URI=mongodb://localhost:27017/notevault
JWT_SECRET=mySuperSecretKey
```

🔒 **Important**

* `.env` files are **ignored by Git**
* Never upload real secrets to a public repository
* Use platform environment variables when deploying

---

### 4️⃣ Run the backend server

From the `notevaultBackend` directory:

```bash
npm run dev
```

or

```bash
nodemon index.js
```

Backend runs on:

```
http://localhost:5000
```

---

### 5️⃣ Run the frontend

Open a new terminal, go back to the project root:

```bash
npm start
```

Frontend runs on:

```
http://localhost:3000
```

---

## 📜 Available Scripts (Frontend)

In the project root, you can run:

### `npm start`

Runs the app in development mode.

### `npm run build`

Builds the app for production.

### `npm test`

Runs tests (if configured).

> ⚠️ `npm run eject` is **not required** for this project.

---

## 🌍 Deployment Notes

* **Frontend:** Vercel / Netlify
* **Backend:** Render / Railway
* **Database:** MongoDB Atlas

When deploying:

* Do **not** upload `.env` files
* Add environment variables in the hosting platform dashboard

---

## 🧠 Common Issues & Solutions

### ❓ Backend crashes on startup

✔ Ensure `.env` exists inside `notevaultBackend`
✔ Ensure `MONGO_URI` is correct
✔ Ensure MongoDB service is running

---

### ❓ “Module not found” errors

✔ Run `npm install` in **both** frontend and backend folders
✔ Ensure Node.js is installed

---

## 📌 Future Enhancements

* AI-powered note suggestions
* Full-text search
* Note sharing
* Calendar-based reminders
* Mobile optimization

---

## 👨‍💻 Author

**Sahil Kalambe**
Engineering Graduate | MERN Stack Developer

---

## ⭐ Final Note

If you find this project useful:

* ⭐ Star the repository
* 🍴 Fork it
* 🛠️ Explore and improve it



```
notevault
├─ eng.traineddata
├─ notevaultBackend
│  ├─ .env
│  ├─ db.js
│  ├─ ExtractionUploads
│  ├─ index.js
│  ├─ middleware
│  │  ├─ fetchuser.js
│  │  └─ uploads.js
│  ├─ models
│  │  ├─ Note.js
│  │  ├─ NoteVersion.js
│  │  └─ User.js
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ routes
│  │  ├─ aiSuggest.js
│  │  ├─ auth.js
│  │  ├─ notes.js
│  │  └─ ocr.js
│  ├─ uploads
│  │  ├─ 1764566446121-326302813.jpg
│  │  ├─ 1764566446125-863861465.pdf
│  │  ├─ 1764593621952-549563739.jpg
│  │  ├─ 1764593621953-788304018.pdf
│  └─ utils
│     └─ pruneNoteVersions.js
├─ package-lock.json
├─ package.json
├─ public
│  ├─ favicon.ico
│  ├─ index.html
│  ├─ logo192.png
│  ├─ logo512.png
│  ├─ manifest.json
│  └─ robots.txt
├─ README.md
├─ src
│  ├─ App.css
│  ├─ App.js
│  ├─ components
│  │  ├─ About.js
│  │  ├─ Alert.js
│  │  ├─ AuthLayout.js
│  │  ├─ DiffViewer.js
│  │  ├─ Footer.css
│  │  ├─ Footer.js
│  │  ├─ Home.js
│  │  ├─ Login.js
│  │  ├─ Navbar.js
│  │  ├─ NoteAttachmentsPanel.js
│  │  ├─ NoteEditorPage.js
│  │  ├─ NoteImagesPanel.js
│  │  ├─ NoteItem.js
│  │  ├─ NotePreview.js
│  │  ├─ Notes.js
│  │  ├─ NotesFilters.js
│  │  ├─ NotesHeader.js
│  │  ├─ OcrExtractor.js
│  │  ├─ PinButton.js
│  │  ├─ Profile.js
│  │  ├─ ProtectedRoute.js
│  │  ├─ ReminderBadge.js
│  │  ├─ ReminderManager.js
│  │  ├─ ReminderModal.js
│  │  ├─ RichTextEditor.js
│  │  ├─ Settings.js
│  │  ├─ ShowNote.js
│  │  ├─ Signup.js
│  │  ├─ TagSelector.js
│  │  ├─ TagSelectorModal.js
│  │  ├─ UserHeader.js
│  │  └─ VersionHistoryModal.js
│  ├─ context
│  │  └─ notes
│  │     ├─ notesContext.js
│  │     └─ NotesSt.js
│  ├─ index.css
│  ├─ index.js
│  ├─ offline
│  │  └─ NoteCache.js
│  └─ static
└─ uploads

```