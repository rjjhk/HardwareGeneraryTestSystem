const fsP = require('fs').promises
const {spawn} = require('child_process')

let settingObj = null
exports.handOverThrouthPutTest = async () => {
    await fsP.readFile('./allconfig/throughputtestconfig.json',{encoding:'utf8'}).then(res => {
        settingObj = JSON.parse(res)
        return wifiInit()
    }).then(()=>{
        getTestList()
    }).then(()=>{
        startTest()
    }).catch(err => {
        log(err)
    }).finally(() =>{
        log("throughputtest init success")
    })
} 

let wifiInit = async () => {
    // 设置wifi-5G打开/广播/wmm/无认证/SSID
    settingObj.router.requestPayload.cmd = 211              // 2 wifi-2.4g 211 wifi-5g
    settingObj.router.requestPayload.method = "POST"        // post-设置    get-读取
    settingObj.router.requestPayload.wifiOpen = '1'
    settingObj.router.requestPayload.broadcast = '1'
    settingObj.router.requestPayload.wifiwmm = '1'
    settingObj.router.requestPayload.authenticationType = '0'
    settingObj.router.requestPayload.ssid = iconv.decode(iconv.encode(settingObj.hardware + '-5G',"utf8"),"base64")
    await axios.post(settingObj.router.destinationURL,settingObj.router.requestPayload).then(res => {
        if(res.data.success){
            log("wifi-5g init success")
        }
    }).catch(err => {
        log(err)
    })
    // 设置wifi-24G打开/广播/wmm/无认证/SSID
    settingObj.router.requestPayload.cmd = 2
    settingObj.router.requestPayload.ssid = iconv.decode(iconv.encode(settingObj.hardware + '-24G',"utf8"),"base64")
    await axios.post(settingObj.router.destinationURL,settingObj.router.requestPayload).then(res => {
        if(res.data.success){
            log("wifi-24g init success")
        }
    }).catch(err => {
        log(err)
    })
}

