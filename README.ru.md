<p align="center">
  <a href="https://obsidian.md/"><img src="https://obsidian.md/images/obsidian-logo-gradient.svg" width="72" alt="Obsidian" /></a>
</p>

<h1 align="center">glyph-miO 2.7.1</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Obsidian-Plugin-7c3aed" alt="Плагин Obsidian" />
  <img src="https://img.shields.io/badge/версия-2.7.1-blue" alt="версия 2.7.1" />
  <img src="https://img.shields.io/badge/офлайн-brightgreen" alt="офлайн" />
  <img src="https://img.shields.io/badge/Ollama-опционально-orange" alt="Ollama опционально" />
  <img src="https://img.shields.io/badge/лицензия-GPL--3.0-lightgrey" alt="GPL-3.0" />
</p>

<p align="center">
  <strong>Metadata Intelligence для Obsidian</strong> — анализ заметки, теги с объяснимостью, <em>краткий пересказ</em> в конце файла.<br/>
  Работает без интернета; <a href="https://ollama.com/">Ollama</a> на вашем ПК — по желанию.
</p>

<p align="center">
  <a href="README.md">🇬🇧 English</a>
  ·
  <a href="https://github.com/FlokeStudio/glyph-sO">glyph-sO</a> (поиск)
  ·
  <a href="https://github.com/krwg/glyph-mi">glyph-mi</a>
</p>

---

## Что такое glyph-miO?

**glyph-miO** — бесплатный **плагин для [Obsidian](https://obsidian.md/)**. Работает с **открытой заметкой** и помогает:

- увидеть структуру (слова, ссылки, заголовки),
- подобрать **`#теги`** с **% релевантности** и подсказкой (заголовок / раздел / текст),
- добавить **краткий пересказ** в конец заметки,
- видеть статус **Ollama** (онлайн / офлайн-fallback) в статусной строке и панели.

Связка с **[glyph-sO](https://github.com/FlokeStudio/glyph-sO)**: поиск по vault + понимание текущей заметки. В перспективе — общий стиль **glyph-ui** с sO.

---

## Что нового в 2.7.1

- Ключ кэша всегда включает **путь** + mtime + size + хеш содержимого
- Режимы саммари **`none` / `off`** — черновик в панели, запись только по явной вставке
- Настройка **таймаута Ollama** (секунды, по умолчанию 12)
- Объяснимость тегов и индикатор Ollama
- Опциональное **diff-превью** перед Apply
- **RU-локализация** подписей команд и настроек (язык Obsidian)

Логика MI сейчас в локальных **`services/*`**. Roadmap: подключить модуль **`notes`** из [glyph-mi](https://github.com/krwg/glyph-mi) (общий контракт `confidence` / `sources`) через адаптер-заглушку — офлайн-путь не ломается.

---

## Что умеет

| Кнопка / команда | Зачем |
|------------------|--------|
| **Анализ** | Статистика + **черновик пересказа** + теги с % |
| Чипы `#тегов` | Подсказки; tooltip — почему предложены; клик вставляет |
| **Вставить пересказ** | Пересказ (Ollama или офлайн) в **конец** заметки |
| **К саммари** / **Jump to MI summary** | Перейти к блоку Glyph |
| **Копировать #теги** | В буфер |

**Офлайн:** информативные предложения из текста.  
**Ollama:** более связный пересказ — если сервер успевает за таймаут.

---

## Установка

### Шаг 1 — Плагины в Obsidian

**Настройки → Сторонние плагины** → выключить ограниченный режим → **включить сторонние плагины**.

### Шаг 2 — Установить glyph-miO

#### A) Вручную

1. Скачать или клонировать [репозиторий](https://github.com/FlokeStudio/glyph-miO).
2. В vault: `.obsidian/plugins/glyph-mi-o/`
3. Скопировать: `manifest.json`, `main.js`, `styles.css`, папку `services/`

4. Включить **glyph-miO** → **Ctrl+R**.

#### B) BRAT

**BRAT** → `FlokeStudio/glyph-miO` → включить → перезагрузка.

#### C) Git

```bash
cd /путь/к/ВашVault/.obsidian/plugins
git clone https://github.com/FlokeStudio/glyph-miO.git glyph-mi-o
```

---

## Первый запуск

1. Откройте **любую markdown-заметку**.
2. **✨** на ленте или команда **открыть панель MI**.
3. **Анализ** — слова, заголовки, теги с %, **черновик пересказа**.
4. **Вставить пересказ** — (при включённом превью) Apply/Отмена, затем блок в конце файла:

   ```markdown
   ---
   <!-- glyph-miO-summary -->
   > [!summary] Glyph MI-O
   > Текст пересказа…

   #теги
   ```

5. Не видно — **К саммари** или **Ctrl+End**.

---

## Команды

| Команда | Когда |
|---------|--------|
| **Glyph: открыть панель MI** | Основное окно |
| **Glyph: пересказ заметки** | Вставить пересказ без панели |
| **Glyph: перейти к саммари MI** | К блоку внизу |
| **Glyph: анализ активной заметки** | Краткая статистика |
| **Glyph: предложить теги** | Теги с % во всплывающем уведомлении |

Подписи зависят от языка интерфейса Obsidian (EN/RU).

---

## Ollama (локально, необязательно)

```bash
ollama pull llama3.2
ollama serve
```

**Настройки → Glyph MI-O** → включить Ollama → URL → модель → **таймаут (секунды)**.

| Ситуация | Результат |
|----------|-----------|
| Ollama выкл. | Офлайн-пересказ; статус «Ollama выкл.» |
| Ollama ок | Пересказ от модели + теги; статус «Ollama» |
| Таймаут / 500 | Уведомление + **офлайн-пересказ** |

---

## Настройки

| Параметр | Смысл |
|----------|--------|
| **Включить Ollama** | LLM для пересказа |
| **URL Ollama** | Обычно `http://127.0.0.1:11434` |
| **Модель** | Как в `ollama list` |
| **Таймаут Ollama (секунды)** | По умолчанию 12 |
| **Режим блока саммари** | `append` / `replace-latest` / `none` / `off` |
| **Превью diff перед Apply** | Модалка до/после перед записью |

---

## Связка с glyph-sO

1. **[glyph-sO](https://github.com/FlokeStudio/glyph-sO)** — найти заметку.  
2. **glyph-miO** — **Анализ** → **Вставить пересказ**.  
3. Позже — **перейти к саммари MI**.

---

## Частые вопросы

### Куда делся пересказ?

В **конец той же заметки**. Режим `none`/`off` сам файл не трогает — нужна кнопка вставки.

### Только цифры и теги, без текста

Ollama не сработала — вставлен **офлайн-пересказ**. Проверьте таймаут и модель.

### Плагин не загружается

Папка **`glyph-mi-o`**, файлы `main.js` + `services/`.

---

## Техническая часть

- Офлайн: `services/metadata.js`, `services/summary.js`
- Адаптер: `services/glyph-mi-notes-adapter.js` → будущий модуль `notes` в glyph-mi
- Ollama: JSON `{"summary","tags"}`, таймаут из настроек

Obsidian ≥ 1.5.0.

---

## Лицензия

GPL-3.0 · [Floke Studio](https://github.com/FlokeStudio)
