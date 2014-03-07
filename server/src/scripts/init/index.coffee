co = require 'co'
conf = require '../../conf'
utils = require '../../lib/utils'
fs = require 'fs'
path = require 'path'
fsutils = require '../../common/fsutils'
typeUtils = require('../../models/foratypeutils').typeUtils

#create directories
today = Date.now()
for p in ['assets', 'images', 'originalimages']
    for i in [0..999] by 1
        do (p, i) ->
            newPath = fsutils.getDirPath [p, i.toString()]
            console.log newPath
            fs.exists newPath, (exists) ->
                if not exists
                    fs.mkdir newPath, ->
                    utils.log "Created #{newPath}"
                else
                    utils.log "#{newPath} exists"
    
#ensure indexes.
(co ->*
    yield typeUtils.init()
    Database = require '../../lib/data/database'
    db = new Database conf.db, typeUtils.getTypeDefinitions()
    yield db.setupIndexes()
)()

setTimeout (-> process.exit()), 5000
