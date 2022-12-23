## Online

[Overleaf](https://www.overleaf.com/) or [Overleaf in Chinese](https://cn.overleaf.com/)

## Offline

[MiKTeX](https://miktex.org/)

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

\usepackage[letterpaper,top=2cm,bottom=2cm,left=3cm,right=3cm,marginparwidth=1.75cm]{geometry}

\usepackage{ctex} % [UTF8]

\setCJKmainfont{Noto Serif CJK SC}
\setCJKsansfont{Noto Sans CJK SC}
\setCJKmonofont{Noto Sans Mono CJK SC}

\usepackage{algorithm2e}
\usepackage{amssymb}
\usepackage{amsfonts}
\usepackage{amsmath}
\usepackage{amssymb}
\usepackage{cancel}
% \usepackage{emoji}
\usepackage{extarrows}
\usepackage{float}
\usepackage{framed}
\usepackage[colorlinks=true]{hyperref}
\usepackage{minted}
\usepackage{mathrsfs}
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



\end{document}
```