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
// ✅ EL NUEVO POOL BLINDADO
const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT, 
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true // ¡Esto evita que MySQL nos corte la llamada!
});

db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Error conectando a la base de datos:', err);
  } else {
    console.log('✅ ¡Conectado al MySQL con un POOL blindado! 🐻');
    connection.release(); // Soltamos la conexión para que descanse
  }
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
  const { numeroHabitacion, nuevoEstado, nuevoPrecio } = req.body;

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

// 🚪 PUERTA 11: Guardar Historial de Reservas y Ventas (Súper Blindado)
app.post('/api/reservacion/guardar', verificarApiKey, (req, res) => {
  const { fechaInicio, fechaFin, totalVenta, nota, clienteDni, numeroHabitacion, personalCorreo } = req.body;

  // 1. Buscamos el ID del cliente
  const sqlCliente = `SELECT CLIENTEID FROM CLIENTE WHERE DNI = ? LIMIT 1`;
  db.query(sqlCliente, [clienteDni], (err, resultsCliente) => {
    if (err) return res.status(500).json({ mensaje: 'Error buscando cliente' });
    if (resultsCliente.length === 0) return res.status(400).json({ mensaje: 'Cliente no existe en la nube aún' });
    const clienteId = resultsCliente[0].CLIENTEID;

    // 2. Buscamos el ID real del Recepcionista usando su correo
    const sqlPersonal = `SELECT PERSONALID FROM PERSONAL WHERE CORREO = ? LIMIT 1`;
    db.query(sqlPersonal, [personalCorreo], (err, resultsPersonal) => {
      if (err) return res.status(500).json({ mensaje: 'Error buscando personal' });
      
      // Función interna para disparar la reserva
      const insertarReserva = (idPersonalFinal) => {
        const sqlReserva = `INSERT INTO RESERVACION (FECHAINICIO, FECHAFIN, PERSONAL, TOTAL_VENTA, NOTA, CLIENTE, HABITACION_INFO) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        db.query(sqlReserva, [fechaInicio, fechaFin, idPersonalFinal, totalVenta, nota, clienteId, numeroHabitacion], (errRes, resultsRes) => {
          if (errRes) {
            console.error('Error guardando reserva en historial: ', errRes);
            return res.status(500).json({ mensaje: 'Error guardando reserva' });
          }
          res.json({ mensaje: `Reserva guardada con éxito a nombre del ID ${idPersonalFinal} ☁️✅` });
        });
      };

      if (resultsPersonal.length > 0) {
        // Encontró el correo exacto (ej. daniel@gmail.com)
        insertarReserva(resultsPersonal[0].PERSONALID);
      } else {
        // 🛡️ ESCUDO: Si Android mandó un correo "fantasma" que ya borraste, 
        // agarramos el primer usuario real que exista en tu BD para que NO explote.
        db.query(`SELECT PERSONALID FROM PERSONAL LIMIT 1`, (errFallback, resFallback) => {
           if (resFallback && resFallback.length > 0) {
             insertarReserva(resFallback[0].PERSONALID);
           } else {
             return res.status(500).json({ mensaje: 'No hay ningún recepcionista en la BD' });
           }
        });
      }
    });
  });
});


// 🚪 PUERTA 12: Descargar todo el historial de reservaciones (Tubo de Bajada)
app.get('/api/reservacion/todas', verificarApiKey, (req, res) => {
  const sql = `SELECT * FROM RESERVACION`;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error al descargar reservaciones: ', err);
      return res.status(500).json({ mensaje: 'Error en la nube' });
    }
    res.json({ reservaciones: results });
  });
});


// 🚪 PUERTA 3: Recibir un nuevo registro (AHORA PROTEGIDA CON CADENERO 🛡️)
// 🚪 PUERTA 3: Recibir un nuevo registro (AHORA ACEPTA ROLES)
app.post('/api/registro', verificarApiKey, (req, res) => {
  const { nombres, apellidos, correo, pass, pregunta, respuesta, rol } = req.body;
  
  // Si no mandan rol, por seguridad le ponemos 2 (Recepcionista/Trabajador)
  const rolFinal = rol ? rol : 2; 

  const sql = `INSERT INTO PERSONAL 
    (NOMBRES, APELLIDOS, USUARIO, CONTRASENA, CORREO, SUELDO, ROL, HORARIO, ASISTENCIA, PREGUNTA, RESPUESTA, is_deleted) 
    VALUES (?, ?, ?, ?, ?, 0.0, ?, 1, 1, ?, ?, 0)`;
  
  db.query(sql, [nombres, apellidos, correo, pass, correo, rolFinal, pregunta, respuesta], (err, results) => {
    if (err) {
      console.error('Error al guardar en MySQL: ', err);
      return res.status(500).json({ mensaje: 'Error guardando en la nube: ' + err.code });
    }
    res.json({ mensaje: "¡Usuario guardado en la nube con éxito! ☁️🐻" });
  });
});

// 🚪 PUERTA 4: Sincronización (Bajar los usuarios de MySQL al celular)
app.get('/api/sincronizar/personal', verificarApiKey, (req, res) => {
  const sql = 'SELECT NOMBRES, APELLIDOS, USUARIO, CONTRASENA, CORREO, PREGUNTA, RESPUESTA, ROL, is_deleted FROM PERSONAL';
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error al sincronizar: ', err);
      return res.status(500).json({ mensaje: 'Error leyendo la nube' });
    }
    
    // 🚀 EL ANTÍDOTO ULTRA-BLINDADO: Formateamos a mano asegurando mayúsculas y minúsculas
    const datosLimpios = results.map(usuario => {
        // DOBLE ESCUDO: Buscamos "is_deleted" en minúsculas o en mayúsculas por si acaso
        let estadoCrudo = usuario.is_deleted !== undefined ? usuario.is_deleted : usuario.IS_DELETED;
        
        // Convertimos cualquier formato (true, 1, "1") estrictamente a un número entero 1 o 0
        let estadoReal = (estadoCrudo == 1 || estadoCrudo === true) ? 1 : 0;

        return {
            NOMBRES: usuario.NOMBRES,
            APELLIDOS: usuario.APELLIDOS,
            USUARIO: usuario.USUARIO,
            CONTRASENA: usuario.CONTRASENA,
            CORREO: usuario.CORREO,
            PREGUNTA: usuario.PREGUNTA,
            RESPUESTA: usuario.RESPUESTA,
            ROL: usuario.ROL,
            is_deleted: estadoReal // 👈 Viaja limpio como un número puro (0 o 1)
        };
    });

    // Enviamos los datos limpios a tu celular
    res.json(datosLimpios); 
  });
});


// 🚪 PUERTA 13: Actualizar Recepcionista (Ahora guarda si está Activo o Inactivo)
app.put('/api/personal/actualizar', verificarApiKey, (req, res) => {
  // 🚀 LA PIEZA FALTANTE: Ahora recibimos el is_deleted desde el celular
  const { nombres, apellidos, correo, pass, is_deleted } = req.body;
  
  // Si por alguna razón el celular no manda el dato, asumimos que sigue activo (0)
  const estadoFinal = is_deleted !== undefined ? is_deleted : 0;
  
  let sql;
  let params;

  // 🛡️ ESCUDO: Actualizamos también la columna is_deleted en ambas opciones
  if (pass && pass.trim() !== "") {
      sql = `UPDATE PERSONAL SET NOMBRES = ?, APELLIDOS = ?, CONTRASENA = ?, is_deleted = ? WHERE CORREO = ?`;
      params = [nombres, apellidos, pass, estadoFinal, correo];
  } else {
      sql = `UPDATE PERSONAL SET NOMBRES = ?, APELLIDOS = ?, is_deleted = ? WHERE CORREO = ?`;
      params = [nombres, apellidos, estadoFinal, correo];
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error actualizando personal: ', err);
      return res.status(500).json({ mensaje: 'Error actualizando en la nube' });
    }
    res.json({ mensaje: `Personal actualizado (Estado: ${estadoFinal}) en la nube ☁️🔄` });
  });
});

// 🚪 PUERTA 14: Eliminar Recepcionista
app.delete('/api/personal/eliminar/:correo', verificarApiKey, (req, res) => {
  const correo = req.params.correo;
  
  const sql = `DELETE FROM PERSONAL WHERE CORREO = ?`;
  db.query(sql, [correo], (err, results) => {
    if (err) {
      console.error('Error eliminando personal: ', err);
      return res.status(500).json({ mensaje: 'Error eliminando en la nube' });
    }
    res.json({ mensaje: 'Personal eliminado de la nube ☁️🗑️' });
  });
});

// 🚪 PUERTA 9: Descargar todos los clientes (Tubo de Bajada para el Buscador)
app.get('/api/cliente/todos', verificarApiKey, (req, res) => {
  // 🚀 TRUCO DE TRADUCCIÓN: Le decimos DNI AS DOCUMENTO para que Android lo entienda
  const sql = `
    SELECT 
        CLIENTEID, 
        DNI AS DOCUMENTO, 
        NOMBRES, 
        APELLIDOS, 
        TELEFONO, 
        CORREO, 
        FECHA_NAC, 
        EDAD, 
        PROCEDENCIA, 
        NACIONALIDAD 
    FROM CLIENTE
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error al descargar clientes: ', err);
      return res.status(500).json({ mensaje: 'Error en la nube' });
    }
    res.json({ clientes: results });
  });
});

// 🚪 PUERTA 10: Guardar o Actualizar un Cliente
app.post('/api/cliente/guardar', verificarApiKey, (req, res) => {
  let { dni, nombres, apellidos, telefono, correo, fechaNacimiento, procedencia, nacionalidad } = req.body;

  // 🛡️ ESCUDO PROTECTOR DE FECHAS (El traductor que le gusta a MySQL)
  let fechaValida = null;
  
  if (fechaNacimiento && fechaNacimiento.trim() !== "") {
    // Si Android manda "01/01/1990", lo partimos y lo volteamos a "1990-01-01"
    if (fechaNacimiento.includes('/')) {
        const partes = fechaNacimiento.split('/');
        if (partes.length === 3) {
            fechaValida = `${partes[2]}-${partes[1]}-${partes[0]}`;
        } else {
            fechaValida = fechaNacimiento;
        }
    } else {
        fechaValida = fechaNacimiento;
    }
  }

  // 🧠 CALCULADORA AUTOMÁTICA DE EDAD (La Nota de Oro)
  let edadCalculada = 0;
  if (fechaValida) {
      const fechaNac = new Date(fechaValida);
      // Validamos que sea una fecha real antes de hacer la matemática
      if (!isNaN(fechaNac.getTime())) {
          const hoy = new Date();
          let edad = hoy.getFullYear() - fechaNac.getFullYear();
          const mes = hoy.getMonth() - fechaNac.getMonth();
          
          // Si aún no ha llegado su mes de cumpleaños, o es el mes pero no ha llegado el día, le restamos 1 año
          if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
              edad--;
          }
          edadCalculada = edad > 0 ? edad : 0; // Evitamos edades negativas por errores
      }
  }

  // 🚀 ACTUALIZAMOS EL SQL PARA QUE GUARDE LA COLUMNA EDAD
  const sql = `
    INSERT INTO CLIENTE (DNI, NOMBRES, APELLIDOS, TELEFONO, CORREO, FECHA_NAC, EDAD, PROCEDENCIA, NACIONALIDAD) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
    NOMBRES = VALUES(NOMBRES), APELLIDOS = VALUES(APELLIDOS), TELEFONO = VALUES(TELEFONO), 
    CORREO = VALUES(CORREO), FECHA_NAC = VALUES(FECHA_NAC), EDAD = VALUES(EDAD), 
    PROCEDENCIA = VALUES(PROCEDENCIA), NACIONALIDAD = VALUES(NACIONALIDAD)
  `;

  // ¡Enviamos edadCalculada en el arreglo de datos!
  db.query(sql, [dni, nombres, apellidos, telefono, correo, fechaValida, edadCalculada, procedencia, nacionalidad], (err, results) => {
    if (err) {
      console.error('Error al guardar cliente: ', err);
      return res.status(500).json({ mensaje: 'Error en la nube' });
    }
    res.json({ mensaje: `Cliente ${dni} guardado en la nube con ${edadCalculada} años ☁️✅` });
  });
});


// =========================================================================
// ⚙️ GESTIÓN DE CONFIGURACIÓN DEL HOTEL
// =========================================================================

// 🚪 PUERTA 15: Obtener la configuración actual
app.get('/api/configuracion', verificarApiKey, (req, res) => {
  const sql = `SELECT * FROM CONFIGURACION WHERE ID = 1`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ mensaje: 'Error al obtener config' });
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.json({ CHECKOUT_HORA: 12, CHECKOUT_MINUTO: 0, CORTE_HORA: 3, CORTE_MINUTO: 30 });
    }
  });
});

