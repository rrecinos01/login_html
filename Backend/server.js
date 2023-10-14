import express from 'express'
import {pool} from './db.js'
import cors from 'cors';
import {PORT} from './config.js'
const app = express();
app.use(express.json());
app.use(cors());

/* app.get('/create', async (req, res) => {
  try {
    const nombre = 'Ronal Recinos';
    const email = 'admin@gmail.com';
    const contrasena = '1234'; // La contraseña sin encriptar
    const role = 1; // La contraseña sin encriptar
    const { email, contrasena,nombre } = req.body;
    // Generar un hash seguro de la contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10); // 10 es el número de rondas de hashing

    // Insertar el usuario en la base de datos con la contraseña hasheada
    const [result] = await pool.query('INSERT INTO users(nombre, email, contrasena, role_id) VALUES (?, ?, ?, ?)', [nombre, email, hashedPassword, role]);

    res.json({ success: true, message: 'Usuario insertado correctamente' });
  } catch (error) {
    console.error('Error al insertar usuario:', error);
    res.status(500).json({ success: false, message: 'Error al insertar usuario' });
  }
}); */

app.get('/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users');
    res.json({ success: true, users: rows });
  } catch (error) {
    console.error('Error al consultar usuarios:', error);
    res.status(500).json({ success: false, message: 'Error al consultar usuarios' });
  }
});

app.post('/login', async (req, res) => {
  const { email, contrasena } = req.body;

  try {
    // Obtener el hash de la contraseña almacenado en la base de datos para el usuario con el correo electrónico proporcionado
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    // Verificar si se encontró un usuario con el correo electrónico proporcionado
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Correo electrónico o contraseña incorrectos' });
    }

    // Comparar la contraseña ingresada con el hash almacenado en la base de datos
    const match = await contrasena === rows[0].contraseña;

    // Verificar si la contraseña coincide
    if (!match) {
      return res.status(401).json({ success: false, message: 'Correo electrónico o contraseña incorrectos' });
    }

    // La contraseña es correcta, puedes iniciar sesión aquí
    // Prepara la información del usuario a enviar al cliente
    const userInfo = {
      id: rows[0].id,
      nombre: rows[0].nombre,
      email: rows[0].email,
    };

    // Envía una respuesta JSON con la información del usuario
    return res.json({ success: true, message: 'Inicio de sesión exitoso', user: userInfo });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ success: false, message: 'Error al iniciar sesión' });
  }
});
app.post('/logout', async (req, res) => {
  const { userId } = req.body; // Obtén el ID del usuario desde el cuerpo de la solicitud

  try {
    // Actualiza el valor de login_on a false para el usuario con el ID proporcionado
    await pool.query('UPDATE users SET login_on = false WHERE id = ?', [userId]);

    // Envía una respuesta exitosa
    res.json({ success: true, message: 'Cierre de sesión exitoso' });
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    res.status(500).json({ success: false, message: 'Error al cerrar sesión' });
  }
});



app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
