const express = require('express');
const router = express.Router();
const { changePassword, getUsers, changeInformation, getInformation } = require('../controllers/userController');
const upload = require('../middlewares/multer');

router.get('/information', getInformation);
router.get('/', getUsers);
router.post('/change-password', changePassword);
router.put('/change-information', upload.single('avatar'), changeInformation);

module.exports = router;