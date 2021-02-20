const axios = require('axios')
const iconv = require('iconv-lite')
const {logInit} = require('./log/log.js')
const {initWechatNotice} = require('./wechatNotice/wechatNotice.js')
const {handOverHelp} = require('./subsystem/help.js')
const {handOverAliveTest} = require('./subsystem/alivetest.js')
const {handOverThrouthPutTest} = require('./subsystem/throughputtest.js')
const {handOverTraceMemTest} = require('./subsystem/tracememtest.js')
// 全局注册
global.axios = axios
global.iconv = iconv
// 初始化
logInit()
initWechatNotice()
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
    case '--test':
        handOverTraceMemTest()
        break
    case '--throuthputtest':
        handOverThrouthPutTest()
        break
    case '-h':
    default: 
        handOverHelp()
}