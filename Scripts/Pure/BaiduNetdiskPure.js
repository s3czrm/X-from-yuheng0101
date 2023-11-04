/******************************************
 * @name 百度网盘净化
 * @description 仅限11.14.0版本|去除个人页面借贷广告
 * @statement 仅供学习交流|禁止用于商业用途|违者后果自负|
 * @statement 转载请注明来源|欢迎分享|拒绝倒卖|倒卖🐕必死🐎
 * @channel https://t.me/yqc_123/
 * @feedback https://t.me/yqc_777/
 * @author 𝒀𝒖𝒉𝒆𝒏𝒈
 * @update 20230803
 * @version 1.0.0
******************************************
### 注意事项
 * 下列除Quantumult X外均为自动生成, 规则自测, 不保证可用

hostname=pan.baidu.com

================ Quantumult X ================
^http[s]?://pan.baidu.com/(act/(v2/(welfare|bchannel)/list|api/activityentry)|rest/2.0/(pcs/adv|xpan/smartprogram)).*ver.*=11.14.0 url script-response-body https://raw.githubusercontent.com/Yuheng0101/X/main/Scripts/Pure/BaiduNetdiskPure.js

================ Loon ================
http-response ^http[s]?://pan.baidu.com/(act/(v2/(welfare|bchannel)/list|api/activityentry)|rest/2.0/(pcs/adv|xpan/smartprogram)).*ver.*=11.14.0 script-path=https://raw.githubusercontent.com/Yuheng0101/X/main/Scripts/Pure/BaiduNetdiskPure.js, require-body=true, tag=百度网盘@11.14.0净化, enabled=true

================ Surge ================
type=http-response, pattern=^http[s]?://pan.baidu.com/(act/(v2/(welfare|bchannel)/list|api/activityentry)|rest/2.0/(pcs/adv|xpan/smartprogram)).*ver.*=11.14.0, script-path=https://raw.githubusercontent.com/Yuheng0101/X/main/Scripts/Pure/BaiduNetdiskPure.js, require-body=true, tag=百度网盘@11.14.0净化, enabled=true

******************************************/

var { body: body } = $response, { url: url } = $request, obj = JSON.parse(body); /(welfare|bchannel)\/list/.test(url) && (obj.data = []), /activityentry/.test(url) && (obj.popup_list = []), /2.0\/pcs\/adv/.test(url) && (obj.open_in_app = 0, obj.scene_list = []), /xpan\/smartprogram/.test(url) && (obj.list = []), $done({ body: JSON.stringify(obj) });