import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { sendTelegram, testTelegram } from "@/lib/server/market";
import { formatTelegramHtml } from "@/lib/strategy/format";
import type { Signal } from "@/lib/strategy/types";
import { useSettings } from "@/lib/store/settings";

export function TelegramSheet({
  open,
  onOpenChange,
  signals,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  signals: Signal[];
}) {
  const {
    botToken,
    chatId,
    autoSend,
    accountUsd,
    riskPct,
    setBotToken,
    setChatId,
    setAutoSend,
    markSent,
  } = useSettings();
  const [testing, setTesting] = useState(false);
  const [sending, setSending] = useState(false);

  async function onTest() {
    setTesting(true);
    try {
      const res = await testTelegram({ data: { botToken, chatId } });
      toast.success(`Подключено: @${res.username}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Не удалось проверить бота");
    } finally {
      setTesting(false);
    }
  }

  async function onSendAll() {
    if (signals.length === 0) {
      toast.message("Сейчас нет сигналов для отправки");
      return;
    }
    setSending(true);
    try {
      const keys: string[] = [];
      for (const signal of signals) {
        await sendTelegram({
          data: {
            botToken,
            chatId,
            text: formatTelegramHtml(signal, accountUsd, riskPct),
          },
        });
        keys.push(signal.key);
      }
      markSent(keys);
      toast.success(`Отправлено сигналов: ${keys.length}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка отправки");
    } finally {
      setSending(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Telegram</SheetTitle>
          <SheetDescription>
            Токен хранится только в этом браузере и уходит на сервер в момент
            отправки.
          </SheetDescription>
        </SheetHeader>

        <ol className="space-y-3 text-sm text-muted-foreground">
          <li>
            1. В Telegram откройте <span className="text-foreground">@BotFather</span>,
            команда <span className="font-mono text-foreground">/newbot</span> — скопируйте токен.
          </li>
          <li>
            2. Напишите своему боту любое сообщение. Chat ID узнайте у{" "}
            <span className="text-foreground">@userinfobot</span> (личный чат) или добавьте бота
            в канал как администратора и укажите <span className="font-mono">@канал</span>.
          </li>
          <li>3. Проверьте связь и включите автоотправку новых сигналов.</li>
        </ol>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bot-token">Токен бота</Label>
            <Input
              id="bot-token"
              type="password"
              autoComplete="off"
              placeholder="123456:AAH..."
              value={botToken}
              onChange={(e) => setBotToken(e.target.value.trim())}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="chat-id">Chat ID или @канал</Label>
            <Input
              id="chat-id"
              placeholder="123456789 или @mychannel"
              value={chatId}
              onChange={(e) => setChatId(e.target.value.trim())}
            />
          </div>

          <div className="flex items-center justify-between gap-3 rounded-xl bg-raised px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">Автоотправка</p>
              <p className="text-xs text-muted-foreground">
                Новые сигналы уходят сами после скана
              </p>
            </div>
            <Switch checked={autoSend} onCheckedChange={setAutoSend} />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onTest}
              disabled={testing || !botToken || !chatId}
            >
              {testing ? <Loader2 className="animate-spin" /> : null}
              Проверить связь
            </Button>
            <Button
              className="flex-1"
              onClick={onSendAll}
              disabled={sending || !botToken || !chatId}
            >
              {sending ? <Loader2 className="animate-spin" /> : <Send />}
              Отправить текущие
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
