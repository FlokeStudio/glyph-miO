<p align="center">
  <a href="https://obsidian.md/"><img src="https://obsidian.md/images/obsidian-logo-gradient.svg" width="72" alt="Obsidian" /></a>
</p>

<h1 align="center">glyph-miO 2.3</h1>

<p align="center">
  <a href="README.md">🇬🇧 English</a>
</p>

## Зачем glyph-miO

**glyph-miO** — **Metadata Intelligence** для Obsidian: не только теги, а **краткий пересказ** заметки, который можно вставить в дневник.

| Возможность | Как |
|-------------|-----|
| **Пересказ** | 3–5 предложений (Ollama) или офлайн-выжимка по абзацам |
| **Теги** | Частотный анализ + frontmatter; клик → `#тег` в курсор |
| **Черновик** | **Analyze** показывает пересказ до вставки |
| **Куда попадает** | **Insert summary** → **конец активной заметки**, callout `> [!summary] Glyph MI-O` |
| **Перейти** | **Go to summary** или **Glyph: jump to MI summary** |

Вместе с **[glyph-sO](https://github.com/FlokeStudio/glyph-sO)**: нашли «шаурма» в поиске → открыли → **Insert summary**.

Работает **без интернета**; Ollama по желанию.

### Быстрый старт

1. Откройте заметку.
2. **✨** на ленте или **`Glyph: open MI panel`**.
3. **Analyze** — статистика, черновик пересказа, чипы тегов.
4. **Insert summary** — прокрутка к блоку внизу.

Если Ollama отвечает **500** — вставится **офлайн-пересказ** (уведомление об этом).

---

## Установка

```powershell
powershell -ExecutionPolicy Bypass -File F:\floke_dev\scripts\install-glyph-obsidian.ps1
```

`.obsidian/plugins/glyph-mi-o/` → включить → **Ctrl+R**.

---

## Ollama

```bash
ollama pull llama3.2
```

**Настройки → glyph-miO** → URL `http://127.0.0.1:11434`

При ошибке модели отключите Ollama — пересказ останется офлайн.

---

## Команды

| Команда | Действие |
|---------|----------|
| **Glyph: open MI panel** | Панель MI |
| **Glyph: summarize note** | Пересказ в конец |
| **Glyph: jump to MI summary** | К блоку Glyph |
| **Glyph: analyze active note** | Краткая статистика |

---

## Техническая часть

- Офлайн: ранжирование предложений по ключевым словам.
- Ollama: JSON `{"summary","tags"}`.
- [glyph-mi](https://github.com/FlokeStudio/glyph-mi) · [glyph-sO](https://github.com/FlokeStudio/glyph-sO)

GPL-3.0 · Floke Studio
