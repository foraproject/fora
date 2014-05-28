// Generated by CoffeeScript 1.6.3
(function() {
  var log, printError, printStack;

  printError = function(err) {
    var _ref;
    if (err) {
      log((_ref = err.stack) != null ? _ref : 'There is no stack trace.');
      if (err.details) {
        return log(err.details);
      }
    } else {
      return log('Error is null or undefined.');
    }
  };

  printStack = function() {
    var err;
    err = new Error;
    return log(err.stack);
  };

  log = function(msg) {
    return console.log(msg);
  };

  module.exports = {
    log: log,
    printError: printError,
    printStack: printStack
  };

}).call(this);