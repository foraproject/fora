(function() {

    "use strict";

    var _;

    var userCommon = require('./user-common'),
        dataUtils = require('fora-data-utils');

    var User = function(params) {
        dataUtils.extend(this, params);
    };
    userCommon.extendUser(User);

    exports.User = User;

})();