const fsP = require('fs').promises
const subName = 'help'
let nullPromise = new Promise((res,rej)=>{res()})

exports.handOverHelp = (mainRunInfo) => {
    mainRunInfo.registerSubsystem(subName)
    nullPromise.then(res => {
        return helpMain()
    }).catch(err => {
        console.error(err)
    }).finally(() => {
        console.log("aha")
        mainRunInfo.unregisterSubsystem(subName)
    })
}

let helpMain = () => {
    return fsP.readFile('./allconfig/helpconfig.json',{encoding:"utf8"}).then(res => {
        let helpObj = JSON.parse(res)
        console.log('\n' + helpObj.desc)
        for(let fun of helpObj.function){
            console.log('\t' + fun.attr + '\t\t' + fun.desc)
        }
    })
}

