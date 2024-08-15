importScripts('https://www.gstatic.com/firebasejs/9.9.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.9.1/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyCbwvYbyo_8_ZFVzspr2owyy4rSja5zkE0",
    authDomain: "calendar-7e9fc.firebaseapp.com",
    projectId: "calendar-7e9fc",
    storageBucket: "calendar-7e9fc.appspot.com",
    messagingSenderId: "548073834016",
    appId: "1:548073834016:web:4f70645d03e89073c7de45"
});

const messaging = firebase.messaging();
