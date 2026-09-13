import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const scanMarket = createServerFn({ method: "POST" })
  .validator(z.object({ force: z.boolean().optional() }).optional())
  .handler(async ({ data }) => {
    const { runScan } = await import("@/lib/market/scan.server.ts");
    return runScan(Boolean(data?.force));
  });

export const getPairDetail = createServerFn({ method: "POST" })
  .validator(z.object({ symbol: z.string().min(3).max(20) }))
  .handler(async ({ data }) => {
    const { runPairDetail } = await import("@/lib/market/scan.server.ts");
    return runPairDetail(data.symbol);
  });

export const testTelegram = createServerFn({ method: "POST" })
  .validator(
    z.object({
      botToken: z.string().min(20).max(200),
      chatId: z.string().min(1).max(80),
    }),
  )
  .handler(async ({ data }) => {
    const { testBot } = await import("@/lib/telegram/telegram.server.ts");
    return testBot(data.botToken, data.chatId);
  });

export const sendTelegram = createServerFn({ method: "POST" })
  .validator(
    z.object({
      botToken: z.string().min(20).max(200),
      chatId: z.string().min(1).max(80),
      text: z.string().min(1).max(4096),
    }),
  )
  .handler(async ({ data }) => {
    const { sendMessage } = await import("@/lib/telegram/telegram.server.ts");
    return sendMessage(data.botToken, data.chatId, data.text);
  });
