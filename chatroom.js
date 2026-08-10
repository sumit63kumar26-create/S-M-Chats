import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  deleteDoc,
  setDoc,
  limit
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

// DOM Elements
const friendName = document.getElementById("friendName");
const menuBtn = document.getElementById("menuBtn");
const popupMenu = document.getElementById("popupMenu");
const blockUserBtn = document.getElementById("blockUserBtn");
const friendStatus = document.getElementById("friendStatus");
const backBtn = document.getElementById("backBtn");
const callBtn = document.getElementById("callBtn");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const chatMessages = document.getElementById("chatMessages");

// URL Parameters
const params = new URLSearchParams(window.location.search);
const friendUid = params.get("uid");

let currentUid = null;
let messageListenerUnsub = null;
let friendListenerUnsub = null;
let sendBound = false;

backBtn.addEventListener("click", () => {
  window.location.href = "chat.html";
});

callBtn.addEventListener("click", () => {
  window.location.href = "call.html?uid=" + friendUid;
});

function getChatId(uid1, uid2) {
  return [uid1, uid2].sort().join("_");
}

function loadFriend() {
  if (!friendUid) return;

  friendListenerUnsub = onSnapshot(doc(db, "users", friendUid), (friendDoc) => {
    if (!friendDoc.exists()) return;

    const friend = friendDoc.data();
    friendName.innerText = friend.username || "Unknown";

    if (friend.online) {
      friendStatus.innerText = "🟢 Online";
    } else if (friend.lastSeen) {
      const time = new Date(friend.lastSeen);
      friendStatus.innerText =
        "Last seen " +
        time.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        });
    } else {
      friendStatus.innerText = "Offline";
    }
  });
}

async function checkBlockStatus() {
  const currentUser = auth.currentUser;
  if (!currentUser || !friendUid) return false;

  const iBlocked = await getDocs(
    query(
      collection(db, "blockedUsers"),
      where("blockerUid", "==", currentUser.uid),
      where("blockedUid", "==", friendUid),
      limit(1)
    )
  );

  if (!iBlocked.empty) {
    blockUserBtn.innerText = "✅ Unblock User";
    blockUserBtn.dataset.mode = "unblock";
    messageInput.disabled = true;
    sendBtn.disabled = true;
    messageInput.placeholder = "You blocked this user.";
    return true;
  }

  const blockedMe = await getDocs(
    query(
      collection(db, "blockedUsers"),
      where("blockerUid", "==", friendUid),
      where("blockedUid", "==", currentUser.uid),
      limit(1)
    )
  );

  if (!blockedMe.empty) {
    messageInput.disabled = true;
    sendBtn.disabled = true;
    messageInput.placeholder = "You are blocked.";
    return true;
  }

  blockUserBtn.innerText = "🚫 Block User";
  blockUserBtn.dataset.mode = "block";
  messageInput.disabled = false;
  sendBtn.disabled = false;
  messageInput.placeholder = "Type a message";
  return false;
}

menuBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  popupMenu.style.display = popupMenu.style.display === "block" ? "none" : "block";
});

document.addEventListener("click", () => {
  popupMenu.style.display = "none";
});

blockUserBtn.addEventListener("click", async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) return;

  if (blockUserBtn.dataset.mode === "unblock") {
    const snapshot = await getDocs(
      query(
        collection(db, "blockedUsers"),
        where("blockerUid", "==", currentUser.uid),
        where("blockedUid", "==", friendUid)
      )
    );

    if (!snapshot.empty) {
      await deleteDoc(doc(db, "blockedUsers", snapshot.docs[0].id));
      alert("User Unblocked");
      await checkBlockStatus();
      return;
    }
  }

  popupMenu.style.display = "none";

  const ok = confirm("Block this user?");
  if (!ok) return;

  const alreadyBlocked = await getDocs(
    query(
      collection(db, "blockedUsers"),
      where("blockerUid", "==", currentUser.uid),
      where("blockedUid", "==", friendUid)
    )
  );

  if (!alreadyBlocked.empty) {
    alert("User already blocked.");
    return;
  }

  await addDoc(collection(db, "blockedUsers"), {
    blockerUid: currentUser.uid,
    blockedUid: friendUid,
    blockedUsername: friendName.innerText,
    blockedAt: Date.now()
  });

  alert("User Blocked Successfully.");
  window.location.href = "chat.html";
});

