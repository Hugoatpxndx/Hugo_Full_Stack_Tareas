const express = require('express');
const router = express.Router();
const prestamoController = require('../controllers/prestamoController');
const verifyToken = require('../middlewares/auth');

router.get('/', verifyToken, prestamoController.getAll);
router.get('/:id', verifyToken, prestamoController.getById);
router.post('/', verifyToken, prestamoController.create);
router.put('/:id', verifyToken, prestamoController.update);
router.delete('/:id', verifyToken, prestamoController.delete);

module.exports = router;
