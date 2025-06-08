// login-register.js - Lógica específica para estas páginas

// Login
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = e.target.email.value;
  const password = e.target.password.value;

  try {
    const res = await fetch(`${window.API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) throw new Error(await res.text());
    
    const { token } = await res.json();
    localStorage.setItem('token', token);
    window.redirectAfterLogin(); // Función de auth.js

  } catch (error) {
    alert(`Error: ${error.message}`);
  }
});

// Registro
document.getElementById('register-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  if (e.target.password.value !== e.target['confirm-password'].value) {
    alert('Las contraseñas no coinciden');
    return;
  }

  try {
    const res = await fetch(`${window.API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: e.target.username.value,
        email: e.target.email.value,
        password: e.target.password.value
      })
    });

    if (!res.ok) throw new Error(await res.text());
    
    alert('Registro exitoso!');
    window.location.href = 'login.html';

  } catch (error) {
    alert(`Error: ${error.message}`);
  }
});
