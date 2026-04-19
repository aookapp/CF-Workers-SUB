// 部署完成后在网址后面加上这个，获取自建节点和机场聚合节点，/?token=auto或/auto或

let mytoken = 'auto';
let guestToken = ''; //可以随便取，或者uuid生成，https://1024tools.com/uuid
let BotToken = ''; //可以为空，或者@BotFather中输入/start，/newbot，并关注机器人
let ChatID = ''; //可以为空，或者@userinfobot中获取，/start
let TG = 0; //小白勿动， 开发者专用，1 为推送所有的访问信息，0 为不推送订阅转换后端的访问信息与异常访问
let FileName = 'CF-Workers-SUB';
let SUBUpdateTime = 6; //自定义订阅更新时间，单位小时
let total = 99;//TB
let timestamp = 4102329600000;//2099-12-31

// 节点链接 + 订阅链接 + Base64 文本 (现已完美支持混填)
let MainData = ``

let urls = [];
let subConverter = "SUBAPI.cmliussss.net"; //在线订阅转换后端
let subConfig = "https://raw.githubusercontent.com/cmliu/ACL4SSR/main/Clash/config/ACL4SSR_Online_MultiCountry.ini"; //订阅配置文件
let subProtocol = 'https';

export default {
	async fetch(request, env) {
		const userAgentHeader = request.headers.get('User-Agent');
		const userAgent = userAgentHeader ? userAgentHeader.toLowerCase() : "null";
		const url = new URL(request.url);
		const token = url.searchParams.get('token');
		
		// 修复: 使用局部变量防止并发污染
		let currentToken = env.TOKEN || mytoken;
		let currentBotToken = env.TGTOKEN || BotToken;
		let currentChatID = env.TGID || ChatID;
		let currentTG = env.TG || TG;
		let currentSubConverter = env.SUBAPI || subConverter;
		let currentSubProtocol = subProtocol;
		let currentMainData = MainData;
		let currentUrls = [...urls];

		if (currentSubConverter.includes("http://")) {
			currentSubConverter = currentSubConverter.split("//")[1];
			currentSubProtocol = 'http';
		} else {
			currentSubConverter = currentSubConverter.split("//")[1] || currentSubConverter;
		}
		let currentSubConfig = env.SUBCONFIG || subConfig;
		let currentFileName = env.SUBNAME || FileName;

		const currentDate = new Date();
		currentDate.setHours(0, 0, 0, 0);
		const timeTemp = Math.ceil(currentDate.getTime() / 1000);
		const fakeToken = await MD5MD5(`${currentToken}${timeTemp}`);
		let currentGuestToken = env.GUESTTOKEN || env.GUEST || guestToken;
		if (!currentGuestToken) currentGuestToken = await MD5MD5(currentToken);
		const 访客订阅 = currentGuestToken;

		let UD = Math.floor(((timestamp - Date.now()) / timestamp * total * 1099511627776) / 2);
		let expire = Math.floor(timestamp / 1000);
		let currentSUBUpdateTime = env.SUBUPTIME || SUBUpdateTime;

		if (!([currentToken, fakeToken, 访客订阅].includes(token) || url.pathname == ("/" + currentToken) || url.pathname.includes("/" + currentToken + "?"))) {
			if (currentTG == 1 && url.pathname !== "/" && url.pathname !== "/favicon.ico") await sendMessage(currentBotToken, currentChatID, `#异常访问 ${currentFileName}`, request.headers.get('CF-Connecting-IP'), `UA: ${userAgent}</tg-spoiler>\n域名: ${url.hostname}\n<tg-spoiler>入口: ${url.pathname + url.search}</tg-spoiler>`);
			if (env.URL302) return Response.redirect(env.URL302, 302);
			else if (env.URL) return await proxyURL(env.URL, url);
			else return new Response(await nginx(), {
				status: 200,
				headers: { 'Content-Type': 'text/html; charset=UTF-8' },
			});
		} else {
			if (env.KV) {
				await 迁移地址列表(env, 'LINK.txt');
				if (userAgent.includes('mozilla') && !url.search) {
					await sendMessage(currentBotToken, currentChatID, `#编辑订阅 ${currentFileName}`, request.headers.get('CF-Connecting-IP'), `UA: ${userAgentHeader}</tg-spoiler>\n域名: ${url.hostname}\n<tg-spoiler>入口: ${url.pathname + url.search}</tg-spoiler>`);
					return await KV(request, env, 'LINK.txt', 访客订阅, currentSubProtocol, currentSubConverter, currentSubConfig, currentFileName, currentToken);
				} else {
					currentMainData = await env.KV.get('LINK.txt') || currentMainData;
				}
			} else {
				currentMainData = env.LINK || currentMainData;
				if (env.LINKSUB) currentUrls = currentUrls.concat(await ADD(env.LINKSUB));
			}

			// 完美解析混填内容 (明文, Base64, 订阅链接)
			let 自建节点 = "";
			let 订阅链接 = "";
			const lines = currentMainData.split('\n');
			for (let line of lines) {
				line = line.trim();
				if (!line) continue;
				if (line.toLowerCase().startsWith('http://') || line.toLowerCase().startsWith('https://')) {
					订阅链接 += line + '\n';
				} else if (line.includes('://')) {
					自建节点 += line + '\n';
				} else if (isValidBase64(line)) {
					// 自动解析 Base64 到明文节点
					let decoded = base64Decode(line);
					let decodedLines = decoded.split('\n');
					for(let dl of decodedLines){
						dl = dl.trim();
						if(dl.includes('://')) 自建节点 += dl + '\n';
					}
				}
			}
			
			currentMainData = 自建节点;
			currentUrls = currentUrls.concat(await ADD(订阅链接));
			await sendMessage(currentBotToken, currentChatID, `#获取订阅 ${currentFileName}`, request.headers.get('CF-Connecting-IP'), `UA: ${userAgentHeader}</tg-spoiler>\n域名: ${url.hostname}\n<tg-spoiler>入口: ${url.pathname + url.search}</tg-spoiler>`);

			let 订阅格式 = 'base64';
			if (userAgent.includes('null') || userAgent.includes('subconverter') || userAgent.includes('nekobox') || userAgent.includes(('CF-Workers-SUB').toLowerCase())) {
				订阅格式 = 'base64';
			} else if (userAgent.includes('clash') || (url.searchParams.has('clash') && !userAgent.includes('subconverter'))) {
				订阅格式 = 'clash';
			} else if (userAgent.includes('sing-box') || userAgent.includes('singbox') || ((url.searchParams.has('sb') || url.searchParams.has('singbox')) && !userAgent.includes('subconverter'))) {
				订阅格式 = 'singbox';
			} else if (userAgent.includes('surge') || (url.searchParams.has('surge') && !userAgent.includes('subconverter'))) {
				订阅格式 = 'surge';
			} else if (userAgent.includes('quantumult%20x') || (url.searchParams.has('quanx') && !userAgent.includes('subconverter'))) {
				订阅格式 = 'quanx';
			} else if (userAgent.includes('loon') || (url.searchParams.has('loon') && !userAgent.includes('subconverter'))) {
				订阅格式 = 'loon';
			}

			let subConverterUrl;
			let 订阅转换URL = `${url.origin}/${await MD5MD5(fakeToken)}?token=${fakeToken}`;
			let req_data = currentMainData;

			let 追加UA = 'v2rayn';
			if (url.searchParams.has('b64') || url.searchParams.has('base64')) 订阅格式 = 'base64';
			else if (url.searchParams.has('clash')) 追加UA = 'clash';
			else if (url.searchParams.has('singbox')) 追加UA = 'singbox';
			else if (url.searchParams.has('surge')) 追加UA = 'surge';
			else if (url.searchParams.has('quanx')) 追加UA = 'Quantumult%20X';
			else if (url.searchParams.has('loon')) 追加UA = 'Loon';

			const 请求订阅响应内容 = await getSUB(currentUrls, request, 追加UA, userAgentHeader);
			req_data += 请求订阅响应内容[0].join('\n');
			订阅转换URL += "|" + 请求订阅响应内容[1];

			if (env.WARP) 订阅转换URL += "|" + (await ADD(env.WARP)).join("|");
			
			const utf8Encoder = new TextEncoder();
			const encodedData = utf8Encoder.encode(req_data);
			const utf8Decoder = new TextDecoder();
			const text = utf8Decoder.decode(encodedData);

			const uniqueLines = new Set(text.split('\n'));
			const result = [...uniqueLines].join('\n');

			let base64Data;
			try {
				base64Data = btoa(result);
			} catch (e) {
				function encodeBase64(data) {
					const binary = new TextEncoder().encode(data);
					let base64 = '';
					const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
					for (let i = 0; i < binary.length; i += 3) {
						const byte1 = binary[i];
						const byte2 = binary[i + 1] || 0;
						const byte3 = binary[i + 2] || 0;
						base64 += chars[byte1 >> 2];
						base64 += chars[((byte1 & 3) << 4) | (byte2 >> 4)];
						base64 += chars[((byte2 & 15) << 2) | (byte3 >> 6)];
						base64 += chars[byte3 & 63];
					}
					const padding = 3 - (binary.length % 3 || 3);
					return base64.slice(0, base64.length - padding) + '=='.slice(0, padding);
				}
				base64Data = encodeBase64(result.replace(/\u0026/g, '&'))
			}

			if (订阅格式 == 'base64' || token == fakeToken) {
				return new Response(base64Data, {
					headers: {
						"content-type": "text/plain; charset=utf-8",
						"Profile-Update-Interval": `${currentSUBUpdateTime}`,
					}
				});
			} else if (订阅格式 == 'clash') {
				subConverterUrl = `${currentSubProtocol}://${currentSubConverter}/sub?target=clash&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(currentSubConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
			} else if (订阅格式 == 'singbox') {
				subConverterUrl = `${currentSubProtocol}://${currentSubConverter}/sub?target=singbox&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(currentSubConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
			} else if (订阅格式 == 'surge') {
				subConverterUrl = `${currentSubProtocol}://${currentSubConverter}/sub?target=surge&ver=4&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(currentSubConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
			} else if (订阅格式 == 'quanx') {
				subConverterUrl = `${currentSubProtocol}://${currentSubConverter}/sub?target=quanx&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(currentSubConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&udp=true`;
			} else if (订阅格式 == 'loon') {
				subConverterUrl = `${currentSubProtocol}://${currentSubConverter}/sub?target=loon&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(currentSubConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false`;
			}
			try {
				const subConverterResponse = await fetch(subConverterUrl);
				if (!subConverterResponse.ok) {
					return new Response(base64Data, {
						headers: {
							"content-type": "text/plain; charset=utf-8",
							"Profile-Update-Interval": `${currentSUBUpdateTime}`,
						}
					});
				}
				let subConverterContent = await subConverterResponse.text();
				if (订阅格式 == 'clash') subConverterContent = await clashFix(subConverterContent);
				return new Response(subConverterContent, {
					headers: {
						"Content-Disposition": `attachment; filename*=utf-8''${encodeURIComponent(currentFileName)}`,
						"content-type": "text/plain; charset=utf-8",
						"Profile-Update-Interval": `${currentSUBUpdateTime}`,
					},
				});
			} catch (error) {
				return new Response(base64Data, {
					headers: {
						"content-type": "text/plain; charset=utf-8",
						"Profile-Update-Interval": `${currentSUBUpdateTime}`,
					}
				});
			}
		}
	}
};

