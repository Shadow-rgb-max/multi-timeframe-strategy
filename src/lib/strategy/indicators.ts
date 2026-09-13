const NAN_ARR = (n: number) => Array.from({ length: n }, () => Number.NaN);

export function sma(values: number[], period: number): number[] {
  const out = NAN_ARR(values.length);
  if (period <= 0 || values.length < period) return out;
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i]!;
    if (i >= period) sum -= values[i - period]!;
    if (i >= period - 1) out[i] = sum / period;
  }
  return out;
}

export function ema(values: number[], period: number): number[] {
  const out = NAN_ARR(values.length);
  if (period <= 0 || values.length < period) return out;
  const k = 2 / (period + 1);
  let seed = 0;
  for (let i = 0; i < period; i++) seed += values[i]!;
  let prev = seed / period;
  out[period - 1] = prev;
  for (let i = period; i < values.length; i++) {
    prev = values[i]! * k + prev * (1 - k);
    out[i] = prev;
  }
  return out;
}

export function rsi(closes: number[], period = 14): number[] {
  const out = NAN_ARR(closes.length);
  if (closes.length <= period) return out;
  let gain = 0;
  let loss = 0;
  for (let i = 1; i <= period; i++) {
    const d = closes[i]! - closes[i - 1]!;
    if (d >= 0) gain += d;
    else loss -= d;
  }
  gain /= period;
  loss /= period;
  out[period] = loss === 0 ? 100 : 100 - 100 / (1 + gain / loss);
  for (let i = period + 1; i < closes.length; i++) {
    const d = closes[i]! - closes[i - 1]!;
    const g = d > 0 ? d : 0;
    const l = d < 0 ? -d : 0;
    gain = (gain * (period - 1) + g) / period;
    loss = (loss * (period - 1) + l) / period;
    out[i] = loss === 0 ? 100 : 100 - 100 / (1 + gain / loss);
  }
  return out;
}

export function trueRange(
  highs: number[],
  lows: number[],
  closes: number[],
): number[] {
  const out = NAN_ARR(highs.length);
  for (let i = 0; i < highs.length; i++) {
    if (i === 0) {
      out[i] = highs[i]! - lows[i]!;
      continue;
    }
    const hl = highs[i]! - lows[i]!;
    const hc = Math.abs(highs[i]! - closes[i - 1]!);
    const lc = Math.abs(lows[i]! - closes[i - 1]!);
    out[i] = Math.max(hl, hc, lc);
  }
  return out;
}

export function atr(
  highs: number[],
  lows: number[],
  closes: number[],
  period = 14,
): number[] {
  const tr = trueRange(highs, lows, closes);
  const out = NAN_ARR(tr.length);
  if (tr.length <= period) return out;
  let val = 0;
  for (let i = 1; i <= period; i++) val += tr[i]!;
  val /= period;
  out[period] = val;
  for (let i = period + 1; i < tr.length; i++) {
    val = (val * (period - 1) + tr[i]!) / period;
    out[i] = val;
  }
  return out;
}

export function macd(
  closes: number[],
  fast = 12,
  slow = 26,
  signalPeriod = 9,
): { line: number[]; signal: number[]; hist: number[] } {
  const line = NAN_ARR(closes.length);
  const signal = NAN_ARR(closes.length);
  const hist = NAN_ARR(closes.length);
  const emaFast = ema(closes, fast);
  const emaSlow = ema(closes, slow);
  const macdSeries: number[] = [];
  const macdIndex: number[] = [];
  for (let i = 0; i < closes.length; i++) {
    if (Number.isFinite(emaFast[i]) && Number.isFinite(emaSlow[i])) {
      line[i] = emaFast[i]! - emaSlow[i]!;
      macdSeries.push(line[i]!);
      macdIndex.push(i);
    }
  }
  const sigSeries = ema(macdSeries, signalPeriod);
  for (let j = 0; j < macdSeries.length; j++) {
    const i = macdIndex[j]!;
    if (Number.isFinite(sigSeries[j])) {
      signal[i] = sigSeries[j]!;
      hist[i] = line[i]! - signal[i]!;
    }
  }
  return { line, signal, hist };
}

