# Arch Linux

本文只记录个人安装与配置 arch linux 的流程，更系统的教程请见：

1. [Arch Linux 官方维基](https://wiki.archlinux.org/)
2. [Arch Linux 安装使用教程](https://archlinuxstudio.github.io/ArchLinuxTutorial/#/)
3. [Arch Linux 简明指南](https://arch.icekylin.online)

建议：跟着教程装一两遍，之后 `archinstall` 就行了

## 基础配置

- 禁用 PC speaker: `sudo vim /etc/modprobe.d/nobeep.conf`

```bash
blacklist pcspkr
blacklist snd_pcsp
```

- 更改显示缩放: `150%`
- 加速开关机 `sudo vim /etc/default/grub`，修改后运行 `sudo grub-mkconfig -o /boot/grub/grub.cfg`

```bash
# GRUB_CMDLINE_LINUX_DEFAULT="loglevel=3 quiet"
# 修改为
GRUB_CMDLINE_LINUX_DEFAULT="loglevel=5 nowatchdog splash"
```

- pacman 颜色、多线程下载、cn 源：`sudo vim /etc/pacman.conf`

```
Color
ParallelDownloads = 5

[archlinuxcn]
Server = https://mirrors.ustc.edu.cn/archlinuxcn/$arch
# 先设置这一个，安装 archlinuxcn-mirrorlist-git 后再成：
# Include = /etc/pacman.d/archlinuxcn-mirrorlist
```

## 软件安装

```bash
sudo pacman -S archlinuxcn-keyring
sudo pacman -S yay

yay -S archlinuxcn-mirrorlist-git
yay -S clash clash-meta clash-verge
yay -S ffmpeg neofetch lolcat
yay -S fcitx5-im fcitx5-chinese-addons fcitx5-pinyin-moegirl fcitx5-pinyin-zhwiki fcitx5-pinyin-custom-pinyin-dictionary
yay -S foliate foxitreader
yay -S github-desktop-bin
yay -S jabref
yay -S kuro
yay -S kvantum kvantum-theme-nordic-git
yay -S kwin-scripts-tiling
yay -S linuxqq wechat-uos wemeet-bin
yay -S mathematica
yay -S microsoft-edge-dev-bin vivaldi vivaldi-ffmpeg-codecs
yay -S noto-fonts noto-fonts-cjk noto-fonts-emoji noto-fonts-extra otf-fandol
yay -S nerd-fonts-meta
yay -S ntfs-3g
yay -S obs-studio xdg-desktop-portal xdg-desktop-portal-kde
yay -S onedrivegui-git
yay -S python-pip
yay -S qbittorrent-enhanced-git
yay -S sddm-git
yay -S spectacle
yay -S stardict
yay -S texlive-most texlive-lang texlive-latexindent-meta
yay -S visual-studio-code-bin
yay -S vlc yesplaymusic
yay -S wps-office wps-office-fonts ttf-wps-fonts ttf-ms-fonts
```

### jabref

直接 `yay -S jabref` 则会发现有一个 java 需要的东西几乎下载不下来，这里提供一种解决方法：

1. 下载失败会有提示，去那个连接手动下载
2. 把从 github 上下载下来的 .tar.gz 文件解压缩修改 `gradle\wrapper\gradle-wrapper.properties` 里面的下载地址为手动下载下来的文件的位置 `file:///home/...`
3. 理论上 Sha256Sum 不需要更改，如果报了这个错误就回来改
4. 再把这个包打包成 .tar.gz 文件，复制到 ~/.cache/yay/jabref/src 下
5. 最重要的一步，安装：`yay -S --mflags --skipinteg jabref`「这个选项是为了跳过 Sha256Sum 检验」

也许在第一次安装 java 编译程序的时候可以选择其他的编译环境以避免这样做（可能吗？我觉得不可能，因为下载那个文件是 jabref 的 源码所需要的），你可以试一试……

## 美化

1. [系统美化](https://archlinuxstudio.github.io/ArchLinuxTutorial/#/advanced/beauty)
2. [archlinux 系统美化（布局篇）](https://arch.icekylin.online/guide/advanced/beauty-1.html)
3. [archlinux 系统美化（主题篇）](https://arch.icekylin.online/guide/advanced/beauty-2.html)
4. [archlinux 系统美化（终端篇）](https://arch.icekylin.online/guide/advanced/beauty-3.html)
5. [Tutorials/Force Transparency And Blur](https://userbase.kde.org/Tutorials/Force_Transparency_And_Blur)

- 任务栏：放在屏幕顶部
- 壁纸：使用必应每日一图
- Konsole：修改默认的颜色主题透明度为 `75%`

### 更换主题

先在 `kvantum manager` 里更换主题，再在系统设置里把能改成 `kvantum` 的改掉。

### KDE 平铺脚本

- 在系统设置中搜索 `KWin Scripts`
- "Tiling Extension" 中 "Gap" 全部设置为 `5`

### 非聚焦窗口透明化

- 在系统设置中搜索 `Translucency`
- 在 `Dekstop Effects` 中搜索 `Translucency`
- `Translucency` 左边全部设置为右起第四档

## 软件配置

### 添加虚拟桌面

- 在系统设置中搜索 `Virtual Desktops`
- 添加至 `5` 个
- 设置他们的快捷键为 `Super + Shift + <number>`

  - 在系统设置中搜索 `Shortcuts` -> `KWin`

### 中文输入法

`sudo vim /etc/environment`

```bash
GTK_IM_MODULE=fcitx
QT_IM_MODULE=fcitx
XMODIFIERS=@im=fcitx
SDL_IM_MODULE=fcitx
GLFW_IM_MODULE=ibus
```

- 添加输入法 `Shuangpin`，修改双拼方案为 `Xiaohe`
- 修改云拼音后端为 `Baidu`

### stardict

1. 下载 [简体中文词典](http://download.huzheng.org/zh_CN/)
2. 安装词典 `tar -xjvf <file name> -C ~/.stardict/dic/ # or /usr/share/stardict/dic/`

### proxy

`clash-verge`

### 登陆各种账号

1. vivaldi
2. google
3. microsoft
4. vscode

---

我自己在一个相对私人的笔记本电脑安装了 arch linux，并同时另持有一台 MacBook Pro 2015 和一台 Windows 台式机——它们所需的花费并没有想象中的大。如果你没有另一台 macos 或 windows 的电脑，我不建议你安装 arch linux。
