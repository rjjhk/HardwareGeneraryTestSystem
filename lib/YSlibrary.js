// eg 202101311500
exports.getTimeString = () => {
    let date = new Date()
    let dateString = date.getFullYear().toString() + 
        ((date.getMonth() + 1) > 9? (date.getMonth() + 1):('0' + (date.getMonth() + 1))) + 
        (date.getDate() > 9? date.getDate() : ('0' + date.getDate())) +
        (date.getHours() > 9? date.getHours() : ('0' + date.getHours())) + 
        (date.getMinutes() > 9? date.getMinutes() : ('0' + date.getMinutes()))
    return dateString
}
// eg 
exports.getPassTimeString = (ms) => {
    let days = 0
    let hours = 0
    let minutes = 0
    let seconds = 0
    for(let conutCircle = 0;ms > 1000 * 60 * 60 * 24 || conutCircle > 1000;conutCircle++){
        days ++
        ms -= 1000 * 60 * 60 * 24
    }
    for(let conutCircle = 0;ms > 1000 * 60 * 60 || conutCircle > 1000;conutCircle++){
        hours ++
        ms -= 1000 * 60 * 60
    }
    for(let conutCircle = 0;ms > 1000 * 60 || conutCircle > 1000;conutCircle++){
        minutes ++
        ms -= 1000 * 60
    }
    for(let conutCircle = 0;ms > 1000 || conutCircle > 1000;conutCircle++){
        seconds ++
        ms -= 1000
    }
    return days + 'd ' + hours + 'h ' +  minutes + 'm ' + seconds + 's '
}