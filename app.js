// URL base de tu API
const API_URL = 'http://localhost:3000/api';

// Función para obtener el token JWT del localStorage
function getAuthToken() {
  return localStorage.getItem('authToken');
}

// Función para obtener headers con autenticación
function getAuthHeaders() {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

// Verificar si el usuario está autenticado
function isAuthenticated() {
  return !!getAuthToken();
}

// Carga y muestra el catálogo desde la API
async function mostrarProductos() {
  try {
    const res = await fetch(`${API_URL}/productos`);
    const productos = await res.json();
    const cont = document.getElementById('productos');
    cont.innerHTML = '';
    productos.forEach(p => {
      const div = document.createElement('div');
      div.className = 'producto';
      div.innerHTML = `
        <img src="${p.imagen}" alt="${p.nombre}">
        <h3>${p.nombre}</h3>
        <p>$${p.precio}</p>
        <button onclick="agregarAlCarrito(${p.id})">Agregar</button>
      `;
      cont.appendChild(div);
    });
  } catch (error) {
    console.error('Error al cargar productos:', error);
  }
}

// Obtiene el carrito actual (anónimo del localStorage o del servidor si está logueado)
async function obtenerCarrito() {
  if (isAuthenticated()) {
    // Usuario logueado - obtener del servidor
    try {
      const res = await fetch(`${API_URL}/carrito`, {
        headers: getAuthHeaders()
      });
      
      if (res.status === 401) {
        // Token inválido, limpiar y usar carrito local
        localStorage.removeItem('authToken');
        return getLocalCart();
      }
      
      return await res.json();
    } catch (error) {
      console.error('Error al obtener carrito del servidor:', error);
      return getLocalCart();
    }
  } else {
    // Usuario anónimo - obtener del localStorage
    return getLocalCart();
  }
}

// Obtener carrito local del localStorage
function getLocalCart() {
  const cart = localStorage.getItem('anonymousCart');
  return cart ? JSON.parse(cart) : [];
}

// Guardar carrito local en localStorage
function saveLocalCart(cart) {
  localStorage.setItem('anonymousCart', JSON.stringify(cart));
}

// Migrar carrito anónimo al usuario logueado
async function migrateAnonymousCart() {
  const localCart = getLocalCart();
  if (localCart.length > 0 && isAuthenticated()) {
    try {
      const res = await fetch(`${API_URL}/carrito/migrate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ anonymousCart: localCart })
      });
      
      if (res.ok) {
        // Limpiar carrito local después de migrar exitosamente
        localStorage.removeItem('anonymousCart');
        console.log('Carrito anónimo migrado exitosamente');
      }
    } catch (error) {
      console.error('Error al migrar carrito:', error);
    }
  }
}

// Agrega un producto al carrito (anónimo o autenticado)
async function agregarAlCarrito(id) {
  if (isAuthenticated()) {
    // Usuario logueado - agregar al servidor
    try {
      const res = await fetch(`${API_URL}/carrito`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ id })
      });

      if (res.status === 401) {
        localStorage.removeItem('authToken');
        // Continuar como anónimo
        agregarAlCarritoLocal(id);
        return;
      }

      if (res.ok) {
        await actualizarCarrito();
        showCartNotification('Producto agregado al carrito! 🛒');
      }
    } catch (error) {
      console.error('Error al agregar producto:', error);
      // Fallback a carrito local
      agregarAlCarritoLocal(id);
    }
  } else {
    // Usuario anónimo - agregar al localStorage
    agregarAlCarritoLocal(id);
  }
}

// Agregar producto al carrito local
async function agregarAlCarritoLocal(id) {
  try {
    // Obtener datos del producto desde la API
    const res = await fetch(`${API_URL}/productos`);
    const productos = await res.json();
    const producto = productos.find(p => p.id === id);
    
    if (!producto) return;

    let cart = getLocalCart();
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
      existingItem.cantidad += 1;
      existingItem.fechaActualizado = new Date();
    } else {
      cart.push({
        ...producto,
        cantidad: 1,
        fechaAgregado: new Date(),
        fechaActualizado: new Date()
      });
    }
    
    saveLocalCart(cart);
    await actualizarCarrito();
    showCartNotification('Producto agregado al carrito! 🛒');
  } catch (error) {
    console.error('Error al agregar producto local:', error);
  }
}

// Actualizar cantidad de un producto en el carrito
async function actualizarCantidadCarrito(id, cantidad) {
  if (isAuthenticated()) {
    // Usuario logueado - actualizar en servidor
    try {
      const res = await fetch(`${API_URL}/carrito/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ cantidad })
      });

      if (res.ok) {
        await actualizarCarrito();
      }
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
    }
  } else {
    // Usuario anónimo - actualizar en localStorage
    let cart = getLocalCart();
    const item = cart.find(item => item.id === id);
    
    if (item) {
      if (cantidad <= 0) {
        cart = cart.filter(item => item.id !== id);
      } else {
        item.cantidad = cantidad;
        item.fechaActualizado = new Date();
      }
      saveLocalCart(cart);
      await actualizarCarrito();
    }
  }
}

