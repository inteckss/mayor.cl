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
let carrito = [];

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
