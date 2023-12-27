/******************************************
 * @name 绿色产业链通杀
 * @description 好男人专用脚本
 * @channel https://t.me/yqc_123
 * @feedback https://t.me/yqc_777
 * @version 2.0.1
******************************************

## 脚本注明

1. 脚本只是针对基于 Quantumult X 和 Surge 对 Javascript 和 WEB 逆向的学习，不得用于商业用途，否则后果自负。
2. 不保证脚本合法性、准确性、有效性，请根据情况自行判断，本人对此不承担任何保证责任。
3. 本人对任何脚本引发的问题概不负责，包括但不限于由脚本错误引起的任何损失和损害。
4. 转载脚本请注明来源，欢迎分享，拒绝倒卖，倒卖 🐕 必死 🐎。
5. 如果任何单位或个人认为此脚本可能涉嫌侵犯其权利，应及时通知并提供身份证明，所有权证明，我们将在收到认证文件确认后删除此脚本。
6. 所有直接或间接使用、查看此脚本的人均应该仔细阅读此声明, 本人保留随时更改或补充此声明的权利, 一旦您使用或复制了此脚本，即视为您已接受此免责声明。
7. 欢迎对[本仓库](https://github.com/Yuheng0101/X)Star✅，但请不要 Fork❌。

[50 度灰](https://50.aff009.net/)

[91 短视频](https://ba65.eimkeb.com)

[微密圈](https://app.wmq.life/)

[撸先生](https://657.jgespu.com/)

******************************************

hostname = *.bmafdxt.com, *.yxlauhm.com, *.psovzwr.com, *.50*pi.com, *.wmq*api*.com, *.tbrapi.org, *.hichatapi.com, *.longyuandingyi.com,*.zihzot.com,*.snowing.ren,*.vzcnqmr.cn,*beibeini3.cn,*.pili01a.net,*.hhclyjz.cn, *.bhhcdou.cn, *.xuxivwx.cn, *.sdtuxyh.cn, *.kngpdsz.cn, *.sugugaj.cn, *.mqqjrv.com, *.gnikvh.com, *.auhvylo.cn, *.hefeixcx.xyz

# 91短视频
^https?:\/\/.*(bmafdxt|yxlauhm|psovzwr).com/pwa.php url script-analyze-echo-response https://raw.githubusercontent.com/Yuheng0101/X/main/Scripts/lsp.js
# 50度灰
^https?:\/\/.*50.*pi.com/pwa.php/api/(user/userinfo|MvDetail/(detail|xiao_detail)|home/(getOpenAdsAndVersion|appcenter)|system/getad) url script-response-body https://raw.githubusercontent.com/Yuheng0101/X/main/Scripts/lsp.js
# 微密圈
^https?:\/\/.*(wmq.*api\d+).com/pwa.php url script-analyze-echo-response https://raw.githubusercontent.com/Yuheng0101/X/main/Scripts/lsp.js
# 撸先生
^https?:\/\/.*hichatapi.+\/api\.php$ url script-analyze-echo-response https://raw.githubusercontent.com/Yuheng0101/X/main/Scripts/lsp.js
# 𝐀𝐋𝐋
^(https?:\/\/)(?!long)([^./]+\.)*(longyuandingyi.com|zihzot.com|snowing.ren|vzcnqmr.cn|beibeini3.cn|pili01a.net|hhclyjz.cn|bhhcdou.cn|xuxivwx.cn|sdtuxyh.cn|kngpdsz.cn|sugugaj.cn|mqqjrv.com|gnikvh.com|auhvylo.cn|hefeixcx.xyz)(\/.*)? url 302 $1long.$3$4

******************************************/
// const server = `http://192.168.10.2:7788` // 测试服
const server = `https://welfare.yuheng.best` // 正式服
const $ = new Env(`绿色产业链通杀`)
const { origin } = ObjectKeys2LowerCase($request.headers)
$.isResBody = typeof $response != 'undefined' && $response?.body
$.is91dsp = /dsp\d+/.test(origin) // 91短视频
$.iswmq = /wmq(|api)\d+/.test($request.url) // 微密圈
$.is50dh = /hui\d+/.test(origin) // 50度灰
$.islusir = /hichatapi/.test($request.url) // 撸先生
$.isPWA = /(pwa|api).php$/.test($request.url) // 结尾是pwa.php的请求
// prettier-ignore
$.defaultReq=()=>new Promise((e,r)=>{$.post({url:$request.url,headers:$request.headers,body:$request.body},(s,o,t)=>{s?r(s):e(o)})});
$.defaultResponse = { body: $.isResBody ? $response.body : '{}' }
// prettier-ignore
$.request=((e,s)=>new Promise(async(t,a)=>{$.isPWA&&($.defaultResponse=await $.defaultReq(),$.defaultResponse.status="HTTP/1.1 200 OK",delete $.defaultResponse.headers["Content-Encoding"],delete $.defaultResponse.headers["Transfer-Encoding"],delete $.defaultResponse.headers["Content-Length"]);let{body:n}=$.defaultResponse;try{n=JSON.parse(n)}catch(e){}$.post({url:server+"/api/91series/rewrite",method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({hy:e,yh:n.data,appid:s})},(e,s,d)=>{e?($.logErr(e),a(e)):(n.data=d,$.defaultResponse.body=JSON.stringify(n),t())})}));
;(async () => {
    try {
        // 91短视频
        if ($.is91dsp) {
            await $.request($request.body, `91dsp`)
        }
        // 50度灰
        else if ($.is50dh) {
            await $.request($request.url, `50dh`)
        }
        // 微密圈
        else if ($.iswmq) {
            await $.request($request.body, `wmq`)
        }
        // 撸先生
        else if ($.islusir) {
            await $.request($request.body, `lxs`)
        }
    } catch (e) {
        $.log(`❗️${$.name}, 请求异常!`, e)
    } finally {
        // prettier-ignore
        $.isPWA?$.isQuanX()?$.done({status:$.defaultResponse.status,headers:$.defaultResponse.headers,body:$.defaultResponse.body}):$.done({response:{status:200,headers:$.defaultResponse.headers,body:$.defaultResponse.body}}):$.done({body:$.defaultResponse.body});
    }
})()
/**
 * 对象属性转小写
 * @param {*} obj
 * @returns
 */
