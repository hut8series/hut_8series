// ======= LOGIN USER =======
const loginForm = document.getElementById('login-form');

loginForm.addEventListener('submit', e => {
  e.preventDefault();

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  if (!email || !password) return alert("Enter email and password");

  auth.signInWithEmailAndPassword(email, password)
    .then(cred => {
      alert("Login successful!");
      window.location.href = "dashboard.html"; // redirect to dashboard
    })
    .catch(err => alert(err.message));
});