async function ADD(envadd) {
	var addtext = envadd.replace(/[	"'|\r\n]+/g, ',').replace(/,+/g, ',');
	if (addtext.charAt(0) == ',') addtext = addtext.slice(1);
	if (addtext.charAt(addtext.length - 1) == ',') addtext = addtext.slice(0, addtext.length - 1);
	const add = addtext.split(',');
	return add;
}

async function nginx() {
	return `
	<!DOCTYPE html>
	<html>
	<head>
	<title>Welcome to nginx!</title>
	<style>
		body { width: 35em; margin: 0 auto; font-family: Tahoma, Verdana, Arial, sans-serif; }
	</style>
	</head>
	<body>
	<h1>Welcome to nginx!</h1>
	<p>If you see this page, the nginx web server is successfully installed and working.</p>
	</body>
	</html>
	`;
}

async function sendMessage(botToken, chatID, type, ip, add_data = "") {
	if (botToken !== '' && chatID !== '') {
		let msg = "";
		const response = await fetch(`http://ip-api.com/json/${ip}?lang=zh-CN`);
		if (response.status == 200) {
			const ipInfo = await response.json();
			msg = `${type}\nIP: ${ip}\n国家: ${ipInfo.country}\n<tg-spoiler>城市: ${ipInfo.city}\n组织: ${ipInfo.org}\nASN: ${ipInfo.as}\n${add_data}`;
		} else {
			msg = `${type}\nIP: ${ip}\n<tg-spoiler>${add_data}`;
		}
		let url = "https://api.telegram.org/bot" + botToken + "/sendMessage?chat_id=" + chatID + "&parse_mode=HTML&text=" + encodeURIComponent(msg);
		return fetch(url, { method: 'get' });
	}
}

// 修复: 更健壮的 base64 验证与解码 (过滤空格换行)
function isValidBase64(str) {
	const cleanStr = str.replace(/\s/g, '');
	if(cleanStr.length % 4 !== 0 || cleanStr.length === 0) return false;
	const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;
	return base64Regex.test(cleanStr);
}

function base64Decode(str) {
	try {
		const cleanStr = str.replace(/\s/g, '');
		const bytes = new Uint8Array(atob(cleanStr).split('').map(c => c.charCodeAt(0)));
		const decoder = new TextDecoder('utf-8');
		return decoder.decode(bytes);
	} catch(e) {
		return "";
	}
}

async function MD5MD5(text) {
	const encoder = new TextEncoder();
	const firstPass = await crypto.subtle.digest('MD5', encoder.encode(text));
	const firstPassArray = Array.from(new Uint8Array(firstPass));
	const firstHex = firstPassArray.map(b => b.toString(16).padStart(2, '0')).join('');
	const secondPass = await crypto.subtle.digest('MD5', encoder.encode(firstHex.slice(7, 27)));
	const secondPassArray = Array.from(new Uint8Array(secondPass));
	const secondHex = secondPassArray.map(b => b.toString(16).padStart(2, '0')).join('');
	return secondHex.toLowerCase();
}

function clashFix(content) {
	if (content.includes('wireguard') && !content.includes('remote-dns-resolve')) {
		let lines = content.includes('\r\n') ? content.split('\r\n') : content.split('\n');
		let result = "";
		for (let line of lines) {
			if (line.includes('type: wireguard')) {
				const 备改内容 = `, mtu: 1280, udp: true`;
				const 正确内容 = `, mtu: 1280, remote-dns-resolve: true, udp: true`;
				result += line.replace(new RegExp(备改内容, 'g'), 正确内容) + '\n';
			} else {
				result += line + '\n';
			}
		}
		content = result;
	}
	return content;
}

async function proxyURL(proxyURL, url) {
	const URLs = await ADD(proxyURL);
	const fullURL = URLs[Math.floor(Math.random() * URLs.length)];
	let parsedURL = new URL(fullURL);
	let URLProtocol = parsedURL.protocol.slice(0, -1) || 'https';
	let URLHostname = parsedURL.hostname;
	let URLPathname = parsedURL.pathname;
	let URLSearch = parsedURL.search;
	if (URLPathname.charAt(URLPathname.length - 1) == '/') {
		URLPathname = URLPathname.slice(0, -1);
	}
	URLPathname += url.pathname;
	let newURL = `${URLProtocol}://${URLHostname}${URLPathname}${URLSearch}`;
	let response = await fetch(newURL);
	let newResponse = new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: response.headers
	});
	newResponse.headers.set('X-New-URL', newURL);
	return newResponse;
}

