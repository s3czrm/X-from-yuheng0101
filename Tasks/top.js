/******************************************
 * @name 热搜整合
 * @description 整合常用热搜榜|随机取热搜通知
 * @platform 微博、知乎、头条、抖音、百度、bilibili、贴吧
 * @author 𝒀𝒖𝒉𝒆𝒏𝒈
 * @update 20230715
 * @version 1.0.0
******************************************

[task_local]
30 6-23 * * * https://raw.githubusercontent.com/Yuheng0101/X/main/Tasks/top.js, tag=热搜聚合, img-url=https://is3-ssl.mzstatic.com/image/thumb/Purple126/v4/9a/d8/77/9ad877c6-e3d7-61a1-3911-5036239a41a6/AppIcon-1x_U007emarketing-0-7-0-0-sRGB-85-220.png/144x144bb.png, enabled=true

[Script]
cron "30 6-23 * * *" script-path=https://raw.githubusercontent.com/Yuheng0101/X/main/Tasks/top.js, timeout=10, tag=热搜聚合, argument="https://is3-ssl.mzstatic.com/image/thumb/Purple126/v4/9a/d8/77/9ad877c6-e3d7-61a1-3911-5036239a41a6/AppIcon-1x_U007emarketing-0-7-0-0-sRGB-85-220.png/144x144bb.png"


******************************************/
const scriptName = '热搜榜'
    , $ = Env(scriptName)
    , request = $.http
    , __list = [
        { name: '微博', tag: 'weibo', url: 'https://s.weibo.com/top/summary', logo: 'https://file.ipadown.com/tophub/assets/images/media/weibo.com.png_160x160.png' },
        { name: '知乎', tag: 'zhihu', url: 'https://www.zhihu.com/billboard', logo: 'https://file.ipadown.com/tophub/assets/images/media/zhihu.com.png_160x160.png' },
        { name: '头条', tag: 'toutiao', url: 'https://tophub.today/n/x9ozB4KoXb', logo: 'https://file.ipadown.com/tophub/assets/images/media/so.toutiao.com.png_160x160.png' },
        { name: '抖音', tag: 'douyin', url: 'https://www.iesdouyin.com/share/billboard/?id=0', logo: 'https://file.ipadown.com/tophub/assets/images/media/douyin.com.png_160x160.png' },
        { name: '百度', tag: 'baidu', url: 'https://top.baidu.com/board?tab=realtime', logo: 'https://file.ipadown.com/tophub/assets/images/media/baidu.com.png_160x160.png' },
        { name: '贴吧', tag: 'tieba', url: 'http://c.tieba.baidu.com/hottopic/browse/topicList?res_type=1', logo: '//tb2.bdstatic.com/tb/static-common/img/search_logo_big_v2_d84d082.png' },
        { name: '哔哩哔哩', tag: 'bilibili', url: 'https://tophub.today/n/74KvxwokxM', logo: 'https://file.ipadown.com/tophub/assets/images/media/bilibili.com.png_160x160.png' }
    ]
    , { tag: __key } = __list[Math.floor(Math.random() * __list.length)]
    , __current = __list.find(item => item.tag === __key)
    , { name: __name, url: __url, logo: __logo } = __current

!(async () => {
    const content = await eval(__key)()
    $.notify(`🔔${__name}热搜榜`, '', content, { 'open-url': __url, 'media-url': __logo })
})()
    .catch(e => $.log('', '❌错误，原因：', e, ''))
    .finally(() => $.done())

