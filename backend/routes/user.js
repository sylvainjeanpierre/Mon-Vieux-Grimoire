const express = require('express');
const router = express.Router();
const useCtrl = require('../controllers/user')

router.post('/signup', useCtrl.signup);
router.post('/login', useCtrl.login);

module.exports = router;