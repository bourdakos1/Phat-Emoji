var express = require('express');
var router = express.Router();
var db = require('../queries');

router.get('/api/keys', db.getKeys);
router.get('/api/keys/:id', db.getKey);
router.post('/api/keys', db.createKey);
router.put('/api/keys/:id', db.updateKey);
router.delete('/api/keys/:id', db.removeKey);

module.exports = router;