async function weibo() {
    try {
        const { body } = await request.get({
            url: "https://weibo.com/ajax/statuses/hot_band",
            headers: {
                'Host': 'weibo.com',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
                'Referer': 'https://weibo.com/?category=1760',
                'Cookie': 'SRF-TOKEN=gy-JCKoaCdJaydGgNdGOogST; SUB=_2AkMU9HZyf8NxqwFRmP8XxW7qbY1xww_EieKiqIepJRMxHRl-yT9jqkkDtRB6P3RYnazWoKVAc1j0D2MFZq7dbfgCR7Di; UPSTREAM-V-WEIBO-COM=b09171a17b2b5a470c42e2f713edace0; _s_tentry=www.baidu.com; UOR=www.baidu.com,weibo.com,www.baidu.com; Apache=5141979382819.02.1672025150365; SINAGLOBAL=5141979382819.02.1672025150365; ULV=1672025150482:1:1:1:5141979382819.02.1672025150365:; WBPSESS=dg5zs_KFY81p0FnDKmb34RZVNfWqA4WfanF-eevXRNWdIWtd_kUo1q0Ch7GDzlXpHmvQmi-7BWumVFwxBD1iFRNvgEHYg72tSysad_QtTnFbyJJcw7fgyg68oRbFW1Q2oIzltdkpP0sCHaUZEFtU_fMQvLT71kRQDZfIfEjSY1Y=; PPA_CI=01ab9f68a4bb63b1ffbb251ade53b255',
            }
        })
            , { data: { band_list: list } } = JSON.parse(body)
        return list.map((item, index) => {
            // https://s.weibo.com/weibo?q=${encodeURI(item.word)}
            return `【${index + 1}】${item.word}`
        }).join('\n')
    } catch (e) {
        $.log('===========', '❌微博热搜获取失败:', e, '===========')
        $.done()
    }
}
async function zhihu() {
    try {
        const { body } = await request.get("https://api.codelife.cc/api/top/list?lang=cn&id=mproPpoq6O&size=50")
            , { data: list } = JSON.parse(body)
        return list.map((item) => {
            // item.link
            return `【${item.index}】${item.title}`
        }).join('\n')
    } catch (e) {
        $.log('===========', '❌知乎热搜获取失败:', e, '===========')
        $.done()
    }
}
async function toutiao() {
    try {
        const { body } = await request.get("https://api.codelife.cc/api/top/list?lang=cn&id=toutiao&size=50")
            , { data: list } = JSON.parse(body)
        return list.map((item) => {
            // item.link
            return `【${item.index}】${item.title}`
        }).join('\n')
    } catch (e) {
        $.log('===========', '❌头条热搜获取失败:', e, '===========')
        $.done()
    }
}
async function douyin() {
    try {
        const { body } = await request.get({ url: 'https://aweme.snssdk.com/aweme/v1/hot/search/list/' })
            , { data: { word_list: list } } = JSON.parse(body)
        return list.map((item, index) => {
            // https://www.iesdouyin.com/share/billboard/?id=${item.word}
            return `【${index + 1}】${item.word}`
        }).join('\n')
    } catch (e) {
        $.log('===========', '❌抖音热搜获取失败:', e, '===========')
        $.done()
    }
}
async function baidu() {
    try {
        const { body } = await request.get({ url: 'https://top.baidu.com/board?tab=realtime', headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)' } })
            , { data: { cards } } = JSON.parse(body.match(/<!--s-data:(.*?)-->/)[1])
            , list = cards[0].content
        return list.map((item, index) => {
            return `【${index + 1}】${item.word}`
        }).join('\n')
    } catch (e) {
        $.log('===========', '❌百度热搜获取失败:', e, '===========')
        $.done()
    }
}
async function tieba() {
    try {
        const { body } = await request.get({ url: 'https://tieba.baidu.com/hottopic/browse/topicList' })
            , { data: { bang_topic: { topic_list: list } } } = JSON.parse(body)
        return list.map((item) => {
            return `【${item.idx_num}】${item.topic_name}`
        }).join('\n')
    } catch (e) {
        $.log('===========', '❌贴吧热搜获取失败:', e, '===========')
        $.done()
    }
}
async function bilibili() {
    try {
        const { body } = await request.get({ url: 'https://api.bilibili.com/x/web-interface/ranking/v2' })
            , { data: { list } } = JSON.parse(body)
        return list.map((item, index) => {
            return `【${index + 1}】${item.title}`
        }).join('\n')
    } catch (e) {
        $.log('===========', '❌哔哩哔哩热搜获取失败:', e, '===========')
        $.done()
    }
}
// prettier-ignore
function Env(name, opts) { class Http { constructor(env) { this.env = env } send(opts, method = "GET") { opts = "string" == typeof opts ? { url: opts } : opts; let sender = this.get; return "POST" === method && (sender = this.post), new Promise((resolve, reject) => { sender.call(this, opts, (err, resp, body) => { err ? reject(err) : resolve(resp) }) }) } get(opts) { return this.send.call(this.env, opts) } post(opts) { return this.send.call(this.env, opts, "POST") } } return new class { constructor(name, opts) { this.name = name, this.http = new Http(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.encoding = "utf-8", this.startTime = (new Date).getTime(), Object.assign(this, opts), this.log("", `🔔${this.name}, 开始!`) } getEnv() { return "undefined" != typeof $environment && $environment["surge-version"] ? "Surge" : "undefined" != typeof $environment && $environment["stash-version"] ? "Stash" : "undefined" != typeof module && module.exports ? "Node.js" : "undefined" != typeof $task ? "Quantumult X" : "undefined" != typeof $loon ? "Loon" : "undefined" != typeof $rocket ? "Shadowrocket" : "undefined" != typeof importModule ? "Scriptable" : "function" == typeof require && "undefined" != typeof $jsbox ? "JSBox" : void 0 } isNode() { return "Node.js" === this.getEnv() } isQuanX() { return "Quantumult X" === this.getEnv() } isSurge() { return "Surge" === this.getEnv() } isLoon() { return "Loon" === this.getEnv() } isShadowrocket() { return "Shadowrocket" === this.getEnv() } isStash() { return "Stash" === this.getEnv() } isScriptable() { return "Scriptable" === this.getEnv() } isJSBox() { return "JSBox" === this.getEnv() } toObj(str, defaultValue = null) { try { return JSON.parse(str) } catch { return defaultValue } } toStr(obj, defaultValue = null) { try { return JSON.stringify(obj) } catch { return defaultValue } } getjson(key, defaultValue) { let json = defaultValue; const val = this.getdata(key); if (val) try { json = JSON.parse(this.getdata(key)) } catch { } return json } setjson(val, key) { try { return this.setdata(JSON.stringify(val), key) } catch { return !1 } } getScript(url) { return new Promise(resolve => { this.get({ url: url }, (err, resp, body) => resolve(body)) }) } runScript(script, runOpts) { return new Promise(resolve => { let httpapi = this.getdata("@chavy_boxjs_userCfgs.httpapi"); httpapi = httpapi ? httpapi.replace(/\n/g, "").trim() : httpapi; let httpapi_timeout = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); httpapi_timeout = httpapi_timeout ? 1 * httpapi_timeout : 20, httpapi_timeout = runOpts && runOpts.timeout ? runOpts.timeout : httpapi_timeout; const [key, addr] = httpapi.split("@"), opts = { url: `http://${addr}/v1/scripting/evaluate`, body: { script_text: script, mock_type: "cron", timeout: httpapi_timeout }, headers: { "X-Key": key, Accept: "*/*" }, timeout: httpapi_timeout }; this.post(opts, (err, resp, body) => resolve(body)) }).catch(e => this.logErr(e)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const curDirDataFilePath = this.path.resolve(this.dataFile), rootDirDataFilePath = this.path.resolve(process.cwd(), this.dataFile), isCurDirDataFile = this.fs.existsSync(curDirDataFilePath), isRootDirDataFile = !isCurDirDataFile && this.fs.existsSync(rootDirDataFilePath); if (!isCurDirDataFile && !isRootDirDataFile) return {}; { const datPath = isCurDirDataFile ? curDirDataFilePath : rootDirDataFilePath; try { return JSON.parse(this.fs.readFileSync(datPath)) } catch (e) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const curDirDataFilePath = this.path.resolve(this.dataFile), rootDirDataFilePath = this.path.resolve(process.cwd(), this.dataFile), isCurDirDataFile = this.fs.existsSync(curDirDataFilePath), isRootDirDataFile = !isCurDirDataFile && this.fs.existsSync(rootDirDataFilePath), jsondata = JSON.stringify(this.data); isCurDirDataFile ? this.fs.writeFileSync(curDirDataFilePath, jsondata) : isRootDirDataFile ? this.fs.writeFileSync(rootDirDataFilePath, jsondata) : this.fs.writeFileSync(curDirDataFilePath, jsondata) } } lodash_get(source, path, defaultValue) { const paths = path.replace(/\[(\d+)\]/g, ".$1").split("."); let result = source; for (const p of paths) if (result = Object(result)[p], void 0 === result) return defaultValue; return result } lodash_set(obj, path, value) { return Object(obj) !== obj ? obj : (Array.isArray(path) || (path = path.toString().match(/[^.[\]]+/g) || []), path.slice(0, -1).reduce((a, c, i) => Object(a[c]) === a[c] ? a[c] : a[c] = Math.abs(path[i + 1]) >> 0 == +path[i + 1] ? [] : {}, obj)[path[path.length - 1]] = value, obj) } getdata(key) { let val = this.getval(key); if (/^@/.test(key)) { const [, objkey, paths] = /^@(.*?)\.(.*?)$/.exec(key), objval = objkey ? this.getval(objkey) : ""; if (objval) try { const objedval = JSON.parse(objval); val = objedval ? this.lodash_get(objedval, paths, "") : val } catch (e) { val = "" } } return val } setdata(val, key) { let issuc = !1; if (/^@/.test(key)) { const [, objkey, paths] = /^@(.*?)\.(.*?)$/.exec(key), objdat = this.getval(objkey), objval = objkey ? "null" === objdat ? null : objdat || "{}" : "{}"; try { const objedval = JSON.parse(objval); this.lodash_set(objedval, paths, val), issuc = this.setval(JSON.stringify(objedval), objkey) } catch (e) { const objedval = {}; this.lodash_set(objedval, paths, val), issuc = this.setval(JSON.stringify(objedval), objkey) } } else issuc = this.setval(val, key); return issuc } getval(key) { switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": return $persistentStore.read(key); case "Quantumult X": return $prefs.valueForKey(key); case "Node.js": return this.data = this.loaddata(), this.data[key]; default: return this.data && this.data[key] || null } } setval(val, key) { switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": return $persistentStore.write(val, key); case "Quantumult X": return $prefs.setValueForKey(val, key); case "Node.js": return this.data = this.loaddata(), this.data[key] = val, this.writedata(), !0; default: return this.data && this.data[key] || null } } initGotEnv(opts) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, opts && (opts.headers = opts.headers ? opts.headers : {}, void 0 === opts.headers.Cookie && void 0 === opts.cookieJar && (opts.cookieJar = this.ckjar)) } get(request, callback = (() => { })) { switch (request.headers && (delete request.headers["Content-Type"], delete request.headers["Content-Length"], delete request.headers["content-type"], delete request.headers["content-length"]), this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": default: this.isSurge() && this.isNeedRewrite && (request.headers = request.headers || {}, Object.assign(request.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(request, (err, resp, body) => { !err && resp && (resp.body = body, resp.statusCode = resp.status ? resp.status : resp.statusCode, resp.status = resp.statusCode), callback(err, resp, body) }); break; case "Quantumult X": this.isNeedRewrite && (request.opts = request.opts || {}, Object.assign(request.opts, { hints: !1 })), $task.fetch(request).then(resp => { const { statusCode: status, statusCode: statusCode, headers: headers, body: body, bodyBytes: bodyBytes } = resp; callback(null, { status: status, statusCode: statusCode, headers: headers, body: body, bodyBytes: bodyBytes }, body, bodyBytes) }, err => callback(err && err.error || "UndefinedError")); break; case "Node.js": let iconv = require("iconv-lite"); this.initGotEnv(request), this.got(request).on("redirect", (resp, nextOpts) => { try { if (resp.headers["set-cookie"]) { const ck = resp.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); ck && this.ckjar.setCookieSync(ck, null), nextOpts.cookieJar = this.ckjar } } catch (e) { this.logErr(e) } }).then(resp => { const { statusCode: status, statusCode: statusCode, headers: headers, rawBody: rawBody } = resp, body = iconv.decode(rawBody, this.encoding); callback(null, { status: status, statusCode: statusCode, headers: headers, rawBody: rawBody, body: body }, body) }, err => { const { message: error, response: resp } = err; callback(error, resp, resp && iconv.decode(resp.rawBody, this.encoding)) }) } } post(request, callback = (() => { })) { const method = request.method ? request.method.toLocaleLowerCase() : "post"; switch (request.body && request.headers && !request.headers["Content-Type"] && !request.headers["content-type"] && (request.headers["content-type"] = "application/x-www-form-urlencoded"), request.headers && (delete request.headers["Content-Length"], delete request.headers["content-length"]), this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": default: this.isSurge() && this.isNeedRewrite && (request.headers = request.headers || {}, Object.assign(request.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient[method](request, (err, resp, body) => { !err && resp && (resp.body = body, resp.statusCode = resp.status ? resp.status : resp.statusCode, resp.status = resp.statusCode), callback(err, resp, body) }); break; case "Quantumult X": request.method = method, this.isNeedRewrite && (request.opts = request.opts || {}, Object.assign(request.opts, { hints: !1 })), $task.fetch(request).then(resp => { const { statusCode: status, statusCode: statusCode, headers: headers, body: body, bodyBytes: bodyBytes } = resp; callback(null, { status: status, statusCode: statusCode, headers: headers, body: body, bodyBytes: bodyBytes }, body, bodyBytes) }, err => callback(err && err.error || "UndefinedError")); break; case "Node.js": let iconv = require("iconv-lite"); this.initGotEnv(request); const { url: url, ..._request } = request; this.got[method](url, _request).then(resp => { const { statusCode: status, statusCode: statusCode, headers: headers, rawBody: rawBody } = resp, body = iconv.decode(rawBody, this.encoding); callback(null, { status: status, statusCode: statusCode, headers: headers, rawBody: rawBody, body: body }, body) }, err => { const { message: error, response: resp } = err; callback(error, resp, resp && iconv.decode(resp.rawBody, this.encoding)) }) } } time(fmt, ts = null) { const date = ts ? new Date(ts) : new Date; let o = { "M+": date.getMonth() + 1, "d+": date.getDate(), "H+": date.getHours(), "m+": date.getMinutes(), "s+": date.getSeconds(), "q+": Math.floor((date.getMonth() + 3) / 3), S: date.getMilliseconds() }; /(y+)/.test(fmt) && (fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let k in o) new RegExp("(" + k + ")").test(fmt) && (fmt = fmt.replace(RegExp.$1, 1 == RegExp.$1.length ? o[k] : ("00" + o[k]).substr(("" + o[k]).length))); return fmt } queryStr(options) { let queryString = ""; for (const key in options) { let value = options[key]; null != value && "" !== value && ("object" == typeof value && (value = JSON.stringify(value)), queryString += `${key}=${value}&`) } return queryString = queryString.substring(0, queryString.length - 1), queryString } msg(title = name, subt = "", desc = "", opts) { const toEnvOpts = rawopts => { switch (typeof rawopts) { case void 0: return rawopts; case "string": switch (this.getEnv()) { case "Surge": case "Stash": default: return { url: rawopts }; case "Loon": case "Shadowrocket": return rawopts; case "Quantumult X": return { "open-url": rawopts }; case "Node.js": return }case "object": switch (this.getEnv()) { case "Surge": case "Stash": case "Shadowrocket": default: { let openUrl; return { url: rawopts.url || rawopts.openUrl || rawopts["open-url"] } } case "Loon": { let openUrl, mediaUrl; return { openUrl: rawopts.openUrl || rawopts.url || rawopts["open-url"], mediaUrl: rawopts.mediaUrl || rawopts["media-url"] } } case "Quantumult X": { let openUrl, mediaUrl, updatePasteboard; return { "open-url": rawopts["open-url"] || rawopts.url || rawopts.openUrl, "media-url": rawopts["media-url"] || rawopts.mediaUrl, "update-pasteboard": rawopts["update-pasteboard"] || rawopts.updatePasteboard } } case "Node.js": return }default: return } }; if (!this.isMute) switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": default: $notification.post(title, subt, desc, toEnvOpts(opts)); break; case "Quantumult X": $notify(title, subt, desc, toEnvOpts(opts)); break; case "Node.js": }if (!this.isMuteLog) { let logs = ["", "==============📣系统通知📣=============="]; logs.push(title), subt && logs.push(subt), desc && logs.push(desc), console.log(logs.join("\n")), this.logs = this.logs.concat(logs) } } notify(title = name, subtitle = "", content = "", options = {}) { const openURL = options["open-url"], mediaURL = options["media-url"]; if (this.isQuanX() && $notify(title, subtitle, content, options), this.isSurge() && $notification.post(title, subtitle, content + `${mediaURL ? "\n多媒体:" + mediaURL : ""}`, { url: openURL }), this.isLoon()) { let opts = {}; openURL && (opts.openUrl = openURL), mediaURL && (opts.mediaUrl = mediaURL), "{}" === JSON.stringify(opts) ? $notification.post(title, subtitle, content) : $notification.post(title, subtitle, content, opts) } if (this.isJSBox()) { const content_ = content + (openURL ? `\n点击跳转: ${openURL}` : "") + (mediaURL ? `\n多媒体: ${mediaURL}` : ""), push = require("push"); push.schedule({ title: title, body: (subtitle ? subtitle + "\n" : "") + content_ }) } if (!this.isMuteLog) { let logs = ["", "==============📣系统通知📣=============="]; logs.push(title), subtitle && logs.push(subtitle), content && logs.push(content + (openURL ? `\n点击跳转: ${openURL}` : "") + (mediaURL ? `\n多媒体: ${mediaURL}` : "")), console.log(logs.join("\n")), this.logs = this.logs.concat(logs) } } log(...logs) { logs.length > 0 && (this.logs = [...this.logs, ...logs]), console.log(logs.join(this.logSeparator)) } logErr(err, msg) { switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": case "Quantumult X": default: this.log("", `❗️${this.name}, 错误!`, err); break; case "Node.js": this.log("", `❗️${this.name}, 错误!`, err.stack) } } wait(time) { return new Promise(resolve => setTimeout(resolve, time)) } done(val = {}) { const endTime = (new Date).getTime(), costTime = (endTime - this.startTime) / 1e3; switch (this.log("", `🔔${this.name}, 结束! 🕛 ${costTime} 秒`), this.log(), this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": case "Quantumult X": default: $done(val); break; case "Node.js": process.exit(1) } } }(name, opts) }