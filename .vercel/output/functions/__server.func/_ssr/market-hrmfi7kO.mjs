import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { a as string, i as object, t as boolean } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/market-hrmfi7kO.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var scanMarket_createServerFn_handler = createServerRpc({
	id: "ffb8c9c8fecbe45ced597f5e61c17d0e9bc19b8b24a2959273f75e96b53b9205",
	name: "scanMarket",
	filename: "src/lib/server/market.ts"
}, (opts) => scanMarket.__executeServer(opts));
var scanMarket = createServerFn({ method: "POST" }).validator(object({ force: boolean().optional() }).optional()).handler(scanMarket_createServerFn_handler, async ({ data }) => {
	const { runScan } = await import("./scan.server-CvQXzuea.mjs");
	return runScan(Boolean(data?.force));
});
var getPairDetail_createServerFn_handler = createServerRpc({
	id: "b699399d0210bd6dd5631e3fde29c7caa322e4ac4428c66f2512b9e307a45bd4",
	name: "getPairDetail",
	filename: "src/lib/server/market.ts"
}, (opts) => getPairDetail.__executeServer(opts));
var getPairDetail = createServerFn({ method: "POST" }).validator(object({ symbol: string().min(3).max(20) })).handler(getPairDetail_createServerFn_handler, async ({ data }) => {
	const { runPairDetail } = await import("./scan.server-CvQXzuea.mjs");
	return runPairDetail(data.symbol);
});
var testTelegram_createServerFn_handler = createServerRpc({
	id: "421e7b1582aa53688f450302b94e0609a3fe6e5e6a476930b0b423cf678d1837",
	name: "testTelegram",
	filename: "src/lib/server/market.ts"
}, (opts) => testTelegram.__executeServer(opts));
var testTelegram = createServerFn({ method: "POST" }).validator(object({
	botToken: string().min(20).max(200),
	chatId: string().min(1).max(80)
})).handler(testTelegram_createServerFn_handler, async ({ data }) => {
	const { testBot } = await import("./telegram.server-CL8LQOcH.mjs");
	return testBot(data.botToken, data.chatId);
});
var sendTelegram_createServerFn_handler = createServerRpc({
	id: "7eb6ce59a3f215bb493f51743fb4b4d3726409ea95238822b6d955407855d8ac",
	name: "sendTelegram",
	filename: "src/lib/server/market.ts"
}, (opts) => sendTelegram.__executeServer(opts));
var sendTelegram = createServerFn({ method: "POST" }).validator(object({
	botToken: string().min(20).max(200),
	chatId: string().min(1).max(80),
	text: string().min(1).max(4096)
})).handler(sendTelegram_createServerFn_handler, async ({ data }) => {
	const { sendMessage } = await import("./telegram.server-CL8LQOcH.mjs");
	return sendMessage(data.botToken, data.chatId, data.text);
});
//#endregion
export { getPairDetail_createServerFn_handler, scanMarket_createServerFn_handler, sendTelegram_createServerFn_handler, testTelegram_createServerFn_handler };
