const fsP = require('fs').promises
const {spawn} = require('child_process')

let settingObj = null
let testRunning = true
exports.handOverThrouthPutTest = async () => {
    await fsP.readFile('./allconfig/throughputtestconfig.json',{encoding:'utf8'}).then(res => {
        settingObj = JSON.parse(res)
        wifiInit()
    }).then(()=>{
        wifiThoughputTest()
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
    if(wifi.match(/2.4G/i)){
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
        }else if(wifimode.match(/802.11n/i)){
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
    settingObj.router.txPower = "100"
    settingObj.router.channel = channel
    // 设置
    await axios.post(settingObj.router.destinationURL,settingObj.router.requestPayload).then(res => {
        if(res.data.success){
            return 0
        }
    }).catch(err => {
        log(err)
        return -1
    })
}

let wifiThoughputTest = () => {
    for(let test of settingObj.tests){
        if(test.wifi.match(/wifi-24g/i)){
            for(let wifimode of test.wifimode){
                if(wifimode.match(/11b|g/i)){
                    for(let channel of test.channels){
                        if(wifiSet(test.wifi,channel,test.bgBandwidth[0],wifimode)){
                            testRunning = true
                            log("wifi:" + test.wifi + "\twifimode:" + wifimode + "\tbandwidth:" + test.bgBandwidth + "\tchannel:" + channel)
                            pingPassToIperfTest(test.destinationIP,test.sourceIP)
                        }else{
                            return -1
                        }
                        // hold the test
                        while(testRunning){}
                    }
                }else if(wifimode.match(/11n/i)){
                    for(let bandwidth of test.nBandwidth){
                        for(let channel of test.channels){
                            if(wifiSet(test.wifi,channel,bandwidth,wifimode)){
                                testRunning = true
                                log("wifi:" + test.wifi + "\twifimode:" + wifimode + "\tbandwidth:" + bandwidth + "\tchannel:" + channel)
                                pingPassToIperfTest(test.destinationIP,test.sourceIP)
                            }else{
                                return -1
                            }
                            // hold the test
                            while(testRunning){}
                        }
                    }
                }
            }
        }else if(test.wifi.match(/wifi-5g/i)){

        }
    }
} 

// ping测试联通性
let pingPassToIperfTest = (destinationIP,sourceIP) => {
    let ls = spawn('ping',[destinationIP,'-t','-S',sourceIP])
    ls.stdout.on('data',(data) => {
        let pingString = iconv.decode(data,'gbk')
        if(pingString.match(new RegExp(destinationIP + "[\\s\\S]*TTL=",'i'))){
            // ls.kill()
            console.log(pingString)
            // 转移到iperf测试吞吐量
            //iperfTest()
        }
    })
}