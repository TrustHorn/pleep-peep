# pleep-peep

Стартовый проект на Next.js с App Router, TypeScript и Tailwind CSS. Здесь настроены базовые проверки и автоматическая проверка кода при отправке изменений в GitHub.

## Требования

- Node.js 22 (минимум 20.9)
- pnpm 11

## Запуск

```bash
pnpm install
pnpm dev
```

Откройте [http://localhost:3000](http://localhost:3000).

## Проверки

```bash
pnpm lint
pnpm typecheck
pnpm build
```

GitHub Actions запускает эти проверки при push и pull request в `main`.

## Переменные окружения

Скопируйте `.env.example` в `.env.local` и заполните значения по мере добавления сервисов. Не отправляйте секреты в Git.

## Структура

- `src/app/` — страницы, layout и стили приложения.
- `public/` — статические файлы.
- `.github/workflows/` — автоматические проверки.

Для новых импортов из `src` доступен алиас `@/*`.

## Полезные ссылки

- [Документация Next.js](https://nextjs.org/docs)
- [Документация Tailwind CSS](https://tailwindcss.com/docs)
