// Scripts for firebase and firebase messaging
importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js");

// Initialize the Firebase app in the service worker by passing the generated config
const firebaseConfig = {
  apiKey: "AIzaSyDs2uryBMFaetOHsA8o6kzd8XyRWoydMGc",
  authDomain: "hale-hamilton-employee-project.firebaseapp.com",
  projectId: "hale-hamilton-employee-project",
  storageBucket: "hale-hamilton-employee-project.appspot.com",
  messagingSenderId: "862072805914",
  appId: "1:862072805914:web:307c782b8ef4ad0f2e0fa3",
  measurementId: "G-DS6TZTHMB3",
};

firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log("Received background message ", payload);
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "https://firebasestorage.googleapis.com/v0/b/hale-hamilton-employee-project.appspot.com/o/assets%2Flogo-black.svg?alt=media&token=e05f14b4-a7c0-4ee9-b0df-18c1c9e208bf",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
