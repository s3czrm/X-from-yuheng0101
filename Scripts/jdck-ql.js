/******************************************
 * @name 获取京东 COOKIE 同步青龙
 * @channel https://t.me/yqc_123
 * @feedback https://t.me/yqc_777
 * @version 1.0.0
******************************************
# 获取京东 COOKIE 同步青龙

## 脚本注明

    1. 本脚本仅供学习交流，禁止用于商业用途，违者后果自负。
    2. 转载脚本请注明来源，欢迎分享，拒绝倒卖，倒卖🐕必死🐎。
    3. 欢迎对本仓库(https://github.com/Yuheng0101/X)Star✅，但请不要Fork❌。

## 使用方式

> 使用该脚本前务必需要在 👉 [Boxjs](https://raw.githubusercontent.com/Yuheng0101/X/main/Tasks/boxjs.json)👈 中配置青龙面板的相关参数。

> 由于该脚本使用 [NobyDa 大佬的京东签到脚本](https://raw.githubusercontent.com/NobyDa/Script/master/JD-DailyBonus/JD_DailyBonus.js)获取 CK 的方式进行抓取并同步到青龙面板,所以跟签到脚本不冲突，使用同一组缓存变量。

> Safari 浏览器登录 https://home.m.jd.com/myJd/newhome.action 点击个人中心页面后, 打开app抓包, 提示成功后即可关闭。

## 致谢

[@NobyDa](https://github.com/NobyDa)

[@Peng-YM](https://github.com/Peng-YM)

[@chavyleung](https://github.com/chavyleung)
******************************************

^https:\/\/(api\.m|me-api)\.jd\.com\/api\?functionId=GetJDUserInfoUnionForJD url script-request-header https://raw.githubusercontent.com/Yuheng0101/X/main/Scripts/jdck-ql.js

hostname = me-api.jd.com, api.m.jd.com

******************************************/
const $ = new Env('京东COOKIE同步青龙')

let QL_HOST = ''

let QL_CLIENT_ID = ''

let QL_CLIENT_SECRET = ''

let ql = null

let isSync = true // 是否同步到青龙

!(async () => {
    $.env.isNode && require('dotenv').config()

    QL_HOST = ($.env.isNode ? process.env.QL_HOST : $.getdata('yuheng_ql_host')) || ''

    QL_CLIENT_ID = ($.env.isNode ? process.env.QL_CLIENT_ID : $.getdata('yuheng_ql_clientid')) || ''

    QL_CLIENT_SECRET = ($.env.isNode ? process.env.QL_CLIENT_SECRET : $.getdata('yuheng_ql_clientsecret')) || ''

    // TODO:后续可以增加boxjs配置是否同步到青龙
    if (!QL_HOST || !QL_CLIENT_ID || !QL_CLIENT_SECRET) isSync = false

    isSync && (ql = new QingLong(QL_HOST, QL_CLIENT_ID, QL_CLIENT_SECRET))

    if ($.env.isRequest) {
        await GetCookie()
        return
    }
    // ...
})()
    .catch((e) => $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, ''))
    .finally(() => $.done())

