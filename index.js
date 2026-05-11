require('dotenv').config(); // 👈 Llama a la magia del .env
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 🛡️ MIDDLEWARE DE SEGURIDAD (El Cadenero del Club)
const verificarApiKey = (req, res, next) => {
  // 1. Le pedimos que nos muestre su llave secreta (que viene oculta en las "cabeceras")
  const apiKey = req.headers['x-api-key'];
  
  // 2. Definimos cuál es la llave oficial (¡Inventa una muy difícil luego!)
  const miLlaveSecreta = 'HotelBears_SuperSecret_2026'; 

  // 3. Verificamos si la llave es correcta
  if (!apiKey || apiKey !== miLlaveSecreta) {
    console.log('🚨 ¡Intento de hackeo bloqueado!');
    return res.status(401).json({ mensaje: '¡Acceso denegado! No tienes el Pase VIP 🛑' });
  }

  // 4. Si la llave es correcta, le decimos "Adelante, pasa".
  next(); 
};

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

// 🚪 PUERTA 5: Actualizar estado y precio de una Habitación (Guardar y Disparar)
app.post('/api/habitacion/actualizar', verificarApiKey, (req, res) => {
  // Recibimos la caja de Android
  const { numeroHabitacion, nuevoEstado, nuevoPrecio } = req.body;

  // Actualizamos la tabla HABITACION. 
  // OJO: Usamos un sub-query para buscar el ESTADOID basado en el nombre ('LIBRE', 'OCUPADO', etc.)
  const sql = `
    UPDATE HABITACION 
    SET 
        ESTADO = (SELECT ESTADOID FROM ESTADOHABITACION WHERE NOMBRE = ? LIMIT 1),
        PRECIO = ?
    WHERE HABITACION = ?
  `;
  
  db.query(sql, [nuevoEstado, nuevoPrecio, numeroHabitacion], (err, results) => {
    if (err) {
      console.error('Error al actualizar habitación: ', err);
      return res.status(500).json({ mensaje: 'Error en la nube' });
    }
    res.json({ mensaje: `Habitación ${numeroHabitacion} actualizada a ${nuevoEstado} ☁️✅` });
  });
});


// 🚪 PUERTA 3: Recibir un nuevo registro (AHORA PROTEGIDA CON CADENERO 🛡️)
app.post('/api/registro', verificarApiKey, (req, res) => {
  const { nombres, apellidos, correo, pass, pregunta, respuesta } = req.body;

  const sql = `INSERT INTO PERSONAL 
    (NOMBRES, APELLIDOS, USUARIO, CONTRASENA, CORREO, SUELDO, ROL, HORARIO, ASISTENCIA, PREGUNTA, RESPUESTA, is_deleted) 
    VALUES (?, ?, ?, ?, ?, 0.0, 1, 1, 1, ?, ?, 0)`;
  
  db.query(sql, [nombres, apellidos, correo, pass, correo, pregunta, respuesta], (err, results) => {
    if (err) {
      console.error('Error al guardar en MySQL: ', err);
      return res.status(500).json({ mensaje: 'Error guardando en la nube: ' + err.code });
    }
    res.json({ mensaje: "¡Usuario guardado en la nube con éxito! ☁️🐻" });
  });
});

// 🚪 PUERTA 4: Sincronización (Bajar los usuarios de MySQL al celular)
app.get('/api/sincronizar/personal', verificarApiKey, (req, res) => {
  const sql = 'SELECT NOMBRES, APELLIDOS, USUARIO, CONTRASENA, CORREO, PREGUNTA, RESPUESTA, ROL FROM PERSONAL WHERE is_deleted = 0';
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error al sincronizar: ', err);
      return res.status(500).json({ mensaje: 'Error leyendo la nube' });
    }
    // Le devolvemos la lista completa al celular en formato JSON
    res.json(results); 
  });
});

// Encendemos el servidor (Adaptado para la nube)
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API corriendo en el puerto ${PORT}`);
});

