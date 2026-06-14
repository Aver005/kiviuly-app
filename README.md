# Kiviuly

**Студия, что строит системы.** Лендинг молодой инженерной студии — тёмная
редакторская типографика на шрифте *Femme Fatale*, плавные scroll-анимации,
кастомный курсор и форма обращения с антиботом на **proof-of-work** (без капчи).

Весь проект — это **один Docker-образ**: сервер на Bun отдаёт и собранный
фронтенд, и API, и пишет обращения в SQLite. Один внешний порт — `5678`.

```
┌──────────────────────── контейнер :5678 ────────────────────────┐
│  Bun.serve                                                       │
│   ├─ /            → статика собранного Vite-клиента (SPA)        │
│   ├─ /api/pow/challenge → выдаёт подписанную PoW-задачу          │
│   ├─ /api/contact       → проверяет PoW + Zod, пишет в SQLite    │
│   └─ /api/stats         → счётчик обращений (живая цифра)        │
│  SQLite  →  /data/kiviuly.db  (Docker volume)                    │
└──────────────────────────────────────────────────────────────────┘
```

---

## Стек

| Слой        | Технологии                                              |
| ----------- | ------------------------------------------------------- |
| Фронтенд    | TypeScript · Vite · React 19 · Tailwind CSS v4          |
| Анимации    | Motion                                                  |
| Данные      | React Query · Zustand · Zod                             |
| Бэкенд      | Bun (`Bun.serve`) · `bun:sqlite`                        |
| Антибот     | HMAC-подписанный SHA-256 proof-of-work + honeypot       |
| Деплой      | Docker · docker compose (один образ, один порт)         |

---

## Структура

```
kiviuly-app/
├── client/            # Vite + React фронтенд
│   ├── public/fonts/  # самохостинг шрифтов (Femme Fatale, Golos Text, Plex Mono)
│   └── src/
│       ├── components/   # курсор, marquee, magnetic, reveal, поля формы…
│       ├── sections/     # Hero, Manifesto, Services, Process, Capabilities, Contact, Footer
│       ├── hooks/        # usePowSolver (web-worker), useCursorZone
│       ├── workers/      # pow.worker.ts — решает PoW вне основного потока
│       ├── lib/          # api, i18n (RU/EN), sha256, scroll
│       └── store/        # zustand: язык, курсор, меню
├── server/            # Bun-сервер
│   └── src/           # index (роуты) · db (sqlite) · pow · static · ratelimit
├── shared/contract.ts # ОДИН источник правды: Zod-схемы + протокол PoW
├── Dockerfile         # multi-stage: собирает клиент → запускает сервер
└── docker-compose.yml # один сервис, порт 5678, volume для БД
```

---

## Запуск на сервере (VDS) — одной командой

```bash
git clone <repo-url> kiviuly && cd kiviuly

# задайте секрет для подписи PoW (обязательно в проде)
cp .env.example .env
sed -i "s/change-me-in-production/$(openssl rand -hex 32)/" .env

# собрать и поднять
docker compose up -d --build
```

Готово — сайт на `http://<ip-сервера>:5678`.

Полезное:

```bash
docker compose logs -f      # логи (видно каждое обращение по ref)
docker compose down         # остановить
docker compose up -d --build  # обновить после git pull
```

База данных живёт в Docker volume `kiviuly-data` (`/data/kiviuly.db`) и
переживает пересборку контейнера.

> Порт `5678` — единственный внешний. Если перед сервером стоит reverse-proxy
> (nginx/Caddy/Traefik), проксируйте на него; сервер уважает `X-Forwarded-For`
> для rate-limit'а.

---

## Локальная разработка

Нужен [Bun](https://bun.sh) ≥ 1.3.

```bash
# сервер (API + SQLite) на :5678
cd server && bun install && bun run dev

# клиент (Vite, :5173, проксирует /api на :5678) — в другом терминале
cd client && bun install && bun run dev
```

Открыть `http://localhost:5173`.

Проверить продакшен-путь локально (сервер отдаёт собранную статику):

```bash
cd client && bun run build
cd ../server && bun run start      # http://localhost:5678
```

Тайпчек: `bun run typecheck` в `client/` и `server/`.

---

## Переменные окружения

| Переменная       | По умолчанию           | Назначение                                            |
| ---------------- | ---------------------- | ----------------------------------------------------- |
| `PORT`           | `5678`                 | Порт сервера                                          |
| `HOST`           | `0.0.0.0`              | Интерфейс                                             |
| `DB_PATH`        | `./data/kiviuly.db`    | Путь к файлу SQLite                                   |
| `STATIC_DIR`     | `../client/dist`       | Папка собранного клиента                              |
| `POW_SECRET`     | dev-заглушка           | **Секрет для HMAC-подписи PoW. Смените в проде.**     |
| `POW_DIFFICULTY` | `17`                   | Сложность PoW в ведущих нулевых битах (8–28)          |

---

## Как работает антибот (proof-of-work)

Капчи нет — вместо неё браузер делает небольшую «полезную работу», которую
дорого масштабировать ботам, но незаметно для человека (~доли секунды).

1. **Задача.** `GET /api/pow/challenge` отдаёт `{ challenge, difficulty, expires, signature }`.
   Подпись — это `HMAC-SHA256(POW_SECRET, …)`, поэтому задачу нельзя подделать
   на клиенте.
2. **Решение.** Web-worker перебирает `nonce`, пока `SHA-256("challenge:nonce")`
   не получит нужное число ведущих нулевых бит. SHA-256 реализован синхронно
   (Web Crypto слишком медленный в цикле) — ~10⁶ хешей/с, поток UI не блокируется.
   Пользователь видит живой счётчик попыток и найденный хеш.
3. **Проверка.** `POST /api/contact` сверяет подпись, срок жизни, фактическое
   решение и **одноразовость** (повторно использовать подпись нельзя), затем
   валидирует данные через Zod и пишет в SQLite.

Дополнительно: скрытый honeypot-инпут, серверный rate-limit по IP и нормализация
данных (trim, lower-case email).

---

## API

| Метод | Путь                   | Описание                                  |
| ----- | ---------------------- | ----------------------------------------- |
| `GET` | `/api/health`          | Health-чек                                |
| `GET` | `/api/pow/challenge`   | Выдать подписанную PoW-задачу             |
| `POST`| `/api/contact`         | Принять обращение (PoW + Zod + SQLite)    |
| `GET` | `/api/stats`           | Количество обращений (для живой цифры)    |

---

## Заметки

- Шрифт **Femme Fatale** содержит только заглавные глифы — поэтому весь
  display-текст принудительно `uppercase` (см. `.font-display`).
- Папка `.dev/` (расходники: исходный `.otf`, скриншоты) — в `.gitignore`.
  Рабочие копии шрифтов лежат в `client/public/fonts/` уже как `woff2`.
- Уважается `prefers-reduced-motion`: анимации, marquee и кастомный курсор
  выключаются для тех, кому так комфортнее.
