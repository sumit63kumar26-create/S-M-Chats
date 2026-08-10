
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getFirestore,
    collection,
    setDoc,
    getDocs,
    getDoc,
    addDoc,
    query,
    where,
    doc,
    updateDoc,
    deleteDoc,
    serverTimestamp
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

async function loadRequests(){

    const currentUser = auth.currentUser;

    if(!currentUser) return;

    const q = query(
        collection(db, "requests"),
        where(
            "receiverUid",
            "==",
            currentUser.uid
        ),
        where("status", "==", "pending")
    );

    const snapshot =
        await getDocs(q);
        
       /* alert("Requests Found: " + snapshot.size);
*/

    requestList.innerHTML = "";

    let count = 0;

    snapshot.forEach((doc) => {

        const request = doc.data();
        const requestId = doc.id;

        count++;

        const div =
            document.createElement("div");

        div.className = "requestCard";

div.innerHTML = `
<div class="requestLeft">

    <div class="avatar">
        ${(request.senderUsername || "U")
            .charAt(0)
            .toUpperCase()}
    </div>

    <div class="userInfo">
        <h4>${request.senderUsername || "Unknown User"}</h4>
        <p>Sent you a friend request</p>
    </div>

</div>

<div class="requestButtons">

    <button class="acceptBtn">
        Accept
    </button>

    <button class="rejectBtn">
        Reject
    </button>

</div>
`;
const acceptBtn = div.querySelector(".acceptBtn");
const rejectBtn = div.querySelector(".rejectBtn");

acceptBtn.addEventListener("click", async () => {

    await updateDoc(
    doc(db, "requests", requestId),
    {
        status: "accepted"
    }
);
    
    await addDoc(
    collection(db, "friends"),
    {
        user1Uid: request.senderUid,
        user1Username: request.senderUsername,

        user2Uid: request.receiverUid,
        user2Username: request.receiverUsername,

        createdAt: Date.now()
    }
);

    alert("Accepted: " + request.senderUsername);

    loadRequests();
});

rejectBtn.addEventListener("click", async () => {
    
    await deleteDoc(
        doc(db, "requests", requestId)
    );
    
    alert("Rejected: " + request.senderUsername);
    
    loadRequests();
});

        requestList.appendChild(div);

    });

    requestCount.innerText =
        "Requested - " + count;

    if(count === 0){

        requestList.innerHTML = `
<div class="card emptyCard">

    <svg xmlns="http://www.w3.org/2000/svg"
    width="42"
    height="42"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#38BDF8"
    stroke-width="2">

        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>

    </svg>

    <h4>No Requests</h4>

    <p>Friend requests will appear here.</p>

</div>
`;

    }

}

const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");
const searchSection =
    document.getElementById("searchSection");
const requestSection =
    document.getElementById("requestSection");
const requestCount =
    document.getElementById("requestCount");

const requestList =
    document.getElementById("requestList");

