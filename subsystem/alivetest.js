const fsP = require('fs').promises
const iconv = require('iconv-lite')
const { spawn } = require('child_process')

let workingIndex = 0
let nullPromise = new Promise((res,rej) => {res()})
exports.handOverAliveTest = () => {
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
                    lanAliveTest(dut)
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

let lanAliveTest = (dut) => {
    workingIndex++
    let sublog = ''
    let subProcess = spawn('ping',[dut.lanDestinationIP,'-S',dut.lanSourceIP,'-w',dut.returnTimeS.toString()])
    subProcess.on("data",(data)=>{  
        sublog += iconv.decode(data,'gbk')
    })
    subProcess.on("close",()=>{  
        log(dut.index + ' log')
    })

    let logDealWithFun = (log) => {
        if(log.match(/[^|\n][\s\S][\n|$]/)){
            console.log(log.match(/[^|\n][\s\S][\n|$]/))
        }
    }
}