import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as Slot, s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { a as string, i as object, t as boolean } from "../_libs/zod.mjs";
import { a as RefreshCw, c as Check, i as Send, l as BookOpen, o as Minus, r as SlidersHorizontal, s as LoaderCircle, t as X } from "../_libs/lucide-react.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as DialogOverlay, i as DialogDescription, n as DialogClose, o as DialogPortal, r as DialogContent, s as DialogTitle, t as Dialog } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { n as cn } from "./router-JuzUHYSB.mjs";
import { a as Line, c as Tooltip, i as Area, n as YAxis, o as CartesianGrid, r as XAxis, s as ResponsiveContainer, t as ComposedChart } from "../_libs/recharts+[...].mjs";
import { t as Root } from "../_libs/radix-ui__react-label.mjs";
import { n as SwitchThumb, t as Switch$1 } from "../_libs/radix-ui__react-switch.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { t as Root$1 } from "../_libs/radix-ui__react-separator.mjs";
import { i as SliderTrack, n as SliderRange, r as SliderThumb, t as Slider$1 } from "../_libs/@radix-ui/react-slider+[...].mjs";
import { i as Trigger, n as List, r as Root2, t as Content } from "../_libs/radix-ui__react-tabs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-C5VJa1KK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function priceDecimals(price) {
	if (price >= 1e3) return 2;
	if (price >= 100) return 3;
	if (price >= 1) return 4;
	if (price >= .01) return 5;
	return 6;
}
function formatPrice(price) {
	return price.toLocaleString("ru-RU", {
		minimumFractionDigits: priceDecimals(price),
		maximumFractionDigits: priceDecimals(price)
	});
}
function formatPct(pct, digits = 2) {
	return `${pct > 0 ? "+" : ""}${pct.toFixed(digits)}%`;
}
function formatUsd(n) {
	return n.toLocaleString("ru-RU", { maximumFractionDigits: n >= 100 ? 0 : 2 });
}
function formatQty(qty) {
	if (qty >= 100) return qty.toLocaleString("ru-RU", { maximumFractionDigits: 2 });
	if (qty >= 1) return qty.toLocaleString("ru-RU", { maximumFractionDigits: 4 });
	return qty.toLocaleString("ru-RU", { maximumFractionDigits: 6 });
}
function sideLabel(side) {
	if (side === "long") return "лонг";
	if (side === "short") return "шорт";
	return "—";
}
function positionSize(signal, accountUsd, riskPct) {
	const riskUsd = accountUsd * (riskPct / 100);
	const stopDist = Math.abs(signal.price - signal.stop);
	const qty = stopDist > 0 ? riskUsd / stopDist : 0;
	return {
		riskUsd,
		qty,
		notional: qty * signal.price
	};
}
function esc(s) {
	return s.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">");
}
function formatTelegramHtml(signal, accountUsd, riskPct) {
	const { qty, riskUsd } = positionSize(signal, accountUsd, riskPct);
	const side = signal.side === "long" ? "LONG" : "SHORT";
	const checks = signal.checks.map((c) => `${c.pass ? "✓" : "·"} ${esc(c.label)} — ${esc(c.detail)}`).join("\n");
	return [
		`<b>POLARIS · ${side} ${esc(signal.symbol)}</b>`,
		`4H · счёт ${signal.score}/100 · режим ${signal.regime === "bull" ? "бычий" : "медвежий"}`,
		``,
		`Цена  <code>${formatPrice(signal.price)}</code>`,
		`Стоп  <code>${formatPrice(signal.stop)}</code>  (${formatPct(signal.riskPct)})`,
		`Цель  <code>${formatPrice(signal.target)}</code>  (${formatPct(signal.rewardPct)})`,
		`R:R   1 : ${signal.rr.toFixed(2)}`,
		`Риск  ${riskPct}% ≈ ${formatUsd(riskUsd)} USDT → ${formatQty(qty)} ${esc(signal.base)}`,
		``,
		`<b>Конфлюэнция</b>`,
		checks,
		``,
		`<i>Триггер: ${esc(signal.trigger)}</i>`,
		``,
		`Не является инвестиционной рекомендацией.`
	].join("\n");
}
function formatTick(t) {
	return new Date(t).toLocaleString("ru-RU", {
		day: "2-digit",
		month: "short",
		hour: "2-digit",
		minute: "2-digit"
	});
}
function axisDecimals(points) {
	const ys = points.map((p) => p.close);
	const span = Math.max(...ys) - Math.min(...ys);
	if (!Number.isFinite(span) || span <= 0) return 2;
	if (span < .001) return 6;
	if (span < .05) return 5;
	if (span < 1) return 4;
	if (span < 20) return 3;
	if (span < 200) return 2;
	return 0;
}
function PairChart({ points }) {
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setReady(true);
	}, []);
	const decimals = (0, import_react.useMemo)(() => axisDecimals(points), [points]);
	if (!ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-56 w-full rounded-xl bg-raised" });
	if (points.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-56 items-center justify-center text-sm text-muted-foreground",
		children: "Загрузка ряда"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-56 w-full",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
			width: "100%",
			height: "100%",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ComposedChart, {
				data: points,
				margin: {
					top: 8,
					right: 8,
					left: 4,
					bottom: 0
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
						stroke: "var(--color-border)",
						vertical: false
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
						dataKey: "t",
						tickFormatter: (v) => new Date(v).toLocaleDateString("ru-RU", {
							day: "2-digit",
							month: "short"
						}),
						tick: {
							fill: "var(--color-muted-foreground)",
							fontSize: 11
						},
						axisLine: false,
						tickLine: false,
						minTickGap: 28
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
						domain: ["auto", "auto"],
						tickCount: 5,
						tickFormatter: (v) => v.toLocaleString("ru-RU", {
							minimumFractionDigits: decimals,
							maximumFractionDigits: decimals
						}),
						tick: {
							fill: "var(--color-muted-foreground)",
							fontSize: 11
						},
						axisLine: false,
						tickLine: false,
						width: 78
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
						contentStyle: {
							background: "var(--color-card)",
							border: "1px solid var(--color-border)",
							borderRadius: 12,
							color: "var(--color-foreground)",
							fontSize: 12
						},
						labelFormatter: (v) => formatTick(Number(v)),
						formatter: (value, name) => {
							const n = typeof value === "number" ? value : Number(value);
							const label = name === "close" ? "Цена" : name === "ema21" ? "EMA 21" : "EMA 55";
							return [Number.isFinite(n) ? formatPrice(n) : "—", label];
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
						type: "monotone",
						dataKey: "close",
						stroke: "var(--color-foreground)",
						fill: "var(--color-raised)",
						strokeWidth: 1.5,
						dot: false,
						isAnimationActive: false
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
						type: "monotone",
						dataKey: "ema21",
						stroke: "var(--color-long)",
						strokeWidth: 1.25,
						dot: false,
						connectNulls: true,
						isAnimationActive: false
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
						type: "monotone",
						dataKey: "ema55",
						stroke: "var(--color-muted-foreground)",
						strokeWidth: 1,
						dot: false,
						connectNulls: true,
						isAnimationActive: false
					})
				]
			})
		})
	});
}
function PolarisMark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 32 32",
		className,
		"aria-hidden": "true",
		fill: "none",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M16 2.5 L18.2 13.8 L29.5 16 L18.2 18.2 L16 29.5 L13.8 18.2 L2.5 16 L13.8 13.8 Z",
			fill: "currentColor"
		})
	});
}
var Sheet = Dialog;
var SheetPortal = DialogPortal;
var SheetOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {
	className: cn("fixed inset-0 z-50 bg-background/70 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props,
	ref
}));
SheetOverlay.displayName = DialogOverlay.displayName;
var SheetContent = import_react.forwardRef(({ className, children, side = "right", ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
	ref,
	className: cn("fixed z-50 flex flex-col gap-4 bg-card p-5 shadow-[var(--shadow-border)] outline-none data-[state=open]:animate-in data-[state=closed]:animate-out", side === "right" && "inset-y-0 right-0 h-full w-full max-w-md rounded-l-2xl border-l border-border data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right", side === "bottom" && "inset-x-0 bottom-0 max-h-[88vh] rounded-t-2xl border-t border-border data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute top-4 right-4 rounded-md p-2 text-muted-foreground hover:bg-raised hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Закрыть"
		})]
	})]
})] }));
SheetContent.displayName = DialogContent.displayName;
function SheetHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex flex-col gap-1 pr-8", className),
		...props
	});
}
function SheetTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
		className: cn("font-display text-lg font-medium tracking-tight", className),
		...props
	});
}
function SheetDescription({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
		className: cn("text-sm text-muted-foreground", className),
		...props
	});
}
var RULES = [
	{
		title: "Фильтр режима · дневка",
		body: "Лонги только если цена выше EMA 200 на 1D, шорты — только ниже. Так отсекаются контртрендовые сделки против старшего потока."
	},
	{
		title: "Тренд · 4 часа",
		body: "Стек EMA 21 / 55 и наклон быстрой средней. Вход по направлению тренда, не против него."
	},
	{
		title: "Импульс",
		body: "RSI 14 в рабочей зоне (не перекуплен для лонга, не перепродан для шорта) и гистограмма MACD в ту же сторону."
	},
	{
		title: "Объём и ADX",
		body: "Объём выше 1.1× средней за 20 баров — участие есть. ADX ниже 16 — боковик, сигналы глушатся."
	},
	{
		title: "Триггер",
		body: "Свежий вход: пересечение EMA или MACD за последние 3 свечи, либо отбой от EMA 21. Без триггера счёт ниже, в Telegram не уходит."
	},
	{
		title: "Риск",
		body: "Стоп 1.8× ATR(14), цель 2.7× ATR — фиксированный R:R 1:1.5. Размер позиции считается от 1% депозита на стоп. Не больше трёх коррелированных идей сразу."
	}
];
function StrategySheet({ open, onOpenChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
			side: "right",
			className: "overflow-y-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, { children: "Северный тренд" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetDescription, { children: "Рабочая система, не «гарантированная прибыль». Край живёт в толстых хвостах трендов — и умирает, если игнорировать стопы." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-5 text-sm leading-relaxed text-pretty",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-muted-foreground",
						children: "Сетки, мартингейл и «нейросеть без модели» красиво выглядят на боковике и сгорают на импульсе. У тренд-следования (Turtles, managed futures, стек EMA) самый длинный публичный след на рынках с жирными хвостами — а крипта именно такая."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-4",
						children: RULES.map((rule) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "rounded-xl bg-raised p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium text-foreground",
								children: rule.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1.5 text-muted-foreground",
								children: rule.body
							})]
						}, rule.title))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-muted-foreground",
						children: "Бэктест на загруженных 4H-свечах — иллюстрация на коротком окне, не доказательство края. Ожидайте много небольших минусов и редкие крупные плюсы. Если психология этого не выдерживает — система вам не подходит."
					})
				]
			})]
		})
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[opacity,transform,background-color,color,box-shadow] duration-[var(--motion-quick)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:opacity-90",
			secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
			outline: "border border-border bg-transparent text-foreground hover:bg-raised",
			ghost: "text-foreground hover:bg-raised",
			destructive: "bg-short text-primary-foreground hover:opacity-90"
		},
		size: {
			default: "h-11 px-4",
			sm: "h-9 px-3 text-xs",
			lg: "h-12 px-5",
			icon: "size-11"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
var Input = import_react.forwardRef(({ className, type, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		className: cn("flex h-11 w-full rounded-md border border-border bg-raised px-3 text-sm text-foreground shadow-[var(--shadow-border)] transition-[box-shadow] duration-[var(--motion-quick)] placeholder:text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50", className),
		ref,
		...props
	});
});
Input.displayName = "Input";
var Label = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
	ref,
	className: cn("text-xs font-medium text-muted-foreground", className),
	...props
}));
Label.displayName = Root.displayName;
var Switch = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch$1, {
	className: cn("peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-border transition-colors duration-[var(--motion-quick)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-raised", className),
	...props,
	ref,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchThumb, { className: "pointer-events-none block size-5 rounded-full bg-foreground shadow-sm transition-transform duration-[var(--motion-quick)] data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0.5 data-[state=checked]:bg-primary-foreground" })
}));
Switch.displayName = Switch$1.displayName;
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var scanMarket = createServerFn({ method: "POST" }).validator(object({ force: boolean().optional() }).optional()).handler(createSsrRpc("ffb8c9c8fecbe45ced597f5e61c17d0e9bc19b8b24a2959273f75e96b53b9205"));
var getPairDetail = createServerFn({ method: "POST" }).validator(object({ symbol: string().min(3).max(20) })).handler(createSsrRpc("b699399d0210bd6dd5631e3fde29c7caa322e4ac4428c66f2512b9e307a45bd4"));
var testTelegram = createServerFn({ method: "POST" }).validator(object({
	botToken: string().min(20).max(200),
	chatId: string().min(1).max(80)
})).handler(createSsrRpc("421e7b1582aa53688f450302b94e0609a3fe6e5e6a476930b0b423cf678d1837"));
var sendTelegram = createServerFn({ method: "POST" }).validator(object({
	botToken: string().min(20).max(200),
	chatId: string().min(1).max(80),
	text: string().min(1).max(4096)
})).handler(createSsrRpc("7eb6ce59a3f215bb493f51743fb4b4d3726409ea95238822b6d955407855d8ac"));
var useSettings = create()(persist((set, get) => ({
	botToken: "",
	chatId: "",
	autoSend: false,
	minScore: 65,
	accountUsd: 1e4,
	riskPct: 1,
	sentKeys: [],
	setBotToken: (botToken) => set({ botToken }),
	setChatId: (chatId) => set({ chatId }),
	setAutoSend: (autoSend) => set({ autoSend }),
	setMinScore: (minScore) => set({ minScore }),
	setAccountUsd: (accountUsd) => set({ accountUsd }),
	setRiskPct: (riskPct) => set({ riskPct }),
	markSent: (keys) => set({ sentKeys: [...get().sentKeys, ...keys].slice(-400) })
}), { name: "polaris-settings" }));
function TelegramSheet({ open, onOpenChange, signals }) {
	const { botToken, chatId, autoSend, accountUsd, riskPct, setBotToken, setChatId, setAutoSend, markSent } = useSettings();
	const [testing, setTesting] = (0, import_react.useState)(false);
	const [sending, setSending] = (0, import_react.useState)(false);
	async function onTest() {
		setTesting(true);
		try {
			const res = await testTelegram({ data: {
				botToken,
				chatId
			} });
			toast.success(`Подключено: @${res.username}`);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Не удалось проверить бота");
		} finally {
			setTesting(false);
		}
	}
	async function onSendAll() {
		if (signals.length === 0) {
			toast.message("Сейчас нет сигналов для отправки");
			return;
		}
		setSending(true);
		try {
			const keys = [];
			for (const signal of signals) {
				await sendTelegram({ data: {
					botToken,
					chatId,
					text: formatTelegramHtml(signal, accountUsd, riskPct)
				} });
				keys.push(signal.key);
			}
			markSent(keys);
			toast.success(`Отправлено сигналов: ${keys.length}`);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Ошибка отправки");
		} finally {
			setSending(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
			side: "right",
			className: "overflow-y-auto",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, { children: "Telegram" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetDescription, { children: "Токен хранится только в этом браузере и уходит на сервер в момент отправки." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
					className: "space-y-3 text-sm text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							"1. В Telegram откройте ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-foreground",
								children: "@BotFather"
							}),
							", команда ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-foreground",
								children: "/newbot"
							}),
							" — скопируйте токен."
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							"2. Напишите своему боту любое сообщение. Chat ID узнайте у",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-foreground",
								children: "@userinfobot"
							}),
							" (личный чат) или добавьте бота в канал как администратора и укажите ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono",
								children: "@канал"
							}),
							"."
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "3. Проверьте связь и включите автоотправку новых сигналов." })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "bot-token",
								children: "Токен бота"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "bot-token",
								type: "password",
								autoComplete: "off",
								placeholder: "123456:AAH...",
								value: botToken,
								onChange: (e) => setBotToken(e.target.value.trim())
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "chat-id",
								children: "Chat ID или @канал"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "chat-id",
								placeholder: "123456789 или @mychannel",
								value: chatId,
								onChange: (e) => setChatId(e.target.value.trim())
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-3 rounded-xl bg-raised px-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium text-foreground",
								children: "Автоотправка"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "Новые сигналы уходят сами после скана"
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
								checked: autoSend,
								onCheckedChange: setAutoSend
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-2 sm:flex-row",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								className: "flex-1",
								onClick: onTest,
								disabled: testing || !botToken || !chatId,
								children: [testing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "animate-spin" }) : null, "Проверить связь"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								className: "flex-1",
								onClick: onSendAll,
								disabled: sending || !botToken || !chatId,
								children: [sending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, {}), "Отправить текущие"]
							})]
						})
					]
				})
			]
		})
	});
}
var badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide", {
	variants: { variant: {
		default: "border-transparent bg-raised text-foreground",
		long: "border-transparent bg-long/15 text-long",
		short: "border-transparent bg-short/15 text-short",
		outline: "border-border text-muted-foreground",
		mute: "border-transparent bg-secondary text-muted-foreground"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
var Separator = import_react.forwardRef(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root$1, {
	ref,
	decorative,
	orientation,
	className: cn("shrink-0 bg-border", orientation === "horizontal" ? "h-px w-full" : "h-full w-px", className),
	...props
}));
Separator.displayName = Root$1.displayName;
function Skeleton({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("animate-pulse rounded-md bg-raised", className),
		...props
	});
}
var Slider = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Slider$1, {
	ref,
	className: cn("relative flex w-full touch-none items-center select-none", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderTrack, {
		className: "relative h-1.5 w-full grow overflow-hidden rounded-full bg-raised",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderRange, { className: "absolute h-full bg-primary" })
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderThumb, { className: "block size-5 rounded-full border border-border bg-primary shadow-[var(--shadow-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" })]
}));
Slider.displayName = Slider$1.displayName;
var Tabs = Root2;
var TabsList = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {
	ref,
	className: cn("inline-flex h-11 items-center justify-start gap-1 rounded-xl bg-raised p-1 text-muted-foreground", className),
	...props
}));
TabsList.displayName = List.displayName;
var TabsTrigger = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, {
	ref,
	className: cn("inline-flex h-9 items-center justify-center rounded-lg px-3 text-sm font-medium whitespace-nowrap transition-[background-color,color] duration-[var(--motion-quick)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 data-[state=active]:bg-card data-[state=active]:text-foreground", className),
	...props
}));
TabsTrigger.displayName = Trigger.displayName;
var TabsContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content, {
	ref,
	className: cn("mt-4 focus-visible:outline-none", className),
	...props
}));
TabsContent.displayName = Content.displayName;
function PolarisApp() {
	const queryClient = useQueryClient();
	const [telegramOpen, setTelegramOpen] = (0, import_react.useState)(false);
	const [strategyOpen, setStrategyOpen] = (0, import_react.useState)(false);
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [tab, setTab] = (0, import_react.useState)("signals");
	const { botToken, chatId, autoSend, minScore, accountUsd, riskPct, sentKeys, markSent, setMinScore, setAccountUsd } = useSettings();
	const scanQuery = useQuery({
		queryKey: ["scan"],
		queryFn: () => scanMarket({ data: { force: false } }),
		refetchInterval: 18e4,
		staleTime: 6e4,
		retry: 1
	});
	const refresh = useMutation({
		mutationFn: () => scanMarket({ data: { force: true } }),
		onSuccess: (data) => {
			queryClient.setQueryData(["scan"], data);
		},
		onError: (err) => {
			toast.error(err instanceof Error ? err.message : "Скан не удался");
		}
	});
	const data = scanQuery.data;
	const scanning = scanQuery.isLoading || refresh.isPending;
	const visibleSignals = (0, import_react.useMemo)(() => (data?.signals ?? []).filter((s) => s.score >= minScore), [data, minScore]);
	(0, import_react.useEffect)(() => {
		if (!selected && data?.pairs[0]) setSelected(data.pairs[0].symbol);
	}, [data, selected]);
	const detailQuery = useQuery({
		queryKey: ["pair", selected],
		queryFn: () => getPairDetail({ data: { symbol: selected } }),
		enabled: Boolean(selected),
		staleTime: 6e4
	});
	(0, import_react.useEffect)(() => {
		if (!data || !autoSend || !botToken || !chatId) return;
		const known = new Set(useSettings.getState().sentKeys);
		const fresh = data.signals.filter((s) => s.score >= minScore && !known.has(s.key));
		if (fresh.length === 0) return;
		let cancelled = false;
		(async () => {
			const sent = [];
			for (const signal of fresh) {
				if (cancelled) return;
				try {
					await sendTelegram({ data: {
						botToken,
						chatId,
						text: formatTelegramHtml(signal, accountUsd, riskPct)
					} });
					sent.push(signal.key);
				} catch (err) {
					toast.error(err instanceof Error ? err.message : "Автоотправка не удалась");
					break;
				}
			}
			if (sent.length) {
				markSent(sent);
				toast.success(`В Telegram ушло сигналов: ${sent.length}`);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [
		data?.scannedAt,
		autoSend,
		botToken,
		chatId,
		minScore,
		accountUsd,
		riskPct,
		markSent
	]);
	async function sendOne(signal) {
		if (!botToken || !chatId) {
			setTelegramOpen(true);
			toast.message("Сначала подключите Telegram");
			return;
		}
		try {
			await sendTelegram({ data: {
				botToken,
				chatId,
				text: formatTelegramHtml(signal, accountUsd, riskPct)
			} });
			markSent([signal.key]);
			toast.success(`${signal.symbol} отправлен`);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Ошибка отправки");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-background text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "border-b border-border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PolarisMark, { className: "size-7 text-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-xl leading-tight tracking-tight",
								children: "Polaris"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "Сигналы Binance · Северный тренд · 4H"
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									onClick: () => setStrategyOpen(true),
									"aria-label": "Стратегия",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "sr-only sm:not-sr-only sm:inline",
										children: "Стратегия"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									onClick: () => setTelegramOpen(true),
									"aria-label": "Telegram",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "sr-only sm:not-sr-only sm:inline",
										children: "Telegram"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									onClick: () => refresh.mutate(),
									disabled: scanning,
									children: [scanning ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, {}), "Скан"]
								})
							]
						})]
					}), data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatsRow, { data }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatsSkeleton, {})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					className: "min-w-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
						value: tab,
						onValueChange: setTab,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
									value: "signals",
									children: ["Сигналы", visibleSignals.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "ml-1 font-mono text-xs tabular-nums text-muted-foreground",
										children: visibleSignals.length
									}) : null]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
									value: "market",
									children: "Все пары"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
									value: "risk",
									children: "Риск"
								})
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
								value: "signals",
								children: scanQuery.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
									message: scanQuery.error instanceof Error ? scanQuery.error.message : "Не удалось получить данные биржи",
									onRetry: () => refresh.mutate()
								}) : scanning && !data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignalSkeletons, {}) : visibleSignals.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptySignals, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "flex flex-col gap-2",
									children: visibleSignals.map((signal) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignalCard, {
										signal,
										active: selected === signal.symbol,
										sent: sentKeys.includes(signal.key),
										accountUsd,
										riskPct,
										onSelect: () => {
											setSelected(signal.symbol);
										},
										onSend: () => sendOne(signal)
									}) }, signal.key))
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
								value: "market",
								children: data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketTable, {
									pairs: data.pairs,
									selected,
									onSelect: setSelected
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignalSkeletons, {})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
								value: "risk",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RiskPanel, {
									minScore,
									accountUsd,
									onMinScore: setMinScore,
									onAccount: setAccountUsd
								})
							})
						]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
					className: "min-w-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailPanel, {
						symbol: selected,
						snapshot: data?.pairs.find((p) => p.symbol === selected) ?? null,
						detail: detailQuery.data ?? null,
						loading: detailQuery.isLoading,
						accountUsd,
						riskPct,
						onSend: (s) => sendOne(s)
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "mx-auto max-w-6xl px-4 pb-10 text-xs leading-relaxed text-muted-foreground sm:px-6",
				children: "Не финансовая рекомендация. Polaris считает правила на публичных свечах Binance и не исполняет сделки. Прошлые бэктесты не гарантируют результат. Рискуйте только тем, что готовы потерять."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TelegramSheet, {
				open: telegramOpen,
				onOpenChange: setTelegramOpen,
				signals: visibleSignals
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StrategySheet, {
				open: strategyOpen,
				onOpenChange: setStrategyOpen
			})
		]
	});
}
function StatsRow({ data }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
		className: "grid grid-cols-2 gap-3 sm:grid-cols-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
				label: "BTC",
				value: formatPrice(data.btcPrice),
				hint: formatPct(data.btcChange24h),
				hintClass: data.btcChange24h >= 0 ? "text-long" : "text-short"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
				label: "Режим рынка",
				value: data.marketRegime === "bull" ? "бычий" : "медвежий",
				hint: "BTC vs EMA200 · D1"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
				label: "Сигналы",
				value: `${data.longs} / ${data.shorts}`,
				hint: "лонг / шорт"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
				label: "Бэктест 4H",
				value: data.backtest.trades ? `${data.backtest.winRate.toFixed(0)}% · ${data.backtest.expectancyR.toFixed(2)}R` : "—",
				hint: data.backtest.trades ? `${data.backtest.trades} сделок, иллюстрация` : "мало истории"
			})
		]
	});
}
function Stat({ label, value, hint, hintClass }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-card px-3 py-3 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
				className: "text-[11px] tracking-wide text-muted-foreground uppercase",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
				className: "mt-1 font-mono text-sm font-medium tabular-nums",
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: cn("mt-0.5 text-xs text-muted-foreground", hintClass),
				children: hint
			})
		]
	});
}
function StatsSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-2 gap-3 sm:grid-cols-4",
		children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-[74px] rounded-xl" }, i))
	});
}
function SignalSkeletons() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-col gap-2",
		children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-28 rounded-2xl" }, i))
	});
}
function EmptySignals() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl bg-card px-5 py-10 text-center shadow-[var(--shadow-border)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-lg",
			children: "Тишина — это тоже сигнал"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mx-auto mt-2 max-w-sm text-sm text-pretty text-muted-foreground",
			children: "Нет сетапов выше порога. На боковике система молчит специально: торговать шум дороже, чем пропустить бар."
		})]
	});
}
function ErrorState({ message, onRetry }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl bg-card px-5 py-10 text-center shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-lg",
				children: "Биржа не ответила"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted-foreground",
				children: message
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-4",
				onClick: onRetry,
				children: "Повторить скан"
			})
		]
	});
}
function SignalCard({ signal, active, sent, accountUsd, riskPct, onSelect, onSend }) {
	const size = positionSize(signal, accountUsd, riskPct);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: cn("w-full rounded-2xl bg-card p-4 text-left shadow-[var(--shadow-border)] transition-[box-shadow] duration-[var(--motion-quick)]", active && "shadow-[var(--shadow-border-hover)]"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: onSelect,
			className: "w-full text-left",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-sm tracking-wide",
						children: signal.symbol
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 font-mono text-lg tabular-nums",
						children: formatPrice(signal.price)
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col items-end gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: signal.side === "long" ? "long" : "short",
							children: [
								signal.side === "long" ? "LONG" : "SHORT",
								" · ",
								signal.score
							]
						}), sent ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[11px] text-muted-foreground",
							children: "в Telegram"
						}) : null]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 font-mono text-xs tabular-nums text-muted-foreground",
					children: [
						"стоп ",
						formatPrice(signal.stop),
						" · цель ",
						formatPrice(signal.target),
						" · R:R 1:",
						signal.rr.toFixed(2)
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-xs text-muted-foreground",
					children: [
						signal.trigger,
						" · риск ",
						formatUsd(size.riskUsd),
						" USDT → ",
						formatQty(size.qty),
						" ",
						signal.base
					]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3 flex justify-end",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				size: "sm",
				onClick: onSend,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, {}), "В Telegram"]
			})
		})]
	});
}
function MarketTable({ pairs, selected, onSelect }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-x-auto rounded-2xl bg-card shadow-[var(--shadow-border)]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full min-w-[26rem] text-left text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
				className: "text-[11px] tracking-wide text-muted-foreground uppercase",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-b border-border",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Пара"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-3 py-3 font-medium",
							children: "24ч"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-3 py-3 font-medium",
							children: "Счёт"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-3 py-3 font-medium",
							children: "Сторона"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "ADX"
						})
					]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: pairs.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: cn("cursor-pointer border-b border-border last:border-0 hover:bg-raised", selected === p.symbol && "bg-raised"),
				onClick: () => onSelect(p.symbol),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-4 py-3 font-mono whitespace-nowrap",
						children: p.base
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: cn("px-3 py-3 font-mono whitespace-nowrap tabular-nums", p.change24h >= 0 ? "text-long" : "text-short"),
						children: formatPct(p.change24h)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-3 py-3 font-mono tabular-nums",
						children: p.score
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-3 py-3 whitespace-nowrap",
						children: sideLabel(p.side)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-4 py-3 font-mono tabular-nums",
						children: p.adx.toFixed(0)
					})
				]
			}, p.symbol)) })]
		})
	});
}
function RiskPanel({ minScore, accountUsd, onMinScore, onAccount }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4 rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 text-sm font-medium",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersHorizontal, { className: "size-4" }), "Порог и депозит"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-xs text-muted-foreground",
					children: ["Минимальный счёт сигнала: ", minScore]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
					min: 50,
					max: 90,
					step: 5,
					value: [minScore],
					onValueChange: (v) => onMinScore(v[0] ?? 65)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex flex-col gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs text-muted-foreground",
					children: "Депозит, USDT (для расчёта размера)"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "number",
					min: 100,
					step: 100,
					value: accountUsd,
					onChange: (e) => onAccount(Number(e.target.value) || 0),
					className: "font-mono"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-pretty text-muted-foreground",
				children: "На каждую идею система рискует 1% депозита до стопа. Не держите больше трёх позиций, если они все смотрят в BTC."
			})
		]
	});
}
function DetailPanel({ symbol, snapshot, detail, loading, accountUsd, riskPct, onSend }) {
	const pair = detail?.snapshot ?? snapshot;
	const signal = detail?.signal ?? pair?.signal ?? null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl bg-card p-4 shadow-[var(--shadow-border)] sm:p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-wide text-muted-foreground uppercase",
					children: "Пара"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl tracking-tight",
					children: pair?.base ?? symbol ?? "—"
				})] }), pair ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					variant: pair.regime === "bull" ? "long" : "short",
					children: ["D1 ", pair.regime === "bull" ? "бычий" : "медвежий"]
				}) : null]
			}),
			loading && !detail ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-4 h-56 rounded-xl" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PairChart, { points: detail?.points ?? [] })
			}),
			pair ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniStat, {
						label: "Цена",
						value: formatPrice(pair.price)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniStat, {
						label: "RSI",
						value: pair.rsi.toFixed(1)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniStat, {
						label: "ADX",
						value: pair.adx.toFixed(1)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniStat, {
						label: "Объём",
						value: `${pair.volumeRatio.toFixed(2)}×`
					})
				]
			}) : null,
			signal ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm font-medium",
							children: [
								"Конфлюэнция · ",
								signal.score,
								"/100"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							onClick: () => onSend(signal),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, {}), "В Telegram"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 space-y-2",
						children: signal.checks.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-start gap-2 text-sm",
							children: [c.pass ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "mt-0.5 size-3.5 shrink-0 text-long" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "mt-0.5 size-3.5 shrink-0 text-subtle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-foreground",
								children: c.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted-foreground",
								children: [" — ", c.detail]
							})] })]
						}, c.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, { className: "my-4" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-mono text-xs tabular-nums text-muted-foreground",
						children: [
							"стоп ",
							formatPrice(signal.stop),
							" (",
							formatPct(signal.riskPct),
							") · цель",
							" ",
							formatPrice(signal.target),
							" (",
							formatPct(signal.rewardPct),
							")"
						]
					})
				]
			}) : pair ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-5 text-sm text-muted-foreground",
				children: [
					"Сейчас нет рабочего сетапа. Режим ",
					pair.regime === "bull" ? "бычий" : "медвежий",
					", ADX ",
					pair.adx.toFixed(0),
					"."
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-5 text-sm text-muted-foreground",
				children: "Выберите пару в списке."
			}),
			detail?.backtest.trades ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-4 text-xs text-muted-foreground",
				children: [
					"На 4H-истории пары: ",
					detail.backtest.trades,
					" сделок, win",
					" ",
					detail.backtest.winRate.toFixed(0),
					"%, ожидание ",
					detail.backtest.expectancyR.toFixed(2),
					"R. Короткое окно, без комиссий — не обещание."
				]
			}) : null
		]
	});
}
function MiniStat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
		className: "text-[11px] text-muted-foreground",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
		className: "font-mono text-sm tabular-nums",
		children: value
	})] });
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PolarisApp, {});
}
//#endregion
export { Home as component };
