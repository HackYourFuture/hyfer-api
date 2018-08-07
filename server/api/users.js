
const express = require('express');
const _ = require('lodash');
const { param } = require('express-validator/check');
const db = require('../datalayer/users');
const { getConnection } = require('./connection');
const { hasRole, isAuthenticated } = require('../auth/auth-service');
const { handleError, hasValidationErrors } = require('./error');
const logger = require('../util/logger');

async function getCurrentUser(req, res) {
  try {
    const con = await getConnection(req, res);
    const [result] = await db.getUserByUsername(con, req.user.username);
    const { username, full_name, role } = result;
    logger.info(`${_.capitalize(role)} signed in`, { username, full_name });

    res.json(result);
  } catch (err) {
    handleError(req, res, err);
  }
}

async function getUsers(req, res) {
  try {
    const con = await getConnection(req, res);
    const result = await db.getUsers(con);
    res.json(result);
  } catch (err) {
    handleError(req, res, err);
  }
}

async function getLastEvent(req, res) {
  try {
    const con = await getConnection(req, res);
    const result = await db.getLastEvent(con, req.params.eventName);
    res.json(result);
  } catch (err) {
    handleError(req, res, err);
  }
}

async function getTeachers(req, res) {
  try {
    const con = await getConnection(req, res);
    const result = await db.getTeachers(con);
    res.json(result);
  } catch (err) {
    handleError(req, res, err);
  }
}

async function getUserById(req, res) {
  if (hasValidationErrors(req, res)) {
    return;
  }
  try {
    const con = await getConnection(req, res);
    const result = await db.getUserById(con, req.params.id);
    res.json(result[0]);
  } catch (err) {
    handleError(req, res, err);
  }
}

async function updateUser(req, res) {
  if (hasValidationErrors(req, res)) {
    return;
  }
  try {
    const con = await getConnection(req, res);
    const [result] = await db.updateUser(con, req.params.id, req.body);
    res.json(result);
    logger.info('Update user', { ...req.params, ...req.body, requester: req.user.username });
  } catch (err) {
    handleError(req, res, err);
  }
}

const router = express.Router();
router
  .get('/', isAuthenticated(), getCurrentUser)
  .get('/event/:eventName', hasRole('teacher'), getLastEvent)
  .get('/all', hasRole('teacher|student'), getUsers)
  .get('/teachers', hasRole('teacher|student'), getTeachers)
  .get('/:id', hasRole('teacher|student'), [param('id').isInt().toInt()], getUserById)
  .patch('/:id', hasRole('teacher|student'), [param('id').isInt().toInt()], updateUser);

module.exports = router;
