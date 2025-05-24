const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const db = require('./database');
const auth = require('./backend/auth');
const rest = require('./backend/rest');

// Configuración inicial
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'frontend')));

// Rutas
app.use('/auth', auth);
app.use('/reset', rest);

// CRUD Productos
app.post('/api/productos', async (req, res) => {
  try {
    const { nombre, precio } = req.body;
    const [result] = await db.query(
      'INSERT INTO productos (nombre, precio) VALUES (?, ?)',
      [nombre, parseFloat(precio)]
    );
    res.status(201).json({ id: result.insertId, nombre, precio });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al crear el producto' });
  }
});

app.get('/api/productos', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM productos');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener productos' });
  }
});

app.put('/api/productos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, precio } = req.body;
    await db.query(
      'UPDATE productos SET nombre = ?, precio = ? WHERE id = ?',
      [nombre, parseFloat(precio), id]
    );
    res.json({ id, nombre, precio });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar producto' });
  }
});

app.delete('/api/productos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM productos WHERE id = ?', [id]);
    res.json({ message: 'Producto eliminado' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar producto' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});