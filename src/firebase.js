let firebaseConfig = {
    apiKey: "AIzaSyCVPkiyjY57mwE5VtP3jV29hbN-MzErXr0",
    authDomain: "chat-55d87.firebaseapp.com",
    databaseURL: "https://chat-55d87.firebaseio.com",
    projectId: "chat-55d87",
    storageBucket: "chat-55d87.appspot.com",
    messagingSenderId: "569404966426",
    appId: "1:569404966426:web:9f16bba437f95e7697b3a3"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

let database = firebase.database()

database.ref('acount').once('967737519232')
    .then(function(snapshot) {
        console.log( snapshot.val() )
    })