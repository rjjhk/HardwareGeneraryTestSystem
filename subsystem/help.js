const subName = 'help'
let nullPromise = new Promise((res,rej)=>{res()})

exports.handOverHelp = (mainRunInfo) => {
    mainRunInfo.registerSubsystem(subName)
    nullPromise.then(res => {
        helpMain()
    }).catch(err => {
        console.error(err)
    }).finally(() => {
        mainRunInfo.unregisterSubsystem(subName)
    })
}

let helpMain = () => {
    console.log("Hardarware Test System Designed by Yingsan\n")
}

