import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getAuth,
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
getFirestore,
doc,
setDoc,
getDoc
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

const db = getFirestore(app);

const backBtn =
document.getElementById("backBtn");

backBtn.addEventListener("click",()=>{

window.location.href="settings.html";

});

const searchToggle =
document.getElementById("searchToggle");

onAuthStateChanged(auth, async(user)=>{
    
if(!user)return;

const snap=await getDoc(

doc(
db,
"advancedSettings",
user.uid
)

);

if(snap.exists()){

searchToggle.checked=
snap.data().searchEnabled===true;

}

});

searchToggle.addEventListener("change",async()=>{

const user=auth.currentUser;

if(!user)return;

await setDoc(

doc(
db,
"advancedSettings",
user.uid
),

{

searchEnabled:
searchToggle.checked

},

{

merge:true

}

);

console.log("Saved:", searchToggle.checked);

const test = await getDoc(
    doc(db, "advancedSettings", user.uid)
);

console.log(test.data());

alert("Saved Successfully");

});