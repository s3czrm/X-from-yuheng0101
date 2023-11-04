const $ = new Env("青龙");

let QL_HOST = "";

let QL_CLIENT_ID = "";

let QL_CLIENT_SECRET = "";

let ql = null;

!(async () => {
  $.env.isNode && require("dotenv").config();

  QL_HOST =
    ($.env.isNode ? process.env.QL_HOST : $.getdata("yuheng_ql_host")) || "";

  QL_CLIENT_ID =
    ($.env.isNode
      ? process.env.QL_CLIENT_ID
      : $.getdata("yuheng_ql_clientid")) || "";

  QL_CLIENT_SECRET =
    ($.env.isNode
      ? process.env.QL_CLIENT_SECRET
      : $.getdata("yuheng_ql_clientsecret")) || "";

  if (!QL_HOST || !QL_CLIENT_ID || !QL_CLIENT_SECRET) {
    $.log("❌请填写青龙面板地址和密钥");
    return;
  }
  console.log(
    `获取到的青龙面板地址: ${QL_HOST}\n获取到的青龙面板 Client_ID: ${QL_CLIENT_ID}\n获取到的青龙面板 Client_Secret: ${QL_CLIENT_SECRET}\n`
  );
  ql = new QingLong(QL_HOST, QL_CLIENT_ID, QL_CLIENT_SECRET);
  if (!QL_HOST || !QL_CLIENT_ID || !QL_CLIENT_SECRET) {
    $.log("请填写青龙面板地址和密钥");
    return;
  }
  try {
    await ql.checkLogin();
    if (ql.token) {
      $.notify("青龙面板", "", "✅测试连接成功！");
    } else {
      $.notify("青龙面板", "", "❌测试连接失败, 请检查账号密码是否正确!");
    }
  } catch (e) {
    throw e;
  }
})()
  .catch((e) => $.log("", `❌ ${$.name}, 失败! 原因: ${e}!`, ""))
  .finally(() => $.done());