searchBtn?.addEventListener("click", async () => {
  
  const searchText =
    searchInput.value.toLowerCase().trim();
  
  searchResults.innerHTML = "";
  
  requestSection.style.display = "none";
searchSection.style.display = "block";

searchSection.style.display = "block";
  
  if (!searchText) {

    searchSection.style.display = "none";
    requestSection.style.display = "block";

    return;
}
  
  const snapshot =
    await getDocs(collection(db, "users"));
  
  let found = false;
  
  searchSection.style.display = "block";
  
  snapshot.forEach((doc) => {
    
    const user = doc.data();
    
    if (
      user.username
      .toLowerCase()
      .includes(searchText)
    ) {
      
      found = true;
      
      const div =
        document.createElement("div");
      
      div.className = "searchCard";

div.innerHTML = `
<div class="searchUser">

    <div class="searchAvatar">
        ${user.username.charAt(0).toUpperCase()}
    </div>

    <div class="searchInfo">
        <h4>${user.username}</h4>
        <p>S Chat User</p>
    </div>

</div>

<button class="sendRequestBtn">
    Send Request 
</button>
`;
      
      searchResults.appendChild(div);

const sendBtn =
    div.querySelector(".sendRequestBtn");

sendBtn.addEventListener("click", async () => {

    const currentUser = auth.currentUser;

    if(!currentUser){
        alert("Please login again");
        return;
    }
    
    let currentUserData;

try {

    const currentUserDoc = await getDoc(
    doc(db, "users", currentUser.uid)
);

    currentUserData =
        currentUserDoc.data();
        
        const friendCheck = await getDocs(
    query(
        collection(db, "friends"),
        where("user1Uid", "in", [currentUser.uid, user.uid])
    )
);

let alreadyFriend = false;

friendCheck.forEach((doc) => {

    const data = doc.data();

    if (
        (data.user1Uid === currentUser.uid &&
         data.user2Uid === user.uid) ||

        (data.user1Uid === user.uid &&
         data.user2Uid === currentUser.uid)
    ) {
        alreadyFriend = true;
    }

});

if (alreadyFriend) {

    alert("This user is already your friend.");

    return;

}

} catch(error) {

    alert(error.message);
    return;

}

const requestCheck = await getDocs(
    query(
        collection(db, "requests"),
        where("senderUid", "==", currentUser.uid),
        where("receiverUid", "==", user.uid),
        where("status", "==", "pending")
    )
);

if (!requestCheck.empty) {

    alert("Friend request already sent.");

    return;

}

const blockCheck = await getDocs(
    collection(db, "blockedUsers")
);

let blockedByUser = false;
let youBlockedUser = false;

blockCheck.forEach((doc) => {

    const data = doc.data();

    if (
        data.blockerUid === user.uid &&
        data.blockedUid === currentUser.uid
    ) {
        blockedByUser = true;
    }

    if (
        data.blockerUid === currentUser.uid &&
        data.blockedUid === user.uid
    ) {
        youBlockedUser = true;
    }

});

if (blockedByUser) {

    alert("You're blocked by this user.");

    return;

}

if (youBlockedUser) {

    alert("You have blocked this user.");

    return;

}

    await addDoc(
    collection(db, "requests"),
    {
        senderUid: currentUser.uid,
        senderUsername:
    currentUserData.username,

        receiverUid: user.uid,
        receiverUsername: user.username,

        status: "pending",
        createdAt: serverTimestamp()
    }
);

    alert(
        "Request sent to " +
        user.username
    );

});
    }
    
  });
  
  if (!found) {

    searchSection.style.display = "block";

    searchResults.innerHTML = `
        <div class="card">
            No Results Found
        </div>
    `;

}
  
});

/*onAuthStateChanged(auth, (user) => {

    if(user){

        loadRequests();

    }

});
*/

const homeNav =
    document.getElementById("homeNav");

const chatNav =
    document.getElementById("chatNav");

homeNav?.addEventListener("click", () => {
    
    window.location.href = "home.html";
    
});

chatNav?.addEventListener("click", () => {
    
    window.location.href = "chat.html";
    
});

const profileBtn =
    document.getElementById("profileBtn");

profileBtn?.addEventListener("click", () => {
    
    alert("Profile page is coming soon.");
    
});

const settingsBtn =
    document.getElementById("settingsBtn");

settingsBtn?.addEventListener("click", () => {
    
    window.location.href = "settings.html";
    
});

searchInput?.addEventListener("input", () => {

    if (searchInput.value.trim() === "") {

        searchSection.style.display = "none";
        requestSection.style.display = "block";

        searchResults.innerHTML = "";

    }

});

/*const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);
*/
const searchFriend =
document.getElementById("searchFriend");

const friendsCount =
    document.getElementById("friendsCount");

const friendsList =
    document.getElementById("friendsList");
    
    async function showDeleteMenu(friendName, friendUid){

    const ok = confirm(
        "Delete chat with " + friendName + "?"
    );

    if(!ok) return;

    const currentUser = auth.currentUser;

    const chatDocId =
        currentUser.uid + "_" + friendUid;

    try{

        await setDoc(
    doc(db, "userChats", chatDocId),
    {
        hiddenFor: [currentUser.uid],
        deletedAt:Date.now()
    },
    {
        merge: true
    }
);

        alert("Chat Deleted");

        loadFriends();

    }catch(error){

        alert(error.message);

    }

}
    
    let longPressTimer = null;

