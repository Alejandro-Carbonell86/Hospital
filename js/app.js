const API_BASE = window.location.pathname.includes('/pages/') ? '../php/api' : 'php/api';
const formularioLogin = document.getElementById('loginForm');
const entradaUsuario = document.getElementById('username');
const entradaContrasena = document.getElementById('password');
const cajaMensaje = document.getElementById('message');
const botonLimpiar = document.getElementById('resetButton');

function mostrarMensaje(texto, tipo) {
  if (!cajaMensaje) return;
  cajaMensaje.textContent = texto;
  cajaMensaje.className = 'message ' + tipo;
  cajaMensaje.style.display = 'block';
}

function limpiarMensaje() {
  if (!cajaMensaje) return;
  cajaMensaje.textContent = '';
  cajaMensaje.className = 'message';
  cajaMensaje.style.display = 'none';
}

function validarCampos() {
  const usuario = entradaUsuario.value.trim();
  const contrasena = entradaContrasena.value.trim();

  if (usuario === '' && contrasena === '') {
    mostrarMensaje('Por favor ingresa tu usuario y contraseña.', 'error');
    return false;
  }

  if (usuario === '') {
    mostrarMensaje('El campo usuario no puede quedar vacío.', 'error');
    return false;
  }

  if (contrasena === '') {
    mostrarMensaje('El campo contraseña no puede quedar vacío.', 'error');
    return false;
  }

  if (contrasena.length < 6) {
    mostrarMensaje('La contraseña debe tener al menos 6 caracteres.', 'error');
    return false;
  }

  const nombreValido = /^[a-zA-Z0-9_.-]{3,}$/;
  if (!nombreValido.test(usuario)) {
    mostrarMensaje('El usuario solo puede contener letras, números, puntos, guiones o guiones bajos.', 'error');
    return false;
  }

  return true;
}

async function iniciarSesion(usuario, contrasena) {
  try {
    const res = await fetch(`${API_BASE}/login.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username: usuario, password: contrasena })
    });

    const data = await res.json();
    if (!res.ok) {
      mostrarMensaje(data.message || 'Error al iniciar sesión.', 'error');
      return;
    }

    window.location.href = 'pages/panel.html';
  } catch (error) {
    mostrarMensaje('No se pudo conectar con el servidor. Comprueba la configuración.', 'error');
  }
}

async function cerrarSesion() {
  try {
    await fetch(`${API_BASE}/logout.php`, { method: 'POST', credentials: 'include' });
  } catch (error) {
    console.warn('No se pudo desconectar del servidor.', error);
  }
}

if (formularioLogin) {
  formularioLogin.addEventListener('submit', function(evento) {
    evento.preventDefault();
    limpiarMensaje();

    if (validarCampos()) {
      const usuario = entradaUsuario.value.trim();
      const contrasena = entradaContrasena.value.trim();
      iniciarSesion(usuario, contrasena);
    }
  });
}

if (botonLimpiar) {
  botonLimpiar.addEventListener('click', function() {
    if (formularioLogin) formularioLogin.reset();
    limpiarMensaje();
    if (entradaUsuario) entradaUsuario.focus();
  });
}

function inicializarCerrarSesion() {
  const btnLogout = document.querySelector('.btn-logout');
  if (!btnLogout) return;

  btnLogout.addEventListener('click', async (e) => {
    e.preventDefault();
    if (confirm('¿Cerrar sesión y volver al inicio?')) {
      await cerrarSesion();
      window.location.href = window.location.pathname.includes('/pages/') ? '../index.html' : 'index.html';
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarCerrarSesion);
} else {
  inicializarCerrarSesion();
}
