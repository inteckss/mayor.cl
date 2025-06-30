// URL base de tu API
const API_URL = 'http://localhost:3000/api';

// Carga y muestra el catálogo desde la API
async function mostrarProductos() {
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
}

// Obtiene el carrito actual desde la API
async function obtenerCarrito() {
  const res = await fetch(`${API_URL}/carrito`);
  return res.json();
}

// Agrega un producto al carrito vía POST
async function agregarAlCarrito(id) {
  await fetch(`${API_URL}/carrito`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  });
  actualizarCarrito();
}

// Elimina un producto del carrito vía DELETE
async function eliminarDelCarrito(id) {
  await fetch(`${API_URL}/carrito/${id}`, { method: 'DELETE' });
  actualizarCarrito();
}

// Refresca la vista del carrito
async function actualizarCarrito() {
  const carrito = await obtenerCarrito();
  const lista = document.getElementById('lista-carrito');
  const totalSpan = document.getElementById('total');
  const checkoutBtn = document.getElementById('checkout');
  
  lista.innerHTML = '';
  let total = 0;
  
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
    carrito.forEach(p => {
      const li = document.createElement('li');
      li.innerHTML = `
        <img src="${p.imagen}" alt="${p.nombre}" class="cart-item-img">
        <div class="item-info">
          <div class="item-name">${p.nombre}</div>
          <div class="item-price">$${p.precio.toLocaleString()}</div>
        </div>
        <button class="remove-btn" onclick="eliminarDelCarrito(${p.id})" title="Eliminar producto">
          ✕
        </button>
      `;
      lista.appendChild(li);
      total += p.precio;
    });
    checkoutBtn.disabled = false;
  }
  
  totalSpan.textContent = total.toLocaleString();
  document.getElementById('contador-carrito').textContent = carrito.length;
}

// Al cargar la página, invoca catálogo y carrito
window.onload = () => {
  mostrarProductos();
  actualizarCarrito();
  initializeCartSidebar();
  
  // Botón de checkout (vacía carrito)
  document.getElementById('checkout').onclick = async () => {
    if (document.getElementById('checkout').disabled) return;
    
    const result = confirm('¿Estás seguro de que deseas finalizar la compra?');
    if (result) {
      alert('¡Compra completada exitosamente! 🎉\nGracias por tu compra.');
      actualizarCarrito();
      closeCartSidebar();
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
