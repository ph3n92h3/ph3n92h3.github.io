# OS

## Arch Linux

- [dotfile](https://github.com/ph3n92h3/dotfile)

仅记录个人安装与配置 Arch Linux 的流程，更系统的教程请见：

1. [Arch Linux 官方维基](https://wiki.archlinux.org/)
2. [Arch Linux 安装使用教程](https://archlinuxstudio.github.io/ArchLinuxTutorial/#/)
3. [Arch Linux 简明指南](https://arch.icekylin.online)

建议：跟着教程装一两遍，之后 `archinstall` 就行了

### Basic Configuration

#### 禁用 PC speaker

`sudo hx /etc/modprobe.d/nobeep.conf`

```conf
blacklist pcspkr
blacklist snd_pcsp
```

#### 添加非官方用户仓库

- [arch4edu](https://github.com/arch4edu/arch4edu)
- [archlinuxcn](https://github.com/archlinuxcn/repo)

首先添加在一个源，再下载它的密钥和镜像列表文件，在镜像列表文件中对要使用的源取消注释，最后把 Server 改为 Include

```conf
# [core], [extra]

# [multilib]

[arch4edu]
Server = https://mirrors.tuna.tsinghua.edu.cn/arch4edu/$arch
## or other mirrors in https://github.com/arch4edu/mirrorlist/blob/master/mirrorlist.arch4edu
#Include = /etc/pacman.d/mirrorlist.arch4edu

[archlinuxcn]
Server = https://mirrors.tuna.tsinghua.edu.cn/archlinuxcn/$arch
## or install archlinuxcn-mirrorlist-git and use the mirrorlist
#Include = /etc/pacman.d/archlinuxcn-mirrorlist
```

```sh
sudo pacman -S archlinuxcn-keyring archlinuxcn-mirrorlist-git
pacman-key --recv-keys 7931B6D628C8D3BA
pacman-key --finger 7931B6D628C8D3BA
pacman-key --lsign-key 7931B6D628C8D3BA
sudo pacman -S arch4edu-keyring mirrorlist.arch4edu
sudo pacman -S paru-git
```

- [ALHP](https://somegit.dev/ALHP/ALHP.GO)

```sh
paru -S alhp-keyring alhp-mirrorlist
#Server = https://mirrors.shanghaitech.edu.cn/alhp/$repo/os/$arch/
```

```conf
[core-x86-64-v3]
Include = /etc/pacman.d/alhp-mirrorlist

[extra-x86-64-v3]
Include = /etc/pacman.d/alhp-mirrorlist

# [core], [extra]

[multilib-x86-64-v3]
Include = /etc/pacman.d/alhp-mirrorlist

# [multilib]
```

- [chaotic-aur](https://aur.chaotic.cx)

```sh
sudo pacman-key --recv-key 3056513887B78AEB --keyserver keyserver.ubuntu.com
sudo pacman-key --lsign-key 3056513887B78AEB
sudo pacman -U 'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-keyring.pkg.tar.zst' 'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-mirrorlist.pkg.tar.zst'
```

```conf
[chaotic-aur]
Include = /etc/pacman.d/chaotic-mirrorlist
```

#### makepkg

[makepkg-optimize](https://wiki.archlinux.org/title/Makepkg-optimize)

```sh
paru -S makepkg-optimize openmp upx optipng svgo polly
```

[makepkg - Tips and tricks](https://wiki.archlinux.org/title/Makepkg#Tips_and_tricks)

```sh
paru -S lbzip2 pbzip2 pigz plzip xz zstd
```

`sudo hx ~/.config/pacman/makepkg.conf`

### 软件安装与配置

```sh
paru -S aria2 onedrivegui-git qbittorrent-enhanced-git xbyyunpan-bin
paru -S ark # arj lrzip lzop p7zip unarchiver unrar
paru -S clash-dev-git clash-meta-alpha-git clash-verge
paru -S cpufetch-git fastfetch-git ffmpeg-git fish-git joshuto-git nvtop pandoc-bin

paru -S fcitx5-im
paru -S fcitx5-chinese-addons fcitx5-pinyin-moegirl fcitx5-pinyin-zhwiki fcitx5-pinyin-custom-pinyin-dictionary
paru -S fcitx5-rime rime-double-pinyin

paru -S foliate foxitreader
paru -S geeqie gimp shotcut mpv-git obs-studio obs-backgroundremoval yesplaymusic
paru -S gnome-keyring github-desktop
paru -S helix-git visual-studio-code-bin
paru -S linuxqq telegram-desktop wemeet-bin zoom
paru -S linux-amd-drm-next linux-amd-znver2 # sudo grub-mkconfig -o /boot/grub/grub.cfg
paru -S jabref
paru -S kuro
paru -S mathematica # mathematica-light
paru -S vivaldi vivaldi-ffmpeg-codecs
paru -S nerd-fonts-meta noto-fonts noto-fonts-cjk noto-fonts-emoji noto-fonts-extra adobe-source-han-sans-cn-fonts adobe-source-han-serif-cn-fonts adobe-source-han-mono-cn-fonts
paru -S ntfs-3g
paru -S pot-translation-git tesseract tesseract-data wudao-dict-git
paru -S stable-diffusion-ui
paru -S texlive texlive-lang
paru -S ventoy-bin
paru -S wps-office wps-office-fonts ttf-wps-fonts ttf-ms-fonts
```

### Hyprland

#### 专属软件

```sh
sudo pacman -S hyprland-hidpi-xprop-git kitty-git
paru -S xdg-desktop-portal-hyprland-git qt5-wayland qt6-wayland
paru -S dunst hyprpaper-git udiskie wofi
paru -S waybar-hyprland-git otf-font-awesome wttrbar-git
paru -S brightnessctl grimblast-git swaylock-git
```

#### 疑难解决

- 图形化连接网络：`paru -S networkmanager` -> `nmtui`
- 自动挂载 U 盘：`paru -S udiskie`
- 切换代理：在 `clash-verge` 里面创建一个空的 profile，不想走代理的时候就用这个
- 剪切板：`Ctrl + ;`

##### 功耗控制

```sh
# paru -S tlp tlp-rdw
# sudo systemctl enable tlp.service
# sudo systemctl enable NetworkManager-dispatcher.service
# sudo systemctl mask systemd-rfkill.service
# sudo systemctl mask systemd-rfkill.socket

paru -S auto-cpufreq
sudo systemctl enable auto-cpufreq.service
sudo systemctl mask power-profiles-daemon.service
```

#### 美化

```sh
paru -S kvantum qt5ct
paru -S fcitx5-nord graphite-grub-theme-nord-4k nordic-theme tela-circle-icon-theme-nord-git

sudo hx /etc/default/grub
# GRUB_THEME="/usr/share/grub/themes/graphite-nord-4k/theme.txt"
sudo grub-mkconfig -o /boot/grub/grub.cfg
```

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
- 在系统设置中搜索 `Shortcuts` -> `KWin`
- 设置他们的快捷键为 `Meta + Alt + <number>`

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

> 我自己在一个相对私人的笔记本电脑安装了 Arch Linux，并同时另持有一台 MacBook Pro 2015 和一台 Windows 台式机——它们所需的花费并没有想象中的大。如果你没有另一台 macos 或 windows 的电脑，我不建议你安装 Arch Linux。

## MacOS

### Homebrew

[Homebrew 源使用帮助](https://mirrors.ustc.edu.cn/help/brew.git.html)

```sh
brew tap homebrew/cask-fonts 

brew install --cask clashx

brew install ffmpeg
brew install latexindent
brew install fastfetch

brew install --cask adrive
brew install --cask github
brew install --cask keka
brew install --cask mactex-no-gui
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

#### Winget

```sh
winget install Armin2208.WindowsAutoNightMode
winget install Bilibili.Livehime
winget install EpicGames.EpicGamesLauncher
winget install Kingsoft.TypeEasy
winget install Kingsoft.WPSOffice.CN
winget install Microsoft.DotNet.DesktopRuntime.6
winget install Microsoft.DotNet.DesktopRuntime.7
winget install NetEase.CloudMusic
winget install Oracle.VirtualBox
winget install Pylogmon.pot
winget install Tencent.TencentMeeting
winget install Tencent.TIM
winget install Tencent.WeChat
winget install Thunder.Thunder
winget install Valve.Steam
```

#### Scoop

```sh
# add bucket
scoop bucket add extras
scoop bucket add main
scoop bucket add nerd-fonts

# install apps
scoop install 7zip bandizip winrar
scoop install altsnap everything format-factory powertoys quicklook snipaste
scoop install clash-verge
scoop install cpu-z crystaldiskinfo crystaldiskmark gpu-z 
scoop install cpufetch fastfetch ffmpeg git imagemagick lf pandoc sudo syncthing
# scoop install dark innounp
scoop install FiraCode SarasaGothic-ttc
scoop install foxit-reader sumatrapdf
scoop install github
scoop install helix vscode
scoop install jabref
scoop install latex latexindent # miktex
scoop install mpv obs-studio yesplaymusic
scoop install msiafterburner
scoop install office-tool-plus
# scoop install qbittorrent-enhanced
scoop install telegram
scoop install ventoy
scoop install vivaldi
scoop install windows-terminal
```

#### Microsoft Store

```sh
Watt Toolkit
```

#### Install Manually

- [小白羊云盘](https://githubfast.com/gaozhangmin/aliyunpan)
- [EndNote X9](https://endnote.com/)
- [pdfpatcher](https://www.cnblogs.com/pdfpatcher/)
- [Wolfram Mathematica](https://www.wolfram.com/mathematica/)

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
