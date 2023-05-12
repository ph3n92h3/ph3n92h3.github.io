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
GRUB_CMDLINE_LINUX_DEFAULT="loglevel=5 nowatchdog"
```
- pacman 颜色、多线程下载、cn 源：`sudo vim /etc/pacman.conf`
```
Color
ParallelDownloads = 5

[archlinuxcn]
Server = https://mirrors.ustc.edu.cn/archlinuxcn/$arch
```

## 软件安装

```bash
sudo pacman -S yay

yay -S clash-verge
yay -S ffmpeg
yay -S fcitx5-im fcitx5-chinese-addons fcitx5-pinyin-moegirl fcitx5-pinyin-zhwiki fcitx5-pinyin-custom-pinyin-dictionary
yay -S foliate
yay -S foxitreader
yay -S github-desktop-bin
yay -S jabref
yay -S kwin-scripts-tiling
yay -S linuxqq
yay -S mathematica
yay -S microsoft-edge-dev-bin
yay -S noto-fonts noto-fonts-cjk noto-fonts-emoji noto-fonts-extra
yay -S obs-studio xdg-desktop-portal xdg-desktop-portal-kde
yay -S onedrivegui-git
yay -S qbittorrent-enhanced-git
yay -S spectacle
yay -S stardict
yay -S typst
yay -S vivaldi
yay -S vlc
yay -S wechat-uos
yay -S wemeet-bin
yay -S wps-office ttf-wps-fonts ttf-ms-fonts # 还有一个字体包忘了，装完 wps-office 有提示
yay -S yesplaymusic
```

## 软件配置

### KDE 平铺脚本

- 在系统设置中搜索 `KWin Scripts`
- "Tiling Extension" 中 "Gap" 全部设置为 `5`

### 添加虚拟桌面

- 在系统设置中搜索 `Virtual Desktops`
- 添加至 `5` 个
- 设置他们的快捷键为 `Super + Shift + <number>`
  
  - 在系统设置中搜索 `Shortcuts` -> `KWin`

### 任务栏

- 放在屏幕顶部

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

### Konsole

修改默认的颜色主题透明度为 `75%`

### proxy

### 登陆各种账号

---

我自己在一个相对私人的笔记本电脑安装了 arch linux，并同时另持有一台 MacBook Pro 2015 和一台 Windows 台式机——它们所需的花费并没有想象中的大。如果你没有另一台 macos 或 windows 的电脑，我不建议你安装 arch linux。
