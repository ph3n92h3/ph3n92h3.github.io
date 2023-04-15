# Arch Linux

本文只记录个人安装与配置 arch linux 的流程，更系统的教程请见：

1. [Arch Linux 官方维基](https://wiki.archlinux.org/)
2. [Arch Linux 安装使用教程](https://archlinuxstudio.github.io/ArchLinuxTutorial/#/)
3. [Arch Linux 简明指南](https://arch.icekylin.online)

## 软件安装

- 更改显示缩放（最好是刚进入桌面环境就更改）
- 配置 archlinuxcn 源
- add widget: Dictionary, weather report(set location)

install mathematica

```bash
yay -S clash-for-windows
yay -S ffmpeg
yay -S fish
yay -S flameshot
yay -S foliate
yay -S foxitreader
yay -S jabref-bin
yay -S linuxqq
yay -S microsoft-edge-dev-bin
yay -S miktex
yay -S obs-studio
yay -S onedriver
yay -S qbittorrent-enhanced
yay -S stardict
yay -S typora-free-cn
yay -S typst
yay -S vivaldi
yay -S vlc
yay -S visual-studio-code-bin
yay -S wechat-uos
yay -S wemeet-bin
yay -S wps-office wps-office-mui-zh-cn ttf-wps-fonts
yay -S yesplaymusic
```

未解决：
- youdao-dict 不工作
- fish 下可能无法使用 miktex

## 系统美化

美化教程：

- https://arch.icekylin.online/guide/advanced/beauty-1.html
- https://arch.icekylin.online/guide/advanced/beauty-2.html
- https://arch.icekylin.online/guide/advanced/beauty-3.html
- https://archlinuxstudio.github.io/ArchLinuxTutorial/#/advanced/beauty

```bash
# 通过代理进入系统设置
yay proxychains                     # install proxychains
sudo vim /etc/proxychains.conf      # 修改最后一行为代理的端口
proxychains systemsettings5
```

最后，我自己在一个相对私人的笔记本电脑安装了 archlinux，并同时另持有一台 MacBook Pro 2015 和一台 Windows 台式机，它们所需的花费并没有想象中的大。如果你没有另一台 macos 或 windows 的电脑，我不建议你安装 archlinux。
