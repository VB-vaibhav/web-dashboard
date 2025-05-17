const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// GET all clients (filtered by role)
router.get('/', verifyToken, clientController.getClients);

// POST a new client (admin/superadmin only)
router.post('/', verifyToken, requireRole('admin', 'superadmin'), clientController.addClient);

// PUT update a client (admin/superadmin only)
router.put('/:id', verifyToken, requireRole('admin', 'superadmin'), clientController.updateClient);

// DELETE (cancel) a client (superadmin only)
router.delete('/:id', verifyToken, requireRole('superadmin'), clientController.deleteClient);

module.exports = router;
