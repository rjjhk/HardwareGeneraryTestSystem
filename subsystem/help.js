const fsP = require('fs').promises

let nullPromise = new Promise((res,rej)=>{res()})
exports.handOverHelp = () => {
    nullPromise.then(res => {
        return helpMain()
    }).catch(err => {
        log(err)
        console.error(err)
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

