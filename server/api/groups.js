const express = require('express');
const { param } = require('express-validator/check');
const db = require('../datalayer/groups');
const { handleError, hasValidationErrors } = require('./error');
const { hasRole } = require('../auth/auth-service');
const { getConnection } = require('./connection');
const logger = require('../util/logger');

async function getGroups(req, res) {
  try {
    const con = await getConnection(req, res);
    const result = await db.getGroups(con);
    res.json(result);
  } catch (err) {
    handleError(req, res, err);
  }
}

async function addGroup(req, res) {
  try {
    const con = await getConnection(req, res);
    await db.addGroup(con, req.body);
    res.sendStatus(201);
    logger.info('Add group', { ...req.params, ...req.body, requester: req.user.username });
  } catch (err) {
    handleError(req, res, err);
  }
}

async function updateGroup(req, res) {
  if (hasValidationErrors(req, res)) {
    return;
  }
  try {
    const con = await getConnection(req, res);
    const result = await db.updateGroup(con, req.body, req.params.id);
    res.sendStatus(result.affectedRows > 0 ? 204 : 404);
    logger.info('Update group', { ...req.params, ...req.body, requester: req.user.username });
  } catch (err) {
    handleError(req, res, err);
  }
}

const router = express.Router();
router
  .get('/', getGroups)
  .post('/', hasRole('teacher'), addGroup)
  .patch('/:id', hasRole('teacher'), [param('id').isInt().toInt()], updateGroup);

module.exports = router;
