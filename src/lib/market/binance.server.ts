import { SCAN_UNIVERSE } from "@/lib/strategy/universe";
import type { Candle } from "@/lib/strategy/types";

const BASE = "https://data-api.binance.vision";

async function fetchJson<T>(url: string, timeoutMs = 8000): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { accept: "application/json" },
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

type RawKline = [
  number,
  string,
  string,
  string,
  string,
  string,
  number,
  string,
  number,
  string,
  string,
  string,
];

function parseKline(row: RawKline): Candle {
  return {
    openTime: row[0],
    open: Number(row[1]),
    high: Number(row[2]),
    low: Number(row[3]),
    close: Number(row[4]),
    volume: Number(row[5]),
    closeTime: row[6],
  };
}

export async function fetchKlines(
  symbol: string,
  interval: "4h" | "1d",
  limit: number,
): Promise<Candle[]> {
  const url = `${BASE}/api/v3/klines?symbol=${encodeURIComponent(symbol)}&interval=${interval}&limit=${limit}`;
  const raw = await fetchJson<RawKline[]>(url);
  if (!Array.isArray(raw)) throw new Error("bad klines");
  return raw.map(parseKline).filter((c) => Number.isFinite(c.close));
}

export type Ticker24h = {
  symbol: string;
  lastPrice: number;
  priceChangePercent: number;
  quoteVolume: number;
};

export async function fetchTickers(symbols: readonly string[]): Promise<Map<string, Ticker24h>> {
  const q = encodeURIComponent(JSON.stringify(symbols));
  const raw = await fetchJson<
    Array<{
      symbol: string;
      lastPrice: string;
      priceChangePercent: string;
      quoteVolume: string;
    }>
  >(`${BASE}/api/v3/ticker/24hr?symbols=${q}`);
  const map = new Map<string, Ticker24h>();
  for (const t of raw) {
    map.set(t.symbol, {
      symbol: t.symbol,
      lastPrice: Number(t.lastPrice),
      priceChangePercent: Number(t.priceChangePercent),
      quoteVolume: Number(t.quoteVolume),
    });
  }
  return map;
}

async function mapPool<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const idx = cursor++;
      out[idx] = await fn(items[idx]!);
    }
  }
  const n = Math.min(limit, items.length);
  await Promise.all(Array.from({ length: n }, () => worker()));
  return out;
}

export type PairMarket = {
  symbol: string;
  candles4h: Candle[];
  candles1d: Candle[];
  lastPrice: number;
  change24h: number;
  quoteVolume24h: number;
};

export async function loadUniverse(): Promise<{
  pairs: PairMarket[];
  source: string;
}> {
  const tickers = await fetchTickers(SCAN_UNIVERSE);
  const loaded = await mapPool(SCAN_UNIVERSE, 5, async (symbol): Promise<PairMarket | null> => {
    try {
      const [candles4h, candles1d] = await Promise.all([
        fetchKlines(symbol, "4h", 500),
        fetchKlines(symbol, "1d", 250),
      ]);
      const t = tickers.get(symbol);
      return {
        symbol,
        candles4h,
        candles1d,
        lastPrice: t?.lastPrice ?? candles4h[candles4h.length - 1]?.close ?? 0,
        change24h: t?.priceChangePercent ?? 0,
        quoteVolume24h: t?.quoteVolume ?? 0,
      };
    } catch {
      return null;
    }
  });
  return {
    pairs: loaded.filter((p): p is PairMarket => p != null && p.candles4h.length > 80),
    source: "Binance",
  };
}

export async function loadPair(symbol: string): Promise<PairMarket> {
  const [candles4h, candles1d, tickers] = await Promise.all([
    fetchKlines(symbol, "4h", 500),
    fetchKlines(symbol, "1d", 250),
    fetchTickers([symbol]),
  ]);
  const t = tickers.get(symbol);
  return {
    symbol,
    candles4h,
    candles1d,
    lastPrice: t?.lastPrice ?? candles4h[candles4h.length - 1]?.close ?? 0,
    change24h: t?.priceChangePercent ?? 0,
    quoteVolume24h: t?.quoteVolume ?? 0,
  };
}
