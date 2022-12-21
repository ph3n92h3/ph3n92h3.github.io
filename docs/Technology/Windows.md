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
    - Plugged in: 99%