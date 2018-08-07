const { validationResult } = require('express-validator/check');
const log = require('../util/logger');

const handleError = (req, res, err) => {
  log.error(req.originalUrl, { err, requester: req.user.username });
  res.status(500).json(err);
};

const hasValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    log.error(req.originalUrl, { errors: errors.array() });
    res.status(422).json({ errors: errors.array() });
    return true;
  }
  return false;
};

module.exports = {
  handleError,
  hasValidationErrors,
};
