// Import and configure the Firebase SDK
// These scripts are made available when the app is served or deployed on Firebase Hosting
// If you do not serve/host your project using Firebase Hosting see https://firebase.google.com/docs/web/setup
/* importScripts('/__/firebase/7.23.0/firebase-app.js');
importScripts('/__/firebase/7.23.0/firebase-messaging.js');
importScripts('/__/firebase/init.js');

const messaging = firebase.messaging(); */

/* *
 * Here is is the code snippet to initialize Firebase Messaging in the Service
 * Worker when your app is not hosted on Firebase Hosting.

 // [START initialize_firebase_in_sw]
 // Give the service worker access to Firebase Messaging.
 // Note that you can only use Firebase Messaging here, other Firebase libraries
 // are not available in the service worker.  * */
importScripts('https://www.gstatic.com/firebasejs/7.23.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.23.0/firebase-messaging.js');

 // Initialize the Firebase app in the service worker by passing in
 // your app's Firebase config object.
 // https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
    apiKey: "AIzaSyBKa8G7K7nH4vYHxEYNvIrdNHk7YSjFp98",
    authDomain: "lets-bee-f9e7d.firebaseapp.com",
    databaseURL: "https://lets-bee-f9e7d.firebaseio.com",
    projectId: "lets-bee-f9e7d",
    storageBucket: "lets-bee-f9e7d.appspot.com",
    messagingSenderId: "959247206949",
    appId: "1:959247206949:web:a7fe280cbbba915634cdcc",
    measurementId: "G-F5E63TFDH5"
});

 // Retrieve an instance of Firebase Messaging so that it can handle background
 // messages.
 const messaging = firebase.messaging();
 // [END initialize_firebase_in_sw]

/*  messaging.onMessage((payload) => {
    console.log('Message received. ', payload);
    // ...
  }); */

// If you would like to customize notifications that are received in the
// background (Web app is closed or not in browser focus) then you should
// implement this optional method.
// [START background_handler]
/* messaging.setBackgroundMessageHandler(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = 'Background Message Title';
  const notificationOptions = {
    body: 'Background Message body.',
    icon: '/firebase-logo.png'
  };

  return self.registration.showNotification(notificationTitle,
    notificationOptions);
}); */
// [END background_handler]