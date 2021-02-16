const fsP = require('fs').promises
const iconv = require('iconv-lite')
const { spawn } = require('child_process')

let testName = 'AliveTest'
let startTimeMS = null
let testResult = null
let cmdlog = ''
// 设置并发处理
let nullPromise = new Promise((res,rej) => {res()})
exports.handOverAliveTest = () => {
    nullPromise.then(res => {
        // 记录开始时间
        startTimeMS = (new Date).getTime()
        // 启动主程序
        aliveTestMain()
    }).catch(err => {
        console.error(err)
    })
}
// 退出前保存Log
process.on('beforeExit',()=>{
    if(cmdlog.length != 0){
        logToFile(cmdlog,testName)
        cmdlog = ''
    }
})

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
                    let lanAliveTestIntervalID = setInterval(() => {
                        // 如果运行超过设定时间，则成功退出
                        if((new Date()).getTime() - startTimeMS < config.commonSetting.testTimeH * 60 * 60 * 1000){
                            lanAliveTest(dut,lanAliveTestIntervalID)
                        }else{
                            // 测试Pass
                            log('\n-----++++++++++-----\n' + JSON.stringify(dut) + '\nTest Pass\n-----++++++++++-----\n')
                            console.log('\n-----++++++++++-----\n' + JSON.stringify(dut) + '\nTest Pass\n-----++++++++++-----\n')
                            // 清除
                            clearInterval(lanAliveTestIntervalID)
                        }
                    }, config.commonSetting.intervalTimeS * 1000)
                    break
                case "wifi2G":
                    let wifi2GAliveTestIntervalID = setInterval(() => {
                        // 如果运行超过设定时间，则成功退出
                        if((new Date()).getTime() - startTimeMS < config.commonSetting.testTimeH * 60 * 60 * 1000){
                            wifi2GAliveTest(dut,wifi2GAliveTestIntervalID)
                        }else{
                            // 测试Pass
                            log('\n-----++++++++++-----\n' + JSON.stringify(dut) + '\nTest Pass\n-----++++++++++-----\n')
                            console.log('\n-----++++++++++-----\n' + JSON.stringify(dut) + '\nTest Pass\n-----++++++++++-----\n')
                            // 清除
                            clearInterval(aliveTestIntervalID)
                        }
                    }, config.commonSetting.intervalTimeS * 1000)
                    break
                case "wifi5G":
                    let wifi5GAliveTestIntervalID = setInterval(() => {
                        // 如果运行超过设定时间，则成功退出
                        if((new Date()).getTime() - startTimeMS < config.commonSetting.testTimeH * 60 * 60 * 1000){
                            wifi5GAliveTest(dut,wifi5GAliveTestIntervalID)
                        }else{
                            // 测试Pass
                            log('\n-----++++++++++-----\n' + JSON.stringify(dut) + '\nTest Pass\n-----++++++++++-----\n')
                            console.log('\n-----++++++++++-----\n' + JSON.stringify(dut) + '\nTest Pass\n-----++++++++++-----\n')
                            // 清除
                            clearInterval(wifi5GAliveTestIntervalID)
                        }
                    }, config.commonSetting.intervalTimeS * 1000)
                    break
                case "internet":
                    let internetAliveTestIntervalID = setInterval(() => {
                        // 如果运行超过设定时间，则成功退出
                        if((new Date()).getTime() - startTimeMS < config.commonSetting.testTimeH * 60 * 60 * 1000){
                            internetAliveTest(dut,internetAliveTestIntervalID)
                        }else{
                            // 测试Pass
                            log('\n-----++++++++++-----\n' + JSON.stringify(dut) + '\nTest Pass\n-----++++++++++-----\n')
                            console.log('\n-----++++++++++-----\n' + JSON.stringify(dut) + '\nTest Pass\n-----++++++++++-----\n')
                            // 清除
                            clearInterval(internetAliveTestIntervalID)
                        }
                    }, config.commonSetting.intervalTimeS * 1000)
                    break
                case "wifi":
                    let wifiAliveTestIntervalID = setInterval(() => {
                        // 如果运行超过设定时间，则成功退出
                        if((new Date()).getTime() - startTimeMS < config.commonSetting.testTimeH * 60 * 60 * 1000){
                            wifi2GAliveTest(dut,wifiAliveTestIntervalID)
                            wifi5GAliveTest(dut,wifiAliveTestIntervalID)
                        }else{
                            // 测试Pass
                            log('\n-----++++++++++-----\n' + JSON.stringify(dut) + '\nTest Pass\n-----++++++++++-----\n')
                            console.log('\n-----++++++++++-----\n' + JSON.stringify(dut) + '\nTest Pass\n-----++++++++++-----\n')
                            // 清除
                            clearInterval(wifiAliveTestIntervalID)
                        }
                    }, config.commonSetting.intervalTimeS * 1000)
                    break
                case "local":
                    let localAliveTestIntervalID = setInterval(() => {
                        // 如果运行超过设定时间，则成功退出
                        if((new Date()).getTime() - startTimeMS < config.commonSetting.testTimeH * 60 * 60 * 1000){
                            lanAliveTest(dut,localAliveTestIntervalID)
                            wifi2GAliveTest(dut,localAliveTestIntervalID)
                            wifi5GAliveTest(dut,localAliveTestIntervalID)
                        }else{
                            // 测试Pass
                            log('\n-----++++++++++-----\n' + JSON.stringify(dut) + '\nTest Pass\n-----++++++++++-----\n')
                            console.log('\n-----++++++++++-----\n' + JSON.stringify(dut) + '\nTest Pass\n-----++++++++++-----\n')                            
                            // 清除
                            clearInterval(localAliveTestIntervalID)
                        }
                    }, config.commonSetting.intervalTimeS * 1000)
                    break
                case "all":
                    let allAliveTestIntervalID = setInterval(() => {
                        // 如果运行超过设定时间，则成功退出
                        if((new Date()).getTime() - startTimeMS < config.commonSetting.testTimeH * 60 * 1000){
                            lanAliveTest(dut,allAliveTestIntervalID)
                            wifi2GAliveTest(dut,aliveTestIntervalID)
                            wifi5GAliveTest(dut,allAliveTestIntervalID)
                            internetAliveTest(dut,allAliveTestIntervalID)
                        }else{
                            // 测试Pass
                            log('\n-----++++++++++-----\n' + JSON.stringify(dut) + '\nTest Pass\n-----++++++++++-----\n')
                            console.log('\n-----++++++++++-----\n' + JSON.stringify(dut) + '\nTest Pass\n-----++++++++++-----\n')
                            // 清除
                            clearInterval(allAliveTestIntervalID)
                        }
                    }, config.commonSetting.intervalTimeS * 1000)
                    break
                default:
            }
        }
    })
}

