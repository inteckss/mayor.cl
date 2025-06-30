// URL base de tu API
const API = 'http://localhost:3000/api';

// Carga y muestra el catálogo desde la API
async function mostrarProductos() {
  const res = await fetch(`${API}/productos`);
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
  const res = await fetch(`${API}/carrito`);
  return res.json();
}

// Agrega un producto al carrito vía POST
async function agregarAlCarrito(id) {
  await fetch(`${API}/carrito`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  });
  actualizarCarrito();
}

// Elimina un producto del carrito vía DELETE
async function eliminarDelCarrito(id) {
  await fetch(`${API}/carrito/${id}`, { method: 'DELETE' });
  actualizarCarrito();
}

// Refresca la vista del carrito
async function actualizarCarrito() {
  const carrito = await obtenerCarrito();
  const lista = document.getElementById('lista-carrito');
  const totalSpan = document.getElementById('total');
  lista.innerHTML = '';
  let total = 0;
  carrito.forEach(p => {
    const li = document.createElement('li');
    li.innerHTML = `
      ${p.nombre} — $${p.precio}
      <button onclick="eliminarDelCarrito(${p.id})">❌</button>
    `;
    lista.appendChild(li);
    total += p.precio;
  });
  totalSpan.textContent = total;
  document.getElementById('contador-carrito').textContent = carrito.length;
}

// Al cargar la página, invoca catálogo y carrito
window.onload = () => {
  mostrarProductos();
  actualizarCarrito();
  // Botón de checkout (vacía carrito)
  document.getElementById('checkout').onclick = async () => {
    alert('¡Compra completada! (simulada)');
    // Podrías aquí enviar una orden real… 
    carrito = []; // opcional: vaciar array local
    actualizarCarrito();
  };
};
