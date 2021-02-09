const fsP = require('fs').promises

let logText = ''
log = (logstring,save) => {
    logText += '[' + (new Date()).toLocaleString() + ']\t' + logstring + '\n'
    if(logText.length > 1000 || save == "save"){  
        let tempText = logText
        logText = ''
        fsP.access('./log/log').then(res => {
            console.log(res)
            return fsP.appendFile('./log/log',tempText,{encoding:'utf8'})
        }).catch(err => {
            return fsP.writeFile('./log/log',tempText,{encoding:'utf8'})
        }).catch(err => {
            tempText = logText + tempText
        })
    } 
}

exports.logInit = () => {
    // 挂载全局log方法
    global.log = log
    // 设置退出前的回调,保存缓存log
    process.on('beforeExit',()=>{
        if(logText.length != 0){
            log("Done","save")
        }})

    fsP.access('./log/log').then(res => {
        return fsP.unlink('./log/log')
    }).then(res => {
        // res 为undefined
    }).catch(err => {
        log(err)
    }).finally(() => {
        log('System Log Init Finished')
    })
}
