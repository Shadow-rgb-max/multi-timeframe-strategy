import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  Check,
  Loader2,
  Minus,
  RefreshCw,
  Send,
  SlidersHorizontal,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { PairChart } from "@/components/polaris/pair-chart";
import { PolarisMark } from "@/components/polaris/mark";
import { StrategySheet } from "@/components/polaris/strategy-sheet";
import { TelegramSheet } from "@/components/polaris/telegram-sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPairDetail, scanMarket, sendTelegram } from "@/lib/server/market";
import {
  formatPct,
  formatPrice,
  formatQty,
  formatTelegramHtml,
  formatUsd,
  positionSize,
  sideLabel,
} from "@/lib/strategy/format";
import type { PairSnapshot, ScanResult, Signal } from "@/lib/strategy/types";
import { useSettings } from "@/lib/store/settings";
import { cn } from "@/lib/utils";

export function PolarisApp() {
  const queryClient = useQueryClient();
  const [telegramOpen, setTelegramOpen] = useState(false);
  const [strategyOpen, setStrategyOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState("signals");

  const {
    botToken,
    chatId,
    autoSend,
    minScore,
    accountUsd,
    riskPct,
    sentKeys,
    markSent,
    setMinScore,
    setAccountUsd,
  } = useSettings();

  const scanQuery = useQuery({
    queryKey: ["scan"],
    queryFn: () => scanMarket({ data: { force: false } }),
    refetchInterval: 180_000,
    staleTime: 60_000,
    retry: 1,
  });

  const refresh = useMutation({
    mutationFn: () => scanMarket({ data: { force: true } }),
    onSuccess: (data) => {
      queryClient.setQueryData(["scan"], data);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Скан не удался");
    },
  });

  const data = scanQuery.data;
  const scanning = scanQuery.isLoading || refresh.isPending;

  const visibleSignals = useMemo(
    () => (data?.signals ?? []).filter((s) => s.score >= minScore),
    [data, minScore],
  );

  useEffect(() => {
    if (!selected && data?.pairs[0]) setSelected(data.pairs[0].symbol);
  }, [data, selected]);

  const detailQuery = useQuery({
    queryKey: ["pair", selected],
    queryFn: () => getPairDetail({ data: { symbol: selected! } }),
    enabled: Boolean(selected),
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!data || !autoSend || !botToken || !chatId) return;
    const known = new Set(useSettings.getState().sentKeys);
    const fresh = data.signals.filter((s) => s.score >= minScore && !known.has(s.key));
    if (fresh.length === 0) return;
    let cancelled = false;
    (async () => {
      const sent: string[] = [];
      for (const signal of fresh) {
        if (cancelled) return;
        try {
          await sendTelegram({
            data: {
              botToken,
              chatId,
              text: formatTelegramHtml(signal, accountUsd, riskPct),
            },
          });
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
  }, [data?.scannedAt, autoSend, botToken, chatId, minScore, accountUsd, riskPct, markSent]);

  async function sendOne(signal: Signal) {
    if (!botToken || !chatId) {
      setTelegramOpen(true);
      toast.message("Сначала подключите Telegram");
      return;
    }
    try {
      await sendTelegram({
        data: {
          botToken,
          chatId,
          text: formatTelegramHtml(signal, accountUsd, riskPct),
        },
      });
      markSent([signal.key]);
      toast.success(`${signal.symbol} отправлен`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка отправки");
    }
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <PolarisMark className="size-7 text-foreground" />
              <div>
                <p className="font-display text-xl leading-tight tracking-tight">Polaris</p>
                <p className="text-xs text-muted-foreground">
                  Сигналы Binance · Северный тренд · 4H
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setStrategyOpen(true)}
                aria-label="Стратегия"
              >
                <BookOpen />
                <span className="sr-only sm:not-sr-only sm:inline">Стратегия</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setTelegramOpen(true)}
                aria-label="Telegram"
              >
                <Send />
                <span className="sr-only sm:not-sr-only sm:inline">Telegram</span>
              </Button>
              <Button onClick={() => refresh.mutate()} disabled={scanning}>
                {scanning ? <Loader2 className="animate-spin" /> : <RefreshCw />}
                Скан
              </Button>
            </div>
          </div>

          {data ? <StatsRow data={data} /> : <StatsSkeleton />}
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <section className="min-w-0">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="signals">
                Сигналы
                {visibleSignals.length > 0 ? (
                  <span className="ml-1 font-mono text-xs tabular-nums text-muted-foreground">
                    {visibleSignals.length}
                  </span>
                ) : null}
              </TabsTrigger>
              <TabsTrigger value="market">Все пары</TabsTrigger>
              <TabsTrigger value="risk">Риск</TabsTrigger>
            </TabsList>

            <TabsContent value="signals">
              {scanQuery.isError ? (
                <ErrorState
                  message={
                    scanQuery.error instanceof Error
                      ? scanQuery.error.message
                      : "Не удалось получить данные биржи"
                  }
                  onRetry={() => refresh.mutate()}
                />
              ) : scanning && !data ? (
                <SignalSkeletons />
              ) : visibleSignals.length === 0 ? (
                <EmptySignals />
              ) : (
                <ul className="flex flex-col gap-2">
                  {visibleSignals.map((signal) => (
                    <li key={signal.key}>
                      <SignalCard
                        signal={signal}
                        active={selected === signal.symbol}
                        sent={sentKeys.includes(signal.key)}
                        accountUsd={accountUsd}
                        riskPct={riskPct}
                        onSelect={() => {
                          setSelected(signal.symbol);
                        }}
                        onSend={() => sendOne(signal)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>

            <TabsContent value="market">
              {data ? (
                <MarketTable
                  pairs={data.pairs}
                  selected={selected}
                  onSelect={setSelected}
                />
              ) : (
                <SignalSkeletons />
              )}
            </TabsContent>

            <TabsContent value="risk">
              <RiskPanel
                minScore={minScore}
                accountUsd={accountUsd}
                onMinScore={setMinScore}
                onAccount={setAccountUsd}
              />
            </TabsContent>
          </Tabs>
        </section>

        <aside className="min-w-0">
          <DetailPanel
            symbol={selected}
            snapshot={data?.pairs.find((p) => p.symbol === selected) ?? null}
            detail={detailQuery.data ?? null}
            loading={detailQuery.isLoading}
            accountUsd={accountUsd}
            riskPct={riskPct}
            onSend={(s) => sendOne(s)}
          />
        </aside>
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-10 text-xs leading-relaxed text-muted-foreground sm:px-6">
        Не финансовая рекомендация. Polaris считает правила на публичных свечах
        Binance и не исполняет сделки. Прошлые бэктесты не гарантируют результат.
        Рискуйте только тем, что готовы потерять.
      </footer>

      <TelegramSheet
        open={telegramOpen}
        onOpenChange={setTelegramOpen}
        signals={visibleSignals}
      />
      <StrategySheet open={strategyOpen} onOpenChange={setStrategyOpen} />
    </div>
  );
}

function StatsRow({ data }: { data: ScanResult }) {
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Stat
        label="BTC"
        value={formatPrice(data.btcPrice)}
        hint={formatPct(data.btcChange24h)}
        hintClass={data.btcChange24h >= 0 ? "text-long" : "text-short"}
      />
      <Stat
        label="Режим рынка"
        value={data.marketRegime === "bull" ? "бычий" : "медвежий"}
        hint="BTC vs EMA200 · D1"
      />
      <Stat
        label="Сигналы"
        value={`${data.longs} / ${data.shorts}`}
        hint="лонг / шорт"
      />
      <Stat
        label="Бэктест 4H"
        value={
          data.backtest.trades
            ? `${data.backtest.winRate.toFixed(0)}% · ${data.backtest.expectancyR.toFixed(2)}R`
            : "—"
        }
        hint={
          data.backtest.trades
            ? `${data.backtest.trades} сделок, иллюстрация`
            : "мало истории"
        }
      />
    </dl>
  );
}

function Stat({
  label,
  value,
  hint,
  hintClass,
}: {
  label: string;
  value: string;
  hint: string;
  hintClass?: string;
}) {
  return (
    <div className="rounded-xl bg-card px-3 py-3 shadow-[var(--shadow-border)]">
      <dt className="text-xs tracking-wide text-muted-foreground uppercase">{label}</dt>
      <dd className="mt-1 font-mono text-sm font-medium tabular-nums">{value}</dd>
      <p className={cn("mt-0.5 text-xs text-muted-foreground", hintClass)}>{hint}</p>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-20 rounded-xl" />
      ))}
    </div>
  );
}

function SignalSkeletons() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-28 rounded-2xl" />
      ))}
    </div>
  );
}