// https://github.com/NobyDa/Script/blob/master/JD-DailyBonus/JD_DailyBonus.js#L1582
function checkFormat(value) {
    //check format and delete duplicates
    let n,
        k,
        c = {}
    return value.reduce((t, i) => {
        k = ((i.cookie || '').match(/(pt_key|pt_pin)=.+?;/g) || []).sort()
        if (k.length == 2) {
            if ((n = k[1]) && !c[n]) {
                i.userName = i.userName ? i.userName : decodeURIComponent(n.split(/pt_pin=(.+?);/)[1])
                i.cookie = k.join('')
                if (i.jrBody && !i.jrBody.includes('reqData=')) {
                    console.log(`异常钢镚Body已过滤: ${i.jrBody}`)
                    delete i.jrBody
                }
                c[n] = t.push(i)
            }
        } else {
            console.log(`异常京东Cookie已过滤: ${i.cookie}`)
        }
        return t
    }, [])
}
function CookieUpdate(oldValue, newValue, path = 'cookie') {
    let item,
        type,
        name = (oldValue || newValue || '').split(/pt_pin=(.+?);/)[1]
    let total = $.getdata('CookiesJD')
    try {
        total = checkFormat(JSON.parse(total || '[]'))
    } catch (e) {
        $.notify('京东签到', '', 'Cookie JSON格式不正确, 即将清空\n可前往日志查看该数据内容!')
        console.log(`京东签到Cookie JSON格式异常: ${e.message || e}\n旧数据内容: ${total}`)
        total = []
    }
    for (let i = 0; i < total.length; i++) {
        if (total[i].cookie && new RegExp(`pt_pin=${name};`).test(total[i].cookie)) {
            item = i
            break
        }
    }
    if (newValue && item !== undefined) {
        type = total[item][path] === newValue ? -1 : 2
        total[item][path] = newValue
        item = item + 1
    } else if (newValue && path === 'cookie') {
        total.push({
            cookie: newValue
        })
        type = 1
        item = total.length
    }
    return {
        total: checkFormat(total),
        type, //-1: same, 1: add, 2:update
        item,
        name: decodeURIComponent(name)
    }
}
async function GetCookie() {
    const req = $request
    let Message = ''
    if (req.method != 'OPTIONS' && req.headers) {
        const CV = req.headers['Cookie'] || req.headers['cookie'] || ''
        const ckItems = CV.match(/(pt_key|pt_pin)=.+?;/g)
        if (/^https:\/\/(me-|)api(\.m|)\.jd\.com\/api/.test(req.url)) {
            if (ckItems && ckItems.length == 2) {
                const value = CookieUpdate(null, ckItems.join(''))
                if (value.type !== -1) {
                    const write = $.setdata(JSON.stringify(value.total, null, 2), 'CookiesJD')
                    Message += `${value.type == 2 ? `更新` : `写入`}京东 [账号${value.item}] Cookie${
                        write ? `成功 🎉` : `失败 ‼️`
                    }`
                    await $.notify(`用户名: ${value.name}`, ``, Message)
                } else {
                    console.log(`\n用户名: ${value.name}\n与历史京东 [账号${value.item}] Cookie相同, 跳过写入 ⚠️`)
                }
                if (isSync) {
                    try {
                        const isUpdated = await ql.doUpdate({
                            name: 'JD_COOKIE',
                            value: `${ckItems.join('')}`
                        })
                        if (isUpdated) {
                            $.notify(`用户名: ${value.name}`, ``, `同步青龙成功 🎉`)
                        }
                    } catch (e) {
                        console.log(e)
                    }
                }
            } else {
                throw new Error('写入Cookie失败, 关键值缺失\n可能原因: 非网页获取 ‼️')
            }
        } else if (req.url === 'http://www.apple.com/') {
            throw new Error('类型错误, 手动运行请选择上下文环境为Cron ⚠️')
        }
    } else if (!req.headers) {
        throw new Error('写入Cookie失败, 请检查匹配URL或配置内脚本类型 ⚠️')
    }
}
// prettier-ignore
function QingLong(e,t,n){return new class{constructor(e,t,n){this.host=e?e.endsWith("/")?e:e+"/":"",this.clientId=t,this.clientSecret=n,this.token="",this.envs=[]}async checkLogin(){var e=JSON.parse($.getdata("yuheng_ql_token")||"{}");if(Object.keys(e).length){const{token:t,expiration:n}=e,i=(new Date).getTime();i>n?($.log("❌The token has expired"),await this.getAuthToken()):(this.token=t,$.log(`✅The token is successfully obtained (${this.token}) from cache and is valid until ${$.time("yyyy-MM-dd HH:mm:ss",n)}`))}else await this.getAuthToken()}async getAuthToken(){const e={url:`${this.host}open/auth/token`,params:{client_id:this.clientId,client_secret:this.clientSecret}};try{const{code:t,data:n,message:i}=await $.request(e);if(200!==t)throw i||"Failed to obtain user token.";{const{token:e,token_type:t,expiration:i}=n;$.log(`✅The token is successfully obtained: ${e} and is valid until ${$.time("yyyy-MM-dd HH:mm:ss",1e3*i)}`),this.token=`${t} ${e}`,$.setdata(JSON.stringify({token:this.token,expiration:1e3*i}),"yuheng_ql_token")}}catch(e){throw e?"object"==typeof e?JSON.stringify(e):e:"Network Error."}}async getEnvs(){const e={url:`${this.host}open/envs`,headers:{Authorization:`${this.token}`}};try{const{code:t,data:n,message:i}=await $.request(e);if(200!==t)throw i||"Failed to obtain the environment variable.";this.envs=n,$.log("✅Obtaining environment variables succeeded.")}catch(e){throw e?"object"==typeof e?JSON.stringify(e):e:"Network Error."}}checkEnv({name:e,remarks:t,value:n}){const i=()=>{const t=n.match(/pin=(.+?);/);if(t){const n=t[1],i=this.envs.findIndex(e=>e.value.includes(`pin=${n};`));return i>-1?($.log(`🆗Pin Matched: ${e}`),i):($.log("⭕No Pin Matched"),-1)}return $.log("⭕No Pin Matchedn"),-1};if("JD_COOKIE"===e||"JD_R_WSCK"===e)return i();const o=this.envs.findIndex(t=>t.name===e);if(-1===o)return-1;if(t){const e=this.envs.findIndex(e=>e.remarks===t);return-1===e?-1:e}}async doUpdate(e){try{await this.checkLogin(),0==this.envs.length&&await this.getEnvs();const t=this.checkEnv(e);if(t>-1){if($.log(`☑️Update the name of the environment variable: ${e.name}`),e.value===this.envs[t].value)return $.log("⚠️The environment variable value is the same, skipped"),!1;await this.updateEnv({...e,_id:this.envs[t]._id})}else $.log(`☑️Add the name of the environment variable: ${e.name}`),await this.addEnv([e]);const{value:n}=await this.getEnvById(this.envs[t]._id);return n===e.value?($.log("✅The environment variable was updated successfully."),!0):($.log("❌Failed to update the environment variable."),!1)}catch(e){return $.log("❌Failed to update the environment variable."),!1}}async addEnv(e){const t={url:`${this.host}open/envs`,method:"post",headers:{Authorization:`${this.token}`,"Content-Type":"application/json;charset=UTF-8"},body:JSON.stringify(e)};try{const{code:e,message:n}=await $.request(t);if(200!==e)throw n||"Failed to add the environment variable.";$.log("✅The environment variable was added successfully.")}catch(e){throw e?"object"==typeof e?JSON.stringify(e):e:"Network Error."}}async updateEnv(e){const t={url:`${this.host}open/envs`,method:"put",headers:{Authorization:`${this.token}`,"Content-Type":"application/json;charset=UTF-8"},body:JSON.stringify(e)};try{const{code:n,message:i}=await $.request(t);if(200!==n)throw i||"Failed to update the environment variable.";$.log("✅The environment variable was updated successfully."),await this.enableEnv([e._id])}catch(e){throw e?"object"==typeof e?JSON.stringify(e):e:"Network Error."}}async deleteEnv(e){const t={url:`${this.host}open/envs`,method:"delete",headers:{Authorization:`${this.token}`,"Content-Type":"application/json;charset=UTF-8"},body:JSON.stringify(e)};try{const{code:e,message:n}=await $.request(t);if(200!==e)throw n||"Failed to delete the environment variable.";$.log("✅The environment variable was deleted successfully.")}catch(e){throw e?"object"==typeof e?JSON.stringify(e):e:"Network Error."}}async enableEnv(e){const t={url:`${this.host}open/envs/enable`,method:"put",headers:{Authorization:`${this.token}`,"Content-Type":"application/json;charset=UTF-8"},body:JSON.stringify(e)};try{const{code:e,message:n}=await $.request(t);if(200!==e)throw n||"Failed to enable the environment variable.";$.log("✅The environment variable was enabled successfully.")}catch(e){throw e?"object"==typeof e?JSON.stringify(e):e:"Network Error."}}async getEnvById(e){const t={url:`${this.host}open/envs/${e}`,headers:{Authorization:`${this.token}`}};try{const{code:e,data:n,message:i}=await $.request(t);if(200===e)return n;throw i||"Failed to get the environment variable."}catch(e){throw e?"object"==typeof e?JSON.stringify(e):e:"Network Error."}}}(e,t,n)}
// prettier-ignore
function Env(e){const t="undefined"!=typeof $task,s="undefined"!=typeof $loon,n="undefined"!=typeof $httpClient&&"undefined"!=typeof $utils,o="function"==typeof require&&"undefined"!=typeof $jsbox,r="function"==typeof require&&!o,i="undefined"!=typeof document,a="undefined"!=typeof $request,h="undefined"!=typeof importModule,l=()=>{const e=(e,t,s,n)=>{var o=function(e){switch(typeof e){case"string":return e;case"boolean":return e?"true":"false";case"number":return isFinite(e)?e:"";default:return""}};return t=t||"&",s=s||"=",null===e&&(e=void 0),"object"==typeof e?Object.keys(e).map(function(n){var r=encodeURIComponent(o(n))+s;return Array.isArray(e[n])?e[n].map(function(e){return r+encodeURIComponent(o(e))}).join(t):r+encodeURIComponent(o(e[n]))}).filter(Boolean).join(t):n?encodeURIComponent(o(n))+s+encodeURIComponent(o(e)):""},t=(e,t,s,n)=>{function o(e,t){return Object.prototype.hasOwnProperty.call(e,t)}t=t||"&",s=s||"=";var r={};if("string"!=typeof e||0===e.length)return r;var i=/\+/g;e=e.split(t);var a=1e3;n&&"number"==typeof n.maxKeys&&(a=n.maxKeys);var h=e.length;a>0&&h>a&&(h=a);for(var l=0;l<h;++l){var d,u,c,p,f=e[l].replace(i,"%20"),y=f.indexOf(s);y>=0?(d=f.substr(0,y),u=f.substr(y+1)):(d=f,u=""),c=decodeURIComponent(d),p=decodeURIComponent(u),o(r,c)?Array.isArray(r[c])?r[c].push(p):r[c]=[r[c],p]:r[c]=p}return r};return{stringify:e,parse:t}},d=(e="")=>{const o=["GET","POST","PUT","DELETE","HEAD","OPTIONS","PATCH"],a=/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,d=(o,d)=>{d="string"==typeof d?{url:d}:d;const u=e.baseURL;if(u&&!a.test(d.url||"")&&(d.url=u?u+d.url:d.url),d.params&&"GET"===o.toUpperCase()){const{stringify:e}=l(),t=e(d.params);d.url=-1===d.url.indexOf("?")?`${d.url}?${t}`:`${d.url}&${t}`}d.body&&d.headers&&!d.headers["Content-Type"]&&(d.headers["Content-Type"]="application/x-www-form-urlencoded"),d={...e,...d};const c=d.timeout,p={onRequest:()=>{},onResponse:e=>e,onTimeout:()=>{},...d.events};let f,y;if(p.onRequest(o,d),t)f=$task.fetch({method:o,...d});else if(s||n||r)f=new Promise((e,t)=>{const s=r?require("request"):$httpClient;s[o.toLowerCase()](d,(s,n,o)=>{s?t(s):e({statusCode:n.status||n.statusCode,headers:n.headers,body:o})})});else if(h){const e=new Request(d.url);e.method=o,e.headers=d.headers,e.body=d.body,f=new Promise((t,s)=>{e.loadString().then(s=>{t({statusCode:e.response.statusCode,headers:e.response.headers,body:s})}).catch(e=>s(e))})}else i&&(f=new Promise((e,t)=>{fetch(d.url,{method:o,headers:d.headers,body:d.body}).then(e=>e.json()).then(t=>e({statusCode:t.status,headers:t.headers,body:t.data})).catch(t)}));const g=c?new Promise((e,t)=>{y=setTimeout(()=>(p.onTimeout(),t(`${o} URL: ${d.url} exceeds the timeout ${c} ms`)),c)}):null;return(g?Promise.race([g,f]).then(e=>(clearTimeout(y),e)):f).then(e=>p.onResponse(e))},u={};return o.forEach(e=>u[e.toLowerCase()]=(t=>d(e,t))),u},u=e=>{const t=["𝟎","𝟏","𝟐","𝟑","𝟒","𝟓","𝟔","𝟕","𝟖","𝟗","𝐚","𝐛","𝐜","𝐝","𝐞","𝐟","𝐠","𝐡","𝐢","𝐣","𝐤","𝐥","𝐦","𝐧","𝐨","𝐩","𝐪","𝐫","𝐬","𝐭","𝐮","𝐯","𝐰","𝐱","𝐲","𝐳","𝐀","𝐁","𝐂","𝐃","𝐄","𝐅","𝐆","𝐇","𝐈","𝐉","𝐊","𝐋","𝐌","𝐍","𝐎","𝐏","𝐐","𝐑","𝐒","𝐓","𝐔","𝐕","𝐖","𝐗","𝐘","𝐙"],s={48:0,49:1,50:2,51:3,52:4,53:5,54:6,55:7,56:8,57:9,65:36,66:37,67:38,68:39,69:40,70:41,71:42,72:43,73:44,74:45,75:46,76:47,77:48,78:49,79:50,80:51,81:52,82:53,83:54,84:55,85:56,86:57,87:58,88:59,89:60,90:61,97:10,98:11,99:12,100:13,101:14,102:15,103:16,104:17,105:18,106:19,107:20,108:21,109:22,110:23,111:24,112:25,113:26,114:27,115:28,116:29,117:30,118:31,119:32,120:33,121:34,122:35};return e.replace(/[0-9A-z]/g,e=>t[s[e.charCodeAt(0)]])};return new class{constructor(){this.name=e,this.env={isQX:t,isLoon:s,isSurge:n,isJSBox:o,isNode:r,isBrowser:i,isRequest:a,isScriptable:h},this.logs=[],this.dataFile="box.dat",this.qs=l(),this.http=d(),this.operator=u,this.startTime=(new Date).getTime(),this.log("",`🔔${this.name}, 开始!`)}request(e){const t=(e.method||"GET").toUpperCase();if(r&&e.hasOwnProperty("use_proxy")&&e.use_proxy){require("dotenv").config();const t=process.env.PROXY_HOST||"127.0.0.1",s=process.env.PROXY_PORT||7890,n=require("tunnel"),o={https:n.httpsOverHttp({proxy:{host:t,port:1*s}})};Object.assign(e,{agent:o})}return new Promise((s,n)=>{this.http[t.toLowerCase()](e).then(e=>{var t=e.body;try{t=JSON.parse(e.body)}catch(e){}s(t)}).catch(e=>n(e))})}loaddata(){if(!r)return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const e=this.path.resolve(this.dataFile),t=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(e),n=!s&&this.fs.existsSync(t);if(!s&&!n)return{};{const n=s?e:t;try{return JSON.parse(this.fs.readFileSync(n))}catch(e){return{}}}}}writedata(){if(r){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const e=this.path.resolve(this.dataFile),t=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(e),n=!s&&this.fs.existsSync(t),o=JSON.stringify(this.data);s?this.fs.writeFileSync(e,o):n?this.fs.writeFileSync(t,o):this.fs.writeFileSync(e,o)}}lodash_get(e,t,s){const n=t.replace(/\[(\d+)\]/g,".$1").split(".");let o=e;for(const e of n)if(o=Object(o)[e],void 0===o)return s;return o}lodash_set(e,t,s){return Object(e)!==e?e:(Array.isArray(t)||(t=t.toString().match(/[^.[\]]+/g)||[]),t.slice(0,-1).reduce((e,s,n)=>Object(e[s])===e[s]?e[s]:e[s]=Math.abs(t[n+1])>>0==+t[n+1]?[]:{},e)[t[t.length-1]]=s,e)}getdata(e){let t=this.getval(e);if(/^@/.test(e)){const[,s,n]=/^@(.*?)\.(.*?)$/.exec(e),o=s?this.getval(s):"";if(o)try{const e=JSON.parse(o);t=e?this.lodash_get(e,n,""):t}catch(e){t=""}}return t}setdata(e,t){let s=!1;if(/^@/.test(t)){const[,n,o]=/^@(.*?)\.(.*?)$/.exec(t),r=this.getval(n),i=n?"null"===r?null:r||"{}":"{}";try{const t=JSON.parse(i);this.lodash_set(t,o,e),s=this.setval(JSON.stringify(t),n)}catch(t){const r={};this.lodash_set(r,o,e),s=this.setval(JSON.stringify(r),n)}}else s=this.setval(e,t);return s}getval(e){return n||s?$persistentStore.read(e):t?$prefs.valueForKey(e):r?(this.data=this.loaddata(),this.data[e]):this.data&&this.data[e]||null}setval(e,o){return n||s?$persistentStore.write(e,o):t?$prefs.setValueForKey(e,o):r?(this.data=this.loaddata(),this.data[o]=e,this.writedata(),!0):this.data&&this.data[o]||null}bLog(...e){e.length>0&&(this.logs=[...this.logs,...e]),console.log(this.operator(e.join("\n")))}log(...e){e.length>0&&(this.logs=[...this.logs,...e]),console.log(e.join("\n"))}notify(e,i="",a="",h={},l=!0){const d=h["open-url"],u=h["media-url"];return new Promise(async c=>{if(t&&$notify(e,i,a,h),n){const t=u?`${a}\n多媒体:${u}`:a;$notification.post(e,i,t,{url:d})}if(s){const t={};d&&(t.openUrl=d),u&&(t.mediaUrl=u),"{}"===JSON.stringify(t)?$notification.post(e,i,a):$notification.post(e,i,a,t)}const p=`${a}${d?`\n点击跳转: ${d}`:""}${u?`\n多媒体: ${u}`:""}`;if(o){const t=require("push");t.schedule({title:e,body:`${i?`${i}\n`:""}${p}`})}if(r&&l)try{const t=require("./sendNotify");await t.sendNotify(`${e}\n${i}`,p)}catch(e){console.log("没有找到sendNotify.js文件")}console.log(`${e}\n${i}\n${p}\n\n`),c()})}time(e,t=null){const s=t?new Date(t):new Date;let n={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(e)&&(e=e.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let t in n)new RegExp("("+t+")").test(e)&&(e=e.replace(RegExp.$1,1==RegExp.$1.length?n[t]:("00"+n[t]).substr((""+n[t]).length)));return e}wait(e){return new Promise(t=>setTimeout(t,e))}done(e={}){const i=(new Date).getTime(),a=(i-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${a} 秒`),t||s||n?$done(e):r&&!o&&"undefined"!=typeof $context&&($context.headers=e.headers,$context.statusCode=e.statusCode,$context.body=e.body)}}(e)}
