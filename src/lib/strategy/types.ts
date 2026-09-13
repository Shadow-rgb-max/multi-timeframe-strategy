export type Side = "long" | "short" | "flat";
export type Regime = "bull" | "bear";

export type Candle = {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closeTime: number;
};

export type CheckItem = {
  id: string;
  label: string;
  pass: boolean;
  detail: string;
};

export type Signal = {
  symbol: string;
  base: string;
  side: "long" | "short";
  score: number;
  price: number;
  stop: number;
  target: number;
  atr: number;
  riskPct: number;
  rewardPct: number;
  rr: number;
  rsi: number;
  adx: number;
  ema21: number;
  ema55: number;
  ema200Daily: number;
  macdHist: number;
  volumeRatio: number;
  regime: Regime;
  trigger: string;
  checks: CheckItem[];
  barTime: number;
  key: string;
};

export type PairSnapshot = {
  symbol: string;
  base: string;
  side: Side;
  score: number;
  price: number;
  change24h: number;
  quoteVolume24h: number;
  rsi: number;
  adx: number;
  regime: Regime;
  ema21: number;
  ema55: number;
  ema200Daily: number;
  volumeRatio: number;
  signal: Signal | null;
};

export type BacktestSummary = {
  trades: number;
  wins: number;
  winRate: number;
  avgR: number;
  expectancyR: number;
  profitFactor: number | null;
};

export type ScanResult = {
  scannedAt: number;
  interval: "4h";
  marketRegime: Regime;
  btcPrice: number;
  btcChange24h: number;
  longs: number;
  shorts: number;
  flat: number;
  pairs: PairSnapshot[];
  signals: Signal[];
  backtest: BacktestSummary;
  source: string;
};

export type ChartPoint = {
  t: number;
  close: number;
  ema21: number | null;
  ema55: number | null;
  volume: number;
};

export type PairDetail = {
  snapshot: PairSnapshot;
  signal: Signal | null;
  points: ChartPoint[];
  backtest: BacktestSummary;
};
