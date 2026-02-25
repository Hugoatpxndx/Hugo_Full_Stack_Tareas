const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(403).json({ error: 'Token requerido' });

    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET || 'secreto_super_seguro', (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Token inválido o expirado' });
        req.userId = decoded.id;
        next();
    });
};

module.exports = verifyToken;