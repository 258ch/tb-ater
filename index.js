var request = require('sync-request')
var fs = require('fs')
var sleep = require('sleep')
const crypto = require('crypto')
var getUsers = require('./get_user.js')
var at = require('./at.js')

var config = at.config
var cookie = at.cookie

function getUsersByTb(tb, pg) {
    
    var res = []
    for(var i = 1; i <= pg; i++){
        var url = `http://tieba.baidu.com/f?kw=${encodeURIComponent(tb)}&ie=utf-8&pn=${(i-1)*50}`
        var html = request('GET', url).getBody().toString()
        var users = getUsers.getUsers(html)
        res = res.concat(users)
    }
    return res
    
}

function main() {
    
    var tbList = config.src
    var idx = Math.trunc(Math.random() * tbList.length)
    var tb = tbList[idx]
    
    var users = getUsersByTb(tb, 3)
    
    for(var i = 0; i < users.length; i += config.at_num) {
        
        try {
            var content = users.slice(i, i + config.at_num).map(x => `@${x} `).join('')
            var res = at.sendReply(config.tb, config.tid, content, cookie)
            if(res[0] == 1) {
                console.log(`${config.tid} ${content} 发送成功`)
            } else {
                console.log(`${config.tid} ${content} 发送失败：${res[1]}`)
                i -= config.at_num
            }
            sleep.sleep(config.wait_sec)
        } catch(ex) {
            console.log(`${config.tid} ${content} 发送失败：${ex}`)
            i -= config.at_num
        }
    }
}

if(module == require.main) main()