async function getSUB(api, request, 追加UA, userAgentHeader) {
	if (!api || api.length === 0) return [[], ""]; 
	api = [...new Set(api)];
	let newapi = "";
	let 订阅转换URLs = "";
	let 异常订阅 = "";
	
	// 修复: AbortController 正确挂载给 Request
	const controller = new AbortController();
	const timeout = setTimeout(() => { controller.abort(); }, 2000);

	try {
		const responses = await Promise.allSettled(api.map(apiUrl => getUrl(request, apiUrl, 追加UA, userAgentHeader, controller.signal).then(response => response.ok ? response.text() : Promise.reject(response))));
		const modifiedResponses = responses.map((response, index) => {
			if (response.status === 'rejected') {
				const reason = response.reason;
				if (reason && reason.name === 'AbortError') return { status: '超时', value: null, apiUrl: api[index] };
				return { status: '请求失败', value: null, apiUrl: api[index] };
			}
			return { status: response.status, value: response.value, apiUrl: api[index] };
		});

		for (const response of modifiedResponses) {
			if (response.status === 'fulfilled') {
				const content = await response.value || 'null';
				if (content.includes('proxies:')) {
					订阅转换URLs += "|" + response.apiUrl; 
				} else if (content.includes('outbounds"') && content.includes('inbounds"')) {
					订阅转换URLs += "|" + response.apiUrl; 
				} else if (content.includes('://')) {
					newapi += content + '\n';
				} else if (isValidBase64(content)) {
					newapi += base64Decode(content) + '\n';
				} else {
					const 异常订阅LINK = `trojan://CMLiussss@127.0.0.1:8888?security=tls&allowInsecure=1&type=tcp&headerType=none#%E5%BC%82%E5%B8%B8%E8%AE%A2%E9%98%85%20${response.apiUrl.split('://')[1].split('/')[0]}`;
					异常订阅 += `${异常订阅LINK}\n`;
				}
			}
		}
	} catch (error) {
		console.error(error);
	} finally {
		clearTimeout(timeout);
	}

	const 订阅内容 = await ADD(newapi + 异常订阅);
	return [订阅内容, 订阅转换URLs];
}

