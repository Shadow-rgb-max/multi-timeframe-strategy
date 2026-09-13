//#region node_modules/.nitro/vite/services/ssr/assets/scan.server-CvQXzuea.js
var SCAN_UNIVERSE = [
	"BTCUSDT",
	"ETHUSDT",
	"BNBUSDT",
	"SOLUSDT",
	"XRPUSDT",
	"DOGEUSDT",
	"ADAUSDT",
	"AVAXUSDT",
	"LINKUSDT",
	"TONUSDT",
	"SUIUSDT",
	"DOTUSDT",
	"LTCUSDT",
	"NEARUSDT",
	"ATOMUSDT",
	"APTUSDT",
	"UNIUSDT",
	"AAVEUSDT",
	"FILUSDT",
	"INJUSDT"
];
function isUniverseSymbol(symbol) {
	return SCAN_UNIVERSE.includes(symbol);
}
function baseAsset(symbol) {
	return symbol.endsWith("USDT") ? symbol.slice(0, -4) : symbol;
}
var NAN_ARR = (n) => Array.from({ length: n }, () => NaN);
function sma(values, period) {
	const out = NAN_ARR(values.length);
	if (period <= 0 || values.length < period) return out;
	let sum = 0;
	for (let i = 0; i < values.length; i++) {
		sum += values[i];
		if (i >= period) sum -= values[i - period];
		if (i >= period - 1) out[i] = sum / period;
	}
	return out;
}
function ema(values, period) {
	const out = NAN_ARR(values.length);
	if (period <= 0 || values.length < period) return out;
	const k = 2 / (period + 1);
	let seed = 0;
	for (let i = 0; i < period; i++) seed += values[i];
	let prev = seed / period;
	out[period - 1] = prev;
	for (let i = period; i < values.length; i++) {
		prev = values[i] * k + prev * (1 - k);
		out[i] = prev;
	}
	return out;
}
function rsi(closes, period = 14) {
	const out = NAN_ARR(closes.length);
	if (closes.length <= period) return out;
	let gain = 0;
	let loss = 0;
	for (let i = 1; i <= period; i++) {
		const d = closes[i] - closes[i - 1];
		if (d >= 0) gain += d;
		else loss -= d;
	}
	gain /= period;
	loss /= period;
	out[period] = loss === 0 ? 100 : 100 - 100 / (1 + gain / loss);
	for (let i = period + 1; i < closes.length; i++) {
		const d = closes[i] - closes[i - 1];
		const g = d > 0 ? d : 0;
		const l = d < 0 ? -d : 0;
		gain = (gain * (period - 1) + g) / period;
		loss = (loss * (period - 1) + l) / period;
		out[i] = loss === 0 ? 100 : 100 - 100 / (1 + gain / loss);
	}
	return out;
}
function trueRange(highs, lows, closes) {
	const out = NAN_ARR(highs.length);
	for (let i = 0; i < highs.length; i++) {
		if (i === 0) {
			out[i] = highs[i] - lows[i];
			continue;
		}
		const hl = highs[i] - lows[i];
		const hc = Math.abs(highs[i] - closes[i - 1]);
		const lc = Math.abs(lows[i] - closes[i - 1]);
		out[i] = Math.max(hl, hc, lc);
	}
	return out;
}
function atr(highs, lows, closes, period = 14) {
	const tr = trueRange(highs, lows, closes);
	const out = NAN_ARR(tr.length);
	if (tr.length <= period) return out;
	let val = 0;
	for (let i = 1; i <= period; i++) val += tr[i];
	val /= period;
	out[period] = val;
	for (let i = period + 1; i < tr.length; i++) {
		val = (val * (period - 1) + tr[i]) / period;
		out[i] = val;
	}
	return out;
}
function macd(closes, fast = 12, slow = 26, signalPeriod = 9) {
	const line = NAN_ARR(closes.length);
	const signal = NAN_ARR(closes.length);
	const hist = NAN_ARR(closes.length);
	const emaFast = ema(closes, fast);
	const emaSlow = ema(closes, slow);
	const macdSeries = [];
	const macdIndex = [];
	for (let i = 0; i < closes.length; i++) if (Number.isFinite(emaFast[i]) && Number.isFinite(emaSlow[i])) {
		line[i] = emaFast[i] - emaSlow[i];
		macdSeries.push(line[i]);
		macdIndex.push(i);
	}
	const sigSeries = ema(macdSeries, signalPeriod);
	for (let j = 0; j < macdSeries.length; j++) {
		const i = macdIndex[j];
		if (Number.isFinite(sigSeries[j])) {
			signal[i] = sigSeries[j];
			hist[i] = line[i] - signal[i];
		}
	}
	return {
		line,
		signal,
		hist
	};
}
function adx(highs, lows, closes, period = 14) {
	const out = NAN_ARR(highs.length);
	if (highs.length < period * 2) return out;
	const plusDM = [0];
	const minusDM = [0];
	const tr = trueRange(highs, lows, closes);
	for (let i = 1; i < highs.length; i++) {
		const up = highs[i] - highs[i - 1];
		const down = lows[i - 1] - lows[i];
		plusDM.push(up > down && up > 0 ? up : 0);
		minusDM.push(down > up && down > 0 ? down : 0);
	}
	let smTR = 0;
	let smPlus = 0;
	let smMinus = 0;
	for (let i = 1; i <= period; i++) {
		smTR += tr[i];
		smPlus += plusDM[i];
		smMinus += minusDM[i];
	}
	const dx = NAN_ARR(highs.length);
	const plusDI = smTR === 0 ? 0 : 100 * smPlus / smTR;
	const minusDI = smTR === 0 ? 0 : 100 * smMinus / smTR;
	const diSum = plusDI + minusDI;
	dx[period] = diSum === 0 ? 0 : 100 * Math.abs(plusDI - minusDI) / diSum;
	let pDI = plusDI;
	let mDI = minusDI;
	for (let i = period + 1; i < highs.length; i++) {
		smTR = smTR - smTR / period + tr[i];
		smPlus = smPlus - smPlus / period + plusDM[i];
		smMinus = smMinus - smMinus / period + minusDM[i];
		pDI = smTR === 0 ? 0 : 100 * smPlus / smTR;
		mDI = smTR === 0 ? 0 : 100 * smMinus / smTR;
		const s = pDI + mDI;
		dx[i] = s === 0 ? 0 : 100 * Math.abs(pDI - mDI) / s;
	}
	let adxVal = 0;
	let counted = 0;
	for (let i = period; i < period * 2 && i < dx.length; i++) if (Number.isFinite(dx[i])) {
		adxVal += dx[i];
		counted++;
	}
	if (counted === 0) return out;
	adxVal /= counted;
	const seedIndex = period * 2 - 1;
	if (seedIndex < out.length) out[seedIndex] = adxVal;
	for (let i = seedIndex + 1; i < dx.length; i++) {
		adxVal = (adxVal * (period - 1) + dx[i]) / period;
		out[i] = adxVal;
	}
	return out;
}
function lastFinite(xs, offset = 0) {
	for (let i = xs.length - 1 - offset; i >= 0; i--) if (Number.isFinite(xs[i])) return xs[i];
	return NaN;
}
function crossedAbove(fast, slow, lookback) {
	const end = fast.length - 1;
	const start = Math.max(1, end - lookback + 1);
	for (let i = start; i <= end; i++) if (Number.isFinite(fast[i]) && Number.isFinite(slow[i]) && Number.isFinite(fast[i - 1]) && Number.isFinite(slow[i - 1]) && fast[i - 1] <= slow[i - 1] && fast[i] > slow[i]) return true;
	return false;
}
function crossedBelow(fast, slow, lookback) {
	const end = fast.length - 1;
	const start = Math.max(1, end - lookback + 1);
	for (let i = start; i <= end; i++) if (Number.isFinite(fast[i]) && Number.isFinite(slow[i]) && Number.isFinite(fast[i - 1]) && Number.isFinite(slow[i - 1]) && fast[i - 1] >= slow[i - 1] && fast[i] < slow[i]) return true;
	return false;
}
var STOP_ATR = 1.8;
var TARGET_ATR = 2.7;
var MIN_ACTIONABLE = 65;
var ADX_MIN = 16;
var RSI_LONG_LO = 42;
var RSI_LONG_HI = 68;
var RSI_SHORT_LO = 32;
var RSI_SHORT_HI = 58;
var VOL_MULT = 1.1;
var LOOKBACK = 3;
var MAX_HOLD = 30;
function closedOnly(candles, now = Date.now()) {
	return candles.filter((c) => c.closeTime < now);
}
function pullbackLong(candles, ema21, atrArr) {
	const i = candles.length - 1;
	if (i < 6) return false;
	const a = lastFinite(atrArr);
	const e = lastFinite(ema21);
	if (!Number.isFinite(a) || !Number.isFinite(e) || a <= 0) return false;
	if (candles[i].close < e) return false;
	for (let k = 2; k <= 6; k++) {
		const c = candles[i - k];
		const em = ema21[i - k];
		if (!c || !Number.isFinite(em)) continue;
		if (c.low <= em + .3 * a && c.low >= em - .8 * a) return true;
	}
	return false;
}
function pullbackShort(candles, ema21, atrArr) {
	const i = candles.length - 1;
	if (i < 6) return false;
	const a = lastFinite(atrArr);
	const e = lastFinite(ema21);
	if (!Number.isFinite(a) || !Number.isFinite(e) || a <= 0) return false;
	if (candles[i].close > e) return false;
	for (let k = 2; k <= 6; k++) {
		const c = candles[i - k];
		const em = ema21[i - k];
		if (!c || !Number.isFinite(em)) continue;
		if (c.high >= em - .3 * a && c.high <= em + .8 * a) return true;
	}
	return false;
}
function analyzePair(input) {
	const candles = closedOnly(input.candles4h);
	const daily = closedOnly(input.candles1d);
	if (candles.length < 80 || daily.length < 210) return null;
	const closes = candles.map((c) => c.close);
	const highs = candles.map((c) => c.high);
	const lows = candles.map((c) => c.low);
	const vols = candles.map((c) => c.volume);
	const dailyCloses = daily.map((c) => c.close);
	const ema21 = ema(closes, 21);
	const ema55 = ema(closes, 55);
	const rsiArr = rsi(closes, 14);
	const atrArr = atr(highs, lows, closes, 14);
	const adxArr = adx(highs, lows, closes, 14);
	const macdArr = macd(closes);
	const volSma = sma(vols, 20);
	const ema200d = ema(dailyCloses, 200);
	const e21 = lastFinite(ema21);
	const e55 = lastFinite(ema55);
	const e21Prev = lastFinite(ema21, 3);
	const r = lastFinite(rsiArr);
	const a = lastFinite(atrArr);
	const d = lastFinite(adxArr);
	const hist = lastFinite(macdArr.hist);
	const histPrev = lastFinite(macdArr.hist, 1);
	const v = lastFinite(vols);
	const vs = lastFinite(volSma);
	const e200 = lastFinite(ema200d);
	const dClose = daily[daily.length - 1].close;
	if (![
		e21,
		e55,
		r,
		a,
		d,
		hist,
		v,
		vs,
		e200,
		dClose
	].every((x) => Number.isFinite(x)) || a <= 0 || vs <= 0) return null;
	const price = Number.isFinite(input.lastPrice) ? input.lastPrice : closes[closes.length - 1];
	const regime = dClose >= e200 ? "bull" : "bear";
	const volRatio = v / vs;
	const emaSlopeUp = e21 > e21Prev;
	const trendLong = e21 > e55 && emaSlopeUp;
	const trendShort = e21 < e55 && !emaSlopeUp;
	const rsiLong = r >= RSI_LONG_LO && r <= RSI_LONG_HI;
	const rsiShort = r >= RSI_SHORT_LO && r <= RSI_SHORT_HI;
	const macdLong = hist > 0 && hist >= histPrev;
	const macdShort = hist < 0 && hist <= histPrev;
	const volOk = volRatio >= VOL_MULT;
	const adxOk = d >= ADX_MIN;
	const emaCrossUp = crossedAbove(ema21, ema55, LOOKBACK);
	const emaCrossDn = crossedBelow(ema21, ema55, LOOKBACK);
	const macdCrossUp = crossedAbove(macdArr.line, macdArr.signal, LOOKBACK);
	const macdCrossDn = crossedBelow(macdArr.line, macdArr.signal, LOOKBACK);
	const pbLong = pullbackLong(candles, ema21, atrArr);
	const pbShort = pullbackShort(candles, ema21, atrArr);
	const longTrigger = emaCrossUp ? "пересечение EMA 21/55 вверх" : macdCrossUp ? "пересечение MACD вверх" : pbLong ? "отбой от EMA 21" : "";
	const shortTrigger = emaCrossDn ? "пересечение EMA 21/55 вниз" : macdCrossDn ? "пересечение MACD вниз" : pbShort ? "отбой от EMA 21" : "";
	const longChecks = [
		{
			id: "regime",
			label: "Режим D1",
			pass: regime === "bull",
			detail: regime === "bull" ? "цена выше EMA200" : "цена ниже EMA200"
		},
		{
			id: "trend",
			label: "Тренд 4H",
			pass: trendLong,
			detail: trendLong ? "EMA21 > EMA55, наклон вверх" : "стек EMA не бычий"
		},
		{
			id: "rsi",
			label: "RSI",
			pass: rsiLong,
			detail: `${r.toFixed(1)} (зона 42–68)`
		},
		{
			id: "macd",
			label: "MACD",
			pass: macdLong,
			detail: macdLong ? "гистограмма > 0 и растёт" : "нет бычьего импульса"
		},
		{
			id: "vol",
			label: "Объём",
			pass: volOk,
			detail: `${volRatio.toFixed(2)}× средней`
		},
		{
			id: "adx",
			label: "ADX",
			pass: adxOk,
			detail: `${d.toFixed(1)} ${adxOk ? "(есть тренд)" : "(боковик)"}`
		},
		{
			id: "trigger",
			label: "Триггер",
			pass: Boolean(longTrigger),
			detail: longTrigger || "нет свежего входа"
		}
	];
	const shortChecks = [
		{
			id: "regime",
			label: "Режим D1",
			pass: regime === "bear",
			detail: regime === "bear" ? "цена ниже EMA200" : "цена выше EMA200"
		},
		{
			id: "trend",
			label: "Тренд 4H",
			pass: trendShort,
			detail: trendShort ? "EMA21 < EMA55, наклон вниз" : "стек EMA не медвежий"
		},
		{
			id: "rsi",
			label: "RSI",
			pass: rsiShort,
			detail: `${r.toFixed(1)} (зона 32–58)`
		},
		{
			id: "macd",
			label: "MACD",
			pass: macdShort,
			detail: macdShort ? "гистограмма < 0 и падает" : "нет медвежьего импульса"
		},
		{
			id: "vol",
			label: "Объём",
			pass: volOk,
			detail: `${volRatio.toFixed(2)}× средней`
		},
		{
			id: "adx",
			label: "ADX",
			pass: adxOk,
			detail: `${d.toFixed(1)} ${adxOk ? "(есть тренд)" : "(боковик)"}`
		},
		{
			id: "trigger",
			label: "Триггер",
			pass: Boolean(shortTrigger),
			detail: shortTrigger || "нет свежего входа"
		}
	];
	const weights = {
		regime: 22,
		trend: 18,
		rsi: 14,
		macd: 14,
		vol: 12,
		adx: 10,
		trigger: 10
	};
	const scoreOf = (checks) => checks.reduce((s, c) => s + (c.pass ? weights[c.id] ?? 0 : 0), 0);
	const longScore = scoreOf(longChecks);
	const shortScore = scoreOf(shortChecks);
	const longOk = regime === "bull" && trendLong && adxOk && longScore >= MIN_ACTIONABLE;
	const shortOk = regime === "bear" && trendShort && adxOk && shortScore >= MIN_ACTIONABLE;
	let signal = null;
	const barTime = candles[candles.length - 1].openTime;
	const base = baseAsset(input.symbol);
	if (longOk && longScore >= shortScore) {
		const stop = price - STOP_ATR * a;
		const target = price + TARGET_ATR * a;
		signal = {
			symbol: input.symbol,
			base,
			side: "long",
			score: longScore,
			price,
			stop,
			target,
			atr: a,
			riskPct: (stop - price) / price * 100,
			rewardPct: (target - price) / price * 100,
			rr: TARGET_ATR / STOP_ATR,
			rsi: r,
			adx: d,
			ema21: e21,
			ema55: e55,
			ema200Daily: e200,
			macdHist: hist,
			volumeRatio: volRatio,
			regime,
			trigger: longTrigger || "конфлюэнция без свежего триггера",
			checks: longChecks,
			barTime,
			key: `${input.symbol}-long-${barTime}`
		};
	} else if (shortOk) {
		const stop = price + STOP_ATR * a;
		const target = price - TARGET_ATR * a;
		signal = {
			symbol: input.symbol,
			base,
			side: "short",
			score: shortScore,
			price,
			stop,
			target,
			atr: a,
			riskPct: (price - stop) / price * -100,
			rewardPct: (target - price) / price * 100,
			rr: TARGET_ATR / STOP_ATR,
			rsi: r,
			adx: d,
			ema21: e21,
			ema55: e55,
			ema200Daily: e200,
			macdHist: hist,
			volumeRatio: volRatio,
			regime,
			trigger: shortTrigger || "конфлюэнция без свежего триггера",
			checks: shortChecks,
			barTime,
			key: `${input.symbol}-short-${barTime}`
		};
	}
	const side = signal ? signal.side : "flat";
	const score = signal ? signal.score : Math.max(longScore, shortScore);
	return {
		symbol: input.symbol,
		base,
		side,
		score,
		price,
		change24h: input.change24h,
		quoteVolume24h: input.quoteVolume24h,
		rsi: r,
		adx: d,
		regime,
		ema21: e21,
		ema55: e55,
		ema200Daily: e200,
		volumeRatio: volRatio,
		signal
	};
}
function backtestPair(candlesRaw) {
	const candles = closedOnly(candlesRaw);
	const empty = {
		trades: 0,
		wins: 0,
		winRate: 0,
		avgR: 0,
		expectancyR: 0,
		profitFactor: null
	};
	if (candles.length < 120) return empty;
	const closes = candles.map((c) => c.close);
	const highs = candles.map((c) => c.high);
	const lows = candles.map((c) => c.low);
	const ema21 = ema(closes, 21);
	const ema55 = ema(closes, 55);
	const atrArr = atr(highs, lows, closes, 14);
	const adxArr = adx(highs, lows, closes, 14);
	const rsiArr = rsi(closes, 14);
	const macdArr = macd(closes);
	const rs = [];
	let pos = null;
	for (let i = 80; i < candles.length - 1; i++) {
		if (pos) {
			const bar = candles[i];
			let exit = null;
			if (pos.side === "long") {
				if (bar.low <= pos.stop) exit = pos.stop;
				else if (bar.high >= pos.target) exit = pos.target;
			} else if (bar.high >= pos.stop) exit = pos.stop;
			else if (bar.low <= pos.target) exit = pos.target;
			const held = i - pos.i;
			const e21 = ema21[i];
			const e55 = ema55[i];
			const reverse = Number.isFinite(e21) && Number.isFinite(e55) && (pos.side === "long" && e21 < e55 || pos.side === "short" && e21 > e55);
			if (exit == null && (held >= MAX_HOLD || reverse)) exit = bar.close;
			if (exit != null) {
				const r = pos.side === "long" ? (exit - pos.entry) / pos.risk : (pos.entry - exit) / pos.risk;
				rs.push(r);
				pos = null;
			}
			continue;
		}
		const e21 = ema21[i];
		const e55 = ema55[i];
		const e21p = ema21[i - 3];
		const a = atrArr[i];
		const d = adxArr[i];
		const r = rsiArr[i];
		const h = macdArr.hist[i];
		if (![
			e21,
			e55,
			e21p,
			a,
			d,
			r,
			h
		].every((x) => Number.isFinite(x)) || a <= 0) continue;
		if (d < ADX_MIN) continue;
		const trendLong = e21 > e55 && e21 > e21p;
		const trendShort = e21 < e55 && e21 < e21p;
		const rsiLong = r >= RSI_LONG_LO && r <= RSI_LONG_HI;
		const rsiShort = r >= RSI_SHORT_LO && r <= RSI_SHORT_HI;
		const macdLong = h > 0;
		const macdShort = h < 0;
		const next = candles[i + 1];
		if (trendLong && rsiLong && macdLong) {
			const entry = next.open;
			const stop = entry - STOP_ATR * a;
			pos = {
				side: "long",
				entry,
				stop,
				target: entry + TARGET_ATR * a,
				risk: entry - stop,
				i: i + 1
			};
		} else if (trendShort && rsiShort && macdShort) {
			const entry = next.open;
			const stop = entry + STOP_ATR * a;
			pos = {
				side: "short",
				entry,
				stop,
				target: entry - TARGET_ATR * a,
				risk: stop - entry,
				i: i + 1
			};
		}
	}
	if (rs.length === 0) return empty;
	const wins = rs.filter((x) => x > 0).length;
	const avgR = rs.reduce((s, x) => s + x, 0) / rs.length;
	const grossWin = rs.filter((x) => x > 0).reduce((s, x) => s + x, 0);
	const grossLoss = Math.abs(rs.filter((x) => x <= 0).reduce((s, x) => s + x, 0));
	return {
		trades: rs.length,
		wins,
		winRate: wins / rs.length * 100,
		avgR,
		expectancyR: avgR,
		profitFactor: grossLoss === 0 ? null : grossWin / grossLoss
	};
}
function mergeBacktests(parts) {
	const trades = parts.reduce((s, p) => s + p.trades, 0);
	if (trades === 0) return {
		trades: 0,
		wins: 0,
		winRate: 0,
		avgR: 0,
		expectancyR: 0,
		profitFactor: null
	};
	const wins = parts.reduce((s, p) => s + p.wins, 0);
	const avgR = parts.reduce((s, p) => s + p.avgR * p.trades, 0) / trades;
	const pfNums = parts.filter((p) => p.profitFactor != null && p.trades > 0);
	const profitFactor = pfNums.length === 0 ? null : pfNums.reduce((s, p) => s + p.profitFactor * p.trades, 0) / pfNums.reduce((s, p) => s + p.trades, 0);
	return {
		trades,
		wins,
		winRate: wins / trades * 100,
		avgR,
		expectancyR: avgR,
		profitFactor
	};
}
function chartPoints(candlesRaw, take = 80) {
	const candles = closedOnly(candlesRaw);
	const closes = candles.map((c) => c.close);
	const ema21 = ema(closes, 21);
	const ema55 = ema(closes, 55);
	const slice = candles.slice(-take);
	const offset = candles.length - slice.length;
	return slice.map((c, i) => ({
		t: c.openTime,
		close: c.close,
		ema21: Number.isFinite(ema21[offset + i]) ? ema21[offset + i] : null,
		ema55: Number.isFinite(ema55[offset + i]) ? ema55[offset + i] : null,
		volume: c.volume
	}));
}
var BASE = "https://data-api.binance.vision";
async function fetchJson(url, timeoutMs = 8e3) {
	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), timeoutMs);
	try {
		const res = await fetch(url, {
			signal: ctrl.signal,
			headers: { accept: "application/json" }
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return await res.json();
	} finally {
		clearTimeout(timer);
	}
}
function parseKline(row) {
	return {
		openTime: row[0],
		open: Number(row[1]),
		high: Number(row[2]),
		low: Number(row[3]),
		close: Number(row[4]),
		volume: Number(row[5]),
		closeTime: row[6]
	};
}
async function fetchKlines(symbol, interval, limit) {
	const raw = await fetchJson(`${BASE}/api/v3/klines?symbol=${encodeURIComponent(symbol)}&interval=${interval}&limit=${limit}`);
	if (!Array.isArray(raw)) throw new Error("bad klines");
	return raw.map(parseKline).filter((c) => Number.isFinite(c.close));
}
async function fetchTickers(symbols) {
	const raw = await fetchJson(`${BASE}/api/v3/ticker/24hr?symbols=${encodeURIComponent(JSON.stringify(symbols))}`);
	const map = /* @__PURE__ */ new Map();
	for (const t of raw) map.set(t.symbol, {
		symbol: t.symbol,
		lastPrice: Number(t.lastPrice),
		priceChangePercent: Number(t.priceChangePercent),
		quoteVolume: Number(t.quoteVolume)
	});
	return map;
}
async function mapPool(items, limit, fn) {
	const out = new Array(items.length);
	let cursor = 0;
	async function worker() {
		while (cursor < items.length) {
			const idx = cursor++;
			out[idx] = await fn(items[idx]);
		}
	}
	const n = Math.min(limit, items.length);
	await Promise.all(Array.from({ length: n }, () => worker()));
	return out;
}
async function loadUniverse() {
	const tickers = await fetchTickers(SCAN_UNIVERSE);
	return {
		pairs: (await mapPool(SCAN_UNIVERSE, 5, async (symbol) => {
			try {
				const [candles4h, candles1d] = await Promise.all([fetchKlines(symbol, "4h", 500), fetchKlines(symbol, "1d", 250)]);
				const t = tickers.get(symbol);
				return {
					symbol,
					candles4h,
					candles1d,
					lastPrice: t?.lastPrice ?? candles4h[candles4h.length - 1]?.close ?? 0,
					change24h: t?.priceChangePercent ?? 0,
					quoteVolume24h: t?.quoteVolume ?? 0
				};
			} catch {
				return null;
			}
		})).filter((p) => p != null && p.candles4h.length > 80),
		source: "Binance"
	};
}
async function loadPair(symbol) {
	const [candles4h, candles1d, tickers] = await Promise.all([
		fetchKlines(symbol, "4h", 500),
		fetchKlines(symbol, "1d", 250),
		fetchTickers([symbol])
	]);
	const t = tickers.get(symbol);
	return {
		symbol,
		candles4h,
		candles1d,
		lastPrice: t?.lastPrice ?? candles4h[candles4h.length - 1]?.close ?? 0,
		change24h: t?.priceChangePercent ?? 0,
		quoteVolume24h: t?.quoteVolume ?? 0
	};
}
var scanCache = null;
var SCAN_TTL = 9e4;
var detailCache = /* @__PURE__ */ new Map();
var DETAIL_TTL = 6e4;
async function runScan(force = false) {
	const now = Date.now();
	if (!force && scanCache && now - scanCache.at < SCAN_TTL) return scanCache.value;
	const { pairs: market, source } = await loadUniverse();
	const snapshots = market.map((p) => analyzePair({
		symbol: p.symbol,
		candles4h: p.candles4h,
		candles1d: p.candles1d,
		lastPrice: p.lastPrice,
		change24h: p.change24h,
		quoteVolume24h: p.quoteVolume24h
	})).filter((p) => p != null);
	snapshots.sort((a, b) => {
		const as = a.signal ? 1 : 0;
		const bs = b.signal ? 1 : 0;
		if (as !== bs) return bs - as;
		return b.score - a.score;
	});
	const signals = snapshots.map((p) => p.signal).filter((s) => s != null).sort((a, b) => b.score - a.score);
	const btc = snapshots.find((p) => p.symbol === "BTCUSDT");
	const backtest = mergeBacktests(market.map((p) => backtestPair(p.candles4h)));
	const result = {
		scannedAt: now,
		interval: "4h",
		marketRegime: btc?.regime ?? "bull",
		btcPrice: btc?.price ?? 0,
		btcChange24h: btc?.change24h ?? 0,
		longs: snapshots.filter((p) => p.side === "long").length,
		shorts: snapshots.filter((p) => p.side === "short").length,
		flat: snapshots.filter((p) => p.side === "flat").length,
		pairs: snapshots,
		signals,
		backtest,
		source
	};
	scanCache = {
		at: now,
		value: result
	};
	return result;
}
async function runPairDetail(symbol) {
	const upper = symbol.toUpperCase();
	if (!isUniverseSymbol(upper)) throw new Error("Пара не из рабочего списка");
	const now = Date.now();
	const hit = detailCache.get(upper);
	if (hit && now - hit.at < DETAIL_TTL) return hit.value;
	const market = await loadPair(upper);
	const snapshot = analyzePair({
		symbol: upper,
		candles4h: market.candles4h,
		candles1d: market.candles1d,
		lastPrice: market.lastPrice,
		change24h: market.change24h,
		quoteVolume24h: market.quoteVolume24h
	});
	if (!snapshot) throw new Error("Недостаточно истории по паре");
	const value = {
		snapshot,
		signal: snapshot.signal,
		points: chartPoints(market.candles4h, 90),
		backtest: backtestPair(market.candles4h)
	};
	detailCache.set(upper, {
		at: now,
		value
	});
	return value;
}
//#endregion
export { runPairDetail, runScan };
