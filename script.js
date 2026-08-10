import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getFirestore,
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyD1A2aGO3-zeiq4ba1lKxnC_kIRn3wy73c",
    authDomain: "fir-chat-cf42f.firebaseapp.com",
    projectId: "fir-chat-cf42f",
    storageBucket: "fir-chat-cf42f.firebasestorage.app",
    messagingSenderId: "906202182413",
    appId: "1:906202182413:web:ce8fe0b9eac40d498f7644"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

let signupInProgress = false;

const db = getFirestore(app);

const signupBtn = document.getElementById("signupBtn");

signupBtn.addEventListener("click", async () => {
    
    const username =
        document.getElementById("signupUsername").value;
    
    const email =
        document.getElementById("signupEmail").value;
    
    const password =
        document.getElementById("signupPassword").value;
    
    if (!username || !email || !password) {
        alert("Please fill all fields");
        return;
    }
    
    try {
        
        signupInProgress = true;
        
        const userCredential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );
        
        const user = userCredential.user;
        
       /* alert("Before Firestore Save");
       */
        await setDoc(
            doc(db, "users", user.uid),
            {
                uid: user.uid,
                username: username,
                email: email,
                createdAt: Date.now()
            }
        );
        /* alert("After Firestore Save");
        */
        
        console.log("User Saved In Firestore");
       /* alert("Firestore Save Success");
       */
        
        alert("Account Created Successfully");
       
       window.location.href = "home.html";
       
    } catch (error) {
        
        alert(error.message);
        
    }
    
});
const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", async () => {
    
    const email =
        document.getElementById("loginEmail").value;
    
    const password =
        document.getElementById("loginPassword").value;
    
    if (!email || !password) {
        alert("Please fill all fields");
        return;
    }
    
    try {
        
        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );
        
        window.location.href = "home.html";
    } catch (error) {
        
        alert(error.message);
        
    }
    
});

onAuthStateChanged(auth, (user) => {

    if (!user) return;

    if (signupInProgress) return;

    window.location.href = "home.html";

});
