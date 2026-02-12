// Make sure db and auth are initialized in firebase-config.js
const USD_TO_UGX = 3900; // you can adjust anytime

const ordinaryList = document.getElementById("ordinary-machines");
const vipList = document.getElementById("vip-machines");
const logoutBtn = document.getElementById("logout-btn");
const depositBtn = document.getElementById("deposit-btn");
const withdrawBtn = document.getElementById("withdraw-btn");
const withdrawModal = document.getElementById("withdraw-modal");
const confirmWithdraw = document.getElementById("confirm-withdraw");

let currentBalance = 0;
let currentUserId = null;

// AUTH STATE
auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
 
  function formatUGX(usdAmount) {
  const ugx = usdAmount * USD_TO_UGX;
  return "UGX " + ugx.toLocaleString();
}

  currentUserId = user.uid;

  // Load user data
  db.ref("users/" + user.uid).on("value", snapshot => {
    if (!snapshot.exists()) return;

    const data = snapshot.val();
    currentBalance = data.balance || 0;

    document.getElementById("user-name").innerText = data.name;
    document.getElementById("user-balance").innerText = currentBalance.toFixed(2);
   userBalance.innerText = formatUGX(currentBalance);

    autoCreditProfits(currentUserId);
    db.ref(`transactions/${uid}`).push({
  type: "profit",
  amount: m.profit,
  description: `${m.name} profit credited`,
  timestamp: Date.now()
});

loadTransactions(currentUserId);



    // Redirect admin
    if (data.role === "admin") {
      window.location.href = "admin.html";
    }
  });

  loadMachines("ordinary", ordinaryList);
  loadMachines("vip", vipList);
});

const ordinaryContainer = document.getElementById("ordinary-machines");
const vipContainer = document.getElementById("vip-machines");

db.ref("machines").on("value", snapshot => {
  // Clear both containers
  ordinaryContainer.innerHTML = "";
  vipContainer.innerHTML = "";

  if (!snapshot.exists()) {
    ordinaryContainer.innerHTML = "<p>No machines available</p>";
    vipContainer.innerHTML = "<p>No machines available</p>";
    return;
  }

  snapshot.forEach(typeSnap => {
    const type = typeSnap.key; // "ordinary" or "vip"

    typeSnap.forEach(machineSnap => {
      const m = machineSnap.val();
      const machineId = machineSnap.key;

      const card = document.createElement("div");
      card.className = "machine-card";

      card.innerHTML = `
        <img src="${m.image}" alt="${m.name}" style="width:100%;border-radius:8px;">
        <h3>${m.name}</h3>
        <p>${m.description}</p>
        <p><strong>Price:</strong> ${m.price}</p>
        <p><strong>Profit:</strong> ${m.profit}</p>
        <p><strong>Duration:</strong> ${m.duration}</p>
        <button onclick="purchaseMachine('${type}', '${machineId}', ${m.price})">
          Buy Machine
        </button>
      `;

      // Append to correct container
      if (type === "ordinary") {
        ordinaryContainer.appendChild(card);
      } else if (type === "vip") {
        vipContainer.appendChild(card);
      }
    });
  });
});


