document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const errorMessage = document.getElementById('error-message');
  const logoutButton = document.getElementById('logoutButton');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      try {
        const res = await fetch('http://localhost:5001/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (res.status === 200) {
          localStorage.setItem('authToken', data.token);
          window.location.href = '/assignment/dashboard.html';
        } else {
          errorMessage.textContent = data.msg;
          errorMessage.style.display = 'block';
        }
      } catch (err) {
        console.error("Error:", err);
        errorMessage.textContent = 'Something went wrong. Please try again.';
        errorMessage.style.display = 'block';
      }
    });
  } else {
    console.log("Login form not found!");
  }
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      localStorage.removeItem('authToken');
      window.location.href = 'index.html';
    });
  }
});
