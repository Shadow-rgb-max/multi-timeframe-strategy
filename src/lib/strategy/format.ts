import type { Signal, Side } from "./types";

export function priceDecimals(price: number): number {
  if (price >= 1000) return 2;
  if (price >= 100) return 3;
  if (price >= 1) return 4;
  if (price >= 0.01) return 5;
  return 6;
}

export function formatPrice(price: number): string {
  return price.toLocaleString("ru-RU", {
    minimumFractionDigits: priceDecimals(price),
    maximumFractionDigits: priceDecimals(price),
  });
}

export function formatPct(pct: number, digits = 2): string {
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(digits)}%`;
}

export function formatUsd(n: number): string {
  return n.toLocaleString("ru-RU", {
    maximumFractionDigits: n >= 100 ? 0 : 2,
  });
}

export function formatQty(qty: number): string {
  if (qty >= 100) return qty.toLocaleString("ru-RU", { maximumFractionDigits: 2 });
  if (qty >= 1) return qty.toLocaleString("ru-RU", { maximumFractionDigits: 4 });
  return qty.toLocaleString("ru-RU", { maximumFractionDigits: 6 });
}

export function sideLabel(side: Side): string {
  if (side === "long") return "лонг";
  if (side === "short") return "шорт";
  return "—";
}

export function positionSize(signal: Signal, accountUsd: number, riskPct: number) {
  const riskUsd = accountUsd * (riskPct / 100);
  const stopDist = Math.abs(signal.price - signal.stop);
  const qty = stopDist > 0 ? riskUsd / stopDist : 0;
  return { riskUsd, qty, notional: qty * signal.price };
}

function esc(s: string): string {
  return s.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">");
}

export function formatTelegramHtml(
  signal: Signal,
  accountUsd: number,
  riskPct: number,
): string {
  const { qty, riskUsd } = positionSize(signal, accountUsd, riskPct);
  const side = signal.side === "long" ? "LONG" : "SHORT";
  const checks = signal.checks
    .map((c) => `${c.pass ? "✓" : "·"} ${esc(c.label)} — ${esc(c.detail)}`)
    .join("\n");
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
    `Не является инвестиционной рекомендацией.`,
  ].join("\n");
}