// LOAD MACHINES
function loadMachines(type, container) {
  db.ref("machines/" + type).once("value").then(snapshot => {
    container.innerHTML = "";

    snapshot.forEach(machineSnap => {
      const m = machineSnap.val();
      const li = document.createElement("li");

    const durationMs = durationToMs(m.duration);
const timeLeft = (m.purchasedAt + durationMs) - Date.now();

li.innerHTML = `
  <div class="machine-card">
    <strong>${m.name}</strong><br>
    Profit: $${m.profit}<br>
    Duration: ${m.duration}<br>
    ${
      m.credited
        ? `<span class="badge success">Profit Credited</span>`
        : `<span class="badge pending">ó ${formatTime(timeLeft)}</span>`
    }
  </div>
`;

function formatTime(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${days}d ${hours}h ${minutes}m`;
}


      li.querySelector(".purchase-btn").addEventListener("click", () => {
        purchaseMachine(m, machineSnap.key);
      });

      container.appendChild(li);
    });
  });
}

// PURCHASE MACHINE
function purchaseMachine(type, machineId, price) {
  const user = firebase.auth().currentUser;
  if (!user) return alert("Not logged in");

  const userRef = db.ref("users/" + user.uid);
  const machineRef = db.ref(`machines/${type}/${machineId}`);

  machineRef.once("value").then(machineSnap => {
    const mData = machineSnap.val();

    userRef.once("value").then(snapshot => {
      const balance = snapshot.val().balance || 0;

      if (balance < price) {
        alert("Insufficient balance");
        return;
      }

      // Deduct balance
      userRef.update({
        balance: balance - price
      });

      // Save purchased machine with all relevant info
      db.ref(`users/${user.uid}/machines/${type}/${machineId}`).set({
        name: mData.name,
        description: mData.description,
        image: mData.image,
        price: mData.price,
        profit: mData.profit,
        duration: mData.duration,
        purchasedAt: Date.now()
      });

      alert("Machine purchased successfully");
    });
  });
}

    // Deduct balance
    userRef.update({
      balance: balance - price
    });

    // Save purchased machine
    db.ref(`users/${user.uid}/machines/${type}/${machineId}`).set({
      purchasedAt: Date.now()
    });

    alert("Machine purchased successfully");
  ;




  db.ref(`users/${currentUserId}/machines/${machineId}`).set({
  name: machine.name,
  price: machine.price,
  profit: machine.profit,
  duration: machine.duration,
  purchasedAt: Date.now(),
  credited: false
}).then(() => {
  // Step 6: Log this purchase in transactions
  db.ref(`transactions/${currentUserId}`).push({
    type: "purchase",
    amount: machine.price,
    description: `Purchased ${machine.name}`,
    timestamp: Date.now()
  });

  // Update the user balance display
  currentBalance -= machine.price;
  db.ref(`users/${currentUserId}`).update({ balance: currentBalance });
  document.getElementById("user-balance").innerText = formatUGX(currentBalance);

  alert("Machine purchased successfully!");
});


  document.getElementById("user-balance").innerText = currentBalance.toFixed(2);
  alert("Machine purchased successfully");


// LOGOUT
logoutBtn.addEventListener("click", () => {
  auth.signOut().then(() => window.location.href = "index.html");
});

// ===================== LOGOUT =====================
    document.getElementById('logout-btn').addEventListener('click', () => {
      auth.signOut()
        .then(() => window.location.href = "index.html")
        .catch(err => alert("Logout failed: " + err.message));
    });
// DEPOSIT
depositBtn.addEventListener("click", () => {
  alert(
    "Dial *165# ’ Send Money ’ Enter 0769573274\n" +
    "Name: Nsereko Muzafalu\n" +
    "Enter amount ’ Enter PIN ’ Confirm\n\n" +
    "Wait 56 minutes for balance update"
  );
});

document.addEventListener("DOMContentLoaded", () => {
  const withdrawBtn = document.getElementById("withdraw-btn");
  const withdrawModal = document.getElementById("withdraw-modal");
  const confirmWithdraw = document.getElementById("confirm-withdraw");

  withdrawBtn.addEventListener("click", () => {
    withdrawModal.style.display = "block";
  });

  confirmWithdraw.addEventListener("click", () => {
    const number = document.getElementById("withdraw-number").value.trim();
    const amountUGX = Number(document.getElementById("withdraw-amount").value);

    if (!number || !amountUGX || amountUGX <= 0) {
      return alert("Enter a valid number and amount");
    }

    const amountUSD = amountUGX / USD_TO_UGX; // convert UGX ’ USD

    if (amountUSD > currentBalance) {
      return alert("Insufficient balance for withdrawal");
    }

    // Deduct balance
    currentBalance -= amountUSD;
    document.getElementById("user-balance").innerText = formatUGX(currentBalance);

    // Update Firebase
    db.ref(`users/${currentUserId}`).update({ balance: currentBalance });

    // Optional: log transaction
    db.ref(`transactions/${currentUserId}`).push({
      type: "withdraw",
      amount: amountUSD,
      description: `Withdrawal requested to ${number}`,
      timestamp: Date.now()
    });

    alert("Withdraw successful. Wait 56 minutes for confirmation");

    // Reset modal
    withdrawModal.style.display = "none";
    document.getElementById("withdraw-number").value = "";
    document.getElementById("withdraw-amount").value = "";
  });
});


function durationToMs(duration) {
  const value = parseInt(duration);
  if (duration.includes("day")) return value * 24 * 60 * 60 * 1000;
  if (duration.includes("hour")) return value * 60 * 60 * 1000;
  return 0;
}

function autoCreditProfits(uid) {
  db.ref(`users/${uid}/machines`).once("value").then(snapshot => {
    if (!snapshot.exists()) return;

    snapshot.forEach(machineSnap => {
      const m = machineSnap.val();

      if (m.credited) return;

      const durationMs = durationToMs(m.duration);
      const now = Date.now();

      if (now >= m.purchasedAt + durationMs) {
        // Credit profit
        db.ref(`users/${uid}`).once("value").then(userSnap => {
          const balance = userSnap.val().balance || 0;

          db.ref(`users/${uid}`).update({
            balance: balance + m.profit
          });

          db.ref(`users/${uid}/machines/${machineSnap.key}`).update({
            credited: true,
            creditedAt: now
          });
        });
      }
    });
  });
}

function loadTransactions(uid) {
  const txList = document.getElementById("tx-list");

  db.ref(`transactions/${uid}`).limitToLast(10).on("value", snap => {
    txList.innerHTML = "";

    snap.forEach(tx => {
      const t = tx.val();
      const li = document.createElement("li");

      li.innerHTML = `
        ${t.description}  
        <strong>$${t.amount}</strong><br>
        <small>${new Date(t.timestamp).toLocaleString()}</small>
      `;

      txList.appendChild(li);
    });
  });
}

const machinesContainer = document.getElementById("machines-container");

db.ref("machines").on("value", snapshot => {
  machinesContainer.innerHTML = "";

  if (!snapshot.exists()) {
    machinesContainer.innerHTML = "<p>No machines available</p>";
    return;
  }

  snapshot.forEach(typeSnap => {
    const type = typeSnap.key; // ordinary / vip

    typeSnap.forEach(machineSnap => {
      const m = machineSnap.val();
      const machineId = machineSnap.key;

      const card = document.createElement("div");
      card.className = "machine-card";

      card.innerHTML = `
        <img src="${m.image}" alt="${m.name}" style="width:100%;border-radius:8px;">
        <h3>${m.name}</h3>
        <p>${m.description}</p>
        <p><strong>Type:</strong> ${type}</p>
        <p><strong>Price:</strong> ${m.price}</p>
        <p><strong>Profit:</strong> ${m.profit}</p>
        <p><strong>Duration:</strong> ${m.duration}</p>
        <button onclick="purchaseMachine('${type}', '${machineId}', ${m.price})">
          Buy Machine
        </button>
      `;

      machinesContainer.appendChild(card);
    });
  });
});