let wifiSet = async (wifi,channel,bandwidth,wifimode) => {
    settingObj.router.requestPayload.method = "POST"
    if(wifi.match(/24G/i)){
        // 关闭WIFI-5G 打开WIFI-24G
        settingObj.router.requestPayload.cmd = 211
        settingObj.router.requestPayload.wifiOpen = '0'
        await axios.post(settingObj.router.destinationURL,settingObj.router.requestPayload).then(res => {
            if(res.data.success){
                return 0
            }else{
                log("Fail to set wifi and system goes down")
                process.exit()
            }
        }).catch(err => {
            log(err)
            return -1
        })
        settingObj.router.requestPayload.cmd = 2
        settingObj.router.requestPayload.wifiOpen = '1'
        await axios.post(settingObj.router.destinationURL,settingObj.router.requestPayload).then(res => {
            if(res.data.success){
                return 0
            }else{
                log("Fail to set wifi and system goes down")
                process.exit()
            }
        }).catch(err => {
            log(err)
            return -1
        })

        settingObj.router.requestPayload.cmd = 230
        if(wifimode.match(/802.11b/i)){
            settingObj.router.requestPayload.wifiWorkMode = '0'         // b only
            settingObj.router.requestPayload.bandWidth = '0'            // 20M
        }else if(wifimode.match(/802.11g/i)){
            settingObj.router.requestPayload.wifiWorkMode = '1'         // g only
            settingObj.router.requestPayload.bandWidth = '0'            // 20M
        }else if(wifimode.match(/802.11n/i)){   
            settingObj.router.requestPayload.wifiWorkMode = '2'         // n only
            if(bandwidth.match(/20M/i)){
                settingObj.router.requestPayload.bandWidth = '0'        // 20M
            }else{
                settingObj.router.requestPayload.bandWidth = '2'        // 40M
            }
        }
    }else{
        // 关闭WIFI-24G 打开WIFI-5G
        settingObj.router.requestPayload.cmd = 2
        settingObj.router.requestPayload.wifiOpen = '0'
        await axios.post(settingObj.router.destinationURL,settingObj.router.requestPayload).then(res => {
            if(res.data.success){
                return 0
            }else{
                log("Fail to set wifi and system goes down")
                process.exit()
            }
        }).catch(err => {
            log(err)
            return -1
        })
        settingObj.router.requestPayload.cmd = 211
        settingObj.router.requestPayload.wifiOpen = '1'
        await axios.post(settingObj.router.destinationURL,settingObj.router.requestPayload).then(res => {
            if(res.data.success){
                return 0
            }else{
                log("Fail to set wifi and system goes down")
                process.exit()
            }
        }).catch(err => {
            log(err)
            return -1
        })

        settingObj.router.requestPayload.cmd = 231
        if(wifimode.match(/802.11a/i)){
            settingObj.router.requestPayload.wifiWorkMode = '7'         // a only
            settingObj.router.requestPayload.bandWidth = '0'            // 20M
        }else if(wifimode.match(/802.11n/i)){
            settingObj.router.requestPayload.wifiWorkMode = '8'         // n only
            if(bandWidth.match(/20M/i)){
                settingObj.router.requestPayload.bandWidth = '0'        // 20M
            }else{
                settingObj.router.requestPayload.bandWidth = '1'        // 40M
            }
        }else if(wifimode.match(/802.11ac/i)){
            settingObj.router.requestPayload.wifiWorkMode = '9'         // ac only
            if(bandWidth.match(/20M/i)){
                settingObj.router.requestPayload.bandWidth = '0'        // 20M
            }else if(bandWidth.match(/40M/i)){
                settingObj.router.requestPayload.bandWidth = '1'        // 40M
            }else{
                settingObj.router.requestPayload.bandWidth = '2'        // 80M
            }
        }
    }
    settingObj.router.requestPayload.countryCode = "CN"
    settingObj.router.requestPayload.txPower = "100"
    settingObj.router.requestPayload.channel = channel
    // 设置
    await axios.post(settingObj.router.destinationURL,settingObj.router.requestPayload).then(res => {
        if(res.data.success){
            return 0
        }else{
            log("Fail to set wifi and system goes down")
            process.exit()
        }
    }).catch(err => {
        log(err)
        return -1
    })
}

let testList = []
let activeIndex = null
let getTestList = () => {
    for(let test of settingObj.tests){
        if(test.wifi.match(/wifi-24g/i)){
            for(let wifimode of test.wifimode){
                if(wifimode.match(/11b|g/i)){
                    for(let channel of test.channels){
                        testList.push({
                            destinationIP:test.destinationIP,
                            sourceIP:test.sourceIP,
                            wifi:test.wifi,
                            wifimode:wifimode,
                            channel:channel,
                            bandwidth:test.bgBandwidth[0]
                        })
                    }
                }else if(wifimode.match(/11n/i)){
                    for(let bandwidth of test.nBandwidth){
                        for(let channel of test.channels){
                            testList.push({
                                destinationIP:test.destinationIP,
                                sourceIP:test.sourceIP,
                                wifi:test.wifi,
                                wifimode:wifimode,
                                channel:channel,
                                bandwidth:bandwidth
                            })
                        }
                    }
                }
            }
        }else if(test.wifi.match(/wifi-5g/i)){
            for(let wifimode of test.wifimode){
                if(wifimode.match(/11a/i)){
                    for(let channel of test.channels){
                        testList.push({
                            destinationIP:test.destinationIP,
                            sourceIP:test.sourceIP,
                            wifi:test.wifi,
                            wifimode:wifimode,
                            channel:channel,
                            bandwidth:test.aBandwidth[0]
                        })
                    }
                }else if(wifimode.match(/11n/i)){
                    for(let bandwidth of test.nBandwidth){
                        for(let channel of test.channels){
                            testList.push({
                                destinationIP:test.destinationIP,
                                sourceIP:test.sourceIP,
                                wifi:test.wifi,
                                wifimode:wifimode,
                                channel:channel,
                                bandwidth:bandwidth
                            })
                        }
                    }
                }else if(wifimode.match(/11ac/i)){
                    for(let bandwidth of test.acBandwidth){
                        for(let channel of test.channels){
                            testList.push({
                                destinationIP:test.destinationIP,
                                sourceIP:test.sourceIP,
                                wifi:test.wifi,
                                wifimode:wifimode,
                                channel:channel,
                                bandwidth:bandwidth
                            })
                        }
                    }
                }
            }
        }
    }
} 

