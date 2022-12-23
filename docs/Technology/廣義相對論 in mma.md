我曾經有一個夢想，我想象自己快樂地使用 `Mathematica` 進行廣義相對論的計算，就像秋天涼爽的風吹過河灘的田野，我走在奶奶和小山羊之間。然而現實總是有些殘酷，很長一段時間我都沒有找到正確的操作方法。知乎上有很多人寫了小小的文章，自以爲已經足以讓人明白，卻讓我在興奮與失望之間徘徊。曾經也有過自己寫一個 package 的豪情壯志，曾經也一度想過放棄，直到有一天，我在無意之間發現了它：`OGRe`！

之前提到，上個月，梁燦彬先生不幸去世了，這件事令我難以接受，也鞭策我努力學習、尤其是努力學習廣相。梁先生的書📕我已經看到了廣相的部分，但是還沒有真正進入計算。利用這個充滿虛無主義誘惑的夜晚，我開始寫這篇文檔。

這裏主要是想寫一個比較實用主義的、**中文的**文檔，供我查閲使用，也希望能幫到更多的人。一個小小的問題是，我的博客現在仍然不能被 Google 或者其他搜索引擎檢索到，我無數次遵循各種教程，但是總是失敗，希望爲數不多的讀者中能解答此問題者鼎力相助，謝謝😀。

