const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();

// <-- Esta línea es para servir archivos estáticos (las fotitos)
app.use(express.static(path.join(__dirname, '..'))); 

app.use(cors());
app.use(express.json());

// Secret key para JWT (en producción debe estar en variables de entorno)
const JWT_SECRET = 'mi_clave_secreta_super_segura_2024';


// Datos simulados
const productos = [
  { id: 1, nombre: 'Producto A', precio: 1000, imagen: "assets/1.png" },
  { id: 2, nombre: 'Producto B', precio: 2000, imagen: "assets/2.png" },
  { id: 3, nombre: 'Producto C', precio: 3000, imagen: "assets/3.png" }
];

// Base de datos simulada de usuarios
let usuarios = [
  {
    id: 1,
    nombre: 'Usuario Demo',
    email: 'demo@demo.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: demo123
    fechaRegistro: new Date()
  }
];
let nextUserId = 2;

// Base de datos simulada de carritos por usuario
let carritosPorUsuario = {
  // Estructura: { userId: [{ id, nombre, precio, imagen, cantidad, fechaAgregado }] }
};

// Middleware para verificar token JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Token de acceso requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }
    req.user = user;
    next();
  });
}

// Rutas de autenticación
app.post('/api/auth/register', async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    // Validaciones
    if (!nombre || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = usuarios.find(u => u.email === email);
    if (usuarioExistente) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    // Encriptar contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crear nuevo usuario
    const nuevoUsuario = {
      id: nextUserId++,
      nombre,
      email,
      password: hashedPassword,
      fechaRegistro: new Date()
    };

    usuarios.push(nuevoUsuario);

    res.status(201).json({ 
      message: 'Usuario registrado exitosamente',
      user: { id: nuevoUsuario.id, nombre: nuevoUsuario.nombre, email: nuevoUsuario.email }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }

    // Buscar usuario
    const usuario = usuarios.find(u => u.email === email);
    if (!usuario) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    // Crear token JWT
    const token = jwt.sign(
      { 
        id: usuario.id, 
        email: usuario.email,
        nombre: usuario.nombre
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      user: { id: usuario.id, nombre: usuario.nombre, email: usuario.email }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Ruta para obtener perfil del usuario (protegida)
app.get('/api/auth/profile', authenticateToken, (req, res) => {
  const usuario = usuarios.find(u => u.id === req.user.id);
  if (!usuario) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }

  res.json({
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    fechaRegistro: usuario.fechaRegistro
  });
});

// Rutas para productos
app.get('/api/productos', (req, res) => {
  res.json(productos);
});

// Rutas para el carrito persistente por usuario
app.get('/api/carrito', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const carritoUsuario = carritosPorUsuario[userId] || [];
  res.json(carritoUsuario);
});

app.post('/api/carrito', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { id } = req.body;
  
  const producto = productos.find(p => p.id === id);
  if (!producto) {
    return res.status(404).json({ message: 'Producto no encontrado' });
  }

  // Inicializar carrito del usuario si no existe
  if (!carritosPorUsuario[userId]) {
    carritosPorUsuario[userId] = [];
  }

  // Verificar si el producto ya está en el carrito
  const itemExistente = carritosPorUsuario[userId].find(item => item.id === id);
  
  if (itemExistente) {
    // Si existe, incrementar cantidad
    itemExistente.cantidad += 1;
    itemExistente.fechaActualizado = new Date();
  } else {
    // Si no existe, agregar nuevo item
    carritosPorUsuario[userId].push({
      ...producto,
      cantidad: 1,
      fechaAgregado: new Date(),
      fechaActualizado: new Date()
    });
  }

  res.json(carritosPorUsuario[userId]);
});

app.put('/api/carrito/:id', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const productId = parseInt(req.params.id);
  const { cantidad } = req.body;

  if (!carritosPorUsuario[userId]) {
    return res.status(404).json({ message: 'Carrito no encontrado' });
  }

  const item = carritosPorUsuario[userId].find(item => item.id === productId);
  if (!item) {
    return res.status(404).json({ message: 'Producto no encontrado en el carrito' });
  }

  if (cantidad <= 0) {
    // Si la cantidad es 0 o negativa, eliminar el item
    carritosPorUsuario[userId] = carritosPorUsuario[userId].filter(item => item.id !== productId);
  } else {
    // Actualizar cantidad
    item.cantidad = cantidad;
    item.fechaActualizado = new Date();
  }

  res.json(carritosPorUsuario[userId]);
});

app.delete('/api/carrito/:id', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const productId = parseInt(req.params.id);

  if (!carritosPorUsuario[userId]) {
    return res.status(404).json({ message: 'Carrito no encontrado' });
  }

  carritosPorUsuario[userId] = carritosPorUsuario[userId].filter(item => item.id !== productId);
  res.json(carritosPorUsuario[userId]);
});

app.delete('/api/carrito', authenticateToken, (req, res) => {
  const userId = req.user.id;
  carritosPorUsuario[userId] = [];
  res.json({ message: 'Carrito vaciado exitosamente' });
});

// Endpoint para migrar carrito anónimo al usuario logueado
app.post('/api/carrito/migrate', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { anonymousCart } = req.body;

  if (!anonymousCart || !Array.isArray(anonymousCart)) {
    return res.status(400).json({ message: 'Carrito anónimo inválido' });
  }

  // Inicializar carrito del usuario si no existe
  if (!carritosPorUsuario[userId]) {
    carritosPorUsuario[userId] = [];
  }

  // Agregar productos del carrito anónimo
  anonymousCart.forEach(anonItem => {
    const producto = productos.find(p => p.id === anonItem.id);
    if (producto) {
      const itemExistente = carritosPorUsuario[userId].find(item => item.id === anonItem.id);
      
      if (itemExistente) {
        // Si existe, sumar cantidades
        itemExistente.cantidad += anonItem.cantidad;
        itemExistente.fechaActualizado = new Date();
      } else {
        // Si no existe, agregar nuevo item
        carritosPorUsuario[userId].push({
          ...producto,
          cantidad: anonItem.cantidad,
          fechaAgregado: new Date(),
          fechaActualizado: new Date()
        });
      }
    }
  });

  res.json({ 
    message: 'Carrito migrado exitosamente',
    cart: carritosPorUsuario[userId]
  });
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
});
