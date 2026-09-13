import { baseAsset } from "./universe";
import {
  adx,
  atr,
  crossedAbove,
  crossedBelow,
  ema,
  lastFinite,
  macd,
  rsi,
  sma,
} from "./indicators";
import type {
  BacktestSummary,
  Candle,
  CheckItem,
  PairSnapshot,
  Signal,
} from "./types";

const STOP_ATR = 1.8;
const TARGET_ATR = 2.7;
const MIN_ACTIONABLE = 65;
const ADX_MIN = 16;
const RSI_LONG_LO = 42;
const RSI_LONG_HI = 68;
const RSI_SHORT_LO = 32;
const RSI_SHORT_HI = 58;
const VOL_MULT = 1.1;
const LOOKBACK = 3;
const MAX_HOLD = 30;

function closedOnly(candles: Candle[], now = Date.now()): Candle[] {
  return candles.filter((c) => c.closeTime < now);
}

function pullbackLong(candles: Candle[], ema21: number[], atrArr: number[]): boolean {
  const i = candles.length - 1;
  if (i < 6) return false;
  const a = lastFinite(atrArr);
  const e = lastFinite(ema21);
  if (!Number.isFinite(a) || !Number.isFinite(e) || a <= 0) return false;
  if (candles[i]!.close < e) return false;
  for (let k = 2; k <= 6; k++) {
    const c = candles[i - k];
    const em = ema21[i - k];
    if (!c || !Number.isFinite(em)) continue;
    if (c.low <= em + 0.3 * a && c.low >= em - 0.8 * a) return true;
  }
  return false;
}

function pullbackShort(candles: Candle[], ema21: number[], atrArr: number[]): boolean {
  const i = candles.length - 1;
  if (i < 6) return false;
  const a = lastFinite(atrArr);
  const e = lastFinite(ema21);
  if (!Number.isFinite(a) || !Number.isFinite(e) || a <= 0) return false;
  if (candles[i]!.close > e) return false;
  for (let k = 2; k <= 6; k++) {
    const c = candles[i - k];
    const em = ema21[i - k];
    if (!c || !Number.isFinite(em)) continue;
    if (c.high >= em - 0.3 * a && c.high <= em + 0.8 * a) return true;
  }
  return false;
}

export type PairInputs = {
  symbol: string;
  candles4h: Candle[];
  candles1d: Candle[];
  lastPrice: number;
  change24h: number;
  quoteVolume24h: number;
};

export function analyzePair(input: PairInputs): PairSnapshot | null {
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
  const dClose = daily[daily.length - 1]!.close;

  if (
    ![e21, e55, r, a, d, hist, v, vs, e200, dClose].every((x) => Number.isFinite(x)) ||
    a <= 0 ||
    vs <= 0
  ) {
    return null;
  }

  const price = Number.isFinite(input.lastPrice) ? input.lastPrice : closes[closes.length - 1]!;
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

  const longTrigger =
    emaCrossUp ? "пересечение EMA 21/55 вверх" : macdCrossUp ? "пересечение MACD вверх" : pbLong ? "отбой от EMA 21" : "";
  const shortTrigger =
    emaCrossDn ? "пересечение EMA 21/55 вниз" : macdCrossDn ? "пересечение MACD вниз" : pbShort ? "отбой от EMA 21" : "";

  const longChecks: CheckItem[] = [
    {
      id: "regime",
      label: "Режим D1",
      pass: regime === "bull",
      detail: regime === "bull" ? "цена выше EMA200" : "цена ниже EMA200",
    },
    {
      id: "trend",
      label: "Тренд 4H",
      pass: trendLong,
      detail: trendLong ? "EMA21 > EMA55, наклон вверх" : "стек EMA не бычий",
    },
    {
      id: "rsi",
      label: "RSI",
      pass: rsiLong,
      detail: `${r.toFixed(1)} (зона 42–68)`,
    },
    {
      id: "macd",
      label: "MACD",
      pass: macdLong,
      detail: macdLong ? "гистограмма > 0 и растёт" : "нет бычьего импульса",
    },
    {
      id: "vol",
      label: "Объём",
      pass: volOk,
      detail: `${volRatio.toFixed(2)}× средней`,
    },
    {
      id: "adx",
      label: "ADX",
      pass: adxOk,
      detail: `${d.toFixed(1)} ${adxOk ? "(есть тренд)" : "(боковик)"}`,
    },
    {
      id: "trigger",
      label: "Триггер",
      pass: Boolean(longTrigger),
      detail: longTrigger || "нет свежего входа",
    },
  ];

  const shortChecks: CheckItem[] = [
    {
      id: "regime",
      label: "Режим D1",
      pass: regime === "bear",
      detail: regime === "bear" ? "цена ниже EMA200" : "цена выше EMA200",
    },
    {
      id: "trend",
      label: "Тренд 4H",
      pass: trendShort,
      detail: trendShort ? "EMA21 < EMA55, наклон вниз" : "стек EMA не медвежий",
    },
    {
      id: "rsi",
      label: "RSI",
      pass: rsiShort,
      detail: `${r.toFixed(1)} (зона 32–58)`,
    },
    {
      id: "macd",
      label: "MACD",
      pass: macdShort,
      detail: macdShort ? "гистограмма < 0 и падает" : "нет медвежьего импульса",
    },
    {
      id: "vol",
      label: "Объём",
      pass: volOk,
      detail: `${volRatio.toFixed(2)}× средней`,
    },
    {
      id: "adx",
      label: "ADX",
      pass: adxOk,
      detail: `${d.toFixed(1)} ${adxOk ? "(есть тренд)" : "(боковик)"}`,
    },
    {
      id: "trigger",
      label: "Триггер",
      pass: Boolean(shortTrigger),
      detail: shortTrigger || "нет свежего входа",
    },
  ];

  const weights: Record<string, number> = {
    regime: 22,
    trend: 18,
    rsi: 14,
    macd: 14,
    vol: 12,
    adx: 10,
    trigger: 10,
  };

  const scoreOf = (checks: CheckItem[]) =>
    checks.reduce((s, c) => s + (c.pass ? (weights[c.id] ?? 0) : 0), 0);

  const longScore = scoreOf(longChecks);
  const shortScore = scoreOf(shortChecks);

  const longOk =
    regime === "bull" && trendLong && adxOk && longScore >= MIN_ACTIONABLE;
  const shortOk =
    regime === "bear" && trendShort && adxOk && shortScore >= MIN_ACTIONABLE;

  let signal: Signal | null = null;
  const barTime = candles[candles.length - 1]!.openTime;
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
      riskPct: ((stop - price) / price) * 100,
      rewardPct: ((target - price) / price) * 100,
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
      key: `${input.symbol}-long-${barTime}`,
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
      riskPct: ((price - stop) / price) * -100,
      rewardPct: ((target - price) / price) * 100,
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
      key: `${input.symbol}-short-${barTime}`,
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
    signal,
  };
}

