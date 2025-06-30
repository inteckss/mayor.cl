// auth.js - Sistema de autenticación
// URL base de la API
const API = 'http://localhost:3000/api';

// Función para mostrar mensajes
function showMessage(message, type = 'error') {
  const messageDiv = document.getElementById('message');
  messageDiv.textContent = message;
  messageDiv.className = `message ${type}`;
  messageDiv.style.display = 'block';
  
  // Ocultar mensaje después de 5 segundos
  setTimeout(() => {
    messageDiv.style.display = 'none';
  }, 5000);
}

// Función para validar email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Registro de usuario
async function registerUser(userData) {
  try {
    const response = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showMessage('Usuario registrado exitosamente. Redirigiendo al login...', 'success');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
    } else {
      showMessage(data.message || 'Error al registrar usuario');
    }
  } catch (error) {
    showMessage('Error de conexión. Intenta nuevamente.');
    console.error('Error:', error);
  }
}

// Login de usuario
async function loginUser(credentials) {
  try {
    const response = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Guardar token y datos del usuario
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      showMessage('Inicio de sesión exitoso. Redirigiendo...', 'success');
      
      // Redirigir inmediatamente sin delay
      window.location.href = 'index.html';
    } else {
      showMessage(data.message || 'Credenciales incorrectas');
    }
  } catch (error) {
    showMessage('Error de conexión. Intenta nuevamente.');
    console.error('Error:', error);
  }
}

// Logout
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Actualizar navegación
  updateNavigation();
  
  // Redirigir al login
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 500);
}

// Verificar si el usuario está logueado
function isLoggedIn() {
  return localStorage.getItem('token') !== null;
}

// Obtener datos del usuario actual
function getCurrentUser() {
  const userData = localStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
}

// ...existing code...

// Evento DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
  
  // Formulario de registro
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = new FormData(this);
      const nombre = formData.get('nombre').trim();
      const email = formData.get('email').trim();
      const password = formData.get('password');
      const confirmPassword = formData.get('confirm-password');
      
      // Validaciones
      if (!nombre || !email || !password) {
        showMessage('Por favor completa todos los campos');
        return;
      }
      
      if (!isValidEmail(email)) {
        showMessage('Por favor ingresa un email válido');
        return;
      }
      
      if (password.length < 6) {
        showMessage('La contraseña debe tener al menos 6 caracteres');
        return;
      }
      
      if (password !== confirmPassword) {
        showMessage('Las contraseñas no coinciden');
        return;
      }
      
      // Registrar usuario
      registerUser({ nombre, email, password });
    });
  }
  
  // Formulario de login
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = new FormData(this);
      const email = formData.get('email').trim();
      const password = formData.get('password');
      
      // Validaciones
      if (!email || !password) {
        showMessage('Por favor completa todos los campos');
        return;
      }
      
      if (!isValidEmail(email)) {
        showMessage('Por favor ingresa un email válido');
        return;
      }
      
      // Iniciar sesión
      loginUser({ email, password });
    });
  }
});

// Función para actualizar la navegación según el estado de login
function updateNavigation() {
  const user = getCurrentUser();
  const navLinks = document.getElementById('navLinks');
  
  if (user && navLinks) {
    // Usuario logueado - buscar el enlace de login
    const loginLink = navLinks.querySelector('a[href="login.html"]');
    
    if (loginLink) {
      const userSectionHTML = `
        <div class="user-section">
          <span class="user-name">👤 Hola, ${user.nombre}</span>
          <button class="logout-btn" onclick="logout()">🚪 Cerrar Sesión</button>
        </div>
      `;
      
      loginLink.outerHTML = userSectionHTML;
    } else {
      // Si no encuentra el link de login, verificar si ya existe la sección de usuario
      const existingUserSection = navLinks.querySelector('.user-section');
      if (!existingUserSection) {
        const userSectionHTML = `
          <div class="user-section">
            <span class="user-name">👤 Hola, ${user.nombre}</span>
            <button class="logout-btn" onclick="logout()">🚪 Cerrar Sesión</button>
          </div>
        `;
        navLinks.insertAdjacentHTML('beforeend', userSectionHTML);
      }
    }
  } else if (navLinks) {
    // Usuario no logueado - asegurar que el enlace de login esté presente
    const userSection = navLinks.querySelector('.user-section');
    if (userSection) {
      userSection.outerHTML = '<a href="login.html">👤 Login</a>';
    }
  }
}

// Función para proteger páginas que requieren login
function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}