async function loadMessages(chatId, userId) {
  let deletedAt = 0;
  const chatDocId = userId + "_" + friendUid;

  const chatDoc = await getDoc(doc(db, "userChats", chatDocId));
  if (chatDoc.exists() && chatDoc.data().deletedAt) {
    deletedAt = chatDoc.data().deletedAt;
  }

  const q = query(
    collection(db, "messages"),
    where("chatId", "==", chatId),
    orderBy("timestamp", "asc")
  );

  if (messageListenerUnsub) messageListenerUnsub();

  messageListenerUnsub = onSnapshot(q, (snapshot) => {
    chatMessages.innerHTML = "";

    snapshot.forEach((docSnapshot) => {
      const msg = docSnapshot.data();
      if (msg.timestamp <= deletedAt) return;

      const messageId = docSnapshot.id;
      const time = new Date(msg.timestamp);
      const messageTime = time.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });

      const div = document.createElement("div");
      div.style.margin = "10px 0";

      if (msg.senderUid === userId) {
        div.style.textAlign = "right";
        div.innerHTML = `
          <div style="display:inline-block;background:#232323;color:#fff;padding:4px 12px;border:0.2px solid #FFFFFF;border-radius:18px 18px 4px 18px;max-width:72%;text-align:left;box-shadow:0 2px 8px rgba(0,0,0,.25);">
            <div style="font-size:15px;line-height:1.4;word-break:break-word;">
              ${msg.message}
            </div>
            <div style="text-align:right;margin-top:4px;font-size:11px;color:rgba(255,255,255,.75);">
              ${messageTime}
            </div>
          </div>
        `;

        div.addEventListener("contextmenu", async (e) => {
          e.preventDefault();
          const ok = confirm("Delete this message for everyone?");
          if (!ok) return;

          try {
            await deleteDoc(doc(db, "messages", messageId));
            alert("Message Deleted");
          } catch (error) {
            alert(error.message);
          }
        });
      } else {
        div.style.textAlign = "left";
        div.innerHTML = `
          <div style="display:inline-block;background:linear-gradient(135deg,#5BBEFF,#3B82F6);color:#fff;padding:4px 12px;border-radius:18px 18px 18px 4px;max-width:72%;text-align:left;box-shadow:0 2px 8px rgba(0,0,0,.25);">
            <div style="font-size:15px;line-height:1.4;word-break:break-word;">
              ${msg.message}
            </div>
            <div style="text-align:left;margin-top:4px;font-size:11px;color:rgba(255,255,255,.65);">
              ${messageTime}
            </div>
          </div>
        `;
      }

      chatMessages.appendChild(div);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    });
  });
}

function bindSend(chatId, user) {
  if (sendBound) return;
  sendBound = true;

  sendBtn.addEventListener("click", async () => {
    const blocked = await checkBlockStatus();
    if (blocked) {
      alert("You cannot send messages.");
      return;
    }

    const text = messageInput.value.trim();
    if (!text) return;

    await addDoc(collection(db, "messages"), {
      chatId,
      senderUid: user.uid,
      receiverUid: friendUid,
      message: text,
      timestamp: Date.now()
    });

    const senderChatId = user.uid + "_" + friendUid;
    const receiverChatId = friendUid + "_" + user.uid;

    await setDoc(doc(db, "userChats", senderChatId), { hiddenFor: [] }, { merge: true });
    await setDoc(doc(db, "userChats", receiverChatId), { hiddenFor: [] }, { merge: true });

    messageInput.value = "";
  });
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  currentUid = user.uid;

  await updateDoc(doc(db, "users", user.uid), {
    online: true
  });

  loadFriend();
  await checkBlockStatus();

  const chatId = getChatId(user.uid, friendUid);
  await loadMessages(chatId, user.uid);
  bindSend(chatId, user);
});

async function setOffline() {
  const user = auth.currentUser;
  if (!user) return;

  try {
    await updateDoc(doc(db, "users", user.uid), {
      online: false,
      lastSeen: Date.now()
    });
  } catch (e) {}
}

window.addEventListener("beforeunload", () => {
  setOffline();
});