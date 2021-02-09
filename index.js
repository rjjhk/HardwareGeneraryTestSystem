const {logInit} = require('./log/log.js')
const {handOverHelp} = require('./subsystem/help.js')
const { handOverAliveTest } = require('./subsystem/alivetest.js')

// 初始化
logInit()

// 格式化输入参数
let argv1 = process.argv[2]?process.argv[2].trim():''
if(argv1.match(/^-h$|^--help$/i)){
    argv1 = '-h'
}else if(argv1.match(/^--alivetest$/i)){
    argv1 = "--alivetest"
}

// 任务分发
switch(process.argv[2]){
    case '--alivetest': 
        handOverAliveTest()
        break;
    case '-h':
    default: 
        handOverHelp()
}