import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const RULES = [
  {
    title: "Фильтр режима · дневка",
    body: "Лонги только если цена выше EMA 200 на 1D, шорты — только ниже. Так отсекаются контртрендовые сделки против старшего потока.",
  },
  {
    title: "Тренд · 4 часа",
    body: "Стек EMA 21 / 55 и наклон быстрой средней. Вход по направлению тренда, не против него.",
  },
  {
    title: "Импульс",
    body: "RSI 14 в рабочей зоне (не перекуплен для лонга, не перепродан для шорта) и гистограмма MACD в ту же сторону.",
  },
  {
    title: "Объём и ADX",
    body: "Объём выше 1.1× средней за 20 баров — участие есть. ADX ниже 16 — боковик, сигналы глушатся.",
  },
  {
    title: "Триггер",
    body: "Свежий вход: пересечение EMA или MACD за последние 3 свечи, либо отбой от EMA 21. Без триггера счёт ниже, в Telegram не уходит.",
  },
  {
    title: "Риск",
    body: "Стоп 1.8× ATR(14), цель 2.7× ATR — фиксированный R:R 1:1.5. Размер позиции считается от 1% депозита на стоп. Не больше трёх коррелированных идей сразу.",
  },
];

export function StrategySheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Северный тренд</SheetTitle>
          <SheetDescription>
            Рабочая система, не «гарантированная прибыль». Край живёт в толстых
            хвостах трендов — и умирает, если игнорировать стопы.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 text-sm leading-relaxed text-pretty">
          <p className="text-muted-foreground">
            Сетки, мартингейл и «нейросеть без модели» красиво выглядят на боковике
            и сгорают на импульсе. У тренд-следования (Turtles, managed futures,
            стек EMA) самый длинный публичный след на рынках с жирными хвостами —
            а крипта именно такая.
          </p>

          <ul className="space-y-4">
            {RULES.map((rule) => (
              <li key={rule.title} className="rounded-xl bg-raised p-4">
                <p className="font-medium text-foreground">{rule.title}</p>
                <p className="mt-1.5 text-muted-foreground">{rule.body}</p>
              </li>
            ))}
          </ul>

          <p className="text-muted-foreground">
            Бэктест на загруженных 4H-свечах — иллюстрация на коротком окне, не
            доказательство края. Ожидайте много небольших минусов и редкие крупные
            плюсы. Если психология этого не выдерживает — система вам не подходит.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
