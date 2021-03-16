const firebase = require("firebase/app");
require("firebase/firestore")
require("firebase/storage");

const firebaseConfig = {
    apiKey: "AIzaSyCKJssqkkHLubbr4NzzfSPCTt0S8Akn6-8",
    authDomain: "iiqa-dev.firebaseapp.com",
    projectId: "iiqa-dev",
    storageBucket: "iiqa-dev.appspot.com",
    messagingSenderId: "1059526239196",
    appId: "1:1059526239196:web:789ffd80cc0b4f9ad76519",
    measurementId: "G-SLCBJ541BF"
}

firebase.initializeApp(firebaseConfig);
exports.firestore = firebase.firestore();
exports.storage  = firebase.storage();