const {handOverHelp} = require('./subsystem/help.js')
const {logInit} = require('./log/log.js')
const { spawn } = require('child_process')

let mainRunInfo = {
    timeInervalIDs : [],
    timeOutIDs : [],
    runningSubsystems : [],
    firstSubsystemStartTimeMS : null,
    // 启动系统监控，自动退出
    systemInit : function(){
        // 初始化log进程
        logInit()
        // 1s循环尝试退出
        this.timeInervalIDs.push(setInterval(()=>{
            if(this.firstSubsystemStartTimeMS != null){
                if(this.timeOutIDs.length == 0 && this.timeInervalIDs.length == 1){
                    log("System has shot down","close")
                    clearInterval(this.timeInervalIDs[0])
                }
            }
        },1000))
    },
    // 注册运行种的子进程
    registerSubsystem : function(subSystemName){
        if(this.firstSubsystemStartTimeMS == null){
            this.firstSubsystemStartTimeMS = (new Date()).getTime()
        }
        this.runningSubsystems.push(subSystemName)
    },
    // 注销运行种的子进程
    unregisterSubsystem : function(subSystemName){
        let index = 0
        for(;index < this.runningSubsystems.length;index++){
            if(this.runningSubsystems[index] == subSystemName){
                break
            }
        }
        if(index < this.runningSubsystems.length){
            this.runningSubsystems.splice(index,1)
        }else{
            console.error('Unregist subSystem try to unregist')
        }
    }
}

// 初始化系统
mainRunInfo.systemInit()

// 格式化输入参数
let argv1 = process.argv[2].trim()
if(argv1.match(/^-h$|^--help$/i)){
    argv1 = '-h'
}

// 运行子系统
switch(process.argv[2]){
    case '-h':
    default: 
    handOverHelp(mainRunInfo)
}