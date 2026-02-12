const usersList = document.getElementById("users-list");

// AUTH CHECK
auth.onAuthStateChanged(user => {
  if (!user) return window.location.href = "index.html";

  db.ref("users/" + user.uid).once("value").then(snapshot => {
    if (snapshot.val().role !== "admin") {
      alert("Access denied");
      window.location.href = "dashboard.html";
    }
  });

  loadUsers();
});

document.getElementById("add-machine").addEventListener("click", () => {
  const type = document.getElementById("machine-type").value;
  const name = document.getElementById("machine-name").value.trim();
  const desc = document.getElementById("machine-desc").value.trim();
  const price = Number(document.getElementById("machine-price").value);
  const image = document.getElementById("machine-image").value.trim();
  const profit = Number(document.getElementById("machine-profit").value);
  const duration = document.getElementById("machine-duration").value.trim();

  if (!name || !desc || !price || !image || !profit || !duration) {
    alert("Fill all machine fields");
    return;
  }

  const machineId = db.ref().child("machines").push().key;

  db.ref(`machines/${type}/${machineId}`).set({
    name,
    description: desc,
    price,
    image,
    profit,
    duration
  });

  alert("Machine added successfully");


  document.getElementById("machine-name").value = "";
  document.getElementById("machine-desc").value = "";
  document.getElementById("machine-price").value = "";
  document.getElementById("machine-image").value = "";
});

// LOAD USERS
function loadUsers() {
  db.ref("users").once("value").then(snapshot => {

    // FIX: clear users list WITHOUT killing the form
    while (usersList.firstChild) {
      usersList.removeChild(usersList.firstChild);
    }

    snapshot.forEach(userSnap => {
      const u = userSnap.val();
      const li = document.createElement("li");

      li.innerHTML = `
        <strong>${u.name}</strong><br>
        Balance: $${u.balance || 0}
        <br><br>
        <input type="number" placeholder="New Balance" id="bal-${userSnap.key}">
        <button onclick="updateBalance('${userSnap.key}')">Update</button>
      `;

      usersList.appendChild(li);
    });
  });
}


function updateBalance(uid) {
  const input = document.getElementById("bal-" + uid);
  const newBal = Number(input.value);

  if (isNaN(newBal) || newBal < 0) {
    alert("Enter a valid balance");
    return;
  }

  db.ref("users/" + uid).update({
    balance: newBal
  }).then(() => {
    alert("Balance updated successfully");
    loadUsers(); // =% refresh user list so change is visible
  });
}
const withdrawList = document.getElementById("withdraw-list");

// Load withdraw requests
function loadWithdrawRequests() {
  db.ref("withdrawRequests").on("value", snapshot => {
    withdrawList.innerHTML = "";

    snapshot.forEach(reqSnap => {
      const r = reqSnap.val();

      if (r.status !== "pending") return;

      const li = document.createElement("li");

      li.innerHTML = `
        <strong>${r.name}</strong><br>
        Number: ${r.number}<br>
        Amount: $${r.amount}<br><br>
        <button onclick="approveWithdraw('${reqSnap.key}')">Approve</button>
        <button onclick="rejectWithdraw('${reqSnap.key}')">Reject</button>
      `;

      withdrawList.appendChild(li);
    });
  });
}

loadWithdrawRequests();

// Approve withdraw
function approveWithdraw(requestId) {
  db.ref("withdrawRequests/" + requestId).once("value").then(snapshot => {
    const req = snapshot.val();

    db.ref("users/" + req.uid).once("value").then(userSnap => {
      const balance = userSnap.val().balance || 0;

      if (balance < req.amount) {
        alert("User balance insufficient");
        return;
      }

      db.ref("users/" + req.uid).update({
        balance: balance - req.amount
      });

      db.ref("withdrawRequests/" + requestId).update({
        status: "approved"
      });

      alert("Withdraw approved");
      loadUsers();
    });
  });
}

// Reject withdraw
function rejectWithdraw(requestId) {
  db.ref("withdrawRequests/" + requestId).update({
    status: "rejected"
  });

  alert("Withdraw rejected");
}

const depositRequestsList = document.getElementById("deposit-requests-list");

// Load deposit requests
function loadDepositRequests() {
  db.ref("depositRequests").on("value", snapshot => {
    depositRequestsList.innerHTML = ""; // clear old list

    snapshot.forEach(reqSnap => {
      const req = reqSnap.val();
      if (req.status !== "pending") return; // only show pending

      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${req.username}</strong><br>
        Number: ${req.number}<br>
        Registered Name: ${req.name}<br>
        Amount: UGX ${req.amount || "N/A"}<br><br>
        <button class="approve-btn">Approve</button>
        <button class="decline-btn">Decline</button>
      `;

      // Approve deposit
      li.querySelector(".approve-btn").addEventListener("click", () => {
        db.ref(`users/${req.uid}`).once("value").then(userSnap => {
          const currentBalance = userSnap.val().balance || 0;
          const amount = req.amount || 0; // in case you stored amount
          db.ref(`users/${req.uid}`).update({
            balance: currentBalance + amount
          });
        });

        db.ref("depositRequests/" + reqSnap.key).update({
          status: "approved"
        });

        alert("Deposit approved!");
      });

      // Decline deposit
      li.querySelector(".decline-btn").addEventListener("click", () => {
        db.ref("depositRequests/" + reqSnap.key).update({
          status: "denied",
          message: "Deposit denied by admin"
        });

        alert("Deposit denied! User will see a message.");
      });

      depositRequestsList.appendChild(li);
    });
  });
}

// Call this once when admin panel loads
loadDepositRequests();