export function adx(
  highs: number[],
  lows: number[],
  closes: number[],
  period = 14,
): number[] {
  const out = NAN_ARR(highs.length);
  if (highs.length < period * 2) return out;
  const plusDM: number[] = [0];
  const minusDM: number[] = [0];
  const tr = trueRange(highs, lows, closes);
  for (let i = 1; i < highs.length; i++) {
    const up = highs[i]! - highs[i - 1]!;
    const down = lows[i - 1]! - lows[i]!;
    plusDM.push(up > down && up > 0 ? up : 0);
    minusDM.push(down > up && down > 0 ? down : 0);
  }
  let smTR = 0;
  let smPlus = 0;
  let smMinus = 0;
  for (let i = 1; i <= period; i++) {
    smTR += tr[i]!;
    smPlus += plusDM[i]!;
    smMinus += minusDM[i]!;
  }
  const dx: number[] = NAN_ARR(highs.length);
  const plusDI = smTR === 0 ? 0 : (100 * smPlus) / smTR;
  const minusDI = smTR === 0 ? 0 : (100 * smMinus) / smTR;
  const diSum = plusDI + minusDI;
  dx[period] = diSum === 0 ? 0 : (100 * Math.abs(plusDI - minusDI)) / diSum;
  let pDI = plusDI;
  let mDI = minusDI;
  for (let i = period + 1; i < highs.length; i++) {
    smTR = smTR - smTR / period + tr[i]!;
    smPlus = smPlus - smPlus / period + plusDM[i]!;
    smMinus = smMinus - smMinus / period + minusDM[i]!;
    pDI = smTR === 0 ? 0 : (100 * smPlus) / smTR;
    mDI = smTR === 0 ? 0 : (100 * smMinus) / smTR;
    const s = pDI + mDI;
    dx[i] = s === 0 ? 0 : (100 * Math.abs(pDI - mDI)) / s;
  }
  let adxVal = 0;
  let counted = 0;
  for (let i = period; i < period * 2 && i < dx.length; i++) {
    if (Number.isFinite(dx[i])) {
      adxVal += dx[i]!;
      counted++;
    }
  }
  if (counted === 0) return out;
  adxVal /= counted;
  const seedIndex = period * 2 - 1;
  if (seedIndex < out.length) out[seedIndex] = adxVal;
  for (let i = seedIndex + 1; i < dx.length; i++) {
    adxVal = (adxVal * (period - 1) + dx[i]!) / period;
    out[i] = adxVal;
  }
  return out;
}

export function lastFinite(xs: number[], offset = 0): number {
  for (let i = xs.length - 1 - offset; i >= 0; i--) {
    if (Number.isFinite(xs[i])) return xs[i]!;
  }
  return Number.NaN;
}

export function crossedAbove(
  fast: number[],
  slow: number[],
  lookback: number,
): boolean {
  const end = fast.length - 1;
  const start = Math.max(1, end - lookback + 1);
  for (let i = start; i <= end; i++) {
    if (
      Number.isFinite(fast[i]) &&
      Number.isFinite(slow[i]) &&
      Number.isFinite(fast[i - 1]) &&
      Number.isFinite(slow[i - 1]) &&
      fast[i - 1]! <= slow[i - 1]! &&
      fast[i]! > slow[i]!
    ) {
      return true;
    }
  }
  return false;
}

export function crossedBelow(
  fast: number[],
  slow: number[],
  lookback: number,
): boolean {
  const end = fast.length - 1;
  const start = Math.max(1, end - lookback + 1);
  for (let i = start; i <= end; i++) {
    if (
      Number.isFinite(fast[i]) &&
      Number.isFinite(slow[i]) &&
      Number.isFinite(fast[i - 1]) &&
      Number.isFinite(slow[i - 1]) &&
      fast[i - 1]! >= slow[i - 1]! &&
      fast[i]! < slow[i]!
    ) {
      return true;
    }
  }
  return false;
}
