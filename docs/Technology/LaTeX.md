# :simple-latex: LaTeX

<div align=center> <img src="/images/ctanlion.png" width = 30%/> </div>

## Environment

### Online

- [Overleaf](https://www.overleaf.com/) or [Overleaf in Chinese](https://cn.overleaf.com/)
- [GitHub Action](https://github.com/marketplace/actions/github-action-for-latex)

### Offline

#### Arch Linux

- [https://wiki.archlinux.org/title/TeX_Live](https://wiki.archlinux.org/title/TeX_Live)

```sh
paru -S texlive texlive-lang
paru -S python-pygments
```

#### MacOS

```sh
brew install --cask mactex-no-gui
brew install latexindent
```

#### Windows

```sh
scoop install miktex latexindent
```

## Useful Resources

- [install-latex-guide-zh-cn](https://ctan.org/pkg/install-latex-guide-zh-cn)
- [lshort-zh-cn](https://www.ctan.org/pkg/lshort-zh-cn)

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

### Academic Notes

```latex
\documentclass{article}

\usepackage[a4paper,scale=0.8]{geometry}

\usepackage{xeCJK}

% \usepackage{algorithm2e}
% \usepackage{amsfonts}
\usepackage{amsmath}\DeclareMathOperator{\Tr}{Tr}
% \usepackage{amssymb}
% \usepackage{cancel}
\usepackage{derivative}
% \usepackage{emoji}
\usepackage{extarrows}
% \usepackage{float}
% \usepackage{framed}
\usepackage[colorlinks]{hyperref}
% \usepackage{mathrsfs}
\usepackage{mathtools}
\usepackage{minted}
% \usepackage{multicol}
\usepackage{physics2}\usephysicsmodule{ab, braket}
% \usepackage{pifont}
\usepackage{slashed}
% \usepackage{unicode-math}
% \usepackage{upgreek}
% \usepackage{xcolor}

\newcommand{\bmat}[1]{\begin{bmatrix}#1\end{bmatrix}}
\newcommand{\calC}{\mathcal{C}}
\newcommand{\calL}{\mathcal{L}}
\newcommand{\calP}{\mathcal{P}}
\newcommand{\calT}{\mathcal{T}}
\newcommand{\gammafive}{\gamma_5}
\newcommand{\gammamu}{\gamma^{\mu}}
\newcommand{\gammanu}{\gamma^{\nu}}
\newcommand{\gammarho}{\gamma^{\rho}}
\newcommand{\gammasigma}{\gamma^{\sigma}}
\newcommand{\gmunu}{g^{\mu\nu}}
\newcommand{\rme}{\mathrm{e}}
\newcommand{\rmi}{\mathrm{i}}
\newcommand{\rmR}{\mathrm{R}}
\newcommand{\rmT}{\mathrm{T}}
\newcommand{\slasheda}{\slashed{a}}
\newcommand{\slashedb}{\slashed{b}}
\newcommand{\slashedc}{\slashed{c}}
\newcommand{\slashedd}{\slashed{d}}
\newcommand{\slashedp}{\slashed{p}}
\newcommand{\slashedq}{\slashed{q}}
\newcommand{\slashedr}{\slashed{r}}
\newcommand{\slasheds}{\slashed{s}}
\newcommand{\Smunu}{S^{\mu\nu}}
\newcommand{\veck}{\vec{k}}
\newcommand{\vecp}{\vec{p}}
\newcommand{\xleq}{\xlongequal}

\title{temp}
\author{桜井\ 雪子}
% \date{}

\begin{document}

\maketitle
\tableofcontents

\end{document}
```

### General Chinese Notes

```latex
\documentclass{ctexart}

\usepackage[a4paper,scale=0.8]{geometry}

\usepackage[colorlinks]{hyperref}

\title{}
\author{桜井\ 雪子}
\date{}

\begin{document}

\maketitle
\tableofcontents

\end{document}
```

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
% \usebackgroundtemplate{\tikz\node[opacity=0.1]{\includegraphics[width=\paperwidth]{background.jpeg}};}

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
