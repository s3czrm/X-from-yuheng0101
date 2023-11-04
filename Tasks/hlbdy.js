/******************************************
 * @name 黑料不打烊
 * @channel https://t.me/yqc_123
 * @feedback https://t.me/yqc_777
 * @version 1.0.1
******************************************
## 更新日志
### 20231023
    1.适配多种环境
    2.修复日期显示问题

## 脚本声明
    1.此脚本仅用于学习研究，不保证其合法性、准确性、有效性，请根据情况自行判断，本人对此不承担任何保证责任。
    2.由于此脚本仅用于学习研究，您必须在下载后 24 小时内将所有内容从您的计算机或手机或任何存储设备中完全删除，若违反规定引起任何事件本人对此均不负责。
    3.请勿将此脚本用于任何商业或非法目的，若违反规定请自行对此负责。
    4.此脚本涉及应用与本人无关，本人对因此引起的任何隐私泄漏或其他后果不承担任何责任。
    5.本人对任何脚本引发的问题概不负责，包括但不限于由脚本错误引起的任何损失和损害。
    6.如果任何单位或个人认为此脚本可能涉嫌侵犯其权利，应及时通知并提供身份证明，所有权证明，我们将在收到认证文件确认后删除此脚本。
    7.所有直接或间接使用、查看此脚本的人均应该仔细阅读此声明, 本人保留随时更改或补充此声明的权利, 一旦您使用或复制了此脚本，即视为您已接受此免责声明。

## 使用方法

### 配置 (QuanX)
```properties
[task_local]
0 9,15 * * * https://raw.githubusercontent.com/Yuheng0101/X/main/Tasks/hlbdy.js, tag=黑料不打烊, img-url=https://raw.githubusercontent.com/Toperlock/Quantumult/main/icon/heiliao.png, enabled=true
```
### 配置 (Loon)
```properties
[Script]
cron "0 9,15 * * *" script-path=https://raw.githubusercontent.com/Yuheng0101/X/main/Tasks/hlbdy.js, timeout=10, tag=黑料不打烊, img-url=https://raw.githubusercontent.com/Toperlock/Quantumult/main/icon/heiliao.png
```
### 配置 (Surge)
```properties
黑料不打烊 = type=cron,cronexp=0 0 9,15 * * *,wake-system=1,script-path=https://raw.githubusercontent.com/Yuheng0101/X/main/Tasks/hlbdy.js,timeout=60
```

## 访问地址
    https://155.fun/
******************************************/
const scriptName = '黑料不打烊'
const $ = Env(scriptName)
const NAV_URL = $.getdata('hlbdy_nav_url') || 'https://155.fun/'
!(async () => {
    console.log(`🔔正在使用${NAV_URL}进行域名访问`)
    const url = await getNewUrl()
    let hotList = await getHotList(url)
    hotList = $.isSurge() ? hotList.slice(0, 2) : hotList
    const msg = hotList.map((item) => `【${item.title}(${item.date})】\n${item.link}\n`).join('')
    await SendNotify(scriptName, '最新黑料', msg, { 'media-url': url + '/static/pc/icons/icon_512x512.820c9b.png?v=1' })
})()
    .catch((e) => $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, ''))
    .finally(() => $.done())