let lanAliveTest = (dut,aliveTestIntervalID) => {
    let sublog = ''
    let templog = ''        // log临时停靠
    let subProcess = spawn('ping',[dut.lanDestinationIP,'-t','-S',dut.lanSourceIP,'-w',dut.returnTimeS.toString()])
    subProcess.stdout.on("data",(data)=>{ 
        templog += iconv.decode(data,'gbk')
        while(templog.match(/[\s\S]*?\n/)){
            sublog += templog.match(/[\s\S]*?\n/)[0]
            logDealWithFun(templog.match(/[\s\S]*?\n/)[0])
            templog = templog.slice(templog.match(/[\s\S]*?\n/)[0].length)
        }
    })
    subProcess.on("close",()=>{  
        cmdlog += '\n-----++++++++++-----\n' + JSON.stringify(dut) + '\n' + sublog
    })
    // log分段处理函数
    let logDealWithFun = (logInfo) => {
        if(logInfo.length == 2 || logInfo.match(/ping[\s\S]*\d+\.\d+\.\d+\.\d+/i)){
            // do nothing
        }else if(logInfo.match(/ttl=/i)){
            // running correct and close the subprocess
            subProcess.kill()
        }else{
            subProcess.kill()
            clearInterval(aliveTestIntervalID)
            log('\n-----++++++++++-----\n' + new Date().toLocaleString() + 'Ping ' + dut.lanSourceIP + ' Test Fail\n-----++++++++++-----\n')
            console.log('\n-----++++++++++-----\n' + new Date().toLocaleString() + 'Ping ' + dut.lanSourceIP + ' Test Fail\n-----++++++++++-----\n')
        }
    }
}

