co = require 'co'
conf = require '../../conf'
logger = require '../../lib/logger'
fs = require 'fs'
path = require 'path'
fsutils = require '../../lib/fsutils'

models = require '../../models'
fields = require '../../models/fields'

ForaTypeUtils = require('../../models/foratypeutils')
typeUtils = new ForaTypeUtils()

#create directories
today = Date.now()
for p in ['assets', 'images', 'original-images']
    for i in [0..999] by 1
        do (p, i) ->
            newPath = fsutils.getDirPath p, i.toString()
            fs.exists newPath, (exists) ->
                if not exists
                    fs.mkdir newPath, ->
                    logger.log "Created #{newPath}"
                else
                    logger.log "#{newPath} exists"

#ensure indexes.
(co ->*
    odm = require('fora-models')
    yield* typeUtils.init([models, fields], models.App, models.Record)
    db = new odm.Database conf.db, typeUtils.getTypeDefinitions()
    yield* db.setupIndexes()
    console.log "wait for 5 seconds..."
    setTimeout (->
      console.log "done"
      process.exit()
    ), 5000
)()
