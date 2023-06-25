
## apps

### vscode

```json
{
  "[jsonc]": {
    "editor.defaultFormatter": "vscode.json-language-features"
  },
  "[markdown]": {
    "editor.defaultFormatter": "yzhang.markdown-all-in-one"
  },
  "editor.cursorSurroundingLines": 15,
  "editor.fontFamily": "'FiraCode Nerd Font', 'Noto Sans CJK SC'",
  // "editor.fontFamily": "'LXGW WenKai Mono'",
  "editor.fontLigatures": true,
  "editor.fontSize": 20,
  "editor.formatOnSave": true,
  "editor.renderWhitespace": "all",
  "editor.unicodeHighlight.allowedLocales": {
    "zh-hans": true,
    "zh-hant": true
  },
  "editor.wordWrap": "on",
  "explorer.confirmDelete": false,
  "git.openRepositoryInParentFolders": "never",
  "latex-utilities.countWord.format": "${words} Words",
  "latex-utilities.message.update.show": false,
  "latex-workshop.latex.autoBuild.run": "never",
  "latex-workshop.latex.autoClean.run": "onBuilt",
  "latex-workshop.latex.bibDirs": [
    "/home/ph2/OneDrive_ph3n92h3/.jabref"
  ],
  "latex-workshop.latex.recipe.default": "lastUsed",
  "latex-workshop.latex.recipes": [
    {
      "name": "latexmk (xelatex)",
      "tools": [
        "xelatexmk"
      ]
    },
    {
      "name": "latexmk",
      "tools": [
        "latexmk"
      ]
    },
    {
      "name": "latexmk (latexmkrc)",
      "tools": [
        "latexmk_rconly"
      ]
    },
    {
      "name": "latexmk (lualatex)",
      "tools": [
        "lualatexmk"
      ]
    },
    {
      "name": "pdflatex -> bibtex -> pdflatex * 2",
      "tools": [
        "pdflatex",
        "bibtex",
        "pdflatex",
        "pdflatex"
      ]
    },
    {
      "name": "Compile Rnw files",
      "tools": [
        "rnw2tex",
        "latexmk"
      ]
    },
    {
      "name": "Compile Jnw files",
      "tools": [
        "jnw2tex",
        "latexmk"
      ]
    },
    {
      "name": "Compile Pnw files",
      "tools": [
        "pnw2tex",
        "latexmk"
      ]
    },
    {
      "name": "tectonic",
      "tools": [
        "tectonic"
      ]
    }
  ],
  "latex-workshop.latex.tools": [
    {
      "args": [
        "-synctex=1",
        "-interaction=nonstopmode",
        "-file-line-error",
        "-pdf",
        "-outdir=%OUTDIR%",
        "%DOC%"
      ],
      "command": "latexmk",
      "env": {},
      "name": "latexmk"
    },
    {
      "args": [
        "-shell-escape",
        "-synctex=1",
        "-interaction=nonstopmode",
        "-file-line-error",
        "-lualatex",
        "-outdir=%OUTDIR%",
        "%DOC%"
      ],
      "command": "latexmk",
      "env": {},
      "name": "lualatexmk"
    },
    {
      "args": [
        "-shell-escape",
        "-synctex=1",
        "-interaction=nonstopmode",
        "-file-line-error",
        "-xelatex",
        "-outdir=%OUTDIR%",
        "%DOC%"
      ],
      "command": "latexmk",
      "env": {},
      "name": "xelatexmk"
    },
    {
      "args": [
        "%DOC%"
      ],
      "command": "latexmk",
      "env": {},
      "name": "latexmk_rconly"
    },
    {
      "args": [
        "-synctex=1",
        "-interaction=nonstopmode",
        "-file-line-error",
        "%DOC%"
      ],
      "command": "pdflatex",
      "env": {},
      "name": "pdflatex"
    },
    {
      "args": [
        "%DOCFILE%"
      ],
      "command": "bibtex",
      "env": {},
      "name": "bibtex"
    },
    {
      "args": [
        "-e",
        "knitr::opts_knit$set(concordance = TRUE); knitr::knit('%DOCFILE_EXT%')"
      ],
      "command": "Rscript",
      "env": {},
      "name": "rnw2tex"
    },
    {
      "args": [
        "-e",
        "using Weave; weave(\"%DOC_EXT%\", doctype=\"tex\")"
      ],
      "command": "julia",
      "env": {},
      "name": "jnw2tex"
    },
    {
      "args": [
        "-e",
        "using Weave; weave(\"%DOC_EXT%\", doctype=\"texminted\")"
      ],
      "command": "julia",
      "env": {},
      "name": "jnw2texminted"
    },
    {
      "args": [
        "-f",
        "tex",
        "%DOC_EXT%"
      ],
      "command": "pweave",
      "env": {},
      "name": "pnw2tex"
    },
    {
      "args": [
        "-f",
        "texminted",
        "%DOC_EXT%"
      ],
      "command": "pweave",
      "env": {},
      "name": "pnw2texminted"
    },
    {
      "args": [
        "--synctex",
        "--keep-logs",
        "%DOC%.tex"
      ],
      "command": "tectonic",
      "env": {},
      "name": "tectonic"
    }
  ],
  // "latex-workshop.view.pdf.color.dark.backgroundColor": "#263238", // "#ffffff"
  // "latex-workshop.view.pdf.color.dark.pageBorderColor": "#263238", // "lightgrey"
  // "latex-workshop.view.pdf.color.dark.pageColorsBackground": "#263238",
  // "latex-workshop.view.pdf.color.dark.pageColorsForeground": "#d9cd64",
  // "latex-workshop.view.pdf.color.light.backgroundColor": "#ededf5", // "#ffffff"
  // "latex-workshop.view.pdf.color.light.pageBorderColor": "#ededf5", // "lightgrey"
  // "latex-workshop.view.pdf.color.light.pageColorsBackground": "#ededf5",
  // "latex-workshop.view.pdf.color.light.pageColorsForeground": "#12120a",
  "markdown-mermaid.lightModeTheme": "forest",
  "markdown.extension.list.indentationSize": "inherit",
  "markdown.extension.math.enabled": false,
  "markdown.preview.fontSize": 20,
  "mdmath.macros": {
    "\\dd": "{\\mathrm{d}}",
    "\\dv": "{\\frac{\\mathrm{d} #1}{\\mathrm{d} #2}}",
    "\\pdv": "{\\frac{\\partial #1}{\\partial #2}}"
  },
  "redhat.telemetry.enabled": true,
  "security.workspace.trust.untrustedFiles": "open",
  "window.titleBarStyle": "custom",
  "workbench.colorTheme": "Quiet Light",
  // "workbench.iconTheme": "eq-material-theme-icons",
  "yaml.customTags": [
    "!ENV scalar",
    "!ENV sequence",
    "tag:yaml.org,2002:python/name:materialx.emoji.to_svg",
    "tag:yaml.org,2002:python/name:materialx.emoji.twemoji",
    "tag:yaml.org,2002:python/name:pymdownx.superfences.fence_code_format"
  ],
  "yaml.schemas": {
    "https://squidfunk.github.io/mkdocs-material/schema.json": "mkdocs.yml"
  }
}
```

## /etc

### /etc/hosts

```sh
31.209.137.10 bifrost.vivaldi.com
104.22.68.109 mimir.vivaldi.com
172.67.21.222 mimir.vivaldi.com
104.22.58.199 vivaldi.com
```

### /etc/modprobe.d/nobeep.conf

```sh
blacklist pcspkr
blacklist snd_pcsp
```

### /etc/environment

```sh
GTK_IM_MODULE=fcitx
QT_IM_MODULE=fcitx
XMODIFIERS=@im=fcitx
SDL_IM_MODULE=fcitx
GLFW_IM_MODULE=ibus
```
