const {
  execQuery,
  onInvalidateCaches,
  invalidateCaches,
} = require('./database');

const GET_USERS = `
  SELECT users.*, \`groups\`.id as group_id, \`groups\`.group_name,  \`groups\`.archived
  FROM users
  LEFT JOIN group_students ON users.id=group_students.user_id      
  LEFT JOIN \`groups\` ON \`groups\`.id=group_students.group_id`;

const UPDATE_USER = 'UPDATE users SET ? WHERE id=?';

let userCache = null;
let teacherCache = null;

onInvalidateCaches('users', () => {
  userCache = null;
});

onInvalidateCaches('teachers', () => {
  teacherCache = null;
});

async function getUsers(con) {
  if (userCache == null) {
    userCache = await execQuery(con, `${GET_USERS} ORDER BY full_name`);
  }
  return userCache;
}

async function getTeachers(con) {
  const users = await getUsers(con);
  return users.filter(user => user.role === 'teacher');
}

async function getUserByUsername(con, username) {
  const users = await getUsers(con);
  return users.filter(user => user.username === username);
}

async function getUserById(con, id) {
  const users = await getUsers(con);
  return users.filter(user => user.id === id);
}

async function getUsersByGroup(con, groupId) {
  const users = await getUsers(con);
  return users.filter(user => user.group_id === groupId);
}

async function getTeachersByRunningModule(con, runningId) {
  if (teacherCache == null) {
    const sql = `SELECT users.*, running_module_teachers.running_module_id
    FROM users
    INNER JOIN running_module_teachers ON running_module_teachers.user_id = users.id`;
    teacherCache = await execQuery(con, sql, [runningId]);
  }
  return teacherCache.filter(teacher => teacher.running_module_id === runningId);
}

async function addUser(con, user) {
  invalidateCaches('users');
  const { insertId } = await execQuery(
    con,
    'INSERT INTO users (username, full_name, email, role) VALUES(?,?,?,?)',
    [user.username, user.full_name, user.email, user.role]
  );
  return insertId;
}

function bulkInsertUsers(con, users) {
  invalidateCaches('users');
  const args = users.map(user => [user.username, user.full_name, user.email, user.role]);
  return execQuery(
    con,
    'INSERT INTO users (username, full_name, email, role) VALUES ?',
    [args]
  );
}

function bulkUpdateUsers(con, users) {
  invalidateCaches('users');
  const promises = users.map(user => execQuery(
    con,
    'UPDATE users SET full_name=?, email=?, role=? WHERE username=?',
    [user.full_name, user.email, user.role, user.username]
  ));
  return Promise.all(promises);
}

async function bulkUpdateMemberships(con, groupAndUserIds) {
  invalidateCaches('users');
  await execQuery(con, 'DELETE FROM group_students');
  return execQuery(con, 'INSERT INTO group_students (group_id, user_id) VALUES ?', [groupAndUserIds]);
}

async function updateUser(con, id, data) {
  invalidateCaches('users');
  await execQuery(con, UPDATE_USER, [data, id]);
  return getUserById(con, id);
}

async function addTeacher(con, currentModule, userId) {
  invalidateCaches('teachers');
  const query = `INSERT INTO running_module_teachers SET running_module_id=${currentModule} ,
        user_id = (SELECT id FROM users WHERE users.id=${userId})`;
  const { insertId } = await execQuery(con, query);
  return insertId;
}

function deleteTeacher(con, moduleId, userId) {
  invalidateCaches('teachers');
  return execQuery(con, `DELETE FROM running_module_teachers WHERE running_module_id=${moduleId} AND user_id=${userId};`);
}

function getLastEvent(con, eventName) {
  return execQuery(
    con,
    `SELECT username, date_created FROM events
     WHERE  date_created = (
       SELECT MAX(date_created) 
       FROM events 
       WHERE event_name = ?)
;`, eventName
  );
}

module.exports = {
  getUsers,
  getUserByUsername,
  getUsersByGroup,
  getTeachersByRunningModule,
  getUserById,
  addUser,
  updateUser,
  bulkInsertUsers,
  bulkUpdateUsers,
  bulkUpdateMemberships,
  getTeachers,
  addTeacher,
  deleteTeacher,
  getLastEvent,
};