let longPressed = false;

async function loadFriends() {
    
    const currentUser = auth.currentUser;
    
    if (!currentUser) return;
    
    const snapshot = await getDocs(
        collection(db, "friends")
    );
    
    friendsList.innerHTML = "";
    
    let count = 0;
    
    const friendDocs = snapshot.docs;

for (const friendDoc of friendDocs) {

    const friend = friendDoc.data();

    const friendDocId = friendDoc.id;

    let friendName = "";
    let targetUid = "";

    if (friend.user1Uid === currentUser.uid) {

        friendName = friend.user2Username;
        targetUid = friend.user2Uid;

    } else if (friend.user2Uid === currentUser.uid) {

        friendName = friend.user1Username;
        targetUid = friend.user1Uid;

    } else {

        continue;

    }

    const chatDocId1 =
    currentUser.uid + "_" + targetUid;

const chatDocId2 =
    targetUid + "_" + currentUser.uid;

const chatDoc1 = await getDoc(
    doc(db, "userChats", chatDocId1)
);

const chatDoc2 = await getDoc(
    doc(db, "userChats", chatDocId2)
);

const hidden1 =
    chatDoc1.exists() &&
    chatDoc1.data().hiddenFor &&
    chatDoc1.data().hiddenFor.includes(currentUser.uid);

const hidden2 =
    chatDoc2.exists() &&
    chatDoc2.data().hiddenFor &&
    chatDoc2.data().hiddenFor.includes(currentUser.uid);

if (hidden1 && hidden2) {
    continue;
}

    count++;
        
        const div = document.createElement("div");
        
        div.className = "friendCard";
        
        div.innerHTML = `
    <div class="profile">
        <img src="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/person-circle.svg" alt="User">
    </div>

    <div class="info">
        <h4>${friendName}</h4>
        <p>Tap to start chatting</p>
    </div>
`;
        
        div.addEventListener("touchstart", () => {

    longPressed = false;

longPressTimer = setTimeout(() => {

    longPressed = true;

   showDeleteMenu(friendName, targetUid);

}, 1500);
});

div.addEventListener("touchend", () => {

    clearTimeout(longPressTimer);

});

div.addEventListener("click", () => {
    
    if (longPressed) {
        longPressed = false;
        return;
    }
    
    window.location.href =
        "chatroom.html?uid=" +
        encodeURIComponent(
            friend.user1Uid === currentUser.uid ?
            friend.user2Uid :
            friend.user1Uid
        );
    
});
        
        friendsList.appendChild(div);

}
    
    friendsCount.innerText =
        "Friends - " + count;
    
    if (count === 0) {
        
        friendsList.innerHTML = `
    <div class="friendCard">
        <div class="profile">
            <img src="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/person-circle.svg" alt="User">
        </div>

        <div class="info">
            <h4>No Friends</h4>
            <p>Accept requests to start chatting</p>
        </div>
    </div>
`;
        
    } 
  
  searchFriend?.addEventListener("input", () => {

    const text =
    searchFriend.value
    .toLowerCase()
    .trim();

    const cards =
    document.querySelectorAll(".friendCard");

    cards.forEach((card)=>{

        const name =
        card.querySelector("h4")
        .innerText
        .toLowerCase();

        if(
            name.includes(text)
        ){

            card.style.display="flex";

        }else{

            card.style.display="none";

        }

    });

});  

}

onAuthStateChanged(auth, async (user) => {

    if (user) {

        const settingDoc = await getDoc(
            doc(
                db,
                "advancedSettings",
                user.uid
            )
        );

        if (
            settingDoc.exists() &&
            settingDoc.data().searchEnabled === false
        ) {

            document
            .getElementById("searchBox")
            .style.display = "none";

        }

        loadFriends();

    } else {

        window.location.href = "index.html";

    }

});