function EmptySignals() {
  return (
    <div className="rounded-2xl bg-card px-5 py-10 text-center shadow-[var(--shadow-border)]">
      <p className="font-display text-lg">Тишина — это тоже сигнал</p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-pretty text-muted-foreground">
        Нет сетапов выше порога. На боковике система молчит специально: торговать
        шум дороже, чем пропустить бар.
      </p>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-2xl bg-card px-5 py-10 text-center shadow-[var(--shadow-border)]">
      <p className="font-display text-lg">Биржа не ответила</p>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      <Button className="mt-4" onClick={onRetry}>
        Повторить скан
      </Button>
    </div>
  );
}

function SignalCard({
  signal,
  active,
  sent,
  accountUsd,
  riskPct,
  onSelect,
  onSend,
}: {
  signal: Signal;
  active: boolean;
  sent: boolean;
  accountUsd: number;
  riskPct: number;
  onSelect: () => void;
  onSend: () => void;
}) {
  const size = positionSize(signal, accountUsd, riskPct);
  return (
    <article
      className={cn(
        "w-full rounded-2xl bg-card p-4 text-left shadow-[var(--shadow-border)] transition-[box-shadow] duration-[var(--motion-quick)]",
        active && "shadow-[var(--shadow-border-hover)]",
      )}
    >
      <button type="button" onClick={onSelect} className="w-full text-left">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-sm tracking-wide">{signal.symbol}</p>
            <p className="mt-1 font-mono text-lg tabular-nums">{formatPrice(signal.price)}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant={signal.side === "long" ? "long" : "short"}>
              {signal.side === "long" ? "LONG" : "SHORT"} · {signal.score}
            </Badge>
            {sent ? <span className="text-xs text-muted-foreground">в Telegram</span> : null}
          </div>
        </div>
        <p className="mt-3 font-mono text-xs tabular-nums text-muted-foreground">
          стоп {formatPrice(signal.stop)} · цель {formatPrice(signal.target)} · R:R 1:{signal.rr.toFixed(2)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {signal.trigger} · риск {formatUsd(size.riskUsd)} USDT → {formatQty(size.qty)} {signal.base}
        </p>
      </button>
      <div className="mt-3 flex justify-end">
        <Button variant="outline" size="sm" onClick={onSend}>
          <Send />В Telegram
        </Button>
      </div>
    </article>
  );
}

function MarketTable({
  pairs,
  selected,
  onSelect,
}: {
  pairs: PairSnapshot[];
  selected: string | null;
  onSelect: (symbol: string) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl bg-card shadow-[var(--shadow-border)]">
      <table className="w-full min-w-96 text-left text-sm">
        <thead className="text-xs tracking-wide text-muted-foreground uppercase">
          <tr className="border-b border-border">
            <th className="px-4 py-3 font-medium">Пара</th>
            <th className="px-3 py-3 font-medium">24ч</th>
            <th className="px-3 py-3 font-medium">Счёт</th>
            <th className="px-3 py-3 font-medium">Сторона</th>
            <th className="px-4 py-3 font-medium">ADX</th>
          </tr>
        </thead>
        <tbody>
          {pairs.map((p) => (
            <tr
              key={p.symbol}
              className={cn(
                "cursor-pointer border-b border-border last:border-0 hover:bg-raised",
                selected === p.symbol && "bg-raised",
              )}
              onClick={() => onSelect(p.symbol)}
            >
              <td className="px-4 py-3 font-mono whitespace-nowrap">{p.base}</td>
              <td
                className={cn(
                  "px-3 py-3 font-mono whitespace-nowrap tabular-nums",
                  p.change24h >= 0 ? "text-long" : "text-short",
                )}
              >
                {formatPct(p.change24h)}
              </td>
              <td className="px-3 py-3 font-mono tabular-nums">{p.score}</td>
              <td className="px-3 py-3 whitespace-nowrap">{sideLabel(p.side)}</td>
              <td className="px-4 py-3 font-mono tabular-nums">{p.adx.toFixed(0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RiskPanel({
  minScore,
  accountUsd,
  onMinScore,
  onAccount,
}: {
  minScore: number;
  accountUsd: number;
  onMinScore: (n: number) => void;
  onAccount: (n: number) => void;
}) {
  return (
    <div className="space-y-4 rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]">
      <div className="flex items-center gap-2 text-sm font-medium">
        <SlidersHorizontal className="size-4" />
        Порог и депозит
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xs text-muted-foreground">
          Минимальный счёт сигнала: {minScore}
        </span>
        <Slider
          min={50}
          max={90}
          step={5}
          value={[minScore]}
          onValueChange={(v) => onMinScore(v[0] ?? 65)}
        />
      </div>
      <label className="flex flex-col gap-2">
        <span className="text-xs text-muted-foreground">Депозит, USDT (для расчёта размера)</span>
        <Input
          type="number"
          min={100}
          step={100}
          value={accountUsd}
          onChange={(e) => onAccount(Number(e.target.value) || 0)}
          className="font-mono"
        />
      </label>
      <p className="text-sm text-pretty text-muted-foreground">
        На каждую идею система рискует 1% депозита до стопа. Не держите больше трёх
        позиций, если они все смотрят в BTC.
      </p>
    </div>
  );
}

function DetailPanel({
  symbol,
  snapshot,
  detail,
  loading,
  accountUsd,
  riskPct,
  onSend,
}: {
  symbol: string | null;
  snapshot: PairSnapshot | null;
  detail: Awaited<ReturnType<typeof getPairDetail>> | null;
  loading: boolean;
  accountUsd: number;
  riskPct: number;
  onSend: (s: Signal) => void;
}) {
  const pair = detail?.snapshot ?? snapshot;
  const signal = detail?.signal ?? pair?.signal ?? null;

  return (
    <div className="rounded-2xl bg-card p-4 shadow-[var(--shadow-border)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs tracking-wide text-muted-foreground uppercase">Пара</p>
          <h2 className="font-display text-2xl tracking-tight">{pair?.base ?? symbol ?? "—"}</h2>
        </div>
        {pair ? (
          <Badge variant={pair.regime === "bull" ? "long" : "short"}>
            D1 {pair.regime === "bull" ? "бычий" : "медвежий"}
          </Badge>
        ) : null}
      </div>

      {loading && !detail ? (
        <Skeleton className="mt-4 h-56 rounded-xl" />
      ) : (
        <div className="mt-4">
          <PairChart points={detail?.points ?? []} />
        </div>
      )}

      {pair ? (
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <MiniStat label="Цена" value={formatPrice(pair.price)} />
          <MiniStat label="RSI" value={pair.rsi.toFixed(1)} />
          <MiniStat label="ADX" value={pair.adx.toFixed(1)} />
          <MiniStat label="Объём" value={`${pair.volumeRatio.toFixed(2)}×`} />
        </dl>
      ) : null}

      {signal ? (
        <div className="mt-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">Конфлюэнция · {signal.score}/100</p>
            <Button size="sm" onClick={() => onSend(signal)}>
              <Send />
              В Telegram
            </Button>
          </div>
          <ul className="mt-3 space-y-2">
            {signal.checks.map((c) => (
              <li key={c.id} className="flex items-start gap-2 text-sm">
                {c.pass ? (
                  <Check className="mt-0.5 size-3.5 shrink-0 text-long" />
                ) : (
                  <Minus className="mt-0.5 size-3.5 shrink-0 text-subtle" />
                )}
                <span>
                  <span className="text-foreground">{c.label}</span>
                  <span className="text-muted-foreground"> — {c.detail}</span>
                </span>
              </li>
            ))}
          </ul>
          <Separator className="my-4" />
          <p className="font-mono text-xs tabular-nums text-muted-foreground">
            стоп {formatPrice(signal.stop)} ({formatPct(signal.riskPct)}) · цель{" "}
            {formatPrice(signal.target)} ({formatPct(signal.rewardPct)})
          </p>
        </div>
      ) : pair ? (
        <p className="mt-5 text-sm text-muted-foreground">
          Сейчас нет рабочего сетапа. Режим {pair.regime === "bull" ? "бычий" : "медвежий"},
          ADX {pair.adx.toFixed(0)}.
        </p>
      ) : (
        <p className="mt-5 text-sm text-muted-foreground">Выберите пару в списке.</p>
      )}

      {detail?.backtest.trades ? (
        <p className="mt-4 text-xs text-muted-foreground">
          На 4H-истории пары: {detail.backtest.trades} сделок, win{" "}
          {detail.backtest.winRate.toFixed(0)}%, ожидание {detail.backtest.expectancyR.toFixed(2)}R.
          Короткое окно, без комиссий — не обещание.
        </p>
      ) : null}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-mono text-sm tabular-nums">{value}</dd>
    </div>
  );
}
