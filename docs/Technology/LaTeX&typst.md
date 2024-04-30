# :simple-latex: $\LaTeX$ & :simple-typst: typst

## $\LaTeX$

### Usage

- [Overleaf](https://www.overleaf.com/)
- [TeX Live](https://tug.org/texlive/)
  - [Arch Linux](https://wiki.archlinux.org/title/TeX_Live): `paru -S texlive texlive-lang texlive-binextra python-pygments`
  - MacOS: `brew install --cask mactex-no-gui` & `brew install latexindent`
  - Windows: [install-latex-guide-zh-cn](https://ctan.org/pkg/install-latex-guide-zh-cn)
- VS Code: [LaTeX Workshop](https://marketplace.visualstudio.com/items?itemName=James-Yu.latex-workshop), [LaTeX Utilities](https://marketplace.visualstudio.com/items?itemName=tecosaur.latex-utilities), [Ultra Math Preview](https://marketplace.visualstudio.com/items?itemName=yfzhao.ultra-math-preview)

### Tutorial

- [install-latex-guide-zh-cn](https://ctan.org/pkg/install-latex-guide-zh-cn)

### Project Structure

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

### Slides

```latex
\documentclass[9pt,aspectratio=169,hyperref=colorlinks]{beamer}
\usepackage{xeCJK}
% or \documentclass[9pt,aspectratio=169,hyperref=colorlinks]{ctexbeamer}

\usetheme{Goettingen}
\usecolortheme{crane}
\usefonttheme{professionalfonts}
\setbeamercolor{item}{fg=black}
\setbeamertemplate{footline}[frame number]
\setbeamertemplate{itemize items}[circle]

\usepackage{ragged2e}
\justifying\let\raggedright\justifying

% \usepackage{tikz}
% \usebackgroundtemplate{\tikz\node[opacity=0.1]{\includegraphics[width=\paperwidth]{background.jpg}};}

\title{}
\institute{College of Science, Hohai University}
\author{桜井\ 雪子}
% \date{}

\begin{document}

\frame{\titlepage}

\begin{frame}{frame title}
\end{frame}

\end{document}
```

### Hohai University Bachelor Thesis

- [HHUBachelorThesis](https://github.com/ph3n92h3/HHUBachelorThesis)

## typst

### Usage

- [typst.app](https://typst.app)
- VS Code: [Tinymist Typst](https://marketplace.visualstudio.com/items?itemName=myriad-dreamin.tinymist), [Typst Preview](https://marketplace.visualstudio.com/items?itemName=mgt19937.typst-preview)

### Tutorial

- [社区驱动的非官方 Typst 中文文档](https://typst-doc-cn.github.io/docs/)
- [Typst中文教程](https://github.com/typst-doc-cn/tutorial)

### Template

```typst
#set heading(numbering: "1.1")
#set page(margin: 5%)
#set par(justify: true)
#set text(font: ("New Computer Modern", "Noto Serif CJK SC"), lang: "zh", size: 12pt)

#show raw: set text(font: "New Computer Modern Mono")

#align(center)[
  #text(size: 20pt)[Title]

  #text(size: 14pt)[author#footnote[institute]]

  #text(size: 14pt)[#datetime.today().display()]
]

#outline(indent: auto)
```