export function backtestPair(candlesRaw: Candle[]): BacktestSummary {
  const candles = closedOnly(candlesRaw);
  const empty: BacktestSummary = {
    trades: 0,
    wins: 0,
    winRate: 0,
    avgR: 0,
    expectancyR: 0,
    profitFactor: null,
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

  type Pos = {
    side: "long" | "short";
    entry: number;
    stop: number;
    target: number;
    risk: number;
    i: number;
  };

  const rs: number[] = [];
  let pos: Pos | null = null;

  const start = 80;
  for (let i = start; i < candles.length - 1; i++) {
    if (pos) {
      const bar = candles[i]!;
      let exit: number | null = null;
      if (pos.side === "long") {
        if (bar.low <= pos.stop) exit = pos.stop;
        else if (bar.high >= pos.target) exit = pos.target;
      } else {
        if (bar.high >= pos.stop) exit = pos.stop;
        else if (bar.low <= pos.target) exit = pos.target;
      }
      const held = i - pos.i;
      const e21 = ema21[i];
      const e55 = ema55[i];
      const reverse =
        Number.isFinite(e21) &&
        Number.isFinite(e55) &&
        ((pos.side === "long" && e21! < e55!) ||
          (pos.side === "short" && e21! > e55!));
      if (exit == null && (held >= MAX_HOLD || reverse)) exit = bar.close;
      if (exit != null) {
        const r =
          pos.side === "long"
            ? (exit - pos.entry) / pos.risk
            : (pos.entry - exit) / pos.risk;
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
    if (![e21, e55, e21p, a, d, r, h].every((x) => Number.isFinite(x)) || a! <= 0)
      continue;
    if (d! < ADX_MIN) continue;

    const trendLong = e21! > e55! && e21! > e21p!;
    const trendShort = e21! < e55! && e21! < e21p!;
    const rsiLong = r! >= RSI_LONG_LO && r! <= RSI_LONG_HI;
    const rsiShort = r! >= RSI_SHORT_LO && r! <= RSI_SHORT_HI;
    const macdLong = h! > 0;
    const macdShort = h! < 0;

    const next = candles[i + 1]!;
    if (trendLong && rsiLong && macdLong) {
      const entry = next.open;
      const stop = entry - STOP_ATR * a!;
      pos = {
        side: "long",
        entry,
        stop,
        target: entry + TARGET_ATR * a!,
        risk: entry - stop,
        i: i + 1,
      };
    } else if (trendShort && rsiShort && macdShort) {
      const entry = next.open;
      const stop = entry + STOP_ATR * a!;
      pos = {
        side: "short",
        entry,
        stop,
        target: entry - TARGET_ATR * a!,
        risk: stop - entry,
        i: i + 1,
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
    winRate: (wins / rs.length) * 100,
    avgR,
    expectancyR: avgR,
    profitFactor: grossLoss === 0 ? null : grossWin / grossLoss,
  };
}

export function mergeBacktests(parts: BacktestSummary[]): BacktestSummary {
  const trades = parts.reduce((s, p) => s + p.trades, 0);
  if (trades === 0) {
    return {
      trades: 0,
      wins: 0,
      winRate: 0,
      avgR: 0,
      expectancyR: 0,
      profitFactor: null,
    };
  }
  const wins = parts.reduce((s, p) => s + p.wins, 0);
  const avgR =
    parts.reduce((s, p) => s + p.avgR * p.trades, 0) / trades;
  const pfNums = parts.filter((p) => p.profitFactor != null && p.trades > 0);
  const profitFactor =
    pfNums.length === 0
      ? null
      : pfNums.reduce((s, p) => s + p.profitFactor! * p.trades, 0) / pfNums.reduce((s, p) => s + p.trades, 0);
  return {
    trades,
    wins,
    winRate: (wins / trades) * 100,
    avgR,
    expectancyR: avgR,
    profitFactor,
  };
}

export function chartPoints(candlesRaw: Candle[], take = 80) {
  const candles = closedOnly(candlesRaw);
  const closes = candles.map((c) => c.close);
  const ema21 = ema(closes, 21);
  const ema55 = ema(closes, 55);
  const slice = candles.slice(-take);
  const offset = candles.length - slice.length;
  return slice.map((c, i) => ({
    t: c.openTime,
    close: c.close,
    ema21: Number.isFinite(ema21[offset + i]) ? ema21[offset + i]! : null,
    ema55: Number.isFinite(ema55[offset + i]) ? ema55[offset + i]! : null,
    volume: c.volume,
  }));
}
