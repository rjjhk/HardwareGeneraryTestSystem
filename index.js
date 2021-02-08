const {handOverHelp} = require('./subsystem/help.js')
const {logInit} = require('./log/log.js')
const { handOverAliveTest } = require('./subsystem/alivetest.js')

let subName = "main"
// 全局主从mainRunInfo对象
global.mainRunInfo = {
    // timeInervalIDs : [],
    // timeOutIDs : [],
    // runningSubsystems : [],
    // firstSubsystemStartTimeMS : null,
    // errerOccur : false,
    // errerMsg : null,
    subSystems : [],
    // 启动系统监控，自动退出
    systemInit : function(){
        // 初始化log进程
        logInit()
        // 注册主程序名
        this.registerSubsystem(subName)
        // 500ms循环尝试退出
        this.subSystems[0].timeInervalIDs.push(setInterval(()=>{
            console.log(this)
        },500))
    },
    // 注册子进程
    registerSubsystem : function(subName){
        let registerSubSys = {}
        registerSubSys.name = subName
        registerSubSys.stat = 'running'         // option ['running','stop']
        registerSubSys.timeInervalIDs = []
        registerSubSys.timeOutIDs = []
        registerSubSys.startTimeMS = (new Date()).getTime()
        registerSubSys.endTimeMS = null
        registerSubSys.errerOccur = false
        registerSubSys.errerMeg = null
        this.subSystems.push(registerSubSys)
    },
    // 注销子进程
    unregisterSubsystem : function(subSystemName){
        for(let index in this.subSystems){
            if(subSystemName == this.subSystems[index].name){
                this.subSystems[index].stat = 'stop'
                this.subSystems[index].endTimeMS = (new Date()).getTime()
                log(JSON.stringify(this.subSystems[index]))
                this.subSystems.splice(index,1)
            }
        }
    }
}

// 初始化系统
mainRunInfo.systemInit()

// 格式化输入参数
let argv1 = process.argv[2]?process.argv[2].trim():''
if(argv1.match(/^-h$|^--help$/i)){
    argv1 = '-h'
}else if(argv1.match(/^--alivetest$/i)){
    argv1 = "--alivetest"
}

// 运行子系统
switch(process.argv[2]){
    case '--alivetest': 
        handOverAliveTest()
        break;
    case '-h':
    default: 
        handOverHelp()
}

// mainRunInfo.unregisterSubsystem(subName)