//#region node_modules/.nitro/vite/services/ssr/assets/telegram.server-CL8LQOcH.js
var TOKEN_RE = /^\d{6,}:[A-Za-z0-9_-]{20,}$/;
function assertToken(token) {
	if (!TOKEN_RE.test(token)) throw new Error("Неверный формат токена бота");
}
async function telegram(token, method, body) {
	assertToken(token);
	const json = await (await fetch(`https://api.telegram.org/bot${token}/${method}`, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(body)
	})).json();
	if (!json.ok) throw new Error(json.description || "Telegram отклонил запрос");
	return json.result;
}
async function testBot(token, chatId) {
	const me = await telegram(token, "getMe", {});
	await telegram(token, "sendMessage", {
		chat_id: chatId,
		text: "Polaris подключён. Сюда будут приходить торговые сигналы.",
		disable_web_page_preview: true
	});
	return { username: me.username ?? me.first_name ?? "bot" };
}
async function sendMessage(token, chatId, text) {
	await telegram(token, "sendMessage", {
		chat_id: chatId,
		text,
		parse_mode: "HTML",
		disable_web_page_preview: true
	});
	return { ok: true };
}
//#endregion
export { sendMessage, testBot };
