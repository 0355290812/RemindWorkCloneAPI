const express = require('express');
const router = express.Router();
const { changePassword, getUsers } = require('../controllers/userController');

router.get('/', getUsers);
router.post('/change-password', changePassword);

module.exports = router;