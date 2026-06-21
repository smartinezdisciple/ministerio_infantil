const fetch = require('node-fetch');

(async () => {
  try {
    const res = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario: 'admin', contrasena: 'AdminDiosEsFiel123!' })
    });
    console.log('Status:', res.status);
    const json = await res.json();
    console.log('Body:', json);
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
})();
