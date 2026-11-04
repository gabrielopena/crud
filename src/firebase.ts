import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBkE6urNr5qvb1l2y5mqfdo8ftKdqB1EME",
  authDomain: "niga-d1096.firebaseapp.com",
  projectId: "niga-d1096",
  storageBucket: "niga-d1096.firebasestorage.app",
  messagingSenderId: "39847440798",
  appId: "1:39847440798:web:aec64625a8a64b49c9268f",
  measurementId: "G-602JMYFP1W"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
