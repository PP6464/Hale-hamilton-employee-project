import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, onMessage } from "firebase/messaging";
import { getStorage } from "firebase/storage";

const app = initializeApp({
  apiKey: "AIzaSyDs2uryBMFaetOHsA8o6kzd8XyRWoydMGc",
  authDomain: "hale-hamilton-employee-project.firebaseapp.com",
  projectId: "hale-hamilton-employee-project",
  storageBucket: "hale-hamilton-employee-project.appspot.com",
  messagingSenderId: "862072805914",
  appId: "1:862072805914:web:307c782b8ef4ad0f2e0fa3",
  measurementId: "G-DS6TZTHMB3",
});
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const messaging = getMessaging(app);
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
export const apiURL = "https://fair-coveralls-elk.cyclic.app";