/*
对接青龙面板
适配 Node.js、QX、Loon、Surge等平台
*/
function QingLong(HOST, Client_ID, Client_Secret) {
  return new (class {
    /**
     * 对接青龙API
     * @param {*} HOST http://127.0.0.1:5700
     * @param {*} Client_ID xxx
     * @param {*} Client_Secret xxx
     */
    constructor(HOST, Client_ID, Client_Secret) {
      this.host = HOST ? (HOST.endsWith("/") ? HOST : HOST + "/") : "";
      this.clientId = Client_ID;
      this.clientSecret = Client_Secret;
      this.token = "";
      this.envs = [];
    }
    // 检查登录状态
    async checkLogin() {
      var tokenObj = JSON.parse($.getdata("yuheng_ql_token") || "{}");
      if (Object.keys(tokenObj).length) {
        const { token, expiration } = tokenObj;
        const currentTime = new Date().getTime();
        if (currentTime > expiration) {
          $.log("❌The token has expired");
          await this.getAuthToken();
        } else {
          this.token = token;
          $.log(
            `✅The token is successfully obtained (${
              this.token
            }) from cache and is valid until ${$.time(
              "yyyy-MM-dd HH:mm:ss",
              expiration
            )}`
          );
        }
      } else {
        await this.getAuthToken();
      }
    }
    // 获取用户密钥
    async getAuthToken() {
      const options = {
        url: `${this.host}open/auth/token`,
        params: {
          client_id: this.clientId,
          client_secret: this.clientSecret,
        },
      };
      try {
        const { code, data, message } = await $.request(options);
        if (code === 200) {
          const { token, token_type, expiration } = data;
          $.log(
            `✅The token is successfully obtained: ${token} and is valid until ${$.time(
              "yyyy-MM-dd HH:mm:ss",
              expiration * 1e3
            )}`
          );
          this.token = `${token_type} ${token}`;
          $.setdata(
            JSON.stringify({
              token: this.token,
              expiration: expiration * 1e3,
            }),
            "yuheng_ql_token"
          );
        } else {
          throw message || "Failed to obtain user token.";
        }
      } catch (e) {
        throw e
          ? typeof e === "object"
            ? JSON.stringify(e)
            : e
          : "Network Error.";
      }
    }
    /**
     * 获取所有环境变量详情
     */
    async getEnvs() {
      const options = {
        url: `${this.host}open/envs`,
        headers: {
          Authorization: `${this.token}`,
        },
      };
      try {
        const { code, data, message } = await $.request(options);
        if (code === 200) {
          this.envs = data;
          $.log(`✅Obtaining environment variables succeeded.`);
        } else {
          throw message || `Failed to obtain the environment variable.`;
        }
      } catch (e) {
        throw e
          ? typeof e === "object"
            ? JSON.stringify(e)
            : e
          : "Network Error.";
      }
    }
    // 检查是否存在同名环境变量
    checkEnv({ name, remarks, value }) {
      // 单独处理环境变量名为JD_COOKIE的变量
      const checkJDEnv = () => {
        const pinMatch = value.match(/pin=(.+?);/);
        if (pinMatch) {
          const pin = pinMatch[1];
          const index = this.envs.findIndex((item) =>
            item.value.includes(`pin=${pin};`)
          );
          if (index > -1) {
            $.log(`🆗Pin Matched: ${name}`);
            return index;
          } else {
            $.log(`⭕No Pin Matched`);
            return -1;
          }
        } else {
          $.log(`⭕No Pin Matchedn`);
          return -1;
        }
      };
      if (name === "JD_COOKIE" || name === "JD_R_WSCK") return checkJDEnv();
      const index = this.envs.findIndex((item) => item.name === name);
      if (index === -1) return -1;
      if (remarks) {
        const remarksIndex = this.envs.findIndex(
          (item) => item.remarks === remarks
        );
        if (remarksIndex === -1) return -1;
        return remarksIndex;
      }
    }
    /**
     * 更新/新增环境变量 -> 适用于单个环境变量
     * @param {*} obj {value:'变量值',name:'变量名',remarks:'备注'}
     * @returns {Boolean} true: 成功, false: 失败
     */
    async doUpdate(obj) {
      try {
        await this.checkLogin(); // 检查登录状态
        this.envs.length == 0 && (await this.getEnvs()); // 获取所有环境变量详情
        const _index = this.checkEnv(obj); // 检查是否存在同名环境变量
        // 存在 -> 更新
        if (_index > -1) {
          $.log(`☑️Update the name of the environment variable: ${obj.name}`);
          if (obj.value === this.envs[_index].value) {
            $.log(`⚠️The environment variable value is the same, skipped`);
            return false;
          }
          await this.updateEnv({
            ...obj,
            _id: this.envs[_index]._id,
          });
          // 不存在 -> 添加
        } else {
          $.log(`☑️Add the name of the environment variable: ${obj.name}`);
          await this.addEnv([obj]);
        }
        // 检查插入是否成功
        const { value: afterVal } = await this.getEnvById(
          this.envs[_index]._id
        );
        if (afterVal === obj.value) {
          $.log(`✅The environment variable was updated successfully.`);
          return true;
        } else {
          $.log(`❌Failed to update the environment variable.`);
          return false;
        }
      } catch (e) {
        $.log(`❌Failed to update the environment variable.`);
        return false;
      }
    }
    /**
     * 添加环境变量
     * @param {*} array [{value:'变量值',name:'变量名',remarks:'备注'}]
     */
    async addEnv(array) {
      const options = {
        url: `${this.host}open/envs`,
        method: "post",
        headers: {
          Authorization: `${this.token}`,
          "Content-Type": "application/json;charset=UTF-8",
        },
        body: JSON.stringify(array),
      };
      try {
        const { code, message } = await $.request(options);
        if (code === 200) {
          $.log(`✅The environment variable was added successfully.`);
        } else {
          throw message || "Failed to add the environment variable.";
        }
      } catch (e) {
        throw e
          ? typeof e === "object"
            ? JSON.stringify(e)
            : e
          : "Network Error.";
      }
    }
    /**
     * 修改环境变量
     * @param {*} obj {value:'变量值',name:'变量名',remarks:'备注',id:0}
     */
    async updateEnv(obj) {
      const options = {
        url: `${this.host}open/envs`,
        method: "put",
        headers: {
          Authorization: `${this.token}`,
          "Content-Type": "application/json;charset=UTF-8",
        },
        body: JSON.stringify(obj),
      };
      try {
        const { code, message } = await $.request(options);
        if (code === 200) {
          $.log(`✅The environment variable was updated successfully.`);
          await this.enableEnv([obj._id]);
        } else {
          throw message || "Failed to update the environment variable.";
        }
      } catch (e) {
        throw e
          ? typeof e === "object"
            ? JSON.stringify(e)
            : e
          : "Network Error.";
      }
    }
    /**
     * 删除环境变量
     * @param {*} ids [0,1,2] -> id数组
     */
    async deleteEnv(ids) {
      const options = {
        url: `${this.host}open/envs`,
        method: "delete",
        headers: {
          Authorization: `${this.token}`,
          "Content-Type": "application/json;charset=UTF-8",
        },
        body: JSON.stringify(ids),
      };
      try {
        const { code, message } = await $.request(options);
        if (code === 200) {
          $.log(`✅The environment variable was deleted successfully.`);
        } else {
          throw message || "Failed to delete the environment variable.";
        }
      } catch (e) {
        throw e
          ? typeof e === "object"
            ? JSON.stringify(e)
            : e
          : "Network Error.";
      }
    }
    /**
     * 启用环境变量
     * @param {*} ids [0,1,2] -> id数组
     */
    async enableEnv(ids) {
      const options = {
        url: `${this.host}open/envs/enable`,
        method: "put",
        headers: {
          Authorization: `${this.token}`,
          "Content-Type": "application/json;charset=UTF-8",
        },
        body: JSON.stringify(ids),
      };
      try {
        const { code, message } = await $.request(options);
        if (code === 200) {
          $.log(`✅The environment variable was enabled successfully.`);
        } else {
          throw message || "Failed to enable the environment variable.";
        }
      } catch (e) {
        throw e
          ? typeof e === "object"
            ? JSON.stringify(e)
            : e
          : "Network Error.";
      }
    }
    /**
     * 获取单个环境变量详情
     * @param {*} id
     * @returns 变量id
     */
    async getEnvById(id) {
      const options = {
        url: `${this.host}open/envs/${id}`,
        headers: {
          Authorization: `${this.token}`,
        },
      };
      try {
        const { code, data, message } = await $.request(options);
        if (code === 200) {
          return data;
        } else {
          throw message || `Failed to get the environment variable.`;
        }
      } catch (e) {
        throw e
          ? typeof e === "object"
            ? JSON.stringify(e)
            : e
          : "Network Error.";
      }
    }
  })(HOST, Client_ID, Client_Secret);
}
// prettier-ignore
function Env(e){const t="undefined"!=typeof $task,s="undefined"!=typeof $loon,n="undefined"!=typeof $httpClient&&"undefined"!=typeof $utils,o="function"==typeof require&&"undefined"!=typeof $jsbox,r="function"==typeof require&&!o,i="undefined"!=typeof document,a="undefined"!=typeof $request,h="undefined"!=typeof importModule,l=()=>{const e=(e,t,s,n)=>{var o=function(e){switch(typeof e){case"string":return e;case"boolean":return e?"true":"false";case"number":return isFinite(e)?e:"";default:return""}};return t=t||"&",s=s||"=",null===e&&(e=void 0),"object"==typeof e?Object.keys(e).map(function(n){var r=encodeURIComponent(o(n))+s;return Array.isArray(e[n])?e[n].map(function(e){return r+encodeURIComponent(o(e))}).join(t):r+encodeURIComponent(o(e[n]))}).filter(Boolean).join(t):n?encodeURIComponent(o(n))+s+encodeURIComponent(o(e)):""},t=(e,t,s,n)=>{function o(e,t){return Object.prototype.hasOwnProperty.call(e,t)}t=t||"&",s=s||"=";var r={};if("string"!=typeof e||0===e.length)return r;var i=/\+/g;e=e.split(t);var a=1e3;n&&"number"==typeof n.maxKeys&&(a=n.maxKeys);var h=e.length;a>0&&h>a&&(h=a);for(var l=0;l<h;++l){var d,u,c,p,f=e[l].replace(i,"%20"),y=f.indexOf(s);y>=0?(d=f.substr(0,y),u=f.substr(y+1)):(d=f,u=""),c=decodeURIComponent(d),p=decodeURIComponent(u),o(r,c)?Array.isArray(r[c])?r[c].push(p):r[c]=[r[c],p]:r[c]=p}return r};return{stringify:e,parse:t}},d=(e="")=>{const o=["GET","POST","PUT","DELETE","HEAD","OPTIONS","PATCH"],a=/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,d=(o,d)=>{d="string"==typeof d?{url:d}:d;const u=e.baseURL;if(u&&!a.test(d.url||"")&&(d.url=u?u+d.url:d.url),d.params&&"GET"===o.toUpperCase()){const{stringify:e}=l(),t=e(d.params);d.url=-1===d.url.indexOf("?")?`${d.url}?${t}`:`${d.url}&${t}`}d.body&&d.headers&&!d.headers["Content-Type"]&&(d.headers["Content-Type"]="application/x-www-form-urlencoded"),d={...e,...d};const c=d.timeout,p={onRequest:()=>{},onResponse:e=>e,onTimeout:()=>{},...d.events};let f,y;if(p.onRequest(o,d),t)f=$task.fetch({method:o,...d});else if(s||n||r)f=new Promise((e,t)=>{const s=r?require("request"):$httpClient;s[o.toLowerCase()](d,(s,n,o)=>{s?t(s):e({statusCode:n.status||n.statusCode,headers:n.headers,body:o})})});else if(h){const e=new Request(d.url);e.method=o,e.headers=d.headers,e.body=d.body,f=new Promise((t,s)=>{e.loadString().then(s=>{t({statusCode:e.response.statusCode,headers:e.response.headers,body:s})}).catch(e=>s(e))})}else i&&(f=new Promise((e,t)=>{fetch(d.url,{method:o,headers:d.headers,body:d.body}).then(e=>e.json()).then(t=>e({statusCode:t.status,headers:t.headers,body:t.data})).catch(t)}));const g=c?new Promise((e,t)=>{y=setTimeout(()=>(p.onTimeout(),t(`${o} URL: ${d.url} exceeds the timeout ${c} ms`)),c)}):null;return(g?Promise.race([g,f]).then(e=>(clearTimeout(y),e)):f).then(e=>p.onResponse(e))},u={};return o.forEach(e=>u[e.toLowerCase()]=(t=>d(e,t))),u},u=e=>{const t=["𝟎","𝟏","𝟐","𝟑","𝟒","𝟓","𝟔","𝟕","𝟖","𝟗","𝐚","𝐛","𝐜","𝐝","𝐞","𝐟","𝐠","𝐡","𝐢","𝐣","𝐤","𝐥","𝐦","𝐧","𝐨","𝐩","𝐪","𝐫","𝐬","𝐭","𝐮","𝐯","𝐰","𝐱","𝐲","𝐳","𝐀","𝐁","𝐂","𝐃","𝐄","𝐅","𝐆","𝐇","𝐈","𝐉","𝐊","𝐋","𝐌","𝐍","𝐎","𝐏","𝐐","𝐑","𝐒","𝐓","𝐔","𝐕","𝐖","𝐗","𝐘","𝐙"],s={48:0,49:1,50:2,51:3,52:4,53:5,54:6,55:7,56:8,57:9,65:36,66:37,67:38,68:39,69:40,70:41,71:42,72:43,73:44,74:45,75:46,76:47,77:48,78:49,79:50,80:51,81:52,82:53,83:54,84:55,85:56,86:57,87:58,88:59,89:60,90:61,97:10,98:11,99:12,100:13,101:14,102:15,103:16,104:17,105:18,106:19,107:20,108:21,109:22,110:23,111:24,112:25,113:26,114:27,115:28,116:29,117:30,118:31,119:32,120:33,121:34,122:35};return e.replace(/[0-9A-z]/g,e=>t[s[e.charCodeAt(0)]])};return new class{constructor(){this.name=e,this.env={isQX:t,isLoon:s,isSurge:n,isJSBox:o,isNode:r,isBrowser:i,isRequest:a,isScriptable:h},this.logs=[],this.dataFile="box.dat",this.qs=l(),this.http=d(),this.operator=u,this.startTime=(new Date).getTime(),this.log("",`🔔${this.name}, 开始!`)}request(e){const t=(e.method||"GET").toUpperCase();if(r&&e.hasOwnProperty("use_proxy")&&e.use_proxy){require("dotenv").config();const t=process.env.PROXY_HOST||"127.0.0.1",s=process.env.PROXY_PORT||7890,n=require("tunnel"),o={https:n.httpsOverHttp({proxy:{host:t,port:1*s}})};Object.assign(e,{agent:o})}return new Promise((s,n)=>{this.http[t.toLowerCase()](e).then(e=>{var t=e.body;try{t=JSON.parse(e.body)}catch(e){}s(t)}).catch(e=>n(e))})}loaddata(){if(!r)return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const e=this.path.resolve(this.dataFile),t=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(e),n=!s&&this.fs.existsSync(t);if(!s&&!n)return{};{const n=s?e:t;try{return JSON.parse(this.fs.readFileSync(n))}catch(e){return{}}}}}writedata(){if(r){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const e=this.path.resolve(this.dataFile),t=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(e),n=!s&&this.fs.existsSync(t),o=JSON.stringify(this.data);s?this.fs.writeFileSync(e,o):n?this.fs.writeFileSync(t,o):this.fs.writeFileSync(e,o)}}lodash_get(e,t,s){const n=t.replace(/\[(\d+)\]/g,".$1").split(".");let o=e;for(const e of n)if(o=Object(o)[e],void 0===o)return s;return o}lodash_set(e,t,s){return Object(e)!==e?e:(Array.isArray(t)||(t=t.toString().match(/[^.[\]]+/g)||[]),t.slice(0,-1).reduce((e,s,n)=>Object(e[s])===e[s]?e[s]:e[s]=Math.abs(t[n+1])>>0==+t[n+1]?[]:{},e)[t[t.length-1]]=s,e)}getdata(e){let t=this.getval(e);if(/^@/.test(e)){const[,s,n]=/^@(.*?)\.(.*?)$/.exec(e),o=s?this.getval(s):"";if(o)try{const e=JSON.parse(o);t=e?this.lodash_get(e,n,""):t}catch(e){t=""}}return t}setdata(e,t){let s=!1;if(/^@/.test(t)){const[,n,o]=/^@(.*?)\.(.*?)$/.exec(t),r=this.getval(n),i=n?"null"===r?null:r||"{}":"{}";try{const t=JSON.parse(i);this.lodash_set(t,o,e),s=this.setval(JSON.stringify(t),n)}catch(t){const r={};this.lodash_set(r,o,e),s=this.setval(JSON.stringify(r),n)}}else s=this.setval(e,t);return s}getval(e){return n||s?$persistentStore.read(e):t?$prefs.valueForKey(e):r?(this.data=this.loaddata(),this.data[e]):this.data&&this.data[e]||null}setval(e,o){return n||s?$persistentStore.write(e,o):t?$prefs.setValueForKey(e,o):r?(this.data=this.loaddata(),this.data[o]=e,this.writedata(),!0):this.data&&this.data[o]||null}bLog(...e){e.length>0&&(this.logs=[...this.logs,...e]),console.log(this.operator(e.join("\n")))}log(...e){e.length>0&&(this.logs=[...this.logs,...e]),console.log(e.join("\n"))}notify(e,i="",a="",h={},l=!0){const d=h["open-url"],u=h["media-url"];return new Promise(async c=>{if(t&&$notify(e,i,a,h),n){const t=u?`${a}\n多媒体:${u}`:a;$notification.post(e,i,t,{url:d})}if(s){const t={};d&&(t.openUrl=d),u&&(t.mediaUrl=u),"{}"===JSON.stringify(t)?$notification.post(e,i,a):$notification.post(e,i,a,t)}const p=`${a}${d?`\n点击跳转: ${d}`:""}${u?`\n多媒体: ${u}`:""}`;if(o){const t=require("push");t.schedule({title:e,body:`${i?`${i}\n`:""}${p}`})}if(r&&l)try{const t=require("./sendNotify");await t.sendNotify(`${e}\n${i}`,p)}catch(e){console.log("没有找到sendNotify.js文件")}console.log(`${e}\n${i}\n${p}\n\n`),c()})}time(e,t=null){const s=t?new Date(t):new Date;let n={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(e)&&(e=e.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let t in n)new RegExp("("+t+")").test(e)&&(e=e.replace(RegExp.$1,1==RegExp.$1.length?n[t]:("00"+n[t]).substr((""+n[t]).length)));return e}wait(e){return new Promise(t=>setTimeout(t,e))}done(e={}){const i=(new Date).getTime(),a=(i-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${a} 秒`),t||s||n?$done(e):r&&!o&&"undefined"!=typeof $context&&($context.headers=e.headers,$context.statusCode=e.statusCode,$context.body=e.body)}}(e)}
