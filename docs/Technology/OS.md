# OS

## Arch Linux

仅记录个人安装与配置 Arch Linux 的流程，更系统的教程请见：

1. [Arch Linux 官方维基](https://wiki.archlinux.org/)
2. [Arch Linux 安装使用教程](https://archlinuxstudio.github.io/ArchLinuxTutorial/#/)
3. [Arch Linux 简明指南](https://arch.icekylin.online)

建议：跟着教程装一两遍，之后 `archinstall` 就行了

### 基础配置

- 禁用 PC speaker: `sudo vim /etc/modprobe.d/nobeep.conf`

```sh
blacklist pcspkr
blacklist snd_pcsp
```

- 更改显示缩放: `150%`
- 加速开关机 `sudo vim /etc/default/grub`，修改后运行 `sudo grub-mkconfig -o /boot/grub/grub.cfg`

```sh
# GRUB_CMDLINE_LINUX_DEFAULT="loglevel=3 quiet"
# 修改为
GRUB_CMDLINE_LINUX_DEFAULT="loglevel=5 nowatchdog splash"
```

- pacman 颜色、多线程下载、cn 源：`sudo vim /etc/pacman.conf`

```sh
Color
ParallelDownloads = 5

[archlinuxcn]
Server = https://mirrors.ustc.edu.cn/archlinuxcn/$arch
# 先设置这一个，安装 archlinuxcn-mirrorlist-git 后再成：
# Include = /etc/pacman.d/archlinuxcn-mirrorlist
```

### 软件安装

```sh
sudo pacman -S archlinuxcn-keyring archlinuxcn-mirrorlist-git
sudo pacman -S yay

yay -S lrzip lzop p7zip unarchiver unrar
yay -S appstream appstream-qt packagekit packagekit-qt5

yay -S clash clash-meta clash-verge
yay -S fcitx5-im fcitx5-chinese-addons fcitx5-pinyin-moegirl fcitx5-pinyin-zhwiki fcitx5-pinyin-custom-pinyin-dictionary
yay -S ffmpeg fish neofetch lolcat
yay -S foliate foxitreader okular
yay -S github-desktop-bin
yay -S helix typora visual-studio-code-bin xmind
yay -S icalingua++ linuxqq wechat-uos wemeet-bin zoom
yay -S jabref
yay -S kuro
yay -S kwin-scripts-tiling
yay -S mathematica
yay -S microsoft-edge-stable-bin vivaldi vivaldi-ffmpeg-codecs
yay -S nerd-fonts-meta noto-fonts noto-fonts-cjk noto-fonts-emoji noto-fonts-extra otf-fandol ttf-lxgw-wenkai ttf-lxgw-wenkai-mono
yay -S ntfs-3g
yay -S obs-studio xdg-desktop-portal xdg-desktop-portal-kde
yay -S onedrivegui-git
yay -S plasma5-applets-weather-widget-2
yay -S qbittorrent-enhanced-git
yay -S sddm-git
yay -S spectacle
yay -S stardict
yay -S texlive texlive-lang biber texlive-latexindent-meta
yay -S vlc yesplaymusic
yay -S wps-office wps-office-fonts ttf-wps-fonts ttf-ms-fonts
```

#### jabref

直接 `yay -S jabref` 则会发现有一个 java 需要的东西几乎下载不下来，这里提供一种解决方法：

1. 下载失败会有提示，去那个连接手动下载
2. 把从 github 上下载下来的 .tar.gz 文件解压缩修改 `gradle\wrapper\gradle-wrapper.properties` 里面的下载地址为手动下载下来的文件的位置 `file:///home/...`
3. 理论上 Sha256Sum 不需要更改，如果报了这个错误就回来改
4. 再把这个包打包成 .tar.gz 文件，复制到 ~/.cache/yay/jabref/src 下
5. 最重要的一步，安装：`yay -S --mflags --skipinteg jabref`「这个选项是为了跳过 Sha256Sum 检验」

也许在第一次安装 java 编译程序的时候可以选择其他的编译环境以避免这样做（可能吗？我觉得不可能，因为下载那个文件是 jabref 的 源码所需要的），你可以试一试……

### 美化

1. [系统美化](https://archlinuxstudio.github.io/ArchLinuxTutorial/#/advanced/beauty)
2. [archlinux 系统美化（布局篇）](https://arch.icekylin.online/guide/advanced/beauty-1.html)
3. [archlinux 系统美化（主题篇）](https://arch.icekylin.online/guide/advanced/beauty-2.html)
4. [archlinux 系统美化（终端篇）](https://arch.icekylin.online/guide/advanced/beauty-3.html)
5. [Tutorials/Force Transparency And Blur](https://userbase.kde.org/Tutorials/Force_Transparency_And_Blur)

```sh
yay -S bibata-cursor-theme
yay -S catppuccin-fcitx5-git
yay -S flat-remix
yay -S kvantum kvantum-theme-nordic-git
yay -S nordic-kde-git
yay -S nordic-theme
yay -S sddm-nordic-theme-git
```

- 任务栏：放在屏幕顶部
- 壁纸：使用必应每日一图
- Konsole：修改默认的颜色主题透明度为 `75%`

#### 更换主题

先在 `kvantum manager` 里更换主题，再在系统设置里把能改成 `kvantum` 的改掉。

#### KDE 平铺脚本

- 在系统设置中搜索 `KWin Scripts`
- "Tiling Extension" 中 "Gap" 全部设置为 `5`

### 软件配置

#### 添加虚拟桌面

- 在系统设置中搜索 `Virtual Desktops`
- 添加至 `5` 个
- 设置他们的快捷键为 `Meta + Alt + <number>`

  - 在系统设置中搜索 `Shortcuts` -> `KWin`

#### 中文输入法

`sudo vim /etc/environment`

```sh
GTK_IM_MODULE=fcitx
QT_IM_MODULE=fcitx
XMODIFIERS=@im=fcitx
SDL_IM_MODULE=fcitx
GLFW_IM_MODULE=ibus
```

- 添加输入法 `Shuangpin`，修改双拼方案为 `Xiaohe`
- 修改云拼音后端为 `Baidu`

#### stardict

1. 下载 [简体中文词典](http://download.huzheng.org/zh_CN/)
2. 安装词典 `tar -xjvf <file name> -C ~/.stardict/dic/ # or /usr/share/stardict/dic/`

#### proxy

`clash-verge`

> 我自己在一个相对私人的笔记本电脑安装了 arch linux，并同时另持有一台 MacBook Pro 2015 和一台 Windows 台式机——它们所需的花费并没有想象中的大。如果你没有另一台 macos 或 windows 的电脑，我不建议你安装 arch linux。

## MacOS

### Homebrew

[镜像快速安装Homebrew教程](https://brew.idayer.com)

```sh
/bin/bash -c "$(curl -fsSL https://gitee.com/ineo6/homebrew-install/raw/master/install.sh)"

brew tap homebrew/cask-fonts 

brew install --cask clashx

brew install ffmpeg
brew install latexindent
brew install lolcat
brew install neofetch

brew install --cask adrive
brew install --cask github
brew install --cask keka
brew install --cask mactex-no-gui
brew install --cask microsoft-edge
brew install --cask onedrive
brew install --cask qq
brew install --cask snipaste
brew install --cask telegram
brew install --cask typora
brew install --cask visual-studio-code
brew install --cask vivaldi
brew install --cask vlc
brew install --cask wechat
brew install --cask yesplaymusic
brew install --cask youdaodict

brew install --cask font-fira-code-nerd-font
brew install --cask font-lxgw-wenkai
```

## Windows

### Apps

winget + scoop + Microsoft store

#### winget

```sh
Alibaba.aDrive
Armin2208.WindowsAutoNightMode
Bilibili.Livehime
EpicGames.EpicGamesLauncher
Fndroid.ClashForWindows
ForgQi.biliup-app
Kingsoft.TypeEasy
Kingsoft.WPSOffice.CN
MacType.MacType
Microsoft.DotNet.DesktopRuntime.7
Microsoft.PowerShell
Microsoft.WindowsTerminal
NetEase.CloudMusic
oldj.switchhosts
Oracle.VirtualBox
Tencent.TencentMeeting
Tencent.TIM
Tencent.WeChat
Thunder.Thunder
Valve.Steam
Youdao.YoudaoDict
```

#### scoop

added bucket:

```sh
extras
main
nerd-fonts
```

installed apps:

```sh
Name                 Version          Source     Updated             Info
----                 -------          ------     -------             ----
7zip                 22.01            main       2023-01-10 12:03:44
altsnap              1.58             extras     2023-02-08 11:09:34
bandizip             7.30             extras     2023-01-19 22:29:07
dark                 3.11.2           main       2023-01-10 12:32:35
everything           1.4.1.1022       extras     2023-01-10 13:16:31
ffmpeg               5.1.2            main       2023-01-10 12:35:09
firefox              110.0            extras     2023-02-15 09:44:38
git                  2.39.2.windows.1 main       2023-02-15 09:45:22
googlechrome         109.0.5414.129   extras     2023-02-26 14:13:57
imagemagick          7.1.0-62         main       2023-02-13 17:57:41
innounp              0.50             main       2023-01-15 19:31:32
jabref               5.9              extras     2023-01-10 12:36:17
marktext             0.17.1           extras     2023-02-14 17:32:31
miktex               22.10            main       2023-01-10 12:38:24
obs-studio           29.0.2           extras     2023-02-05 07:40:57
pandoc               3.1              main       2023-02-11 10:43:20
potplayer            230207           extras     2023-02-08 14:43:09
powertoys            0.67.1           extras     2023-02-08 14:44:24
qbittorrent-enhanced 4.5.1.10         extras     2023-02-17 09:58:08
quicklook            3.7.3            extras     2023-01-10 15:36:26
snipaste             1.16.2           extras     2023-01-10 12:09:36
sudo                 0.2020.01.26     main       2023-01-16 22:20:40
sumatrapdf           3.4.6            extras     2023-01-10 12:09:23
syncthing            1.23.1           main       2023-02-08 14:43:51
typora               1.5.8            extras     2023-02-15 09:01:41
vlc                  3.0.18           extras     2023-01-17 11:37:36
vscode               1.75.1           extras     2023-02-10 17:14:04
winrar               6.20             extras     2023-02-01 09:19:58
yesplaymusic         0.4.7            extras     2023-01-31 14:44:38
LXGWWenKai           1.250            nerd-fonts 2023-01-18 10:40:23 Global install
LXGWWenKaiScreen     1.250.2          nerd-fonts 2023-02-08 14:49:39 Global install
```

#### Microsoft store

```sh
Watt Toolkit
```

#### 手动安装的软件

```sh
[aurora](https://arr.network/)
[EndNote X9](https://endnote.com/)
[pdfpatcher](https://www.cnblogs.com/pdfpatcher/)
[Wolfram Mathematica](https://www.wolfram.com/mathematica/)
```

### Lists Installed Fonts

```sh
fc-list -f "%{family}\n"
# or save to file:
fc-list -f "%{family}\n" :lang=zh >c:zhfont.txt
```

### Limit Power Consumption and Reduce Noise

Control Panel - Power Options - Edit Plan Settings - Change advanced power settings - Processor power management

- Minimum processor state
    - On battery: 5%
    - Plugged in: 5%
- System cooling policy
    - On battery: Passive
    - Plugged in: Passive
- Maximum processor state
    - On battery: 80%
    - Plugged in: 100%
