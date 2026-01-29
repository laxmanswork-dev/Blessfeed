const express = require('express');
const router = express.Router();
const { startSession, releaseFeed } = require('../controllers/session.controller');

router.post('/start', startSession);
router.post('/release', releaseFeed);

module.exports = router;