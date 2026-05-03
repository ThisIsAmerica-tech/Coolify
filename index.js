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
  const { nombres, apellidos, correo, pass, pregunta, respuesta } = req.body;

  // 1. Armamos la orden COMPLETA para que MySQL no se queje de columnas vacías
  const sql = `INSERT INTO PERSONAL 
    (NOMBRES, APELLIDOS, USUARIO, CONTRASENA, CORREO, SUELDO, ROL, HORARIO, ASISTENCIA, PREGUNTA, RESPUESTA, is_deleted) 
    VALUES (?, ?, ?, ?, ?, 0.0, 1, 1, 1, ?, ?, 0)`;
  
  // 2. Fíjate que repito "correo" en el 3er lugar para que se guarde como USUARIO también
  db.query(sql, [nombres, apellidos, correo, pass, correo, pregunta, respuesta], (err, results) => {
    if (err) {
      console.error('Error al guardar en MySQL: ', err);
      // Imprimimos el error exacto en los logs de Coolify para no adivinar más
      return res.status(500).json({ mensaje: 'Error guardando en la nube: ' + err.code });
    }
    res.json({ mensaje: "¡Usuario guardado en la nube con éxito! ☁️🐻" });
  });
});

// Encendemos el servidor (Adaptado para la nube)
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API corriendo en el puerto ${PORT}`);
});