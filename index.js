require('dotenv').config(); // 👈 Llama a la magia del .env
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 🔌 CONEXIÓN A TU COOLIFY (Ahora lee del .env)
const db = mysql.createConnection({
  host: process.env.DB_HOST, 
  port: process.env.DB_PORT,             
  user: process.env.DB_USER,           
  password: process.env.DB_PASSWORD, 
  database: process.env.DB_NAME  
});

db.connect((err) => {
  if (err) {
    console.error('Error conectando a la base de datos: ', err);
    return;
  }
  console.log('✅ ¡Conectado al MySQL de Coolify como un campeón! 🐻');
});

// 🚪 PUERTA 1: Prueba de conexión
app.get('/api/estado', (req, res) => {
  res.json({ mensaje: "¡El Mesero está vivo y seguro, mi king! 🚀" });
});

// 🚪 PUERTA 2: Obtener cuartos (Ejemplo)
app.get('/api/habitaciones', (req, res) => {
  db.query('SELECT * FROM HABITACION', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});


// 🚪 PUERTA 3: Recibir un nuevo registro de usuario
app.post('/api/registro', (req, res) => {
  // 1. Abrimos el paquete que nos manda Android
  const { nombre, correo, pass, pregunta, respuesta } = req.body;

  // 2. Preparamos la orden para MySQL (⚠️ Asegúrate de que tu tabla en MySQL se llame PERSONAL o el nombre que uses)
  const sql = 'INSERT INTO PERSONAL (nombre, correo, pass, pregunta, respuesta) VALUES (?, ?, ?, ?, ?)';
  
  // 3. Ejecutamos la orden
  db.query(sql, [nombre, correo, pass, pregunta, respuesta], (err, results) => {
    if (err) {
      console.error('Error al guardar: ', err);
      return res.status(500).json({ mensaje: 'Error guardando en la nube' });
    }
    res.json({ mensaje: "¡Usuario guardado en la nube con éxito! ☁️🐻" });
  });
});

// Encendemos el servidor (Adaptado para la nube)
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API corriendo en el puerto ${PORT}`);
});