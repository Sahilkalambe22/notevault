# 🗂️ NoteVault

**NoteVault** is a modern, secure note-taking web application built using the **MERN stack**.

It allows users to create, organize, and manage notes with **rich text editing, attachments, reminders, tags, and version history** while maintaining a fast and responsive user experience.

This project is designed as a **real-world portfolio application**, focusing on:

- Clean architecture  
- Security  
- Scalability  
- Modern UI/UX practices  

---

# ✨ Features

## 🔐 Authentication & Security
- JWT-based authentication
- Secure API routes
- Protected frontend routes

## 📝 Notes Management
- Create, edit, and delete notes
- Rich text editor
- Autosave while editing
- Pin important notes

## 📎 Attachments
- Upload images and PDF documents
- Attach files directly to notes
- View and remove attachments

## 🏷 Organization
- Built-in tag system
- Custom tags supported
- Tag icons and color mapping

## ⏰ Reminders
- Add reminders to notes
- Reminder notifications
- Background reminder manager

## 🕘 Version History
- Automatic note version tracking
- Browse previous versions
- Restore older versions

## 🖼 OCR (Text Extraction)
- Extract text from uploaded images
- OCR powered by **Tesseract**

## ⚡ Modern UX
- Skeleton loaders
- Route-level loading spinner
- Lazy-loaded pages
- Responsive UI

## 💾 Offline Support
- Note cache system for improved reliability

## 🤖 AI-Ready Architecture
- AI suggestion route prepared for future AI features

---

# 🛠 Tech Stack

## Frontend
- React (Create React App)
- React Router
- Bootstrap
- Context API
- Lazy loading + Suspense

## Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Multer (file uploads)
- Tesseract OCR

---

# 📂 Project Structure


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
* Note sharing system
* Collaborative notes
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

