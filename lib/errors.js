"use strict";

function createError(name, base) {
  var err = function(message) {
    this.message = message;
    this.name = name;
    Error.captureStackTrace(this, err);
  };
  err.prototype = Object.create(base.prototype);
  err.prototype.constructor = err;
  return err;
}

var ConfigleError = createError("ConfigleError", Error);

module.exports = {
  ConfigleError: ConfigleError,
  UndefinedVariableError: createError("UndefinedVariableError", ConfigleError),
  CircularReferenceError: createError("CircularReferenceError", ConfigleError),
  ConfigleCoreError: createError("ConfigleCoreError", ConfigleError),
  SyntaxError: createError("SyntaxError", ConfigleError)
};
