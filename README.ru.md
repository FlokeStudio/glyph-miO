<p align="center">
  <a href="https://obsidian.md/"><img src="https://obsidian.md/images/obsidian-logo-gradient.svg" width="72" alt="Obsidian" /></a>
</p>

<h1 align="center">glyph-miO 2.3</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Obsidian-Plugin-7c3aed" alt="Плагин Obsidian" />
  <img src="https://img.shields.io/badge/Glyph--MI-2.3-green" alt="Glyph-MI 2.3" />
  <img src="https://img.shields.io/badge/версия-2.3.0-blue" alt="версия 2.3.0" />
  <img src="https://img.shields.io/badge/офлайн-brightgreen" alt="офлайн" />
  <img src="https://img.shields.io/badge/Ollama-опционально-orange" alt="Ollama опционально" />
  <img src="https://img.shields.io/badge/лицензия-GPL--3.0-lightgrey" alt="GPL-3.0" />
</p>

<p align="center">
  <strong>Metadata Intelligence для Obsidian</strong> — анализ заметки, теги, <em>краткий пересказ</em> в конце файла.<br/>
  Работает без интернета; <a href="https://ollama.com/">Ollama</a> на вашем ПК — по желанию.
</p>

<p align="center">
  <a href="README.md">🇬🇧 English</a>
  ·
  <a href="https://github.com/FlokeStudio/glyph-sO">glyph-sO</a> (поиск)
  ·
  <a href="https://github.com/FlokeStudio/glyph-mi">glyph-mi</a> (Senza)
</p>

---

## Что такое glyph-miO?

**glyph-miO** — бесплатный **плагин для [Obsidian](https://obsidian.md/)**. Работает с **открытой заметкой** и помогает:

- увидеть структуру (слова, ссылки, заголовки),
- подобрать **`#теги`** (вставка по клику),
- добавить **краткий пересказ** — не список ключевых слов, а несколько предложений о содержании,
- положить пересказ **в конец заметки** в заметный блок, к которому можно вернуться.

Это Obsidian-версия **Glyph MI 2.3**. Без облака и без npm.

Если нужно только «найти слово в vault» — ставьте **[glyph-sO](https://github.com/FlokeStudio/glyph-sO)**. Часто ставят **оба**: поиск + пересказ.

---

## Что умеет (не только теги)

| Кнопка / команда | Зачем |
|------------------|--------|
| **Analyze** | Статистика + **черновик пересказа** в панели до вставки |
| Чипы `#тегов` | Подсказки из заголовков и частоты слов — клик вставляет в курсор |
| **Insert summary** | **Пересказ** (Ollama или офлайн) в **конец** активной заметки |
| **Go to summary** / **Jump to MI summary** | Перейти к последнему блоку Glyph |
| **Copy #tags** | Скопировать теги в буфер |

**Офлайн:** выбираются самые информативные предложения из текста.  
**Ollama:** более связный пересказ на языке заметки — если сервер и модель отвечают.

---

## Установка (с нуля)

### Шаг 1 — Плагины в Obsidian

**Настройки → Сторонние плагины** → выключить ограниченный режим → **включить сторонние плагины**.

### Шаг 2 — Установить glyph-miO

#### A) Вручную

1. Скачать или клонировать [репозиторий](https://github.com/FlokeStudio/glyph-miO).
2. В vault: `.obsidian/plugins/glyph-mi-o/`
3. Скопировать: `manifest.json`, `main.js`, `styles.css`

   ```
   ВашVault/
     .obsidian/
       plugins/
         glyph-mi-o/
           manifest.json
           main.js
           styles.css
   ```

4. Включить **glyph-miO 2.3** → **Ctrl+R**.

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
2. **✨** на ленте или **`Glyph: open MI panel`** (`Ctrl+P`).
3. **Analyze** — слова, заголовки, теги, **черновик пересказа**.
4. **Insert summary** — в конце файла появится:

   ```markdown
   ---
   <!-- glyph-miO-summary -->
   > [!summary] Glyph MI-O
   > Текст пересказа…

   #теги
   ```

5. Не видно — **Go to summary**, команда **Jump to MI summary** или **Ctrl+End**.

> Саммари всегда в **той заметке, которая была активна** при нажатии Insert.

---

## Команды

| Команда | Когда |
|---------|--------|
| **Glyph: open MI panel** | Основное окно |
| **Glyph: summarize note** | Вставить пересказ без панели |
| **Glyph: jump to MI summary** | К блоку внизу |
| **Glyph: analyze active note** | Краткая статистика |
| **Glyph: suggest tags** | Теги во всплывающем уведомлении |

---

## Ollama (локально, необязательно)

```bash
ollama pull llama3.2
ollama serve
```

**Настройки → glyph-miO 2.3** → включить Ollama → `http://127.0.0.1:11434` → имя модели как в `ollama list`.

| Ситуация | Результат |
|----------|-----------|
| Ollama выкл. | Офлайн-пересказ |
| Ollama ок | Пересказ от модели + теги |
| Ошибка **500** | Уведомление + **офлайн-пересказ** — текст всё равно вставится |

**500** — чаще всего Ollama не запущена, неверная модель или модель не скачана. Исправьте Ollama или отключите в настройках.

---

## Связка с glyph-sO

1. **[glyph-sO](https://github.com/FlokeStudio/glyph-sO)** — найти заметку по слову (`шаурма`, раскладка, транслит).  
2. **glyph-miO** — **Analyze** → **Insert summary**.  
3. Позже — **Jump to MI summary**.

Папка sO: `.obsidian/plugins/glyph-s-o/` — установка так же, как miO.

---

## Настройки

| Параметр | Смысл |
|----------|--------|
| **Enable Ollama** | LLM для пересказа |
| **Ollama URL** | Обычно `http://127.0.0.1:11434` |
| **Model** | Как в `ollama list` |

---

## Частые вопросы

### Куда делся пересказ?

В **конец той же заметки**. **Go to summary** или поиск по `Glyph MI-O`.

### Только цифры и теги, без текста

Ollama не сработала — вставлен **офлайн-пересказ** из предложений заметки. Включите Ollama для более «литературного» текста.

### «Откройте заметку»

Нужна вкладка с markdown, не пустая область.

### Плагин не загружается

Папка **`glyph-mi-o`**, один файл `main.js`, без `vendor/`.

---

## Техническая часть

- Офлайн: очистка markdown → оценка предложений → склейка.
- Ollama: JSON `{"summary","tags"}`.
- Senza: [glyph-mi](https://github.com/FlokeStudio/glyph-mi).

Obsidian ≥ 1.5.0.

---

## Лицензия

GPL-3.0 · [Floke Studio](https://github.com/FlokeStudio)
