// ======= REGISTER USER =======
const registerForm = document.getElementById('register-form');

registerForm.addEventListener('submit', e => {
  e.preventDefault();

  const name = document.getElementById('register-name').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;
  const role = document.getElementById('register-role').value; // 'user' or 'admin'

  if (!name || !email || !password) return alert("Fill all fields");

  // Create Firebase Auth user
  auth.createUserWithEmailAndPassword(email, password)
    .then(cred => {
      const uid = cred.user.uid;

      // Store user data in Realtime Database
      db.ref('users/' + uid).set({
        name: name,
        email: email,
        role: role,
        balance: 0
      }).then(() => {
        alert("User registered successfully!");
        registerForm.reset();
        window.location.href = "login.html"; // redirect to login
      });
    })
    .catch(err => alert(err.message));
});