// Elimina un producto del carrito
async function eliminarDelCarrito(id) {
  if (isAuthenticated()) {
    // Usuario logueado - eliminar del servidor
    try {
      const res = await fetch(`${API_URL}/carrito/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (res.ok) {
        await actualizarCarrito();
      }
    } catch (error) {
      console.error('Error al eliminar producto:', error);
    }
  } else {
    // Usuario anónimo - eliminar del localStorage
    let cart = getLocalCart();
    cart = cart.filter(item => item.id !== id);
    saveLocalCart(cart);
    await actualizarCarrito();
  }
}

// Vaciar todo el carrito
async function vaciarCarrito() {
  if (isAuthenticated()) {
    // Usuario logueado - vaciar en servidor
    try {
      const res = await fetch(`${API_URL}/carrito`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (res.ok) {
        await actualizarCarrito();
      }
    } catch (error) {
      console.error('Error al vaciar carrito:', error);
    }
  } else {
    // Usuario anónimo - vaciar localStorage
    localStorage.removeItem('anonymousCart');
    await actualizarCarrito();
  }
}

// Refresca la vista del carrito
async function actualizarCarrito() {
  const carrito = await obtenerCarrito();
  const lista = document.getElementById('lista-carrito');
  const totalSpan = document.getElementById('total');
  const checkoutBtn = document.getElementById('checkout');
  
  if (!lista || !totalSpan || !checkoutBtn) return;
  
  lista.innerHTML = '';
  let total = 0;
  let totalItems = 0;
  
  if (carrito.length === 0) {
    lista.innerHTML = `
      <div class="empty-cart">
        <div class="empty-cart-icon">🛒</div>
        <p>Tu carrito está vacío</p>
        <p>¡Agrega algunos productos!</p>
      </div>
    `;
    checkoutBtn.disabled = true;
  } else {
    carrito.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `
        <img src="${item.imagen}" alt="${item.nombre}" class="cart-item-img">
        <div class="item-info">
          <div class="item-name">${item.nombre}</div>
          <div class="item-price">$${item.precio.toLocaleString()}</div>
          <div class="item-quantity">
            <button class="qty-btn" onclick="actualizarCantidadCarrito(${item.id}, ${item.cantidad - 1})" ${item.cantidad <= 1 ? 'disabled' : ''}>-</button>
            <span class="qty-number">${item.cantidad}</span>
            <button class="qty-btn" onclick="actualizarCantidadCarrito(${item.id}, ${item.cantidad + 1})">+</button>
          </div>
        </div>
        <button class="remove-btn" onclick="eliminarDelCarrito(${item.id})" title="Eliminar producto">
          ✕
        </button>
      `;
      lista.appendChild(li);
      total += item.precio * item.cantidad;
      totalItems += item.cantidad;
    });
    checkoutBtn.disabled = false;
  }
  
  totalSpan.textContent = total.toLocaleString();
  document.getElementById('contador-carrito').textContent = totalItems;
}

// Mostrar notificación del carrito
function showCartNotification(message) {
  // Crear notificación temporal
  const notification = document.createElement('div');
  notification.className = 'cart-notification';
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--accent-success);
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  // Eliminar después de 3 segundos
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Al cargar la página, invoca catálogo y carrito
window.onload = () => {
  mostrarProductos();
  actualizarCarrito();
  initializeCartSidebar();
  
  // Botón de checkout (exige login si no está autenticado)
  document.getElementById('checkout').onclick = async () => {
    if (document.getElementById('checkout').disabled) return;
    
    // Si no está logueado, redirigir al login
    if (!isAuthenticated()) {
      const proceder = confirm('Para finalizar la compra necesitas iniciar sesión.\n¿Quieres continuar?');
      if (proceder) {
        // Guardar estado del carrito antes de redirigir
        const cart = await obtenerCarrito();
        if (cart.length > 0) {
          saveLocalCart(cart);
        }
        window.location.href = 'login.html';
      }
      return;
    }

    const result = confirm('¿Estás seguro de que deseas finalizar la compra?');
    if (result) {
      try {
        await vaciarCarrito();
        alert('¡Compra completada exitosamente! 🎉\nGracias por tu compra.');
        closeCartSidebar();
      } catch (error) {
        console.error('Error al procesar compra:', error);
        alert('Error al procesar la compra. Inténtalo de nuevo.');
      }
    }
  };
  
  // Funcionalidad del menú hamburguesa
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
    });
    
    // Cerrar menú al hacer click en un enlace
    navLinks.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
      }
    });
    
    // Cerrar menú al hacer click fuera
    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
      }
    });
  }
};

// Inicializar funcionalidad del sidebar del carrito
function initializeCartSidebar() {
  const cartToggle = document.getElementById('cart-toggle');
  const cartSidebar = document.getElementById('cart-sidebar');
  const cartOverlay = document.getElementById('cart-overlay');
  const closeCartBtn = document.getElementById('close-cart');

  // Abrir carrito al hacer click en el ícono
  cartToggle.addEventListener('click', (e) => {
    e.preventDefault();
    openCartSidebar();
  });

  // Cerrar carrito con el botón X
  closeCartBtn.addEventListener('click', closeCartSidebar);

  // Cerrar carrito al hacer click en el overlay
  cartOverlay.addEventListener('click', closeCartSidebar);

  // Cerrar carrito con ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && cartSidebar.classList.contains('active')) {
      closeCartSidebar();
    }
  });
}

// Abrir sidebar del carrito
function openCartSidebar() {
  const cartSidebar = document.getElementById('cart-sidebar');
  const cartOverlay = document.getElementById('cart-overlay');
  
  cartSidebar.classList.add('active');
  cartOverlay.classList.add('active');
  document.body.style.overflow = 'hidden'; // Evitar scroll
}

// Cerrar sidebar del carrito
function closeCartSidebar() {
  const cartSidebar = document.getElementById('cart-sidebar');
  const cartOverlay = document.getElementById('cart-overlay');
  
  cartSidebar.classList.remove('active');
  cartOverlay.classList.remove('active');
  document.body.style.overflow = ''; // Restaurar scroll
}

// Función para sincronizar el carrito al iniciar sesión
async function syncCartOnLogin() {
  if (isAuthenticated()) {
    try {
      // Migrar carrito anónimo al usuario logueado
      await migrateAnonymousCart();
      
      // Actualizar vista
      await actualizarCarrito();
      await mostrarProductos();
    } catch (error) {
      console.error('Error al sincronizar carrito:', error);
    }
  }
}

// Escuchar cambios en el localStorage para detectar login/logout
window.addEventListener('storage', function(e) {
  if (e.key === 'authToken') {
    // Token cambió (login/logout), sincronizar estado
    setTimeout(() => {
      mostrarProductos();
      actualizarCarrito();
    }, 100);
  }
});
