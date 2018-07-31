const util = require('util');
const EventEmitter = require('events');
const log = require('../util/logger');

class MyEmitter extends EventEmitter { }
const myEmitter = new MyEmitter();

function execQuery(con, sql, args = []) {
  if (process.env.DB_DEBUG === '1') {
    log.debug('---------');
    log.debug(`SQL  => ${sql.trim()}`);
    log.debug(`args => ${util.inspect(args)}`);
  }
  return new Promise((resolve, reject) => {
    con.query(sql, args, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function beginTransaction(con) {
  return new Promise((resolve, reject) => {
    con.beginTransaction((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function commit(con) {
  return new Promise((resolve, reject) => {
    con.commit((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function rollback(con) {
  return new Promise((resolve, reject) => {
    con.rollback((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function invalidateCaches(cacheName) {
  myEmitter.emit(cacheName);
}

function onInvalidateCaches(cacheName, cb) {
  myEmitter.on(cacheName, cb);
}

module.exports = {
  execQuery,
  beginTransaction,
  commit,
  rollback,
  invalidateCaches,
  onInvalidateCaches,
};
