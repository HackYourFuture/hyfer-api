const express = require('express');
const { param } = require('express-validator/check');
const db = require('../datalayer/running-modules');
const dbUsers = require('../datalayer/users');
const dbGroups = require('../datalayer/groups');
const dbModules = require('../datalayer/modules');
const dbHistory = require('../datalayer/history');
const { getConnection } = require('./connection');
const { hasRole } = require('../auth/auth-service');
const { handleError, hasValidationErrors } = require('./error');
const logger = require('../util/logger');

async function getTimeline(req, res) {
  try {
    const con = await getConnection(req, res);
    const timeline = await db.getTimeline(con, req.query.group);
    res.json(timeline);
  } catch (err) {
    handleError(req, res, err);
  }
}

async function getRunningModuleDetails(req, res) {
  if (hasValidationErrors(req, res)) {
    return;
  }

  try {
    const { runningId, groupName } = req.params;
    const con = await getConnection(req, res);

    const [runningModule] = await db.getRunningModuleById(con, runningId);

    const groups = await dbGroups.getGroups(con);
    const group = groups.find(g => g.group_name === groupName);
    if (!group) {
      const error = `Group ${groupName} not found.`;
      logger.error(error);
      res.status(404).json({ error });
      return;
    }

    const [module] = await dbModules.getModuleById(con, runningModule.module_id);
    if (!module) {
      const error = `Module ${runningModule.module_id} not found.`;
      logger.error(error);
      res.status(404).json({ error });
      return;
    }

    let students = await dbUsers.getUsersByGroup(con, runningModule.group_id);

    const promises = students.map(student =>
      dbHistory.getHistory(con, runningId, student.id));
    const histories = await Promise.all(promises);
    students = students.map((student, index) => ({ ...student, history: histories[index] }));

    const teachers = await dbUsers.getTeachersByRunningModule(con, runningId);

    res.json({
      notes: runningModule.notes,
      module,
      group,
      students,
      teachers,
    });
  } catch (err) {
    logger.error(err);
    res.status(500).json(err);
  }
}

async function addRunningModule(req, res) {
  if (hasValidationErrors(req, res)) {
    return;
  }

  try {
    const { moduleId, groupId, position } = req.params;
    const con = await getConnection(req, res);
    await db.addRunningModule(con, moduleId, groupId, position);
    const timeline = await db.getTimeline(con, req.query.group);
    res.json(timeline);
    logger.info('Added running module', { ...req.params, requester: req.user.username });
  } catch (err) {
    handleError(req, res, err);
  }
}

async function updateRunningModule(req, res) {
  if (hasValidationErrors(req, res)) {
    return;
  }

  try {
    const { groupId, position } = req.params;
    const updates = req.body;
    const con = await getConnection(req, res);
    await db.updateRunningModule(con, updates, groupId, position);
    const timeline = await db.getTimeline(con, req.query.group);
    res.json(timeline);
    logger.info('Updated running module', { ...req.params, ...req.body, requester: req.user.username });
  } catch (err) {
    handleError(req, res, err);
  }
}

async function deleteRunningModule(req, res) {
  if (hasValidationErrors(req, res)) {
    return;
  }

  try {
    const { groupId, position } = req.params;
    const con = await getConnection(req, res);
    await db.deleteRunningModule(con, groupId, position);
    const timeline = await db.getTimeline(con, req.query.group);
    res.json(timeline);
    logger.info('Deleted running module', { ...req.params, requester: req.user.username });
  } catch (err) {
    handleError(req, res, err);
  }
}

async function splitRunningModule(req, res) {
  if (hasValidationErrors(req, res)) {
    return;
  }

  try {
    const { groupId, position } = req.params;
    const con = await getConnection(req, res);
    await db.splitRunningModule(con, groupId, position);
    const timeline = await db.getTimeline(con, req.query.group);
    res.json(timeline);
    logger.info('Splitted running module', { ...req.params, requester: req.user.username });
  } catch (err) {
    handleError(req, res, err);
  }
}

async function updateNotes(req, res) {
  if (hasValidationErrors(req, res)) {
    return;
  }

  try {
    const { runningId } = req.params;
    const { notes } = req.body;
    const con = await getConnection(req, res);
    await db.updateNotes(con, runningId, notes);
    const [runningModule] = await db.getRunningModuleById(con, runningId);
    res.json(runningModule.notes);
    logger.info('Saved module', { ...req.params, requester: req.user.username });
  } catch (err) {
    handleError(req, res, err);
  }
}

async function addTeacher(req, res) {
  if (hasValidationErrors(req, res)) {
    return;
  }

  try {
    const { runningId, userId } = req.params;
    const con = await getConnection(req, res);
    await dbUsers.addTeacher(con, runningId, userId);
    const teachers = await dbUsers.getTeachersByRunningModule(con, runningId);
    res.json(teachers);
    logger.info('Added teacher', { ...req.params, requester: req.user.username });
  } catch (err) {
    handleError(req, res, err);
  }
}

async function deleteTeacher(req, res) {
  if (hasValidationErrors(req, res)) {
    return;
  }

  try {
    const { runningId, userId } = req.params;
    const con = await getConnection(req, res);
    await dbUsers.deleteTeacher(con, runningId, userId);
    const teachers = await dbUsers.getTeachersByRunningModule(con, runningId);
    res.json(teachers);
    logger.info('Deleted teacher', { ...req.params, requester: req.user.username });
  } catch (err) {
    handleError(req, res, err);
  }
}

const router = express.Router();
router
  .get('/timeline', getTimeline)
  .get(
    '/details/:groupName/:runningId',
    hasRole('teacher|student'),
    [
      param('groupName').matches(/^class\d+$/),
      param('runningId').isInt().toInt(),
    ],
    getRunningModuleDetails
  )
  .patch(
    '/update/:groupId/:position',
    hasRole('teacher'),
    [
      param('groupId').isInt().toInt(),
      param('position').isInt().toInt(),
    ],
    updateRunningModule
  )
  .patch(
    '/split/:groupId/:position',
    hasRole('teacher'),
    [
      param('groupId').isInt().toInt(),
      param('position').isInt().toInt(),
    ],
    splitRunningModule
  )
  .patch(
    '/add/:moduleId/:groupId/:position',
    hasRole('teacher'),
    [
      param('moduleId').isInt().toInt(),
      param('groupId').isInt().toInt(),
      param('position').isInt().toInt(),
    ],
    addRunningModule
  )
  .delete(
    '/:groupId/:position',
    [
      param('groupId').isInt().toInt(),
      param('position').isInt().toInt(),
    ],
    hasRole('teacher'),
    deleteRunningModule
  )
  .post(
    '/teacher/:runningId/:userId',
    [
      param('runningId').isInt().toInt(),
      param('userId').isInt().toInt(),
    ],
    hasRole('teacher'),
    addTeacher
  )
  .delete(
    '/teacher/:runningId/:userId',
    hasRole('teacher'),
    [
      param('runningId').isInt().toInt(),
      param('userId').isInt().toInt(),
    ],
    deleteTeacher
  )
  .patch(
    '/notes/:runningId',
    hasRole('student|teacher'),
    [
      param('runningId').isInt().toInt(),
    ],
    updateNotes
  );

module.exports = router;
