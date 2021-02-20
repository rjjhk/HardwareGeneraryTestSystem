const fsP = require('fs').promises
const {spawn} = require('child_process')

let config = null
let devices = []
exports.handOverTraceMemTest = () => {
    fsP.readFile('./allconfig/tracememtestconfig.json',{encoding:'utf8'}).then(res => {
        config = JSON.parse(res)
    }).then(() => {
        // test
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
            if(deviceID.trim().replace(/\r/g,"").replace(/\n/g,"").trim().length > 0){
                devices.push(deviceID)
            }
        }
        // 启动定时器获取mem
        
    })
}