// 🚪 PUERTA 16: Actualizar la configuración (Solo Admin)
app.put('/api/configuracion', verificarApiKey, (req, res) => {
  const { checkout_h, checkout_m, corte_h, corte_m } = req.body;
  const sql = `UPDATE CONFIGURACION SET CHECKOUT_HORA=?, CHECKOUT_MINUTO=?, CORTE_HORA=?, CORTE_MINUTO=? WHERE ID=1`;
  
  db.query(sql, [checkout_h, checkout_m, corte_h, corte_m], (err, results) => {
    if (err) return res.status(500).json({ mensaje: 'Error al actualizar config' });
    res.json({ 
        mensaje: 'Configuración actualizada en la nube ☁️⚙️',
        estado: true
    });
  });
});

// Encendemos el servidor (Adaptado para la nube)
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API corriendo en el puerto ${PORT}`);
});


// 🚪 PUERTA MAESTRA: Sincronización Total
app.get('/api/sync/todo', verificarApiKey, (req, res) => {
  const query = `
    SELECT 
      h.HABITACION, h.ESTADO, h.PRECIO,
      r.RESERVACIONID, r.FECHAINICIO, r.FECHAFIN, r.NOTA, r.TOTAL_VENTA, r.CLIENTE,
      c.DNI, c.NOMBRES, c.APELLIDOS
    FROM HABITACION h
    LEFT JOIN RESERVACION r ON h.RESERVACION = r.RESERVACIONID
    LEFT JOIN CLIENTE c ON r.CLIENTE = c.CLIENTEID
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "Error en la sync" });
    res.json({ data: results }); // Todo el hotel en un solo objeto
  });
});