get it: [related paper](https://doi.org/10.21105/joss.03416) and [GitHub repo](https://github.com/bshoshany/OGRe)

可能的運算：加法、數乘、求跡、縮並、偏導數、協變導數。

## 準備工作

1. （在綫）安裝：
   ```mathematica
   URLDownload["https://raw.githubusercontent.com/bshoshany/OGRe/master/OGRe.m",FileNameJoin[{$UserBaseDirectory,"Applications","OGRe.m"}]]
   ```
2. 導入：
   ```mathematica
   Needs["OGRe`"](*注意，該宏包内函數的提示信息較多，為節省篇幅，本文不會一一呈現*)
   ```
3. 調出幫助文檔：
   ```mathematica
   ?OGRe`*
   ```
4. 卸載（？非必要不執行🤨）：
   ```mathematica
   DeleteFile[FileNameJoin[{$UserBaseDirectory,"Applications","OGRe.m"}]]
   ```

## 開始定義一些基本的量

### 定義坐標系

這裏只是告訴了電腦坐標系的名字和每個坐標的記號，并沒有度規等信息。

```mathematica
TNewCoordinates["Cartesian", {t, x, y, z}](*定義Cartesian 坐標系*)
TNewCoordinates["Spherical", {t, r, \[Theta], \[Phi]}](*定義球坐標系*)
```

請注意，裡面的所有變量都是未定義的，意即 `t, x, y, z` 之前還沒有被定義過。有一種方法可以消除已有的定義：

```mathematica
TSetReservedSymbols[{t, x, y, z}]
TSetReservedSymbols[{t, r, \[Theta], \[Phi]}]
```

但是可惜那個坐標系的名字不能以這種方法清除，詳見：`TChangeID[], TDelete[]`。

### 定義度規張量

```mathematica
TNewMetric["Minkowski", "Cartesian", DiagonalMatrix[{-1, 1, 1, 1}], "\[Eta]"](*定義 Minkowski 度規，使用剛剛定義過的 Cartesian 坐標系，符號為\[Eta]*)
(*接下來要定義 Schwarzschild 度規，但是裏面涉及到一個符號 M，即質量，它是一個基本的量，我們需要保留它，並使得以後不再允許爲他提供定義，因此我們附加條件：*)
TSetReservedSymbols[M](*這條命令自動返回已經預先保留的符號*)
TNewMetric["Schwarzschild","Spherical",DiagonalMatrix[{-(1-(2 M)/r),1/(1-(2 M)/r),r^2,r^2 Sin[\[Theta]]^2}]](*定義 Schwarzschild 度規，使用剛剛定義過的球坐標系，符號為默認符號 g*)
```

甚至可以直接計算出度規張量對應的行列式：
```mathematica
TVolumeElementSquared["Minkowski"](*--> -1*)
TVolumeElementSquared["Schwarzschild"](*--> -r^4 Sin[\[Theta]]^2*)
```

### 查看已定義的量

有好幾種方法，：
1. `TShow[]`：以矩陣格式呈現
   ```mathematica
   TShow["Cartesian"]
   TShow["Spherical"]
   TShow["Minkowski"]
   TShow["Schwarzschild"](*爲什麽上面那三個家夥一樣長……*)
   ```
2. `TList[]`：只分別顯示出非零的量，方便直接讀出具體指標
   ```mathematica
   TList["Minkowski"]
   TList["Schwarzschild"]
   ```
3. `TLineElement[]`：包括他們的基矢，寫成一個多項式的形式
   ```mathematica
   TLineElement["Minkowski"](*--> -\[DoubleStruckD]t^2+\[DoubleStruckD]x^2+\[DoubleStruckD]y^2+\[DoubleStruckD]z^2*)
   TLineElement["Schwarzschild"](*--> \[DoubleStruckD]r^2/(1-(2 M)/r)+(-1+(2 M)/r) \[DoubleStruckD]t^2+r^2 \[DoubleStruckD]\[Theta]^2+r^2 \[DoubleStruckD]\[Phi]^2 Sin[\[Theta]]^2*)
   ```

- 什麽？你的度規的定義裏存在參數是時空點的函數？別着急！
```mathematica
TSetReservedSymbols[{v,f}];
TNewMetric["Alcubierre","Cartesian",{{-1+v[t]^2 f[t,x,y,z]^2,0,0,-v[t] f[t,x,y,z]},{0,1,0,0},{0,0,1,0},{-v[t] f[t,x,y,z],0,0,1}}];
```
  - Here, `TShow[]` 在顯示的時候不會顯示出依賴關係，但是 `TLineElement[]` 會。
- 什麽？你想用你自己的指標順序？別着急，我們是追求自由和美的戰士！
```mathematica
(*先看看當前的指標順序*)
TSetIndexLetters[]
(*你說你喜歡英文字母是吧？*)
TSetIndexLetters["abcdefghijklmnopqrstuvwxyz"]
(*你又想改回默認？好吧，一切美化的終點都是默認……*)
TSetIndexLetters[Automatic]
(*增强文化自信，我使用天干做指標😗*)
TSetIndexLetters["甲乙丙丁戊己庚辛壬癸"]
(*但是應該注意，你要是已經規定了坐標的指標，那有些東西還是按照你坐標的指標來*)
```

### 定義其他的東西：各種張量

講起來有點複雜，直接上例子：

```mathematica
(*從現在起，前面都加“TShow@”，這將會自動返回我們定義的具體内容*)
(*標量，空列表{}表示沒有指標，各個東西的含義自明：這個量的名字，它所處在的流形的度規和所選坐標系，指標類型，大小。符號*)
TShow@TNewTensor["Kretschmann", "Schwarzschild", "Spherical", {}, {(48 M^2)/
  r^6}, "K"]
(*--> Kretschmann:   Subsuperscript[K, , ](t,r,\[Theta],\[Phi]) = (48 M^2)/r^6*)
(*矢量，但是還沒有指定符號*)
TShow@TNewTensor["FourVelocity", "Minkowski", "Cartesian", {1}, {1, v, 0, 0}/Sqrt[1 - v^2]]
(*(2, 0)型張量*)
TSetReservedSymbols[{\[Rho], p}]
TShow@TNewTensor["PerfectFluid", "Minkowski", "Cartesian", {1, 1}, DiagonalMatrix[{\[Rho], p, p, p}], "T"]
```

關於定義的張量的類型，由中間那個列表表示，裏面的值只能是正負一，第幾個就是第幾個指標，例如：$$T^{ab}_{\ \ \ \ cd}\Rightarrow\{1, 1, -1, -1\},\ T^{a\ c}_{\ \ \ b\ d}\Rightarrow\{1, -1, 1, -1\}$$。

## 開始（常規/基本）操作

### 改名換姓

- 區分*名字*和*符號*！

```mathemaatica
TShow@TChangeSymbol["FourVelocity", "u"]
TChangeID["FourVelocity" -> "4-Velocity"]
TShow["FourVelocity"]
TShow["4-Velocity"]
```

### 刪除和覆蓋（定義）

```mathemaatica
(*坐標系、度規張量可不能刪除！*)
TDelete["Cartesian"](*報錯*)
TDelete["Minkowski"](*報錯*)
(*查看現在是否允許覆蓋定義*)TSetAllowOverwrite[]
(*我就要允許覆蓋！*)TSetAllowOverwrite[True]
```

### 指標升降

#### 以某種方式顯示

```mathematica
TShow["4-Velocity", {-1}](*已經自動用它定義中的度規張量升降過*)
TList["Schwarzschild", {1, -1}](*度規張量變成一上一下的時候就成了單位張量*)
```

#### 永久地改變

```mathematica
TChangeDefaultIndices["PerfectFluid", {-1, -1}]
```

### 坐標變換

#### 定義坐標關係

```mathematica
TAddCoordTransformation["Spherical"->"Cartesian",{r->Sqrt[x^2+y^2+z^2],\[Theta]->ArcCos[z/Sqrt[x^2+y^2+z^2]],\[Phi]->ArcTan[x,y]}];
(*可以看到，不需要變的坐標可以不寫*)
```

#### 顯示就 vans !

```mathematica
TShow["Minkowski", "Spherical"]
TShow["PerfectFluid", {1, 1}, "Spherical"]
TList["Kretschmann", "Cartesian"]
```

#### 永久地改變（默認坐標系）

```mathematica
TChangeDefaultCoords["PerfectFluid", "Spherical"]
```

### 帶入數值

```mathematica
TShow["Kretschmann", ReplaceAll[{M -> 1, r -> 10}]]
TList["PerfectFluid", ReplaceAll[p -> \[Rho]]]
```

### 設置化簡假設

```mathematica
TSetAssumptions[r >= 0]
TShow[TSimplify["SpatialDistance"], "Spherical"]
(*允許使用非實數變量：*)TSetAssumptions[!Reals]
```

### 導出和導入

不想每次打開筆記本文件都要把所有東西都跑一遍罷~

```mathematica
(*導出（包括關聯）*)
TExport["4-Velocity"]
TExport["Cartesian"]
TExportAll[]

(*查看信息（包括關聯）*)
TInfo["Cartesian"]
TInfo[]

(*導入（所有信息）*)
TImportAll[source]
```

> 這部分在實踐中很重要，但是沒有辦法給出很好的例子，請查閱原文檔。

```mathematica
(*以某種（指標）方式顯示出張量的係數*)
TGetComponents["Schwarzschild",{1,1},"Spherical"]
```

## 代數運算：`TCalc`

### 加法

$$S_{\mu\nu}=\eta_{\mu\nu}+T_{\mu\nu}$$
```mathematica
TShow@TCalc["SumResult","Minkowski"["\[Mu]\[Nu]"]+"PerfectFluid"["\[Mu]\[Nu]"],"S"](*名字和符號是可選的*)
```

### 數乘

這裏的“數”不可以是定義出來的0階張量

```mathematica
TShow@TCalc[2 t "Minkowski"["\[Mu]\[Nu]"]-3 x "PerfectFluid"["\[Mu]\[Nu]"]+4 y "NonSymmetric"["\[Mu]\[Nu]"]-5 z "NonSymmetric"["\[Nu]\[Mu]"]]
```

### 縮並：`.`

```mathematica
(*無縮並，只是簡單的張量積*)
TShow@TCalc["PerfectFluidFromVelocity",(\[Rho]+p) "4-Velocity"["\[Mu]"]."4-Velocity"["\[Nu]"]+p "Minkowski"["\[Mu]\[Nu]"],"T"](*參數的順序仍然是：答案的名字，表達式，答案的符號*)

(*零階張量*)
TShow[TCalc["SpatialDistance"[""]."Minkowski"["\[Mu]\[Nu]"]],"Spherical"]
TShow[TCalc["SpatialDistance"[""]."SpatialDistance"[""]],"Spherical"]

(*自己内積自己*)
TShow@TCalc["4-Velocity"["\[Mu]"] . "4-Velocity"["\[Mu]"]]

(*正經八百的縮並*)
TShow@TCalc["4-Velocity"["\[Mu]"]."PerfectFluidFromVelocity"["\[Mu]\[Nu]"]."NonSymmetric"["\[Nu]\[Rho]"]]

(*自己縮並自己：求跡*)
TShow@TCalc["Minkowski"["\[Mu]\[Mu]"]]
```

- 應該指出，運算時寫出來的指標不需要我們關心上下指標，只需要關心左右關係，因爲計算機可以由定義得知上下指標

### 求範數的平方

$$|v|^2\equiv v^{\mu}v_{\mu},\ |T|^2=T^{\mu\nu}T_{\mu\nu},\ \dots$$

```mathematica
TList@TCalcNormSquared["4-Velocity"]
TList@TCalcNormSquared["Minkowski"]
TList@TCalcNormSquared["SchwarzschildRiemann"]
```

## 微積分運算

### 偏導數

$$\partial_\mu K\mathrm{\ and\ }\partial_\mu x^\mu\mathrm{:}$$

```mathematica
TShow@TCalc[TPartialD["\[Mu]"] . "Kretschmann"[""]]
TShow@TCalc[TPartialD["\[Mu]"] . "Spherical"["\[Mu]"]]
```

若非特殊需要，强烈不建議使用！

### Christoffel 符號

$$\Gamma^{\lambda}_{\ \ \mu\nu}=\frac{1}{2}g^{\lambda\sigma}(\partial_\mu g_{\nu\sigma}+\partial_{\nu}g_{\sigma\mu}-\partial_{\sigma}g_{\mu\nu})$$

直接使用内置函數，自動命名，自動體現特殊的變換性質：

```mathematica
TList@TCalcChristoffel["Schwarzschild"]
```

### Riemann 張量

$$R^{\rho}_{\ \ \sigma\mu\nu}=\partial_\mu\Gamma^\rho_{\ \ \nu\sigma}+\partial_{\nu}\Gamma^{\rho}_{\ \ \mu\sigma}+\Gamma^{\rho}_{\ \ \mu\lambda}\Gamma^{\lambda}_{\ \ \nu\sigma}-\Gamma^{\rho}_{\ \ \nu\lambda}\Gamma^{\lambda}_{\ \ \mu\sigma}$$

直接使用内置函數，自動計算中間過程函數……：

```mathematica
TList@TCalcRiemannTensor["FLRW"](*那是某一個度規張量的名字*)
```

### Ricci 張量和曲率標量

$$R_{\mu\nu}=R^{\lambda}_{\ \ \mu\lambda\nu},\ R=R^\lambda_{\ \ \lambda}$$

内置函數，爽的：

```mathematica
TList@TCalcRicciTensor["FLRW"]
TList@TCalcRicciScalar["FLRW"]
```

### Einstein 張量

$$G_{\mu\nu}=R_{\mu\nu}-\frac{1}{2}g_{\mu\nu}R$$

```mathematica
TList@TCalcEinsteinTensor["FLRW"]
```

### 協變導數 $\nabla_\mu$

```mathematica
TList@TCalc[TCovariantD["\[Mu]"] . "FLRW"["\[Alpha]\[Beta]"]]
```

> 注🐖：當一個度規張量被覆蓋定義時，由它計算出來的量自動被刪除。

## 曲线和测地线

### 曲线的 Lagrangian 與測地綫方程（組）

$$\mathscr{L}=g_{\mu\nu}\dot{x}^{\mu}\dot{x}^{\nu}$$

可以求，都可以求：

```mathematica
TList@TCalcLagrangian["Minkowski"]
TList@TCalcLagrangian["Schwarzschild"]
TList@TCalcLagrangian["FLRW"]
TList@TCalcLagrangian["Alcubierre"]
(*簡簡單單導出一個 mma 格式的表達式*)
TGetComponents["MinkowskiLagrangian"]
```

由 Lagrangian 得到測地綫方程：

$$\frac{\mathrm{d}}{\mathrm{d}\lambda}(\frac{\partial\mathscr{L}}{\partial\dot{x}^{\mu}})-\frac{\partial\mathscr{L}}{\partial x^{\mu}}=0$$

```mathematica
TList@TCalcGeodesicFromLagrangian["Minkowski"]
(*更標準的形式：*)TList["MinkowskiGeodesicFromLagrangian", Activate]
(*得到 mma 表達式以便進一步計算*)TGetComponents["MinkowskiGeodesicFromLagrangian",Activate]
```

注 🐖 ：默認的曲綫參數是 $\lambda$，so 你是不是已經準備掂刀 🔪 或者 TJ 了？別擔心，可以改成我們最喜歡的固有時 $\tau$：`TSetCurveParameter[\[Tau]];`。

### Christoffel 符號與測地綫方程（組）

$$\dot{x}^{\rho}\nabla_{\rho}\dot{x}^{\sigma}=0\Rightarrow\ddot{x}^{\sigma}+\Gamma^{\sigma}_{\ \ \mu\nu}\dot{x}^{\mu}\dot{x}^{\nu}=0$$

```mathematica
TList@TCalcGeodesicFromChristoffel["Minkowski"]
TList@TCalcGeodesicFromChristoffel["Schwarzschild"]
...
```

兩種方法得到的方程組的形式未必一樣，但是有相同的解。對於不同的度規張量，他們的形式簡化程度不同

### 用坐標時表出測地綫方程（組）

我們想要求解坐標系中的運動方程，則更喜歡如下形式的測地綫方程組：

$$\frac{\mathrm{d}^2x^{\sigma}}{\mathrm{d}t^2}+(\Gamma^{\sigma}_{\ \ \mu\nu}-\Gamma^{0}_{\ \ \mu\nu}\frac{\mathrm{d}x^{\sigma}}{\mathrm{d}t})\frac{\mathrm{d}x^{\mu}}{\mathrm{d}t}\frac{\mathrm{d}x^{\nu}}{\mathrm{d}t}=0$$

```mathematica
TList@TCalcGeodesicWithTimeParameter["FLRW", "Cartesian"]
TGetComponents["FLRWGeodesicWithTimeParameter"]
```

- 這裏在提醒一下，很多函數計算之後會自動為結果命名。

## 并行計算

- 應該注意，更加耗時的部分不是張量的指標運算，而是最後的代入數據。
- 小知識：`ClearSystemCache[]` 可以讓 mma 忘記之前的化簡結果。

允許并行化計算：`TSetParallelization[True]`，然後就不用管了，其他的代碼不用修改。

甚至還可以利用這個包來化簡別的表達式 🦁：

```mathematica
(*查看當前化簡假設*)TSetAssumptions[]

(*一個測試案例*)
testExpression=Table[f[a b Sqrt[r^(a+b)]],{a,1,5},{b,1,5}];

ClearSystemCache[]
notParallelSimplify=AbsoluteTiming[FullSimplify[testExpression.testExpression]]

ClearSystemCache[]
parallelSimplify=AbsoluteTiming[TSimplify[testExpression.testExpression]]
```

當輸入的表達式是 `List` 時，自動調用并行化簡。

<p align="right">廣義相對論 in mma - 完</p>