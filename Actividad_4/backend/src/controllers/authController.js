const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const authController = {
    register: async (req, res) => {
        const { nombre, email, password } = req.body;

        if (!nombre || !email || !password) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        try {
            const [existing] = await db.execute('SELECT id FROM usuarios WHERE email = ?', [email]);
            if (existing.length > 0) {
                return res.status(400).json({ error: 'El email ya está registrado' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const [result] = await db.execute(
                'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)',
                [nombre, email, hashedPassword]
            );

            res.status(201).json({ mensaje: 'Usuario registrado exitosamente', id: result.insertId });
        } catch (error) {
            res.status(500).json({ error: 'Error al registrar usuario' });
        }
    },

    login: async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y password son requeridos' });
        }

        try {
            const [rows] = await db.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
            if (rows.length === 0) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }

            const user = rows[0];
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }

            const token = jwt.sign(
                { id: user.id, email: user.email, rol: user.rol },
                process.env.JWT_SECRET || 'secreto_biblioteca_seguro_123',
                { expiresIn: '24h' }
            );

            res.json({
                mensaje: 'Login exitoso',
                token,
                usuario: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol }
            });
        } catch (error) {
            res.status(500).json({ error: 'Error al iniciar sesión' });
        }
    },

    logout: (req, res) => {
        res.json({ mensaje: 'Logout exitoso' });
    }
};

module.exports = authController;
