const fsP = require('fs').promises
const {spawn} = require('child_process')

let config = null
let devices = []
exports.handOverTraceMemTest = () => {
    fsP.readFile('./allconfig/tracememtestconfig.json',{encoding:'utf8'}).then(res => {
        config = JSON.parse(res)
    }).then(() => {
        // start test
        getADBdevices()
    }).catch(err =>{
        log(err)
        log('fail to read the tracememtest.json file')
    })
}

let getADBdevices = () => {
    let lsLog = ""
    let ls = spawn(config.subToolPath,["devices"])
    ls.stdout.on("data",data => {
        lsLog += data
    })
    ls.on("close",code => {
        // 筛选出deviceID
        for(let deviceID of lsLog.match(/[\s\S]*?\n/g).slice(1)){
            let tempDeviceID = deviceID.trim().replace(/\r/g,"").replace(/\n/g,"").replace(/\t/,"").replace(/device/i,"").trim()
            if(tempDeviceID.length > 0){
                devices.push({adbID:tempDeviceID})
            }
        }
        // 判断是否没有设备
        if(devices.length == 0){
            log("ERROR:have not detect any adb device")
            return
        }
        // 启动定时器获取mem
        let getMEMTimeIntervalID = setInterval(()=>{
            for(let device of devices){
                getUptime(device.adbID,getMEMTimeIntervalID)
            }
        },config.getMemIntervalTimeM * 1000)
        // 立即触发
        for(let device of devices){
            getUptime(device.adbID,getMEMTimeIntervalID)
        }
    })
}

let getUptime = (adbID,intervalID) => {
    let ls = spawn('./tool/adb/adb.exe',["-s",adbID,"shell","\"uptime\""])
    ls.stdout.on("data",(data)=>{
        let uptimeString = iconv.decode(data,'gbk')
        // 检测adb设备是否异常
        if(uptimeString.match(/no device/i)){
            clearInterval(intervalID)
            log(uptimeString)
        }
        // 转换成时间
        let timeS = 0
        if(uptimeString.match(/\d+\s*day/i)){
            timeS += Number(uptimeString.match(/\d+\s*day/i)[0].match(/\d+/)[0]) * 24 * 60 * 60
        }
        if(uptimeString.match(/\d+\s*min/i)){
            timeS += Number(uptimeString.match(/\d+\s*min/i)[0].match(/\d+/)[0]) * 60 
        }else{
            timeS += Number(uptimeString.slice(8).match(/\d+:/i)[0].slice(0,-1)) * 60 * 60
            timeS += Number(uptimeString.slice(8).match(/:\d+/i)[0].slice(1)) * 60
        }
        // 运行时间写入维护对象
        for(let device of devices){
            if(device.adbID == adbID){
                if(device.hasOwnProperty("upTime")){
                    // 判断运行时间是否异常
                    if(device.upTime > timeS){
                        // 异常退出
                        sentMessageToWeChat("Device which adbID is " + adbID + " error occur ")
                        clearInterval(intervalID)
                    }else{
                        device.upTime = timeS
                    }
                }else{
                    device.upTime = timeS
                }
                break
            }
        }
        // 转获取mem信息
        getOrcaMEM(adbID,intervalID)
    })
}

let getOrcaMEM = (adbID,intervalID) => {
    let ls = spawn('./tool/adb/adb.exe',["-s",adbID,"shell","cat /proc/meminfo"])
    ls.stdout.on("data",(data) => {
        let orcaMEMString = iconv.decode(data,'gbk')
        if(orcaMEMString.match(/memfree[\s\S]*?\d+\skB/i)){
            // free写入维护对象
            for(let device of devices){
                if(device.adbID == adbID){
                    if(device.hasOwnProperty("orcaMemFrees")){
                        device.orcaMemFrees.push({date:})
                    }else{
                        device.upTime = timeS
                    }
                    break
                }
            }
        }
        console.log(orcaMEMString)
    })
    ls.on("close",() => {
        clearInterval(intervalID)
    })
}