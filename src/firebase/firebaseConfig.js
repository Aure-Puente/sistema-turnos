//Firebase:
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export const firebaseConfig = {
    apiKey: "AIzaSyATAc0xLbrMKuVg7vNFdaVPeupvAjBZakM",
    authDomain: "sistema-turnos-69aa6.firebaseapp.com",
    projectId: "sistema-turnos-69aa6",
    storageBucket: "sistema-turnos-69aa6.firebasestorage.app",
    messagingSenderId: "553637581011",
    appId: "1:553637581011:web:4f72478acb98f5b677c426"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);