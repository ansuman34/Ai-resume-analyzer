import { initializeApp, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "ai-interview-assistant-20269.firebaseapp.com",
  projectId: "ai-interview-assistant-20269",
  storageBucket: "ai-interview-assistant-20269.firebasestorage.app",
  messagingSenderId: "387414669858",
  appId: "1:387414669858:web:5eca3ef4f19be4ee0d287b",
  measurementId: "G-7WNR9NF89V"
};

let auth = null;
let googleProvider = null;
let githubProvider = null;
let firebaseInitError = null;

try {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  githubProvider = new GithubAuthProvider();
} catch (err) {
  if (err.code === 'app/duplicate-app') {
    try {
      const app = getApp();
      auth = getAuth(app);
      googleProvider = new GoogleAuthProvider();
      githubProvider = new GithubAuthProvider();
    } catch (getAppErr) {
      firebaseInitError = getAppErr.message;
      console.error("[Firebase] getApp() failed:", getAppErr.message);
    }
  } else {
    firebaseInitError = err.message;
    console.error("[Firebase] Initialization failed:", err.message);
  }
}

export { auth, googleProvider, githubProvider, firebaseInitError };

