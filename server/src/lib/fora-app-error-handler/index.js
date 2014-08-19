(function() {
    "use strict";

    var argv = require('optimist').argv;

    module.exports = function*(next) {
        try {
            var _ = yield* next;
        } catch (err) {
            var printer = argv['show-errors'] ? console.log : console.error;
            printer.call(console, err);
            if (err.stack)
                printer.call(console, err.stack);
            if(err._inner) {
                printer.call(console, err._inner);
                printer.call(console, err._inner.stack);
            }
        }
    };

})();
