## Apps

winget + scoop + Microsoft store

### winget

```shell
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
SomePythonThings.WingetUIStore
Tencent.TencentMeeting
Tencent.TIM
Tencent.WeChat
Thunder.Thunder
Valve.Steam
Youdao.YoudaoDict
```

### scoop

added bucket:

```shell
extras
main
nerd-fonts
```

installed apps:

```shell
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

### Microsoft store

```shell
Watt Toolkit
```

### 手动安装的软件

```shell
[aurora](https://arr.network/)
[EndNote X9](https://endnote.com/)
[pdfpatcher](https://www.cnblogs.com/pdfpatcher/)
[Wolfram Mathematica](https://www.wolfram.com/mathematica/)
```

## Lists Installed Fonts

```shell
fc-list -f "%{family}\n"
# or save to file:
fc-list -f "%{family}\n" :lang=zh >c:zhfont.txt
```

## Limit Power Consumption and Reduce Noise

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
