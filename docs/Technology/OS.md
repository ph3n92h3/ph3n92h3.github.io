# OS

## Arch Linux

仅记录个人安装与配置 Arch Linux 的流程，更系统的教程请见：

1. [Arch Linux 官方维基](https://wiki.archlinux.org/)
2. [Arch Linux 安装使用教程](https://archlinuxstudio.github.io/ArchLinuxTutorial/#/)
3. [Arch Linux 简明指南](https://arch.icekylin.online)

建议：跟着教程装一两遍，之后 `archinstall` 就行了

### 基础配置

#### 禁用 PC speaker

`sudo vim /etc/modprobe.d/nobeep.conf`

```sh
blacklist pcspkr
blacklist snd_pcsp
```

#### 加速开关机

`sudo vim /etc/default/grub`

```sh
# GRUB_CMDLINE_LINUX_DEFAULT="loglevel=3 quiet"
# 修改为
GRUB_CMDLINE_LINUX_DEFAULT="loglevel=5 nowatchdog"
```

`sudo grub-mkconfig -o /boot/grub/grub.cfg`

#### pacman 颜色、多线程下载

`sudo vim /etc/pacman.conf`

```sh
Color
ParallelDownloads = 10
```

#### 添加非官方用户仓库

- [arch4edu](https://github.com/arch4edu/arch4edu)
- [archlinuxcn](https://github.com/archlinuxcn/repo)

首先添加在一个源，再下载它的密钥和镜像列表文件，在镜像列表文件中对要使用的源取消注释，最后把 Server 改为 Include

```sh
# [core], [extra]

# [multilib]

[arch4edu]
Server = https://mirrors.tuna.tsinghua.edu.cn/arch4edu/$arch
## or other mirrors in https://github.com/arch4edu/mirrorlist/blob/master/mirrorlist.arch4edu
#Include = /etc/pacman.d/mirrorlist.arch4edu

[archlinuxcn]
Server = http://repo.archlinuxcn.org/$arch
## or install archlinuxcn-mirrorlist-git and use the mirrorlist
#Include = /etc/pacman.d/archlinuxcn-mirrorlist
```

```sh
sudo pacman -S archlinuxcn-keyring archlinuxcn-mirrorlist-git
sudo pacman -S arch4edu-keyring mirrorlist.arch4edu
sudo pacman -S paru
```

- [ALHP](https://somegit.dev/ALHP/ALHP.GO)

    - 用了这个之后，浏览器显示不出来东西了……

```sh
paru -S alhp-keyring alhp-mirrorlist
#Server = https://mirrors.shanghaitech.edu.cn/alhp/$repo/os/$arch/
```

```sh
[core-x86-64-v3]
Include = /etc/pacman.d/alhp-mirrorlist

[extra-x86-64-v3]
Include = /etc/pacman.d/alhp-mirrorlist

# [core], [extra]

[multilib-x86-64-v3]
Include = /etc/pacman.d/alhp-mirrorlist

# [multilib]
```

### 软件安装与配置

```sh
paru -S ark lrzip lzop p7zip unarchiver unrar

paru -S clash clash-meta clash-verge
paru -S fcitx5-im fcitx5-chinese-addons fcitx5-pinyin-moegirl fcitx5-pinyin-zhwiki fcitx5-pinyin-custom-pinyin-dictionary
paru -S ffmpeg fish neofetch lolcat
paru -S foliate foxitreader
paru -S github-desktop-bin
paru -S helix typora visual-studio-code-bin
paru -S linuxqq wemeet-bin zoom
paru -S jabref
paru -S kuro
paru -S mathematica
paru -S microsoft-edge-stable-bin vivaldi vivaldi-ffmpeg-codecs
paru -S nerd-fonts-meta noto-fonts noto-fonts-cjk noto-fonts-emoji noto-fonts-extra otf-fandol ttf-lxgw-wenkai ttf-lxgw-wenkai-mono
paru -S ntfs-3g
paru -S obs-studio
paru -S onedrivegui-git
paru -S qbittorrent-enhanced-git
paru -S texlive texlive-lang texlive-latexindent-meta
paru -S vlc yesplaymusic
paru -S wps-office wps-office-fonts ttf-wps-fonts ttf-ms-fonts
```

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

#### 翻译软件

- wudao-dict
- stardict- wudao-dict

    1. 下载 [简体中文词典](http://download.huzheng.org/zh_CN/)
    2. 安装词典 `tar -xjvf <file name> -C ~/.stardict/dic/ # or /usr/share/stardict/dic/`

#### Syncthing

```sh
systemctl enable syncthing@ph2.service
```

### Hyprland

#### 专属软件

```sh
sudo pacman -S hyprland kitty
paru -S hyprland-hidpi-xprop-git xdg-desktop-portal-hyprland qt5-wayland qt6-wayland
paru -S dunst hyprpaper udiskie waybar
```

#### 疑难解决

- 图形化连接网络：`paru -S networkmanager` -> `nmtui`
- 自动挂载 U 盘：`paru -S udiskie`
- 切换代理：在 `clash-verge` 里面创建一个空的 profile，不想走代理的时候就用这个
- 剪切板：`Ctrl + ;`

##### 功耗控制

[archlinux 功耗控制](https://arch.icekylin.online/guide/advanced/power-ctl.html)

```sh
paru -S tlp tlp-rdw
sudo systemctl enable tlp.service
sudo systemctl enable NetworkManager-dispatcher.service
sudo systemctl mask systemd-rfkill.service
sudo systemctl mask systemd-rfkill.socket

paru -S auto-cpufreq
sudo systemctl enable auto-cpufreq.service
sudo systemctl mask power-profiles-daemon.service
```

##### 疑难未解决

- 缩放导致光标大小不一样
- 更换系统默认字体

### KDE

#### 专属软件

```sh
paru -S appstream appstream-qt packagekit packagekit-qt5
paru -S kwin-scripts-tiling
paru -S plasma5-applets-weather-widget-2
paru -S sddm-git
paru -S spectacle
paru -S xdg-desktop-portal-kde
```

#### KDE 平铺脚本

- 在系统设置中搜索 `KWin Scripts`
- "Tiling Extension" 中 "Gap" 全部设置为 `5`

#### 添加虚拟桌面

- 在系统设置中搜索 `Virtual Desktops`
- 添加至 `5` 个
- 设置他们的快捷键为 `Meta + Alt + <number>`

  - 在系统设置中搜索 `Shortcuts` -> `KWin`

#### 美化

1. [ArchLinux 系统美化](https://archlinuxstudio.github.io/ArchLinuxTutorial/#/advanced/beauty)
2. [ArchLinux 系统美化（布局篇）](https://arch.icekylin.online/guide/advanced/beauty-1.html)
3. [ArchLinux 系统美化（主题篇）](https://arch.icekylin.online/guide/advanced/beauty-2.html)
4. [ArchLinux 系统美化（终端篇）](https://arch.icekylin.online/guide/advanced/beauty-3.html)
5. [Tutorials/Force Transparency And Blur](https://userbase.kde.org/Tutorials/Force_Transparency_And_Blur)

```sh
paru -S bibata-cursor-theme
paru -S catppuccin-fcitx5-git
paru -S flat-remix
paru -S kvantum kvantum-theme-nordic-git
paru -S nordic-kde-git
paru -S nordic-theme
paru -S sddm-nordic-theme-git
```

- 任务栏：放在屏幕顶部
- 壁纸：使用必应每日一图
- Konsole：修改默认的颜色主题透明度为 `75%`
- 更换主题：先在 `kvantum manager` 里更换主题，再在系统设置里把能改成 `kvantum` 的改掉。

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
