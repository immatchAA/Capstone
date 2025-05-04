import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDGynVi2H-JMtSNpCYDn-q3Hq1LA63wteU",
  authDomain: "archiquest-a2707.firebaseapp.com",
  projectId: "archiquest-a2707",
  storageBucket: "archiquest-a2707.appspot.com",
  messagingSenderId: "382574143940",
  appId: "1:382574143940:web:3be6b083c41038059c9c91",
  measurementId: "G-H2TK5G45VM"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db};