function ObjectKeys2LowerCase(obj) {
    let result = {}
    for (let key in obj) {
        result[key.toLowerCase()] = obj[key]
    }
    return result
}
// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,a)=>{s.call(this,t,(t,s,r)=>{t?a(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}getEnv(){return"undefined"!=typeof $environment&&$environment["surge-version"]?"Surge":"undefined"!=typeof $environment&&$environment["stash-version"]?"Stash":"undefined"!=typeof module&&module.exports?"Node.js":"undefined"!=typeof $task?"Quantumult X":"undefined"!=typeof $loon?"Loon":"undefined"!=typeof $rocket?"Shadowrocket":void 0}isNode(){return"Node.js"===this.getEnv()}isQuanX(){return"Quantumult X"===this.getEnv()}isSurge(){return"Surge"===this.getEnv()}isLoon(){return"Loon"===this.getEnv()}isShadowrocket(){return"Shadowrocket"===this.getEnv()}isStash(){return"Stash"===this.getEnv()}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const a=this.getdata(t);if(a)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,a)=>e(a))})}runScript(t,e){return new Promise(s=>{let a=this.getdata("@chavy_boxjs_userCfgs.httpapi");a=a?a.replace(/\n/g,"").trim():a;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[i,o]=a.split("@"),n={url:`http://${o}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":i,Accept:"*/*"},timeout:r};this.post(n,(t,e,a)=>s(a))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),a=!s&&this.fs.existsSync(e);if(!s&&!a)return{};{const a=s?t:e;try{return JSON.parse(this.fs.readFileSync(a))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),a=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):a?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const a=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of a)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,a)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[a+1])>>0==+e[a+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,a]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,a,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,a,r]=/^@(.*?)\.(.*?)$/.exec(e),i=this.getval(a),o=a?"null"===i?null:i||"{}":"{}";try{const e=JSON.parse(o);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),a)}catch(e){const i={};this.lodash_set(i,r,t),s=this.setval(JSON.stringify(i),a)}}else s=this.setval(t,e);return s}getval(t){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.read(t);case"Quantumult X":return $prefs.valueForKey(t);case"Node.js":return this.data=this.loaddata(),this.data[t];default:return this.data&&this.data[t]||null}}setval(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.write(t,e);case"Quantumult X":return $prefs.setValueForKey(t,e);case"Node.js":return this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0;default:return this.data&&this.data[e]||null}}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){switch(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"],delete t.headers["content-type"],delete t.headers["content-length"]),t.params&&(t.url+="?"+this.queryStr(t.params)),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,a)=>{!t&&s&&(s.body=a,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,a)});break;case"Quantumult X":this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:a,headers:r,body:i,bodyBytes:o}=t;e(null,{status:s,statusCode:a,headers:r,body:i,bodyBytes:o},i,o)},t=>e(t&&t.error||"UndefinedError"));break;case"Node.js":let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:a,statusCode:r,headers:i,rawBody:o}=t,n=s.decode(o,this.encoding);e(null,{status:a,statusCode:r,headers:i,rawBody:o,body:n},n)},t=>{const{message:a,response:r}=t;e(a,r,r&&s.decode(r.rawBody,this.encoding))})}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";switch(t.body&&t.headers&&!t.headers["Content-Type"]&&!t.headers["content-type"]&&(t.headers["content-type"]="application/x-www-form-urlencoded"),t.headers&&(delete t.headers["Content-Length"],delete t.headers["content-length"]),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,a)=>{!t&&s&&(s.body=a,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,a)});break;case"Quantumult X":t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:a,headers:r,body:i,bodyBytes:o}=t;e(null,{status:s,statusCode:a,headers:r,body:i,bodyBytes:o},i,o)},t=>e(t&&t.error||"UndefinedError"));break;case"Node.js":let a=require("iconv-lite");this.initGotEnv(t);const{url:r,...i}=t;this.got[s](r,i).then(t=>{const{statusCode:s,statusCode:r,headers:i,rawBody:o}=t,n=a.decode(o,this.encoding);e(null,{status:s,statusCode:r,headers:i,rawBody:o,body:n},n)},t=>{const{message:s,response:r}=t;e(s,r,r&&a.decode(r.rawBody,this.encoding))})}}time(t,e=null){const s=e?new Date(e):new Date;let a={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in a)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?a[e]:("00"+a[e]).substr((""+a[e]).length)));return t}queryStr(t){let e="";for(const s in t){let a=t[s];null!=a&&""!==a&&("object"==typeof a&&(a=JSON.stringify(a)),e+=`${s}=${a}&`)}return e=e.substring(0,e.length-1),e}msg(e=t,s="",a="",r){const i=t=>{switch(typeof t){case void 0:return t;case"string":switch(this.getEnv()){case"Surge":case"Stash":default:return{url:t};case"Loon":case"Shadowrocket":return t;case"Quantumult X":return{"open-url":t};case"Node.js":return}case"object":switch(this.getEnv()){case"Surge":case"Stash":case"Shadowrocket":default:{let e=t.url||t.openUrl||t["open-url"];return{url:e}}case"Loon":{let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}case"Quantumult X":{let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl,a=t["update-pasteboard"]||t.updatePasteboard;return{"open-url":e,"media-url":s,"update-pasteboard":a}}case"Node.js":return}default:return}};if(!this.isMute)switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:$notification.post(e,s,a,i(r));break;case"Quantumult X":$notify(e,s,a,i(r));break;case"Node.js":}if(!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),a&&t.push(a),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:this.log("",`❗️${this.name}, 错误!`,t);break;case"Node.js":this.log("",`❗️${this.name}, 错误!`,t.stack)}}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;switch(this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:$done(t);break;case"Node.js":process.exit(1)}}}(t,e)}
