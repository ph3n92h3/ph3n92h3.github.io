# 安装与配置 Arch Linux

本文只记录个人安装与配置 arch linux 的流程，更系统的教程请见：

1. [Arch Linux 官方维基](https://wiki.archlinux.org/)
2. [Arch Linux 安装使用教程](https://archlinuxstudio.github.io/ArchLinuxTutorial/#/)

## 安装前

### vim

```bash
/ustc   # 搜索 ustc
dd		# 剪切当前行
gg		# 回到首行
p		# 粘贴 vim 剪切板的内容
```

### 网络环境

建议连接有线网络

### 设置 U 盘启动

进入 BIOS 关闭 `Secure Boot`

## 基础安装

```bash
systemctl stop reflector.service	# 禁用自动选择镜像源服务
ls /sys/firmware/efi/efivars		# 确保为 UEFI 模式启动
ping www.bilibili.com				# 测试网络

timedatectl set-ntp true
timedatectl status					# 更新系统时钟
```

### 分区

EFI 800M、根目录 100G、用户家目录 剩余全部

```bash
# 转换硬盘类型
lsblk
parted /dev/...
(parted) mktable
New disk label type? gpt
quit
```

```bash
# 建立分区
cfdisk /dev/...						# new、Type、write、quit

fdisk -l
```

```bash
# 格式化
mkfs.vfat /dev/...					# efi
mkfs.vfat /dev/...					# / and /home
```

```bash
# 挂载
mount /dev/... /mnt
mkdir /mnt/efi
mkdir /mnt/home
mount /dev/... /mnt/efi
mount /dev/... /mnt/home
```

### 换源

```bash
vim /etc/pacman.d/mirrorlist

... https ... ustc					# 中科大源
... https ... tuna					# 清华源
```

### 安装系统

```bash
pacstrap /mnt base base-devel linux linux-headers linux-firmware
pacstrap /mnt dhcpcd iwd vim bash-completion
```

### 进入系统

```bash
genfstab -U /mnt >> /mnt/etc/fstab

cat /mnt/etc/fstab

arch-chroot /mnt
```

### 底层设置

```bash
# 区域设置
ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
hwclock --systohc

vim /etc/locale.gen					# 去掉 en_US.UTF-8 和 zh_CN.UTF-8 前的 ‘#’
locale-gen
echo 'LANG=en_US.UTF-8'  > /etc/locale.conf
```

```bash
# 设置主机名
vim /etc/hostname					# ph3n92h3
vim /etc/hosts
# 写入
127.0.0.1	localhost
::1			localhost
127.0.1.1	ph3n92h3

# 若不设置主机名，会导致更换网络环境后图形界面出现问题
```

```bash
# 其他
passwd root

pacman -S intel-ucode or amd-ucode	# 安装微码

pacman -S grub efibootmgr			# 安装引导
grub-install --target=x86_64-efi --efi-directory=/efi --bootloader-id=GRUB

vim /etc/default/grub
# 编辑 GRUB_CMDLINE_LINUX_DEFAULT 三项：log level = 5，删去 quiet，加入 nowatchdog
grub-mkconfig -o /boot/grub/grub.cfg

exit
umount -R /mnt
reboot

systemctl start dhcpcd
ping www.baidu.com
```

## 桌面环境和基础应用

### 建立用户

```bash
useradd -m -G wheel -s /bin/bash ph2
passwd ph2

EDITOR=vim visudo					# 删除 ‘#%wheel ALL=(ALL) ALL’ 前的 '#'
```

### 桌面环境

```bash
pacman -S plasma-meta konsole dolphin
systemctl enable sddm

# 设置 swap
dd if=/dev/zero of=/swapfile bs=1M count=4096 status=progress
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
vim /etc/fstab						# 追加：/swapfile none swap defaults 0 0
```

### 基础应用

```bash
# 开启 32 位支持库
vim /etc/pacman.conf				# 删去 [multilib] 一节中两行的注释

pacman -Syyu
reboot
```

```bash
# 桌面环境中的网络设置
sudo systemctl disable iwd
sudo systemctl stop iwd
sudo systemctl enable --now NetworkManager
```

```bash
sudo pacman -S sof-firmware alsa-firmware alsa-ucm-conf
sudo pacman -S ntfs-3g
sudo pacman -S adobe-source-han-serif-cn-fonts noto-fonts-cjk noto-fonts-emoji noto-fonts-extra
sudo pacman -S ark p7zip unrar unarchiver lzop lrzip
sudo pacman -S packagekit-qt5 packagekit appstream-qt appstream
sudo pacman -S gwenview
sudo pacman -S git wget kate bind
```

```bash
# 安装 yay
pacman -S --needed git base-devel
git clone https://aur.archlinux.org/yay-bin.git
cd yay-bin
makepkg -si
```

```bash
# 中文输入法
sudo pacman -S fcitx5-im fcitx5-chinese-addons fcitx5-pinyin-zhwiki

EDITOR=vim sudoedit /etc/environment
# 加入以下内容
GTK_IM_MODULE=fcitx
QT_IM_MODULE=fcitx
XMODIFIERS=@im=fcitx
SDL_IM_MODULE=fcitx

打开设置、区域设置、输入法，可以直接 add 中文输入法，最下面选双拼，
1. 页长改为 7，2. 改用“小鹤双拼”，3. 启用云拼音
```

```bash
EDITOR=vim sudoedit /etc/profile    # 追加：export EDITOR='vim'

# 蓝牙
sudo pacman -S bluez bluez-utils
sudo systemctl enable --now bluetooth
sudo pacman -S pulseaudio-bluetooth
pulseaudio -k
vim /etc/bluetooth/main.conf        # AutoEnable=true

# [显卡驱动](https://archlinuxstudio.github.io/ArchLinuxTutorial/#/rookie/graphic_driver)
sudo pacman -S mesa lib32-mesa xf86-video-amdgpu vulkan-radeon lib32-vulkan-radeon libva-mesa-driver lib32-libva-mesa-driver mesa-vdpau lib32-mesa-vdpau
```

## 个人配置

更改显示缩放（最好是刚进入桌面环境就更改）

install mathematica

```bash
yay clash-for-windows               # 配置两个账号，配置代理并重启
yay yesplaymusic

yay ffmpeg
yay flameshot
yay foliate
yay jabref
yay linuxqq
yay LXGW                            # 霞鹜文楷、霞鹜新晰黑及其分别的 screen 版本
yay microsoft-edge-stable           # 登录微软账号
yay obs-studio
yay onedriver                       # 配置两个账号
yay tencent meeting                 # 大概叫做 weemeet
yay typora                          # 选择 0.11+ cn 版本
yay vlc
yay vscode
yay wps-office
``

未解决：youdao-dict 不工作

最后，我自己在一个相对私人的笔记本电脑安装了 archlinux，并同时另持有一台 MacBook Pro 2015 和一台 Windows 台式机，它们所需的花费并没有想象中的大。如果你没有另一台 macos 或 windows 的电脑，我不建议你安装 archlinux。