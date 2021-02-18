const fsP = require('fs').promises
const axios = require('axios')

let sentMsgObj = null
let getUsersObj = null
exports.initWechatNotice = async () => {
    global.sentMessageToWeChat = sentMessageToWeChat
    await fsP.readFile('./allconfig/wechatNotice.json',{encoding:'utf8'}).then(res => {
        let tempObj = JSON.parse(res)
        sentMsgObj = tempObj.sentMsgObj
        getUsersObj = tempObj.getUsersObj
        return axios.get(getUsersObj.destinationURL,{params:getUsersObj})
    }).then(res => {
        if(res.data.data.records){
            for(let record of res.data.data.records){
                sentMsgObj.uids.push(record.uid)
            }
            initFinished = true
            // 全局挂载方法
            global.sentMessageToWeChat = sentMessageToWeChat
        }
        log('wechatNotice init success')
    }).catch(err => {
        log('wechatNotice init fail')
    })
}
// 发送微信通知
let sentMessageToWeChat = (msg) => {
    sentMsgObj.summary = msg
    axios.post(sentMsgObj.destinationURL,sentMsgObj).then(res => {
        log("wechat info success")
    }).catch(err => {
        log(err)
    })
}