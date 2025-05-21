const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { verifyToken, requireRole, checkServiceAccess } = require('../middleware/authMiddleware');

// GET all clients (filtered by role)
router.get('/', verifyToken, clientController.getClients);

// POST a new client (admin/superadmin only)
router.post('/', verifyToken, requireRole('admin', 'superadmin'), clientController.addClient);

// PUT update a client (admin/superadmin only)
router.put('/:id', verifyToken, requireRole('admin', 'superadmin'), clientController.updateClient);

// DELETE (cancel) a client (superadmin only)
router.delete('/:id', verifyToken, requireRole('superadmin'), clientController.deleteClient);


// ✅ Dynamic service-based client fetch route (e.g., /clients/cerberus)
router.get('/:service',
  verifyToken,
  requireRole('admin', 'superadmin', 'middleman'),
  (req, res, next) => {
    const serviceKeyMap = {
      cerberus: 'is_cerberus',
      cloud: 'is_vps',
      proxy: 'is_proxy',
      storage: 'is_storage',
      varys: 'is_varys'
    };
    const flag = serviceKeyMap[req.params.service];
    if (!flag) return res.status(400).send("Invalid service");
    return checkServiceAccess(flag)(req, res, next);
  },
  clientController.getClients
);

module.exports = router;
