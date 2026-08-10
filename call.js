import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import{
getAuth
}from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import{
getFirestore,
doc,
getDoc,
addDoc,
collection,
serverTimestamp
}from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD1A2aGO3-zeiq4ba1lKxnC_kIRn3wy73c",
  authDomain: "fir-chat-cf42f.firebaseapp.com",
  projectId: "fir-chat-cf42f",
  storageBucket: "fir-chat-cf42f.firebasestorage.app",
  messagingSenderId: "906202182413",
  appId: "1:906202182413:web:ce8fe0b9eac40d498f7644"
};

const app=
initializeApp(firebaseConfig);

const db=
getFirestore(app);

const auth = getAuth(app);

const params=
new URLSearchParams(window.location.search);

const uid=
params.get("uid");

const callerName=
document.getElementById("callerName");

async function loadUser(){

const snap=
await getDoc(
doc(db,"users",uid)
);

if(snap.exists()){

callerName.innerText=
snap.data().username;

}

}

loadUser();

setTimeout(()=>{

sendCallRequest();

},1000);

async function sendCallRequest(){

const currentUser =
auth.currentUser;

if(!currentUser)return;

await addDoc(

collection(db,"calls"),

{

callerUid:
currentUser.uid,

callerName:
callerName.innerText,

receiverUid:
uid,

status:"calling",

createdAt:
serverTimestamp()

}

);

}
document
.getElementById("endCall")
.onclick=()=>{

history.back();

};