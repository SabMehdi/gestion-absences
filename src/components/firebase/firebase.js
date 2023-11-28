import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyBmvKJxwVI87wPWU8QNR4kXDEJIRu7tA8g",
  authDomain: "absences-ec4d8.firebaseapp.com",
  projectId: "absences-ec4d8",
  storageBucket: "absences-ec4d8.appspot.com",
  messagingSenderId: "692585541596",
  appId: "1:692585541596:web:c2af5e0999ee5417ee6919",
  measurementId: "G-MW5GP1JV05"
};

const app = initializeApp(firebaseConfig);//app avec conffour
const analytics = getAnalytics(app);//suiv des uti
export const auth = getAuth(app)//auth