import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getFirestore,
    collection,
    getDocs
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

const friendsCount =
document.getElementById("friendsCount");

const friendsList =
document.getElementById("friendsList");

document
.getElementById("backBtn")
.addEventListener("click",()=>{

    window.location.href="settings.html";

});

async function loadFriends(){

    const currentUser = auth.currentUser;

    if(!currentUser) return;

    friendsList.innerHTML="";

    let count = 0;

    const snapshot = await getDocs(
        collection(db,"friends")
    );

    snapshot.forEach((doc)=>{

        const data = doc.data();

        let friendName="";

        if(data.user1Uid===currentUser.uid){

            friendName=data.user2Username;

        }else if(data.user2Uid===currentUser.uid){

            friendName=data.user1Username;

        }else{

            return;

        }

        count++;

        const div=document.createElement("div");

        div.className="friendCard";

        div.innerHTML=`

<div class="friendName">

${friendName}

</div>

`;

        friendsList.appendChild(div);

    });

    friendsCount.innerText=count;

    if(count===0){

        friendsList.innerHTML=`

<div class="empty">

No Friends

</div>

`;

    }

}

onAuthStateChanged(auth,(user)=>{

    if(user){

        loadFriends();

    }else{

        window.location.href="index.html";

    }

});