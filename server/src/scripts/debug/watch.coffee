path = require 'path'
co = require 'co'
thunkify = require 'thunkify'

_exec = require('child_process').exec
spawn = require('child_process').spawn

print = (msg) ->
    if msg then console.log "#{msg}".trim()
    

exec = thunkify (cmd, cb) ->
    _exec cmd, (err, stdout, stderr) ->        
        cb err, stdout.substring(0, stdout.length - 1)

(
    co ->*
        os = yield exec 'expr substr $(uname -s) 1 5'
        
        if os is "Linux"
            yield linux()
        else
            print "Watching is not supported for this OS."
        
)()

#actions contain the list of commands to be run. 
#restart is set to true if app needs a restart 
actions = []
restart = false
isExecuting = false

linux = ->*
    print "Watching...."
    notify = spawn 'inotifywait', '-r -m src'.split ' '
    
    notify.stdout.on 'data', (data) ->
        if not isExecuting
            data = data.toString()
            events = []
            for e in data.split('\n')
                [dir, event, file] = e.split(' ')
                if event
                    events.push { dir, event, file }
            processEvents events
            
        
    notify.stderr.on 'data', print
        

    notify.on 'exit', ->
        print 'Exited. No longer watching.'



processEvents = (events) ->
    for ev in events
        #Files inside the www directory
        matches = (a for a in actions when a.dir isnt ev.dir and a.file isnt ev.file)
                
        if not matches.length
            src = "#{ev.dir}#{ev.file}"        
            ext = path.extname src
            dest = src.replace(/^src/, "app")
            eventNames = ev.event.split ','

            if not ('ISDIR' in eventNames)  #We won't handle directory level events. This needs full compile.

                #Handle only known extensions and ignore hidden files
                if (not /^\./.test ev.file) and (ext in ['.htm', '.html', '.coffee', '.css', '.less', '.js', '.hbs', '.config'])
                
                    if ("DELETE" in eventNames)
                        action = ->*
                            cmd = "rm " + dest
                            print cmd
                            print yield exec cmd

                    else if not ("OPEN" in eventNames)

                        if ext is '.coffee'
                            cmd = "coffee -cs <#{src} >#{src.replace(/^src/, 'app').replace(/\.coffee$/, '.js')}"
                            action = ->*
                                print cmd
                                print yield exec cmd

                        else if ext is '.less'
                            action = ->*
                                cmd = "lessc src/www/css/main.less app/www/css/main.less"
                                print cmd
                                print yield exec cmd
                                        
                        else
                            action = ->*
                                cmd = "cp #{src} #{dest}"
                                print cmd
                                print yield exec cmd
                

            if action
                actions.push action
                
                #All changes in other folders will require a restart of app (for eg: a new coffee script file)
                for dir in ['www', 'scripts']
                    regex = new RegExp "^app/#{dir}/"
                    console.log src + "=" + regex.test src
                    if not regex.test src
                        restart = true    
                
        

executeActions = ->*
    isExecuting = true

    if actions.length
        while (action = actions.shift())                
            yield action()
                    
        if restart
            restart = false
            script = spawn "sh", ["run.sh"]
            script.stdout.on "data", print
            script.stderr.on "data", print

    isExecuting = false        
    setTimeout (-> co(executeActions)()), 1000
    
    

setTimeout (-> co(executeActions)()), 1000
            
    
    
 

