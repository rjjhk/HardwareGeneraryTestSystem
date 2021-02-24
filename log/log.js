const fsP = require('fs').promises
const ys = require('../lib/YSlibrary')

let logText = ''
log = (logstring,save) => {
    console.log(logstring)
    logText += '[' + (new Date()).toLocaleString() + ']\t' + logstring + '\n'
    if(logText.length > 1000 || save == "save"){  
        let tempText = logText
        logText = ''
        fsP.access('./log/log').then(res => {
            return fsP.appendFile('./log/log',tempText,{encoding:'utf8'})
        }).catch(err => {
            return fsP.writeFile('./log/log',tempText,{encoding:'utf8'})
        }).catch(err => {
            tempText = logText + tempText
        })
    } 
}

logToFile = (log,testName,withTime) => {
    let fileNameWithPath = null
    if(withTime){
        fileNameWithPath = './log/' + testName + '-' + ys.getTimeString()
    }else{
        fileNameWithPath = './log/' + testName
    }
    fsP.writeFile(fileNameWithPath,log,{encoding:'utf8'}).then(res => {
        // console.log(res)
    }).catch(err => {
        log(err)
    })
}

exports.logInit = async () => {
    // 挂载全局log/logToFile方法
    global.log = log
    global.logToFile = logToFile
    // 设置退出前的回调,保存缓存log
    process.on('beforeExit',()=>{
        if(logText.length != 0){
            log("Done","save")
        }})

    await fsP.access('./log/log').then(res => {
        return fsP.unlink('./log/log')
    }).catch(err => {
        // do nothing 
    }).finally(() => {
        log('log init success')
    })
}
