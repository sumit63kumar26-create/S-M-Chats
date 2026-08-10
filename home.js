import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  query,
  where,
  doc as firestoreDoc,
  getDoc,
  deleteDoc,
updateDoc
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
const db = getFirestore(app);
const auth = getAuth(app);

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
        firestoreDoc(db, "requests", requestId),
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
        firestoreDoc(db, "requests", requestId)
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

searchBtn.addEventListener("click", async () => {
  
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
        firestoreDoc(db, "users", currentUser.uid)
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
        createdAt: Date.now()
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

onAuthStateChanged(auth, (user) => {

    if(user){

        loadRequests();

    }

});

const homeNav =
    document.getElementById("homeNav");

const chatNav =
    document.getElementById("chatNav");

homeNav.addEventListener("click", () => {

    // Already Home Page
    return;

});

chatNav.addEventListener("click", () => {

    window.location.href = "chat.html";

});

searchInput.addEventListener("input", () => {

    if (searchInput.value.trim() === "") {

        searchSection.style.display = "none";
        requestSection.style.display = "block";

        searchResults.innerHTML = "";

    }

});