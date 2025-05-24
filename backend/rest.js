const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const db = require('../database');
const sgMail = require('@sendgrid/mail');
const path = require('path');
const router = express.Router();

require('dotenv').config({ path: './api.env' });
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Ruta para solicitar restablecimiento de contraseña
router.post('/reset-password', async (req, res) => {
  const { email } = req.body;

  try {
    // Buscar usuario en MySQL
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(400).json({ error: 'El correo electrónico no está registrado' });
    }

    const user = users[0];
    
    // Generar token de restablecimiento
    const token = crypto.randomBytes(20).toString('hex');
    const expireTime = Date.now() + 3600000; // Token expira en 1 hora

    console.log('Token generado:', token);

    // Actualizar token en la base de datos
    await db.query(
      'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?',
      [token, expireTime, email]
    );

    // Enviar correo con el enlace de restablecimiento
    const resetLink = `http://localhost:3000/reset/reset-password/${token}`;
    const msg = {
      to: email,
      from: process.env.EMAIL_FROM || 'atalmendoza03@gmail.com',
      subject: 'Restablecimiento de contraseña',
      text: `Hemos recibido una solicitud para restablecer tu contraseña. Haz clic en el siguiente enlace para restablecerla: ${resetLink}`,
    };

    await sgMail.send(msg);
    res.json({ message: 'Te hemos enviado un enlace para restablecer tu contraseña' });
    
  } catch (err) {
    console.error('Error en reset-password:', err);
    res.status(500).json({ 
      error: err.code === 'ER_NO_SUCH_TABLE' 
        ? 'Tabla de usuarios no encontrada' 
        : 'Error en el servidor' 
    });
  }
});

// Ruta para confirmar el restablecimiento
router.post('/confirm-reset-password', async (req, res) => {
  const { resetToken, newPassword } = req.body;
  
  console.log("Token recibido en el backend:", resetToken);

  if (!resetToken || !newPassword) {
    return res.status(400).json({ error: 'Faltan datos: resetToken o newPassword' });
  }

  try {
    // Verificar token válido
    const [users] = await db.query(
      'SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > ?',
      [resetToken, Date.now()]
    );

    if (users.length === 0) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    const user = users[0];
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Actualizar contraseña y limpiar token
    await db.query(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );

    res.json({ message: 'Contraseña actualizada con éxito' });
    
  } catch (error) {
    console.error('Error en confirm-reset-password:', error);
    res.status(500).json({ error: 'Error al actualizar la contraseña' });
  }
});

// Ruta para servir la página de restablecimiento
router.get('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  console.log('Token recibido:', token);

  try {
    const [users] = await db.query(
      'SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > ?',
      [token, Date.now()]
    );

    if (users.length === 0) {
      console.log('Token no encontrado o expirado');
      return res.status(400).send('Token inválido o expirado');
    }

    res.sendFile(path.join(__dirname, '../frontend/reset-password.html'));
    
  } catch (err) {
    console.error('Error al buscar el usuario:', err);
    res.status(500).send('Error en la base de datos');
  }
});

module.exports = router;