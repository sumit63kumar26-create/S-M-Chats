import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    deleteDoc,
    doc
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

const blockedList =
    document.getElementById("blockedList");

document
    .getElementById("backBtn")
    .addEventListener("click", () => {
        
        window.location.href = "settings.html";
        
    });

async function loadBlockedUsers() {
    
    const currentUser =
        auth.currentUser;
    
    if (!currentUser) return;
    
    blockedList.innerHTML = "";
    
    const snapshot =
        await getDocs(
            
            query(
                
                collection(db, "blockedUsers"),
                
                where(
                    "blockerUid",
                    "==",
                    currentUser.uid
                )
                
            )
            
        );
blockedCount.innerText = snapshot.size;

    if (snapshot.empty) {
        
        blockedList.innerHTML = `
        <p style="
        color:gray;
        text-align:center;
        margin-top:40px;
        ">
        No Blocked Users
        </p>
        `;
        
        return;
        
    }
    
    snapshot.forEach((docSnap) => {
        
        const data =
            docSnap.data();
        
        const div =
            document.createElement("div");
        
        div.className = "userCard";
        
        div.innerHTML = `

       <span>${data.blockedUsername}</span>

        <button class="unblockBtn">

        Unblock

        </button>

        `;
        
        div
            .querySelector(".unblockBtn")
            .addEventListener("click", async () => {
                
                const ok =
                    confirm("Unblock this user?");
                
                if (!ok) return;
                
                await deleteDoc(
                    
                    doc(
                        db,
                        "blockedUsers",
                        docSnap.id
                    )
                    
                );
                
                alert("User Unblocked");
                
                loadBlockedUsers();
                
            });
        
        blockedList.appendChild(div);
        
    });
    
}

onAuthStateChanged(auth, (user) => {
    
    if (user) {
        
        loadBlockedUsers();
        
    } else {
        
        window.location.href = "index.html";
        
    }
    
});