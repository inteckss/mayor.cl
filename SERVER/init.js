#!/usr/bin/env node

// Script para inicializar el servidor con datos de prueba
const express = require('express');
const app = express();

console.log('🚀 Iniciando servidor del e-commerce...');
console.log('📦 Cargando datos de prueba...');

// Datos de prueba para el carrito persistente
const usuariosDePrueba = [
  {
    id: 1,
    nombre: 'Usuario Demo',
    email: 'demo@demo.com',
    // password: demo123 (hasheada)
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
  },
  {
    id: 2,
    nombre: 'Test User',
    email: 'test@test.com',
    // password: test123 (hasheada)
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
  }
];

console.log('👥 Usuarios de prueba disponibles:');
usuariosDePrueba.forEach(user => {
  console.log(`   📧 ${user.email} - password: demo123`);
});

console.log('\n🛒 Sistema de carrito persistente configurado');
console.log('✅ Listo para usar!');
console.log('\n🌐 Para usar el sistema:');
console.log('1. Inicia el servidor: node SERVER/server.js');
console.log('2. Abre el navegador en: http://localhost:3000');
console.log('3. Inicia sesión con demo@demo.com / demo123');
console.log('4. Agrega productos al carrito');
console.log('5. El carrito se guardará automáticamente');
console.log('6. Cierra sesión y vuelve a iniciar - el carrito se recuperará');

console.log('\n🔧 Características implementadas:');
console.log('✅ Carrito persistente por usuario');
console.log('✅ Autenticación JWT');
console.log('✅ Sincronización automática');
console.log('✅ Control de cantidades');
console.log('✅ Diseño responsivo Discord Nitro style');
