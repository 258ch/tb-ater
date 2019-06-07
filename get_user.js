var request = require('sync-request')
var cheerio = require('cheerio')
var fs = require('fs')

var config = JSON.parse(fs.readFileSync('config.json', 'utf-8'))
var tb_list = config.src

function getUsers(html) {
    
    var $ = cheerio.load(html)
    var $list = $('.frs-author-name-wrap>a.frs-author-name')
    var res = []
    for(var i = 0; i < $list.length; i++) {
        
        var j = $list.eq(i).attr('data-field')
        var j = JSON.parse(j)
        if(j.un) res.push(j.un)
    }
    return res
}

function main() {

    var f = fs.openSync(config.users, 'w')

    for(var tb of tb_list) {
        console.log(`贴吧：${tb}`)
        for(var i = 1; i <= 10; i++){
            console.log(`page：${i}`)
            var url = `http://tieba.baidu.com/f?kw=${encodeURIComponent(tb)}&ie=utf-8&pn=${(i-1)*50}`
            var html = request('GET', url).getBody().toString()
            var users = getUsers(html)
            for(var u of users) {
                console.log(u)
                fs.writeSync(f, u + '\r\n')
            }
        }
        
    }

    fs.closeSync(f)

}

exports.getUsers = getUsers

if(module == require.main) main()