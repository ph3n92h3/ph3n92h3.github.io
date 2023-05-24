# LaTeX

## environment

### Online

[Overleaf](https://www.overleaf.com/) or [Overleaf in Chinese](https://cn.overleaf.com/)

### Offline

#### Windows

[MiKTeX](https://miktex.org/)

#### Arch Linux

1. [https://wiki.archlinux.org/title/TeX_Live](https://wiki.archlinux.org/title/TeX_Live)
2. [https://huangno1.github.io/arhlinux_vscode_latex_install_configuration/](https://huangno1.github.io/arhlinux_vscode_latex_install_configuration/)

```bash
yay -S python-pip
yay -S texlive-most texlive-lang texlive-latexindent-meta

sudo pip install pygments
```

注：
1. `texlive-most` 基本包组
2. `texlive-lang` 语言支持，我主要是用 `ctex` 包
3. `texlive-latexindent-meta` 这个是为了在 vscode 中可以自动格式化代码
4. `python-pip` & `pygments` 一些宏包「例如 `physics` 和 `minted`」需要

#### vscode

```json
"latex-workshop.latex.recipe.default": "lastUsed",
"latex-workshop.latex.tools": [...],
```

`xelatexmk` 的 `args` 加入 `-shell-escape`


## Project Structure

```
- main.tex
- ref.bib
- texes
  - 1.tex
  - 2.tex
- figs
  - 1.pdf
  - 2.jpg
  - 3.png
```

## Template

### Notes

```latex
\documentclass{article}

\usepackage[a4paper,top=2cm,bottom=2cm,left=3cm,right=3cm,marginparwidth=1.75cm]{geometry}

\usepackage{ctex} % [UTF8]

\setCJKmainfont{Noto Serif CJK SC}
\setCJKsansfont{Noto Sans CJK SC}
\setCJKmonofont{Noto Sans Mono CJK SC}

\usepackage{algorithm2e}
\usepackage{amsfonts}
\usepackage{amsmath}
\usepackage{amssymb}
\usepackage{cancel}
% \usepackage{emoji}
\usepackage{extarrows}
\usepackage{float}
\usepackage{framed}
\usepackage[colorlinks=true]{hyperref}
\usepackage{mathrsfs}
\usepackage{minted}
\usepackage{physics}
\usepackage{pifont}
\usepackage{unicode-math}
\usepackage{upgreek}

\newcommand{\rme}{\mathrm{e}}
\newcommand{\rmi}{\mathrm{i}}

\title{}
\author{桜井\ 雪子}
% \date{}

\begin{document}
\maketitle

---

---

\end{document}
```

### Beamer

```latex
\documentclass{beamer}

\usetheme{Goettingen}
\usecolortheme{crane}

\setCJKmainfont{Noto Serif CJK SC}
\setCJKsansfont{Noto Sans CJK SC}
\setCJKmonofont{Noto Sans Mono CJK SC}

% \usepackage{}

\title{}
% \subtitle{}
\institute{河海大学\ 理学院}
\author{冯哲}
\date{}

\begin{document}

\frame{\frame{\titlepage}}

\begin{frame}{...}

\end{frame}

\end{document}
```
