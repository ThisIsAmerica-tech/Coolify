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


// 🚪 PUERTA 6: Crear una nueva Habitación (Guardar y Disparar)
app.post('/api/habitacion/nueva', verificarApiKey, (req, res) => {
  const { numeroHabitacion, tipo, precio } = req.body;

  // Por defecto la creamos con ESTADO 1 (Libre) y SUCURSAL 1
  const sql = `INSERT INTO HABITACION (HABITACION, PRECIO, TIPO, ESTADO, SUCURSAL) VALUES (?, ?, ?, 1, 1)`;
  
  db.query(sql, [numeroHabitacion, precio, tipo], (err, results) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ mensaje: 'La habitación ya existe en la nube' });
      }
      console.error('Error al crear habitación: ', err);
      return res.status(500).json({ mensaje: 'Error en la nube' });
    }
    res.json({ mensaje: `Habitación ${numeroHabitacion} creada en la nube ☁️🐻` });
  });
});

// 🚪 PUERTA 7: Descargar todas las habitaciones (Tubo de Bajada)
app.get('/api/habitacion/todas', verificarApiKey, (req, res) => {
  // Juntamos la tabla de habitaciones con la de estados para mandar el nombre ('LIBRE', 'OCUPADO')
  const sql = `
    SELECT h.HABITACION as numero, h.PRECIO as precio, h.TIPO as tipo, e.NOMBRE as estado
    FROM HABITACION h
    JOIN ESTADOHABITACION e ON h.ESTADO = e.ESTADOID
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error al descargar habitaciones: ', err);
      return res.status(500).json({ mensaje: 'Error en la nube' });
    }
    // Mandamos el paquete
    res.json({ habitaciones: results });
  });
});

// 🚪 PUERTA 8: Eliminar una habitación
app.delete('/api/habitacion/eliminar/:numero', verificarApiKey, (req, res) => {
  const numeroHabitacion = req.params.numero;
  
  db.query('DELETE FROM HABITACION WHERE HABITACION = ?', [numeroHabitacion], (err, results) => {
    if (err) {
      console.error('Error al eliminar habitación: ', err);
      return res.status(500).json({ mensaje: 'Error en la nube' });
    }
    res.json({ mensaje: `Habitación ${numeroHabitacion} eliminada de la nube 🗑️☁️` });
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


// 🚪 PUERTA 9: Descargar todos los clientes (Tubo de Bajada para el Buscador)
app.get('/api/cliente/todos', verificarApiKey, (req, res) => {
  const sql = `SELECT * FROM CLIENTE`;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error al descargar clientes: ', err);
      return res.status(500).json({ mensaje: 'Error en la nube' });
    }
    res.json({ clientes: results });
  });
});

// 🚪 PUERTA 10: Guardar o Actualizar un Cliente (Cuando llenan el formulario)
app.post('/api/cliente/guardar', verificarApiKey, (req, res) => {
  // Asumimos que mandas estos datos desde el celular
  const { dni, nombres, apellidos, telefono, correo, fechaNacimiento, procedencia, nacionalidad } = req.body;

  // Usamos ON DUPLICATE KEY UPDATE: Si el DNI ya existe, solo le actualiza los datos. Si no, lo crea.
  const sql = `
    INSERT INTO CLIENTE (DOCUMENTO, NOMBRES, APELLIDOS, TELEFONO, CORREO, FECHANACIMIENTO, PROCEDENCIA, NACIONALIDAD) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
    NOMBRES = VALUES(NOMBRES), APELLIDOS = VALUES(APELLIDOS), TELEFONO = VALUES(TELEFONO), 
    CORREO = VALUES(CORREO), FECHANACIMIENTO = VALUES(FECHANACIMIENTO), 
    PROCEDENCIA = VALUES(PROCEDENCIA), NACIONALIDAD = VALUES(NACIONALIDAD)
  `;

  db.query(sql, [dni, nombres, apellidos, telefono, correo, fechaNacimiento, procedencia, nacionalidad], (err, results) => {
    if (err) {
      console.error('Error al guardar cliente: ', err);
      return res.status(500).json({ mensaje: 'Error en la nube' });
    }
    res.json({ mensaje: `Cliente ${dni} guardado en la nube ☁️✅` });
  });
});


// Encendemos el servidor (Adaptado para la nube)
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API corriendo en el puerto ${PORT}`);
});

