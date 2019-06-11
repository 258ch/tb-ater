var request = require('sync-request')
var fs = require('fs')
var sleep = require('sleep')
const crypto = require('crypto')

var config = JSON.parse(fs.readFileSync('config.json', 'utf-8'))
var cookie = fs.readFileSync('cookie', 'utf-8').trim()
    
function getFid(tb) {
    
    var url = `http://tieba.baidu.com/f/commit/share/fnameShareApi?ie=utf-8&fname=${encodeURIComponent(tb)}`
    var resStr = request('GET', url).getBody().toString()
    return JSON.parse(resStr).data.fid
}

function getTbs(cookie) {
    
    var url = 'http://tieba.baidu.com/dc/common/tbs'
    var resStr = request('GET', url, {headers: {'Cookie': cookie}}).getBody().toString()
    return JSON.parse(resStr).tbs
}

function sendReply(tb, tid, content, cookie) {
   
    var cid = Number.parseInt(new Date() / 1000)
    var tbs = getTbs(cookie)
    var fid = getFid(tb)
    var postData = `${cookie}&_client_id=${cid}&_client_type=2&_client_version=1.0.4&_phone_imei=000000000000000&anonymous=0&content=${content}&fid=${fid}&from=baidu_appstore&kw=${tb}&net_type=1&tbs=${tbs}&tid=${tid}`
    postData = postData.replace(/&/g, '') + "tiebaclient!!!"
    var sign = crypto.createHash('md5').update(postData).digest('hex').toUpperCase()
    postData = `${cookie}&_client_id=${cid}&_client_type=2&_client_version=1.0.4&_phone_imei=000000000000000&anonymous=0&content=${encodeURIComponent(content)}&fid=${fid}&from=baidu_appstore&kw=${encodeURIComponent(tb)}&net_type=1&tbs=${tbs}&tid=${tid}&sign=${sign}`
    var url = 'http://c.tieba.baidu.com/c/c/post/add'
    var resStr = request('POST', url, {body: postData}).getBody().toString()
    var j = JSON.parse(resStr)
    if(j.error_code == 0)
        return [1, '']
    else if(j.error_code == 220035)
        return [-1, '']
    else 
        return [0, j.error_msg]
}

exports.sendReply = sendReply
exports.config = config
exports.cookie = cookie

function main() {

    var users = fs.readFileSync(config.users, 'utf-8')
        .split('\n').map(x => x.trim()).filter(x => x)

    for(var i = 0; i < users.length; i += config.at_num) {
        
        try {
            var content = users.slice(i, i + config.at_num).map(x => `@${x} `).join('')
            var res = sendReply(config.tb, config.tid, content, cookie)
            if(res[0] == 1) {
                console.log(`${config.tid} ${content} 发送成功`)
            } else {
                console.log(`${config.tid} ${content} 发送失败：${res[1]}`)
                i -= config.at_num
                if(res[0] == -1) break
            }
            sleep.sleep(config.wait_sec)
        } catch(ex) {
            console.log(`${config.tid} ${content} 发送失败：${ex}`)
            i -= config.at_num
        }
    }
}

if(module == require.main) main()