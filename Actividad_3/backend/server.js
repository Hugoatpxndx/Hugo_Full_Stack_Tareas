const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'meditrack_secret_key';

app.use(cors());
app.use(express.json());

// Middleware de Seguridad
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) return res.status(403).json({ error: 'Token requerido' });
    
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Token inválido' });
        req.user = decoded;
        next();
    });
};

// --- AUTENTICACIÓN ---
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.execute('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
        res.status(201).json({ message: 'Usuario creado' });
    } catch (err) {
        res.status(500).json({ error: 'Error al registrar (quizás el usuario ya existe)' });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length === 0) return res.status(401).json({ error: 'Usuario no encontrado' });

        const validPass = await bcrypt.compare(password, rows[0].password);
        if (!validPass) return res.status(401).json({ error: 'Contraseña incorrecta' });

        const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token, username });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- CRUD PACIENTES (SQL) ---
app.get('/api/pacientes', verifyToken, async (req, res) => {
    const [rows] = await db.execute('SELECT * FROM patients ORDER BY ingreso DESC');
    res.json(rows);
});

app.post('/api/pacientes', verifyToken, async (req, res) => {
    const { nombre, sintomas, prioridad } = req.body;
    await db.execute('INSERT INTO patients (nombre, sintomas, prioridad) VALUES (?, ?, ?)', [nombre, sintomas, prioridad]);
    res.status(201).json({ message: 'Paciente registrado' });
});

app.delete('/api/pacientes/:id', verifyToken, async (req, res) => {
    await db.execute('DELETE FROM patients WHERE id = ?', [req.params.id]);
    res.json({ message: 'Paciente eliminado' });
});

app.listen(PORT, () => console.log(`Backend corriendo en http://localhost:${PORT}`));