const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 🔌 CONEXIÓN A TU COOLIFY
const db = mysql.createConnection({
  host: '158.220.115.89', // La IP de tu servidor
  port: 3002,             // El puerto que mapeaste
  user: 'root',           // Tu usuario jefe
  password: '95iWhGYPrJn99czMuvLCEuQXWiBbDNmt5TEZaatd0Z3fneGpCT2wZmWn4KfPzw8N', // ⚠️ Pega aquí tu contraseña larga del ojito
  database: 'hotelbears'  // El nombre de tu BD
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
  res.json({ mensaje: "¡El Mesero está vivo, mi king! 🚀" });
});

// 🚪 PUERTA 2: Obtener cuartos (Ejemplo)
app.get('/api/habitaciones', (req, res) => {
  db.query('SELECT * FROM HABITACION', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Encendemos el servidor (Adaptado para la nube)
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API corriendo en el puerto ${PORT}`);
});