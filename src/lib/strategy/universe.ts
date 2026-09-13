export const SCAN_UNIVERSE = [
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
  "INJUSDT",
] as const;

export type UniverseSymbol = (typeof SCAN_UNIVERSE)[number];

export function isUniverseSymbol(symbol: string): symbol is UniverseSymbol {
  return (SCAN_UNIVERSE as readonly string[]).includes(symbol);
}

export function baseAsset(symbol: string): string {
  return symbol.endsWith("USDT") ? symbol.slice(0, -4) : symbol;
}
