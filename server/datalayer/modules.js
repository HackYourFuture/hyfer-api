const _ = require('lodash');
const {
  execQuery,
  beginTransaction,
  commit,
  rollback,
  onInvalidateCaches,
  invalidateCaches,
} = require('./database');

const GET_MODULE_QUERY = `SELECT *,
  (SELECT COUNT(*) 
  FROM running_modules WHERE running_modules.module_id = modules.id) AS ref_count
  FROM modules`;

const GET_HOMEWORK_MODULES_QUERY = `SELECT id, module_name AS name, default_duration AS duration, sort_order
  FROM modules
  WHERE sort_order != 1000 AND has_homework != 0
  ORDER BY sort_order`;

const ADD_MODULE_QUERY = 'INSERT INTO modules SET ?';
const UPDATE_MODULE_QUERY = 'UPDATE modules SET ? WHERE id = ?';
const DELETE_MODULE_QUERY = 'DELETE FROM modules WHERE id = ?';

let cache = null;

onInvalidateCaches('modules', () => {
  cache = null;
});

async function getModules(con) {
  if (cache == null) {
    const sql = `${GET_MODULE_QUERY} ORDER BY sort_order, module_name`;
    cache = await execQuery(con, sql);
  }
  return cache;
}

async function getModuleById(con, id) {
  const modules = await getModules(con);
  return modules.filter(module => module.id === id);
}

function getHomeworkModules(con) {
  const sql = GET_HOMEWORK_MODULES_QUERY;
  return execQuery(con, sql);
}

function getCurriculumModules(con) {
  const sql = `${GET_MODULE_QUERY} WHERE optional=0 ORDER BY sort_order`;
  return execQuery(con, sql);
}

function getOptionalModules(con) {
  const sql = `${GET_MODULE_QUERY} WHERE optional!=0 ORDER BY module_name`;
  return execQuery(con, sql);
}

function addModule(con, module) {
  invalidateCaches('modules');
  const obj = _.omit(module, ['id', 'added_on', 'ref_count']);
  return execQuery(con, ADD_MODULE_QUERY, obj);
}

function updateModule(con, module, id) {
  invalidateCaches('modules');
  const obj = _.omit(module, ['id', 'added_on', 'ref_count']);
  return execQuery(con, UPDATE_MODULE_QUERY, [obj, id]);
}

function deleteModule(con, id) {
  invalidateCaches('modules');
  return execQuery(con, DELETE_MODULE_QUERY, [id]);
}

async function updateModules(con, batchUpdate) {
  try {
    await beginTransaction(con);
    const promises = batchUpdate.updates
      .map(module => this.updateModule(con, module, module.id))
      .concat(batchUpdate.additions.map(module => this.addModule(con, module)))
      .concat(batchUpdate.deletions.map(module => this.deleteModule(con, module.id)));
    await Promise.all(promises);
    await commit(con);
  } catch (err) {
    await rollback(con);
    throw err;
  }
}

module.exports = {
  getModuleById,
  getModules,
  getHomeworkModules,
  getCurriculumModules,
  getOptionalModules,
  addModule,
  updateModule,
  deleteModule,
  updateModules,
};
