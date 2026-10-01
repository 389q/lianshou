// Ostrich VPN Pro 强制解锁脚本
let body = $response.body;
if (!body) $done({});

try {
    let obj = JSON.parse(body);

    // 强制把 busy 置 0，pro 置 true
    if (obj.index) {
        for (let key in obj.index) {
            if (obj.index[key].busy !== undefined) {
                obj.index[key].busy = 0;
            }
        }
    }

    // 常见 Pro 字段强制开启
    obj.pro = true;
    obj.isPro = true;
    obj.level = 99;
    obj.vip = true;
    obj.subscription = true;
    obj.expire = "2099-12-31 23:59:59";
    obj.expired = false;

    body = JSON.stringify(obj);
} catch(e) {
    // 如果不是 JSON，就尝试字符串替换
    body = body.replace(/"busy"\s*:\s*\d+/g, '"busy":0');
    body = body.replace(/"pro"\s*:\s*false/g, '"pro":true');
    body = body.replace(/"isPro"\s*:\s*false/g, '"isPro":true');
    body = body.replace(/"level"\s*:\s*\d+/g, '"level":99');
}

$done({ body });