// 获取最新地址
async function getNewUrl() {
    const navUrl = NAV_URL
    return new Promise(async (resolve, reject) => {
        Request({ url: navUrl, use_proxy: true })
            .then((html) => {
                const linkList = html
                    .replace(/\n|\s|\r/g, '')
                    .match(/<divclass="box-wrap">.*?<\/div>/)[0]
                    .match(/<ahref=".*?">.*?<\/a>/g)
                    .map((item) => {
                        let link = item.match(/<ahref="(.*?)">/)[1]
                        const title = item.match(/<ahref=".*?">(.*?)<\/a>/)[1]
                        if (title.includes('线路')) return link
                    })
                    .filter(Boolean)[0]
                resolve(linkList)
            })
            .catch((err) => reject(err))
    })
}
// 获取热门列表
function getHotList(url) {
    return new Promise((resolve, reject) => {
        Request({ url, use_proxy: true })
            .then(async (html) => {
                let list = html
                    .replace(/\n|\s|\r/g, '')
                    .match(/<aclass="cursor-pointer".*?>(.*?)<\/a>/g)
                    .map((item) => {
                        const title = item.match(/<divclass="title".*?>(.*?)<\/div>/)[1]
                        if (!title) return null
                        const link = url + item.match(/<a.*?href="(.*?)".*?>/)[1]
                        return { title, link }
                    })
                    .filter(Boolean)
                list = await Promise.all(
                    list.map(async (item) => {
                        const date = await getPublishDate(item.link)
                        return { ...item, date, diff: getDiff(date) }
                    })
                )
                const min = Math.min(...list.map((item) => item.diff))
                const hotList = list.filter((item) => item.diff === min)
                resolve(hotList)
            })
            .catch((err) => {
                reject(err)
            })
    })
}
// 获取发布时间
async function getPublishDate(url) {
    return new Promise((resolve, reject) => {
        Request({ url, use_proxy: true })
            .then((data) => {
                const date = data
                    .replace(/\n|\s|\r/g, '')
                    .match(/<spanclass="detail-txt".*?>(.*?)<\/span>/)[1]
                    .split('•')[1]
                    .replace(/年/, '/')
                    .replace(/月/, '/')
                    .replace(/日/, '')
                resolve(date)
            })
            .catch((err) => reject(err))
    })
}
/**
 * 获取时间差
 * @param {*} date YYYY/MM/DD
 */
function getDiff(date) {
    const now = new Date().getTime()
    const target = new Date(date).getTime()
    const diff = Math.floor((now - target) / 1000 / 60 / 60 / 24)
    return diff
}
// prettier-ignore
async function SendNotify(n,o="",i="",t={}){const e="undefined"!=typeof $app&&"undefined"!=typeof $http,s=t["open-url"],f=t["media-url"];if($.isQuanX()&&$notify(n,o,i,t),$.isSurge()){const t=f?`${i}\n多媒体:${f}`:i;$notification.post(n,o,t,{url:s})}if($.isLoon()){const t={};s&&(t.openUrl=s),f&&(t.mediaUrl=f),"{}"===JSON.stringify(t)?$notification.post(n,o,i):$notification.post(n,o,i,t)}const c=`${i}${s?`\n点击跳转: ${s}`:""}${f?`\n多媒体: ${f}`:""}`;if(e){const i=require("push");i.schedule({title:n,body:`${o?`${o}\n`:""}${c}`})}if($.isNode())try{const i=require("../sendNotify");i.sendNotify(`${n}\n${o}`,c)}catch(n){console.log("没有找到sendNotify.js文件")}console.log(`${n}\n${o}\n${c}\n\n`)}
// prettier-ignore
function Request(t){const e=t.hasOwnProperty("method")?t.method.toLocaleLowerCase():"get";if($.isNode()&&t.hasOwnProperty("use_proxy")&&t.use_proxy){const e=require("tunnel"),o={https:e.httpsOverHttp({proxy:{host:"127.0.0.1",port:7890}})};Object.assign(t,{agent:o})}return new Promise((o,r)=>{$.http[e](t).then(t=>{var e=t.body;"string"!=typeof e||/(head|html)>/.test(e)||(e=JSON.parse(e)),o(e)}).catch(t=>r(t))})}
// prettier-ignore
function Env(t, e) { class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `\ud83d\udd14${this.name}, \u5f00\u59cb!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), a = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(a, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t) { let e = { "M+": (new Date).getMonth() + 1, "d+": (new Date).getDate(), "H+": (new Date).getHours(), "m+": (new Date).getMinutes(), "s+": (new Date).getSeconds(), "q+": Math.floor(((new Date).getMonth() + 3) / 3), S: (new Date).getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, ((new Date).getFullYear() + "").substr(4 - RegExp.$1.length))); for (let s in e) new RegExp("(" + s + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? e[s] : ("00" + e[s]).substr(("" + e[s]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))); let h = ["", "==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="]; h.push(e), s && h.push(s), i && h.push(i), console.log(h.join("\n")), this.logs = this.logs.concat(h) } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t.stack) : this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }
