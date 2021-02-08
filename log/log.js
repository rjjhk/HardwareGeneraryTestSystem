const fsP = require('fs').promises

let logText = ''
log = (logstring,last) => {
    logText += '[' + (new Date()).toLocaleString() + ']\t' + logstring + '\n'
    if(logText.length > 1000 || last == "close"){
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

exports.logInit = () => {
    // 挂载全局log方法
    global.log = log

    fsP.access('./log/log').then(res => {
        return fsP.unlink('./log/log')
    }).then(res => {
        // res 为undefined
    }).catch(err => {
        // console.error(err)
    }).finally(() => {
        log('System Log Init Finished')
    })
}
