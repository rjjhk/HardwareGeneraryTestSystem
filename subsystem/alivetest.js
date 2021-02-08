const fsP = require('fs').promises
const { spawn } = require('child_process')

let subName = "alivetest"
let subRunInfo = {
    timeInervalIDs : [],
    timeOutIDs : [],   
    firstSubsystemStartTimeMS : null,
    stillRunning : false,
    // 启动系统监控，自动退出
    systemInit : function(fatherSystemUnregisterFun){
        this.firstSubsystemStartTimeMS = (new Date()).getTime()
        this.stillRunning = true
        // 100ms循环尝试退出
        this.timeInervalIDs.push(setInterval(()=>{
            if(this.firstSubsystemStartTimeMS != null){
                if(this.timeOutIDs.length == 0 && this.timeInervalIDs.length == 1 && !this.stillRunning){
                    log(subName + " subsystem has shot down")
                    clearInterval(this.timeInervalIDs[0])
                    fatherSystemUnregisterFun(subName)
                }
            }
            console.log(subName)
        },1000))
    },
}

let nullPromise = new Promise((res,rej) => { res()})
exports.handOverAliveTest = () => {
    mainRunInfo.registerSubsystem(subName)
    subRunInfo.systemInit()
    nullPromise.then(res => {
        aliveTestMain()
    }).catch(err => {
        console.error(err)
    })
}

let aliveTestMain = () => {
    fsP.readFile("./allconfig/alivetestconfig.json",{encoding:"utf8"}).then(res => {
        let config = JSON.parse(res)
        // 更新DUT测试网段
        for(let dut of config.DUTs){
            if(dut.ipSegment){
                for(let attr in dut){
                    if(typeof(dut[attr]) == 'string' && dut[attr].match(/^\d+\.\d+\.\d+\.\d+/)){
                        dut[attr] = dut[attr].match(/^\d+\.\d+\./)[0] + dut.ipSegment + dut[attr].match(/\.\d+$/)
                    }
                }
            }
        }
        // 循环测试DUT
        for(let dut of config.DUTs){
            // 根据不同的测试，执行不同的测试路径
            switch(dut.testType){
                case "lan":
                   // lanAliveTest(dut)
                    break
                case "wifi2G":
                    break
                case "wifi5G":
                    break
                case "internet":
                    break
                case "wifi":
                    break
                case "local":
                    break
                case "all":
                    break
                default:
            }
        }
    })
}