async function getUrl(request, targetUrl, 追加UA, userAgentHeader, signal) {
	const newHeaders = new Headers(request.headers);
	newHeaders.set("User-Agent", `${atob('djJyYXlOLzYuNDU=')} cmliu/CF-Workers-SUB ${追加UA}(${userAgentHeader})`);
	const modifiedRequest = new Request(targetUrl, {
		method: request.method,
		headers: newHeaders,
		body: request.method === "GET" ? null : request.body,
		redirect: "follow",
		signal: signal, // 此处挂载终止信号解决挂起问题
		cf: {
			insecureSkipVerify: true,
			allowUntrusted: true,
			validateCertificate: false
		}
	});
	return fetch(modifiedRequest);
}

async function 迁移地址列表(env, txt = 'ADD.txt') {
	const 旧数据 = await env.KV.get(`/${txt}`);
	const 新数据 = await env.KV.get(txt);
	if (旧数据 && !新数据) {
		await env.KV.put(txt, 旧数据);
		await env.KV.delete(`/${txt}`);
		return true;
	}
	return false;
}

async function KV(request, env, txt = 'ADD.txt', guest, subProtocol, subConverter, subConfig, FileName, mytoken) {
	const url = new URL(request.url);
	try {
		if (request.method === "POST") {
			if (!env.KV) return new Response("未绑定KV空间", { status: 400 });
			try {
				const content = await request.text();
				await env.KV.put(txt, content);
				return new Response("保存成功");
			} catch (error) {
				return new Response("保存失败: " + error.message, { status: 500 });
			}
		}

		let content = '';
		let hasKV = !!env.KV;
		if (hasKV) {
			try {
				content = await env.KV.get(txt) || '';
			} catch (error) {
				content = '读取数据时发生错误: ' + error.message;
			}
		}

		const html = `
			<!DOCTYPE html>
			<html>
				<head>
					<title>${FileName} 订阅编辑</title>
					<meta charset="utf-8">
					<meta name="viewport" content="width=device-width, initial-scale=1">
					<style>
						body { margin: 0; padding: 15px; box-sizing: border-box; font-size: 13px; }
						.editor-container { width: 100%; max-width: 100%; margin: 0 auto; }
						.editor { width: 100%; height: 300px; margin: 15px 0; padding: 10px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px; font-size: 13px; line-height: 1.5; overflow-y: auto; resize: none; }
						.save-container { margin-top: 8px; display: flex; align-items: center; gap: 10px; }
						.save-btn { padding: 6px 15px; color: white; border: none; border-radius: 4px; cursor: pointer; background: #4CAF50; }
						.save-btn:hover { background: #45a049; }
						.save-btn:disabled { background: #cccccc; cursor: not-allowed; }
						.save-status { color: #666; }
					</style>
					<script src="https://cdn.jsdelivr.net/npm/@keeex/qrcodejs-kx@1.0.2/qrcode.min.js"></script>
				</head>
				<body>
					################################################################<br>
					Subscribe / sub 订阅地址, 点击链接自动 <strong>复制订阅链接</strong> 并 <strong>生成订阅二维码</strong> <br>
					---------------------------------------------------------------<br>
					自适应订阅地址:<br>
					<a href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?sub','qrcode_0')" style="color:blue;text-decoration:underline;cursor:pointer;">https://${url.hostname}/${mytoken}</a><br>
					<div id="qrcode_0" style="margin: 10px 10px 10px 10px;"></div>
					Base64订阅地址:<br>
					<a href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?b64','qrcode_1')" style="color:blue;text-decoration:underline;cursor:pointer;">https://${url.hostname}/${mytoken}?b64</a><br>
					<div id="qrcode_1" style="margin: 10px 10px 10px 10px;"></div>
					clash订阅地址:<br>
					<a href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?clash','qrcode_2')" style="color:blue;text-decoration:underline;cursor:pointer;">https://${url.hostname}/${mytoken}?clash</a><br>
					<div id="qrcode_2" style="margin: 10px 10px 10px 10px;"></div>
					singbox订阅地址:<br>
					<a href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?sb','qrcode_3')" style="color:blue;text-decoration:underline;cursor:pointer;">https://${url.hostname}/${mytoken}?sb</a><br>
					<div id="qrcode_3" style="margin: 10px 10px 10px 10px;"></div>
					&nbsp;&nbsp;<strong><a href="javascript:void(0);" id="noticeToggle" onclick="toggleNotice()">查看访客订阅∨</a></strong><br>
					<div id="noticeContent" class="notice-content" style="display: none;">
						---------------------------------------------------------------<br>
						访客订阅只能使用订阅功能，无法查看配置页！<br>
						GUEST（访客订阅TOKEN）: <strong>${guest}</strong><br>
						---------------------------------------------------------------<br>
						自适应订阅地址:<br>
						<a href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/sub?token=${guest}','guest_0')" style="color:blue;text-decoration:underline;cursor:pointer;">https://${url.hostname}/sub?token=${guest}</a><br>
						<div id="guest_0" style="margin: 10px 10px 10px 10px;"></div>
					</div>
					---------------------------------------------------------------<br>
					################################################################<br>
					订阅转换配置<br>
					---------------------------------------------------------------<br>
					SUBAPI（订阅转换后端）: <strong>${subProtocol}://${subConverter}</strong><br>
					SUBCONFIG（订阅转换配置文件）: <strong>${subConfig}</strong><br>
					---------------------------------------------------------------<br>
					################################################################<br>
					${FileName} 汇聚订阅编辑 (支持混填明文、Base64文本及订阅链接): 
					<div class="editor-container">
						${hasKV ? `
						<textarea class="editor" id="content" placeholder="输入节点、Base64文本或订阅链接...">${content}</textarea>
						<div class="save-container">
							<button id="saveBtn" class="save-btn" onclick="saveContent()">保存</button>
							<span class="save-status" id="saveStatus"></span>
						</div>
						` : '<p>请绑定 <strong>变量名称</strong> 为 <strong>KV</strong> 的KV命名空间</p>'}
					</div>
					<br><br>UA: <strong>${request.headers.get('User-Agent')}</strong>
					<script>
					function copyToClipboard(text, qrcode) {
						navigator.clipboard.writeText(text).then(() => {
							alert('已复制到剪贴板');
						});
						const qrcodeDiv = document.getElementById(qrcode);
						qrcodeDiv.innerHTML = '';
						new QRCode(qrcodeDiv, { text: text, width: 220, height: 220, colorDark: "#000000", colorLight: "#ffffff", correctLevel: QRCode.CorrectLevel.Q });
					}
						
					if (document.querySelector('.editor')) {
						let timer;
						const textarea = document.getElementById('content');
		
						function replaceFullwidthColon() {
							const text = textarea.value;
							textarea.value = text.replace(/：/g, ':');
						}
						
						function saveContent() {
							const button = document.getElementById('saveBtn'); // 修复: 从内部获取元素
							const statusElem = document.getElementById('saveStatus');
							try {
								const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
								if (!isIOS) replaceFullwidthColon();
								
								button.textContent = '保存中...';
								button.disabled = true;

								const newContent = textarea.value || '';
								fetch(window.location.href, {
									method: 'POST',
									body: newContent,
									headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
									cache: 'no-cache'
								})
								.then(response => {
									if (!response.ok) throw new Error(\`HTTP error! status: \${response.status}\`);
									const now = new Date().toLocaleString();
									document.title = \`编辑已保存 \${now}\`;
									if(statusElem) { statusElem.textContent = \`已保存 \${now}\`; statusElem.style.color = '#666'; }
								})
								.catch(error => {
									console.error('Save error:', error);
									if(statusElem) { statusElem.textContent = \`保存失败: \${error.message}\`; statusElem.style.color = 'red'; }
								})
								.finally(() => {
									button.textContent = '保存';
									button.disabled = false;
								});
							} catch (error) {
								console.error('保存过程出错:', error);
								button.textContent = '保存';
								button.disabled = false;
								if(statusElem) { statusElem.textContent = \`错误: \${error.message}\`; statusElem.style.color = 'red'; }
							}
						}
		
						textarea.addEventListener('blur', saveContent);
						textarea.addEventListener('input', () => {
							clearTimeout(timer);
							timer = setTimeout(saveContent, 5000);
						});
					}

					function toggleNotice() {
						const noticeContent = document.getElementById('noticeContent');
						const noticeToggle = document.getElementById('noticeToggle');
						if (noticeContent.style.display === 'none' || noticeContent.style.display === '') {
							noticeContent.style.display = 'block';
							noticeToggle.textContent = '隐藏访客订阅∧';
						} else {
							noticeContent.style.display = 'none';
							noticeToggle.textContent = '查看访客订阅∨';
						}
					}
					document.addEventListener('DOMContentLoaded', () => {
						document.getElementById('noticeContent').style.display = 'none';
					});
					</script>
				</body>
			</html>
		`;
		return new Response(html, { headers: { "Content-Type": "text/html;charset=utf-8" } });
	} catch (error) {
		return new Response("服务器错误: " + error.message, { status: 500, headers: { "Content-Type": "text/plain;charset=utf-8" } });
	}
}
