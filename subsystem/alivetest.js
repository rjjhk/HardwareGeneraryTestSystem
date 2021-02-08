const fsP = require('fs').promises
const { spawn } = require('child_process')

let subName = "alivetest"
let nullPromise = new Promise((res,rej) => { res()})
exports.handOverAliveTest = (mainRunInfo) => {
    mainRunInfo.registerSubsystem(subName)
    nullPromise.then(res => {
        return aliveTestMain()
    }).catch(err => {
        console.error(err)
    }).finally(() => {
        mainRunInfo.unregisterSubsystem(subName)
    })
}

let aliveTestMain = () => {
    return fsP.readFile("./allconfig/alivetestconfig.json",{encoding:"utf8"}).then(res => {
        let config = JSON.parse(res)
        // 更新DUT测试网段
        
        console.log(config)
    })
}