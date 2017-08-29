var express = require('express');
var router = express.Router();
var db = require('../queries');

router.get('/api/keys/:id', db.getKey);
router.post('/api/keys', db.createKey);

module.exports = router;
