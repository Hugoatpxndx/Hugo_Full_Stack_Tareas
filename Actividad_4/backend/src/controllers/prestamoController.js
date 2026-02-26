const db = require('../config/db');

const prestamoController = {
    getAll: async (req, res) => {
        try {
            // Obtenemos el préstamo con el nombre del usuario y título del libro
            const sql = `
                SELECT p.*, u.nombre as usuario_nombre, l.titulo as libro_titulo 
                FROM prestamos p
                JOIN usuarios u ON p.usuario_id = u.id
                JOIN libros l ON p.libro_id = l.id
            `;
            const [rows] = await db.execute(sql);
            res.json({ prestamos: rows });
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener préstamos' });
        }
    },

    getById: async (req, res) => {
        const { id } = req.params;
        try {
            const [rows] = await db.execute('SELECT * FROM prestamos WHERE id = ?', [id]);
            if (rows.length === 0) {
                return res.status(404).json({ error: 'Préstamo no encontrado' });
            }
            res.json({ prestamo: rows[0] });
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener el préstamo' });
        }
    },

    create: async (req, res) => {
        const { usuario_id, libro_id, fecha_prestamo, fecha_devolucion } = req.body;
        // Usamos el ID del token (req.userId) si no viene usuario_id en el body
        const finalUserId = usuario_id || req.userId;

        if (!libro_id || !fecha_prestamo || !fecha_devolucion || !finalUserId) {
            return res.status(400).json({ error: 'Datos incompletos' });
        }

        try {
            // 1. Verificar disponibilidad del libro en BD
            const [libros] = await db.execute('SELECT disponible FROM libros WHERE id = ?', [libro_id]);
            
            if (libros.length === 0) return res.status(404).json({ error: 'Libro no encontrado' });
            if (libros[0].disponible < 1) return res.status(400).json({ error: 'No hay ejemplares disponibles' });

            // 2. Crear el préstamo
            const [result] = await db.execute(
                'INSERT INTO prestamos (usuario_id, libro_id, fecha_prestamo, fecha_devolucion, estado) VALUES (?, ?, ?, ?, ?)',
                [finalUserId, libro_id, fecha_prestamo, fecha_devolucion, 'activo']
            );

            // 3. Restar disponibilidad
            await db.execute('UPDATE libros SET disponible = disponible - 1 WHERE id = ?', [libro_id]);

            res.status(201).json({ mensaje: 'Préstamo creado exitosamente', id: result.insertId });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al crear el préstamo' });
        }
    },

    update: async (req, res) => {
        const { id } = req.params;
        const { estado } = req.body;

        try {
            // Verificar estado actual para saber si hay que devolver stock
            const [rows] = await db.execute('SELECT * FROM prestamos WHERE id = ?', [id]);
            if (rows.length === 0) return res.status(404).json({ error: 'Préstamo no encontrado' });
            
            const prestamo = rows[0];

            // Si se marca como devuelto y antes no lo estaba, sumamos stock
            if (estado === 'devuelto' && prestamo.estado !== 'devuelto') {
                await db.execute('UPDATE libros SET disponible = disponible + 1 WHERE id = ?', [prestamo.libro_id]);
            }

            await db.execute('UPDATE prestamos SET estado = ? WHERE id = ?', [estado, id]);
            res.json({ mensaje: 'Préstamo actualizado exitosamente' });
        } catch (error) {
            res.status(500).json({ error: 'Error al actualizar préstamo' });
        }
    },

    delete: async (req, res) => {
        const { id } = req.params;
        try {
            const [result] = await db.execute('DELETE FROM prestamos WHERE id = ?', [id]);
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Préstamo no encontrado' });
            res.json({ mensaje: 'Préstamo eliminado exitosamente' });
        } catch (error) {
            res.status(500).json({ error: 'Error al eliminar préstamo' });
        }
    }
};

module.exports = prestamoController;
