<p align="center">
  <a href="https://obsidian.md/"><img src="https://obsidian.md/images/obsidian-logo-gradient.svg" width="72" alt="Obsidian" /></a>
</p>

<h1 align="center">glyph-miO 2.3-O</h1>

<p align="center">
  <a href="README.md">🇬🇧 English</a>
</p>

**Metadata Intelligence** для Obsidian — анализ заметки, теги, саммари. Офлайн; [Ollama](https://ollama.com/) по желанию.

---

## Как пользоваться

1. Установите плагин в `.obsidian/plugins/glyph-mi-o/`.
2. Включите **glyph-miO 2.3**, перезагрузите Obsidian (**Ctrl+R**).
3. Откройте заметку.
4. Нажмите иконку **✨** на ленте или команду **`Glyph: open MI panel`**.

### Панель MI

| Кнопка | Действие |
|--------|----------|
| **Analyze** | Слова, ссылки, заголовки, чипы тегов |
| Клик по `#тегу` | Вставка тега в позицию курсора |
| **Insert summary** | Блок `> [!summary]` в конце заметки |
| **Copy #tags** | Теги в буфер обмена |

### Команды (Ctrl+P)

- `Glyph: open MI panel` — главный интерфейс  
- `Glyph: analyze active note` — краткая статистика  
- `Glyph: suggest tags` — теги во всплывающем уведомлении  
- `Glyph: summarize note` — саммари  

---

## Установка

```powershell
# из floke_dev
powershell -ExecutionPolicy Bypass -File F:\floke_dev\scripts\install-glyph-obsidian.ps1
```

Или вручную скопируйте репозиторий в  
`F:\ваш_vault\.obsidian\plugins\glyph-mi-o\`

---

## Ollama

```bash
ollama pull llama3.2
```

**Настройки → glyph-miO** → включить Ollama → `http://127.0.0.1:11434`

Без Ollama саммари строится локально по частоте слов.

---

## Связанные репозитории

- [glyph-mi](https://github.com/FlokeStudio/glyph-mi) — MI для Senza  
- [glyph-sO](https://github.com/FlokeStudio/glyph-sO) — поиск по vault  

Floke Studio · GPL-3.0
