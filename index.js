const {handOverHelp} = require('./subsystem/help.js')
const { spawn } = require('child_process')

let mainRunInfo = {
    timeInervalIDs = [],
    timeOutIDs = [],
    runningSubsystems = [],
    registerSubsystem = function(subSystemName){
        runningSubsystems.push(subSystemName)
    },
    unregisterSubsystem = function(subSystemName){
        
    }
}

switch(process.argv[2]){
    default: 
        handOverHelp(mainRunInfo)
}