/**
 * 新电信抢话费 - 完全版 (Quantumult X)
 * 作者: quanhaipeng 定制
 * 功能: 自动登录 -> 获取 ticket -> 调用瑞数接口 -> 抢话费
 * 
 * cron: 57 9,13,23 * * *
 * 环境变量:
 *   chinaTelecomAccount = 手机号#密码&手机号#密码
 *   reqNUM = 抢购请求次数 (默认 1)
 */

const $ = new Env("新电信抢话费");

// =============== 配置区域 =================
const ACCOUNTS = $.getdata("chinaTelecomAccount") || "";  // 手机号#密码 多账号用 & 分割
const RUN_NUM = $.getdata("reqNUM") || 1;                 // 每个账号重复请求次数
// =========================================

async function main() {
  if (!ACCOUNTS) {
    $.msg("新电信抢话费", "未配置账号", "请在 QX 环境变量里设置 chinaTelecomAccount");
    return;
  }

  const accounts = ACCOUNTS.split("&");

  for (let acc of accounts) {
    const [phone, password] = acc.split("#");
    console.log(`\n📱 开始执行账号: ${phone}`);

    const ticket = await login(phone, password);
    if (!ticket) {
      console.log(`[${phone}] 登录失败`);
      continue;
    }
    console.log(`[${phone}] 登录成功，ticket=${ticket}`);

    // 瑞数通杀 (必须调用一次才行)
    await getRuishuCookie();

    // 抢话费
    for (let i = 0; i < RUN_NUM; i++) {
      await exchange(phone, ticket);
      await $.wait(500); // 避免过快
    }
  }
}

// 登录获取 ticket
async function login(phone, password) {
  const url = "https://appgologin.189.cn:9031/login/client/userLoginNormal";
  const data = {
    headerInfos: {
      code: "userLoginNormal",
      timestamp: new Date().toISOString(),
      userLoginName: phone
    },
    content: { fieldData: { authentication: password } }
  };

  try {
    const resp = await $.post(url, data);
    return resp?.responseData?.data?.loginSuccessResult?.token || null;
  } catch (e) {
    console.log(`[${phone}] 登录异常`, e);
    return null;
  }
}

// 瑞数 Cookie (模仿 Python 中的调用)
async function getRuishuCookie() {
  const url = "https://wappark.189.cn:8043/ruiShuTongSha.js";
  try {
    await $.get(url);
    console.log("✅ 瑞数 Cookie 已刷新");
  } catch (e) {
    console.log("❌ 瑞数 Cookie 获取失败", e);
  }
}

// 抢话费
async function exchange(phone, ticket) {
  const url = `https://wappark.189.cn/jt-sign/ssoHomLogin?ticket=${ticket}`;
  try {
    const resp = await $.get(url);
    if (resp?.includes("success") || resp?.code === "0000") {
      console.log(`[${phone}] 抢购成功 ✅`);
    } else {
      console.log(`[${phone}] 抢购失败 ❌`, resp);
    }
  } catch (e) {
    console.log(`[${phone}] 抢购异常`, e);
  }
}

// 任务入口
main().then(() => console.log("🎉 所有任务执行完毕"));

// ========== QX 脚本运行环境封装 ==========
function Env(name) {
  return new (class {
    constructor(name) { this.name = name }
    getdata(key) { return $prefs.valueForKey(key) }
    setdata(val, key) { return $prefs.setValueForKey(val, key) }
    msg(title, subt, body) { $notify(title, subt, body) }
    log(msg) { console.log(msg) }
    wait(ms) { return new Promise(res => setTimeout(res, ms)) }
    get(url) { return this.request("GET", url) }
    post(url, data) { return this.request("POST", url, data) }
    request(method, url, data) {
      return new Promise((resolve, reject) => {
        $task.fetch({ method, url, body: data ? JSON.stringify(data) : null, headers: { "Content-Type": "application/json" } })
          .then(resp => {
            try { resolve(JSON.parse(resp.body)) } catch { resolve(resp.body) }
          })
          .catch(reject);
      });
    }
  })(name);
}
