// src/offline/NoteCache.js

const DB_NAME = "inotebook_offline";
const DB_VERSION = 1;
const STORE_NAME = "notes";

function openDB() {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onupgradeneeded = (e) => {
			const db = e.target.result;

			// Store full note objects (same shape as in state: _id, title, tagType, etc.)
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				db.createObjectStore(STORE_NAME, { keyPath: "_id" });
			}
		};

		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}

export async function getCachedNotes() {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, "readonly");
		const store = tx.objectStore(STORE_NAME);
		const req = store.getAll();

		req.onsuccess = () => resolve(req.result || []);
		req.onerror = () => reject(req.error);
	});
}

export async function cacheNotes(notes) {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, "readwrite");
		const store = tx.objectStore(STORE_NAME);

		// Clear old and store new
		const clearReq = store.clear();
		clearReq.onsuccess = () => {
			(notes || []).forEach((note) => {
				if (note && note._id) {
					store.put(note);
				}
			});
		};

		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
}
