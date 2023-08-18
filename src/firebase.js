// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCg82CKZdASbAQzNOkCPuUU8-fS0MudOqU",
  authDomain: "pcweb6-e4d16.firebaseapp.com",
  projectId: "pcweb6-e4d16",
  storageBucket: "pcweb6-e4d16.appspot.com",
  messagingSenderId: "567223719228",
  appId: "1:567223719228:web:ea2b981661704aa198ba39"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);