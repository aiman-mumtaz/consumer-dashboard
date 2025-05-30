const DB_NAME = 'dashboardDB';
const DB_VERSION = 1;
const RESPONSES_STORE = 'responses';
const QUESTIONS_STORE = 'questions';

export function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(RESPONSES_STORE)) {
        db.createObjectStore(RESPONSES_STORE, { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(QUESTIONS_STORE)) {
        db.createObjectStore(QUESTIONS_STORE, { keyPath: 'id' }); // id is integer
      }
    };

    request.onsuccess = e => resolve(e.target.result);
    request.onerror = e => reject(e.target.error);
  });
}

export async function saveQuestions(questions) {
  const db = await openDB();
  const tx = db.transaction(QUESTIONS_STORE, 'readwrite');
  const store = tx.objectStore(QUESTIONS_STORE);

  for (const q of questions) {
    store.put(q);
  }

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = e => reject(e.target.error);
  });
}

export async function getQuestions() {
  const db = await openDB();
  const tx = db.transaction(QUESTIONS_STORE, 'readonly');
  const store = tx.objectStore(QUESTIONS_STORE);

  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = e => resolve(e.target.result);
    req.onerror = e => reject(e.target.error);
  });
}

export async function saveResponses(responses) {
  const db = await openDB();
  const tx = db.transaction(RESPONSES_STORE, 'readwrite');
  const store = tx.objectStore(RESPONSES_STORE);

  for (const response of responses) {
    store.add({
      question: response.question,
      type: response.type,
      weightage: response.weightage,
      score: response.score,
      timestamp: response.timestamp,
    });
  }

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = e => reject(e.target.error);
  });
}

export async function getAllResponses() {
  const db = await openDB();
  const tx = db.transaction(RESPONSES_STORE, 'readonly');
  const store = tx.objectStore(RESPONSES_STORE);

  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = e => resolve(e.target.result);
    req.onerror = e => reject(e.target.error);
  });
}
