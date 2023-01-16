## Apps

winget + scoop + Microsoft store

### winget

```shell
Armin2208.WindowsAutoNightMode
Bilibili.Livehime
EpicGames.EpicGamesLauncher
Fndroid.ClashForWindows
Kingsoft.TypeEasy
MacType.MacType
NetEase.CloudMusic
Oracle.VirtualBox
SomePythonThings.WingetUIStore
Tencent.TencentMeeting
Tencent.TIM
Tencent.WeChat
Valve.Steam
Youdao.YoudaoDict
```

### scoop

added bucket:

```shell
extras
main
```

installed apps:

```shell
Name         Version          Source Updated             Info
----         -------          ------ -------             ----
7zip         22.01            main   2023-01-10 12:03:44
bandizip     7.29             extras 2023-01-10 12:08:31
cider        1.6.0            extras 2023-01-14 19:32:07
dark         3.11.2           main   2023-01-10 12:32:35
everything   1.4.1.1022       extras 2023-01-10 13:16:31
ffmpeg       5.1.2            main   2023-01-10 12:35:09
firefox      108.0.2          extras 2023-01-14 17:18:12
git          2.39.0.windows.2 main   2023-01-10 12:04:00
googlechrome 109.0.5414.75    extras 2023-01-13 22:26:32
imagemagick  7.1.0-57         main   2023-01-16 12:00:50
innounp      0.50             main   2023-01-15 19:31:32
jabref       5.9              extras 2023-01-10 12:36:17
miktex       22.10            main   2023-01-10 12:38:24
obs-studio   29.0             extras 2023-01-10 12:28:06
pandoc       2.19.2           main   2023-01-10 12:34:23
potplayer    221215           extras 2023-01-10 12:10:51
powertoys    0.66.0           extras 2023-01-10 12:36:45
qpdf         11.2.0           main   2023-01-16 12:01:18
quicklook    3.7.3            extras 2023-01-10 15:36:26
snipaste     1.16.2           extras 2023-01-10 12:09:36
sumatrapdf   3.4.6            extras 2023-01-10 12:09:23
syncthing    1.23.0           main   2023-01-10 13:18:28
vscode       1.74.3           extras 2023-01-11 12:04:38
yesplaymusic 0.4.5            extras 2023-01-10 12:11:13
```

### Microsoft store

```shell
Watt Toolkit
```

### 手动安装的软件

```shell
[aurora](https://arr.network/)
[EndNote X9](https://endnote.com/)
[Wolfram Mathematica](https://www.wolfram.com/mathematica/)
```

## Lists Installed Fonts

```shell
fc-list -f "%{family}\n"
# or save to file:
fc-list -f "%{family}\n" :lang=zh >c:zhfont.txt
```

## Microsoft.PowerShell_Profile.ps1

```ps1
Import-Module PSReadLine

Set-PSReadLineOption -PredictionSource History

Set-PSReadlineKeyHandler -Key UpArrow -Function HistorySearchBackward
Set-PSReadlineKeyHandler -Key DownArrow -Function HistorySearchForward
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
