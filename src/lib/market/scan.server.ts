import { analyzePair, backtestPair, chartPoints, mergeBacktests } from "@/lib/strategy/engine";
import { isUniverseSymbol } from "@/lib/strategy/universe";
import type { PairDetail, ScanResult } from "@/lib/strategy/types";
import { loadPair, loadUniverse } from "./binance.server";

type Cache<T> = { at: number; value: T };
let scanCache: Cache<ScanResult> | null = null;
const SCAN_TTL = 90_000;
const detailCache = new Map<string, Cache<PairDetail>>();
const DETAIL_TTL = 60_000;

export async function runScan(force = false): Promise<ScanResult> {
  const now = Date.now();
  if (!force && scanCache && now - scanCache.at < SCAN_TTL) {
    return scanCache.value;
  }
  const { pairs: market, source } = await loadUniverse();
  const snapshots = market
    .map((p) =>
      analyzePair({
        symbol: p.symbol,
        candles4h: p.candles4h,
        candles1d: p.candles1d,
        lastPrice: p.lastPrice,
        change24h: p.change24h,
        quoteVolume24h: p.quoteVolume24h,
      }),
    )
    .filter((p): p is NonNullable<typeof p> => p != null);

  snapshots.sort((a, b) => {
    const as = a.signal ? 1 : 0;
    const bs = b.signal ? 1 : 0;
    if (as !== bs) return bs - as;
    return b.score - a.score;
  });

  const signals = snapshots
    .map((p) => p.signal)
    .filter((s): s is NonNullable<typeof s> => s != null)
    .sort((a, b) => b.score - a.score);

  const btc = snapshots.find((p) => p.symbol === "BTCUSDT");
  const backtest = mergeBacktests(market.map((p) => backtestPair(p.candles4h)));

  const result: ScanResult = {
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
    source,
  };
  scanCache = { at: now, value: result };
  return result;
}

export async function runPairDetail(symbol: string): Promise<PairDetail> {
  const upper = symbol.toUpperCase();
  if (!isUniverseSymbol(upper)) {
    throw new Error("Пара не из рабочего списка");
  }
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
    quoteVolume24h: market.quoteVolume24h,
  });
  if (!snapshot) throw new Error("Недостаточно истории по паре");

  const value: PairDetail = {
    snapshot,
    signal: snapshot.signal,
    points: chartPoints(market.candles4h, 90),
    backtest: backtestPair(market.candles4h),
  };
  detailCache.set(upper, { at: now, value });
  return value;
}
