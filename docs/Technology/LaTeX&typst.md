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

### Template

#### Slides

```latex
\documentclass[9pt,aspectratio=169,hyperref=colorlinks]{beamer}
\usepackage{xeCJK}
% or \documentclass{ctexbeamer}

\usecolortheme{whale}
\usefonttheme{professionalfonts}
% \setbeamercolor{item}{fg=black}
\setbeamertemplate{page number in head/foot}[totalframenumber]\useoutertheme[footline=authorinstitutetitle]{miniframes}
\setbeamertemplate{itemize items}[circle]

\title{纯 $\mathbf{AdS_3}$ 引力中的渐进对称性和守恒荷}
\subtitle{河海大学本科毕业论文答辩}
\institute{河海大学力学与工程科学学院}
\author{冯哲}

\usepackage{ragged2e}\justifying\let\raggedright\justifying

% \usepackage{tikz}
% \usebackgroundtemplate{\tikz\node[opacity=0.1]{\includegraphics[width=\paperwidth]{background.jpg}};}

\title{Title}
\subtitle{Subtitle}
\institute{Institute}
\author{Author}
% \date{}

\begin{document}

\frame{\titlepage}

\begin{frame}{frame title}
\end{frame}

\end{document}
```

#### Hohai University Bachelor Thesis

- [HHUBachelorThesis](https://github.com/ph3n92h3/HHUBachelorThesis)

## typst

### Usage

- [typst.app](https://typst.app)
- VS Code: [Tinymist Typst](https://marketplace.visualstudio.com/items?itemName=myriad-dreamin.tinymist)

### Tutorial

- [Typst 中文社区导航](https://typst-doc-cn.github.io/guide/)
- [Typst 中文教程](https://typst-doc-cn.github.io/tutorial/)

### Template

中文文章：

```typst
#set heading(numbering: "1.1")
#set page(margin: 10%, numbering: "1")
#set par(first-line-indent: 2em, justify: true)
#set text(font: ("New Computer Modern", "Noto Serif CJK SC"), lang: "zh", size: 12pt)

#set heading(numbering: "1.1")
#show heading.where(level: 1): it => {
  counter(math.equation).update(0)
  it
}
#set math.equation(numbering: n => {
  numbering("(1.1)", counter(heading).get().first(), n)
})
#show math.equation: set block(breakable: true)
#show raw: set text(font: "New Computer Modern Mono")

#align(center)[
  #text(size: 20pt)[Title]

  #text(size: 14pt)[author#footnote[institute]]

  #text(size: 14pt)[#datetime.today().display()]
]

#outline(indent: auto)
```
