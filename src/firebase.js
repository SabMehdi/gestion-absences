// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth} from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBmvKJxwVI87wPWU8QNR4kXDEJIRu7tA8g",
  authDomain: "absences-ec4d8.firebaseapp.com",
  projectId: "absences-ec4d8",
  storageBucket: "absences-ec4d8.appspot.com",
  messagingSenderId: "692585541596",
  appId: "1:692585541596:web:c2af5e0999ee5417ee6919",
  measurementId: "G-MW5GP1JV05"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth=getAuth(app)