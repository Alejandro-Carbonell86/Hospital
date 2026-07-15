const formularioLogin = document.getElementById('loginForm');
const entradaUsuario = document.getElementById('username');
const entradaContrasena = document.getElementById('password');
const cajaMensaje = document.getElementById('message');
const botonLimpiar = document.getElementById('resetButton');

function mostrarMensaje(texto, tipo) {
  cajaMensaje.textContent = texto;
  cajaMensaje.className = 'message ' + tipo;
  cajaMensaje.style.display = 'block';
}

function limpiarMensaje() {
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

formularioLogin.addEventListener('submit', function(evento) {
  evento.preventDefault();
  limpiarMensaje();

  if (validarCampos()) {
    const usuario = entradaUsuario.value.trim();
    const contrasena = entradaContrasena.value.trim();

    if (usuario === 'alejandro' && contrasena === 'alejandro') {
      window.location.href = 'pages/panel.html';
    } else {
      mostrarMensaje('Usuario o contraseña incorrectos. Revisa tus datos.', 'error');
    }
  }
});

botonLimpiar.addEventListener('click', function() {
  formularioLogin.reset();
  limpiarMensaje();
  entradaUsuario.focus();
});
