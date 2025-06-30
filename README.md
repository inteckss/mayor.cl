# 🛍️ Mi Tienda - E-commerce Full Stack

Una aplicación de e-commerce completa desarrollada con HTML, CSS, JavaScript vanilla y Node.js + Express.

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio (saltar al siguiente paso si descargaste el repo y abriste el Visual Studio Code)
```bash
git clone https://github.com/inteckss/mayor.cl.git
cd mayor.cl
```

### 2. Instalar dependencias 
```bash
npm install
```

### 3. Iniciar el servidor
```bash
node SERVER/server.js
```

### 4. Abrir en navegador
Abre tu navegador web y navega a:
```
http://localhost:3000
```

## 🔧 Tecnologías Utilizadas

### Frontend
- **HTML5** - Estructura
- **CSS3** - Estilos y diseño responsive
- **JavaScript ES6+** - Funcionalidad dinámica
- **Fetch API** - Comunicación con backend

### Backend
- **Node.js** - Entorno de ejecución
- **Express.js** - Framework web
- **JWT** - Autenticación
- **bcryptjs** - Encriptación de contraseñas
- **CORS** - Políticas de intercambio de recursos


## 🛠️ Funcionalidades

### 🛒 Sistema de Carrito
- Agregar productos al carrito
- Eliminar productos del carrito
- Calcular total automáticamente
- Persistencia durante la sesión

### 🔐 Autenticación
- Registro de nuevos usuarios
- Inicio de sesión con JWT
- Navegación dinámica según estado de sesión
- Cerrar sesión

### 📱 Diseño Responsive
- Adaptado para desktop, tablet y móvil
- Menú hamburger en dispositivos móviles
- Interfaz moderna con glassmorphism

## 🔧 API Endpoints

### Productos
- `GET /api/productos` - Obtener todos los productos

### Carrito
- `GET /api/carrito` - Obtener carrito actual
- `POST /api/carrito` - Agregar producto al carrito
- `DELETE /api/carrito/:id` - Eliminar producto del carrito

### Autenticación
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión


## 🚧 Próximas Funcionalidades

- [ ] Base de datos persistente
- [ ] Procesamiento de pagos
- [ ] Panel de administración
- [ ] Gestión de inventario
- [ ] Sistema de reviews
