const express = require('express');
const { param } = require('express-validator/check');
const db = require('../datalayer/history');
const { handleError, hasValidationErrors } = require('./error');
const { hasRole } = require('../auth/auth-service');
const { getConnection } = require('./connection');
const logger = require('../util/logger');

async function save(req, res) {
  if (hasValidationErrors(req, res)) {
    return;
  }
  try {
    const { runningId, userId, weekNum } = req.params;
    const { attendance, homework } = req.body;
    const con = await getConnection(req, res);
    const result = await db.saveHistory(con, {
      runningId,
      userId,
      weekNum,
      attendance,
      homework,
    });
    res.json(result);
    logger.debug('Saved attendance', {
      userId,
      runningId,
      weekNum,
      attendance,
      homework,
      requester: req.user.username,
    });
  } catch (err) {
    handleError(req, res, err);
  }
}

const router = express.Router();
router
  .post(
    '/:runningId/:userId/:weekNum',
    hasRole('teacher'),
    [
      param('runningId').isInt().toInt(),
      param('userId').isInt().toInt(),
      param('weekNum').isInt().toInt(),
    ],
    save
  );

module.exports = router;
