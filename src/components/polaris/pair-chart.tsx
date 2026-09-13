import { useEffect, useMemo, useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartPoint } from "@/lib/strategy/types";
import { formatPrice } from "@/lib/strategy/format";

function formatTick(t: number) {
  return new Date(t).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function axisDecimals(points: ChartPoint[]): number {
  const ys = points.map((p) => p.close);
  const span = Math.max(...ys) - Math.min(...ys);
  if (!Number.isFinite(span) || span <= 0) return 2;
  if (span < 0.001) return 6;
  if (span < 0.05) return 5;
  if (span < 1) return 4;
  if (span < 20) return 3;
  if (span < 200) return 2;
  return 0;
}

export function PairChart({ points }: { points: ChartPoint[] }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);

  const decimals = useMemo(() => axisDecimals(points), [points]);

  if (!ready) {
    return <div className="h-56 w-full rounded-xl bg-raised" />;
  }

  if (points.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
        Загрузка ряда
      </div>
    );
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={points} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
          <CartesianGrid stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="t"
            tickFormatter={(v: number) =>
              new Date(v).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" })
            }
            tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            minTickGap={28}
          />
          <YAxis
            domain={["auto", "auto"]}
            tickCount={5}
            tickFormatter={(v: number) =>
              v.toLocaleString("ru-RU", {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
              })
            }
            tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={78}
          />
          <Tooltip
            contentStyle={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: 12,
              color: "var(--color-foreground)",
              fontSize: 12,
            }}
            labelFormatter={(v) => formatTick(Number(v))}
            formatter={(value, name) => {
              const n = typeof value === "number" ? value : Number(value);
              const label =
                name === "close" ? "Цена" : name === "ema21" ? "EMA 21" : "EMA 55";
              return [Number.isFinite(n) ? formatPrice(n) : "—", label];
            }}
          />
          <Area
            type="monotone"
            dataKey="close"
            stroke="var(--color-foreground)"
            fill="var(--color-raised)"
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="ema21"
            stroke="var(--color-long)"
            strokeWidth={1.25}
            dot={false}
            connectNulls
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="ema55"
            stroke="var(--color-muted-foreground)"
            strokeWidth={1}
            dot={false}
            connectNulls
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
