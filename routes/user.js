const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user');
const rateLimit = require('../middleware/rate-limit');
const passwordValidator = require('../middleware/password-validator');

router.post('/signup', passwordValidator, userCtrl.signup);
router.post('/login', rateLimit, userCtrl.login);

module.exports = router;