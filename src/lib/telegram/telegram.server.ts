const TOKEN_RE = /^\d{6,}:[A-Za-z0-9_-]{20,}$/;

function assertToken(token: string) {
  if (!TOKEN_RE.test(token)) {
    throw new Error("Неверный формат токена бота");
  }
}

async function telegram<T>(
  token: string,
  method: string,
  body: Record<string, unknown>,
): Promise<T> {
  assertToken(token);
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as { ok: boolean; description?: string; result?: T };
  if (!json.ok) {
    throw new Error(json.description || "Telegram отклонил запрос");
  }
  return json.result as T;
}

export async function testBot(token: string, chatId: string) {
  const me = await telegram<{ username?: string; first_name?: string }>(token, "getMe", {});
  await telegram(token, "sendMessage", {
    chat_id: chatId,
    text: "Polaris подключён. Сюда будут приходить торговые сигналы.",
    disable_web_page_preview: true,
  });
  return { username: me.username ?? me.first_name ?? "bot" };
}

export async function sendMessage(token: string, chatId: string, text: string) {
  await telegram(token, "sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
  });
  return { ok: true as const };
}
