# $LaTeX$

## environment

### Online

[Overleaf](https://www.overleaf.com/) or [Overleaf in Chinese](https://cn.overleaf.com/)

### Offline

#### Arch Linux

- [https://wiki.archlinux.org/title/TeX_Live](https://wiki.archlinux.org/title/TeX_Live)
- [https://huangno1.github.io/arhlinux_vscode_latex_install_configuration/](https://huangno1.github.io/arhlinux_vscode_latex_install_configuration/)

```sh
yay -S texlive texlive-lang texlive-latexindent-meta
yay -S python-pygments
```

#### MacOS

```sh
brew install --cask mactex-no-gui
brew install latexindent
```

#### Windows

[MiKTeX](https://miktex.org/)

#### vscode

```json
"latex-workshop.latex.recipe.default": "lastUsed",
"latex-workshop.latex.tools": [...],
// add `-shell-escape` into `args` in `xelatexmk` and `lualatexmk`
```

## Project Structure

```sh
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

\usepackage[a4paper,scale=0.8]{geometry}

\usepackage{ctex}
\setCJKmainfont{Noto Serif CJK SC}
\setCJKsansfont{Noto Sans CJK SC}
\setCJKmonofont{Noto Sans Mono CJK SC}

% \usepackage{algorithm2e}
\usepackage{amsfonts}
% \usepackage{amsmath}
% \usepackage{amssymb}
% \usepackage{cancel}
% \usepackage{emoji}
\usepackage{extarrows}
% \usepackage{float}
\usepackage{framed}
\usepackage[colorlinks]{hyperref}
% \usepackage{mathrsfs}
% \usepackage{minted}
% \usepackage{multicol}
\usepackage{physics}
% \usepackage{pifont}
% \usepackage{unicode-math}
% \usepackage{upgreek}
\usepackage{xcolor}

\newcommand{\rme}{\mathrm{e}}
\newcommand{\rmi}{\mathrm{i}}

\title{}
\author{桜井\ 雪子}
% \date{}

\begin{document}

\maketitle

\end{document}
```

### Beamer

```latex
\documentclass[9pt,aspectratio=169,hyperref=colorlinks]{beamer}

\usetheme{Goettingen}
\usecolortheme{crane}
\usefonttheme{professionalfonts}
\setbeamercolor{item}{fg=black}
\setbeamertemplate{itemize items}[circle]

\usepackage{xeCJK}
\setCJKmainfont{Noto Serif CJK SC}
\setCJKsansfont{Noto Sans CJK SC}
\setCJKmonofont{Noto Sans Mono CJK SC}

\usepackage{ragged2e}
\justifying\let\raggedright\justifying
% \usepackage{tikz}
% \usebackgroundtemplate{\tikz\node[opacity=0.1]{\includegraphics[width=\paperwidth]{background.jpeg}};}

\title{}
\institute{College of Science, Hohai University}
\author{Feng Zhe / 冯哲}
% \date{}

\begin{document}

\frame{\titlepage}

\begin{frame}{frame title}

\end{frame}

\end{document}
```
