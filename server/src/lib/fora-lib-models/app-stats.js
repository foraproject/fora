(function() {

    "use strict";

    var dataUtils = require('fora-data-utils');

    var AppStats = function(params) {
        dataUtils.extend(this, params);
    };

    AppStats.entitySchema = {
        schema: {
            id: 'app-stats',
            type: 'object',
            properties: {
                records: {
                    type: 'number'
                },
                members: {
                    type: 'number'
                },
                lastRecord: {
                    type: 'number'
                }
            },
            required: ['records', 'members', 'lastRecord']
        }
    };

    exports.AppStats = AppStats;

})();
