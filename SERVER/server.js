const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Datos simulados
const productos = [
  { id: 1, nombre: 'Producto A', precio: 1000, imagen: 'https://via.placeholder.com/150' },
  { id: 2, nombre: 'Producto B', precio: 2000, imagen: 'https://via.placeholder.com/150' },
  { id: 3, nombre: 'Producto C', precio: 3000, imagen: 'https://via.placeholder.com/150' }
];
let carrito = [];

// Rutas para productos
app.get('/api/productos', (req, res) => {
  res.json(productos);
});

// Rutas para el carrito
app.get('/api/carrito', (req, res) => {
  res.json(carrito);
});
app.post('/api/carrito', (req, res) => {
  const { id } = req.body;
  const prod = productos.find(p => p.id === id);
  if (prod) carrito.push(prod);
  res.json(carrito);
});
app.delete('/api/carrito/:id', (req, res) => {
  carrito = carrito.filter(p => p.id !== +req.params.id);
  res.json(carrito);
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
});