let startTest = () => {
    activeIndex = null
    // 轮询确认测试项
    let index = 0
    for(;index <= testList.length;index++){
        if(index == testList.length){
            return
        }
        if(testList[index].hasOwnProperty("UL")){
            continue
        }else{
            break
        }
    }
    activeIndex = index
    wifiSet(testList[activeIndex].wifi,testList[activeIndex].channel,testList[activeIndex].bandwidth,testList[activeIndex].wifimode)
    pingPassToIperfTest(testList[index].destinationIP,testList[index].sourceIP)
}

// ping-测试联通性
let pingPassToIperfTest = (destinationIP,sourceIP) => {
    let ls = spawn('ping',[destinationIP,'-t','-S',sourceIP])
    ls.stdout.on('data',(data) => {
        let pingString = iconv.decode(data,'gbk')
        if(pingString.match(new RegExp(destinationIP + "[\\s\\S]*TTL=",'i'))){
            ls.kill()
            // 转移到iperf
            setTimeout(() => {
                iperfTest()
            }, settingObj.testTimeGapS * 2 * 1000)
        }
    })
}

// iperf-测试吞吐量
let iperfTest = () => {
    let paramList = ['-c',testList[activeIndex].destinationIP,'-w','4M','-i','1','-t',settingObj.iperfTestTimeS,'-B',testList[activeIndex].sourceIP,'-P','10']
    // 切换下行
    if(testList[activeIndex].hasOwnProperty('UL')){
        paramList.push('-R')
    }
    let ls = spawn('./tool/iperf3.exe',paramList)
    ls.stdout.on('data',(data) => {
        let matchSpeed = iconv.decode(data,'gbk').match(/\[SUM\][\S\s]+?[M|K]bits\/sec/gi)
        matchSpeed = matchSpeed.slice(1,-2)
        if(settingObj.iperfTestTimeS == matchSpeed.length -1){
            log("Test result length is wrong - " + matchSpeed.length)  
        } 
        matchSpeed = matchSpeed.map(element => {
            if(element.match(/\d+\.*\d*\s+Mbits\/sec/i)){
                return Number((element.match(/\d+\.*\d*\s+[M|K]bits\/sec/i)[0]).match(/\d+\.*\d*/)[0])
            }else{
                return Number((element.match(/\d+\.*\d*\s+[M|K]bits\/sec/i)[0]).match(/\d+\.*\d*/)[0]) / 1000
            }
        })
        // 删减最值，得均值，记录
        let max = 0
        let min = 0
        let sum = 0
        for(let value of matchSpeed){
            max = value > max? value:max
            min = value < min? value:min
            sum += value
        }
        sum /= matchSpeed.length
        sum = sum.toFixed(2)
        // 记录速度
        if(testList[activeIndex].hasOwnProperty('UL')){
            testList[activeIndex].DL = sum
            testList[activeIndex].DLSpeedList = matchSpeed
            // 开启下一个循环
            setTimeout(() => {
                startTest()
            },settingObj.testTimeGapS * 1000)
        }else{
            testList[activeIndex].UL = sum
            testList[activeIndex].ULSpeedList = matchSpeed
            setTimeout(() => {
                iperfTest()
            },settingObj.testTimeGapS * 1000)
        }
        log(testList[activeIndex])
    })
    ls.on('error',(data) => {
        log(data)
    })
}

process.on('beforeExit',() => {
    console.log(testList)
})