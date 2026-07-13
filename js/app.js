const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const messageBox = document.getElementById('message');
const resetButton = document.getElementById('resetButton');

function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = 'message ' + type;
  messageBox.style.display = 'block';
}

function clearMessage() {
  messageBox.textContent = '';
  messageBox.className = 'message';
  messageBox.style.display = 'none';
}

function validarCampos() {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (username === '' && password === '') {
    showMessage('Por favor ingresa tu usuario y contraseña.', 'error');
    return false;
  }

  if (username === '') {
    showMessage('El campo usuario no puede quedar vacío.', 'error');
    return false;
  }

  if (password === '') {
    showMessage('El campo contraseña no puede quedar vacío.', 'error');
    return false;
  }

  if (password.length < 6) {
    showMessage('La contraseña debe tener al menos 6 caracteres.', 'error');
    return false;
  }

  const nombreValido = /^[a-zA-Z0-9_.-]{3,}$/;
  if (!nombreValido.test(username)) {
    showMessage('El usuario solo puede contener letras, números, puntos, guiones o guiones bajos.', 'error');
    return false;
  }

  return true;
}

loginForm.addEventListener('submit', function(event) {
  event.preventDefault();
  clearMessage();

  if (validarCampos()) {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (username === 'admin' && password === 'hospital123') {
      showMessage('Ingreso exitoso. Bienvenido al panel del hospital.', 'success');
    } else {
      showMessage('Usuario o contraseña incorrectos. Revisa tus datos.', 'error');
    }
  }
});

resetButton.addEventListener('click', function() {
  loginForm.reset();
  clearMessage();
  usernameInput.focus();
});