let wifi2GAliveTest = (dut,aliveTestIntervalID) => {
    let sublog = ''
    let templog = ''     // log临时停靠
    let subProcess = spawn('ping',[dut.wifi2GDestinationIP,'-t','-S',dut.wifi2GSourceIP,'-w',dut.returnTimeS.toString()])
    subProcess.stdout.on("data",(data)=>{ 
        templog += iconv.decode(data,'gbk')
        while(templog.match(/[\s\S]*?\n/)){
            sublog += templog.match(/[\s\S]*?\n/)[0]
            logDealWithFun(templog.match(/[\s\S]*?\n/)[0])
            templog = templog.slice(templog.match(/[\s\S]*?\n/)[0].length)
        }
    })
    subProcess.on("close",()=>{  
        cmdlog += '\n-----++++++++++-----\n' + JSON.stringify(dut) + '\n' + sublog
    })
    // log分段处理函数
    let logDealWithFun = (logInfo) => {
        if(logInfo.length == 2 || logInfo.match(/ping[\s\S]*\d+\.\d+\.\d+\.\d+/i)){
            // do nothing
        }else if(logInfo.match(/ttl=/i)){
            // running correct and close the subprocess
            subProcess.kill()
        }else{
            subProcess.kill()
            clearInterval(aliveTestIntervalID)
            log('\n-----++++++++++-----\n' + new Date().toLocaleString() + 'Ping ' + dut.wifi2GSourceIP + ' Test Fail\n-----++++++++++-----\n')
            console.log('\n-----++++++++++-----\n' + new Date().toLocaleString() + 'Ping ' + dut.wifi2GSourceIP + ' Test Fail\n-----++++++++++-----\n')
        }
    }
}

let wifi5GAliveTest = (dut,aliveTestIntervalID) => {
    let sublog = ''
    let templog = ''     // log临时停靠
    let subProcess = spawn('ping',[dut.wifi5GDestinationIP,'-t','-S',dut.wifi5GSourceIP,'-w',dut.returnTimeS.toString()])
    subProcess.stdout.on("data",(data)=>{ 
        templog += iconv.decode(data,'gbk')
        while(templog.match(/[\s\S]*?\n/)){
            sublog += templog.match(/[\s\S]*?\n/)[0]
            logDealWithFun(templog.match(/[\s\S]*?\n/)[0])
            templog = templog.slice(templog.match(/[\s\S]*?\n/)[0].length)
        }
    })
    subProcess.on("close",()=>{  
        cmdlog += '\n-----++++++++++-----\n' + JSON.stringify(dut) + '\n' + sublog
    })
    // log分段处理函数
    let logDealWithFun = (logInfo) => {
        if(logInfo.length == 2 || logInfo.match(/ping[\s\S]*\d+\.\d+\.\d+\.\d+/i)){
            // do nothing
        }else if(logInfo.match(/ttl=/i)){
            // running correct and close the subprocess
            subProcess.kill()
        }else{
            subProcess.kill()
            clearInterval(aliveTestIntervalID)
            log('\n-----++++++++++-----\n' + new Date().toLocaleString() + 'Ping ' + dut.wifi5GSourceIP + ' Test Fail\n-----++++++++++-----\n')
            console.log('\n-----++++++++++-----\n' + new Date().toLocaleString() + 'Ping ' + dut.wifi5GSourceIP + ' Test Fail\n-----++++++++++-----\n')
        }
    }
}

let internetAliveTest = (dut,aliveTestIntervalID) => {
    let sublog = ''
    let templog = ''     // log临时停靠
    let subProcess = spawn('ping',[dut.internetDestinationIP,'-t','-S',dut.internetSourceIP,'-w',dut.returnTimeS.toString()])
    subProcess.stdout.on("data",(data)=>{ 
        templog += iconv.decode(data,'gbk')
        while(templog.match(/[\s\S]*?\n/)){
            sublog += templog.match(/[\s\S]*?\n/)[0]
            logDealWithFun(templog.match(/[\s\S]*?\n/)[0])
            templog = templog.slice(templog.match(/[\s\S]*?\n/)[0].length)
        }
    })
    subProcess.on("close",()=>{  
        cmdlog += '\n-----++++++++++-----\n' + JSON.stringify(dut) + '\n' + sublog
    })
    // log分段处理函数
    let logDealWithFun = (logInfo) => {
        if(logInfo.length == 2 || logInfo.match(/ping[\s\S]*\d+\.\d+\.\d+\.\d+/i)){
            // do nothing
        }else if(logInfo.match(/ttl=/i)){
            // running correct and close the subprocess
            subProcess.kill()
        }else{
            subProcess.kill()
            clearInterval(aliveTestIntervalID)
            log('\n-----++++++++++-----\n' + new Date().toLocaleString() + 'Ping ' + dut.internetSourceIP + ' Test Fail\n-----++++++++++-----\n')
            console.log('\n-----++++++++++-----\n' + new Date().toLocaleString() + 'Ping ' + dut.internetSourceIP + ' Test Fail\n-----++++++++++-----\n')
        }
    }
}