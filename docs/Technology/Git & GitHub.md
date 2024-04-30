# Git & GitHub

## Introduction

> Git is a free and open source distributed version control system designed to handle everything from small to very large projects with speed and efficiency.

`Git` 是一个用来手动记录文件修改历史的软件：

- `Git` 是一个软件，所以你需要在自己的电脑上安装这个软件，安装后的使用不需要连网。请不要着急安装 `Git`！
- 你需要通过 `Git` 的命令手动登记，而不是什么都不做并期待能在某个地方找到文件的历史版本。尽管保存在 `Microsoft Onedrive` 中的文件甚至会在你每次点击“保存”的时候自动保存一个副本，但是目前绝不要信任这种自动化工具。
- “文件修改历史”包含了“文件哪里被怎样修改了”的答案，但是并不需要你回想自己做出了怎样的增删改操作，而是通过提交当前的文件并由程序自动比对得知。文件的修改历史类似于数据库中快速增长的日志，所以为了节约硬盘空间，建议完成一件成体系的、体量不太小的任务再做记录。

> GitHub is a trusted and secure platform for software development, collaboration, and innovation.

`GitHub` 是一个用来存放代码文件的平台。

- `GitHub` 是一个生长在互联网中的平台，连接这个平台需要连网。下载他人的公开内容不需要账号，上传文件、评论等等需要注册并登录账号。
- `GitHub` 免费账户功能已经足够个人的基本使用。
- 向 `GitHub` 提交代码可以通过命令行或浏览器完成，但对于基础使用来说官方的桌面客户端最为方便。另外，此客户端已经包含了基本的本地 `Git` 的功能，因此不需要单独安装 `Git`。

## Install

```sh
# Windows

winget install GitHub.GitHubDesktop

# MacOS

brew install --cask github
```

## Basic Usage

### Get Public Code

在 `GitHub` 上发现了有用的代码时，若想把“整套代码（仓库/repo）”下载到本地进行浏览或运行，`GitHub` 上推荐了三种方法：

- 标准方法——克隆/clone：使用 `Git` 或其他命令行工具直接在命令行里 clone，或通过编辑器等工具间接地使用命令
- 使用 `GitHub` 桌面端打开
- 下载自动打包好的 `.zip` 压缩文件

我一般尽量在网页端浏览，需要频繁在多文件之间跳转或运行程序则会下载 `.zip` 压缩文件。这样做的好处是操作文件的流程完全由我手动控制，而不会在电脑其他地方留下痕迹。

### Change Repo

- 新建仓库: 在 `GitHub` 网页端或桌面端新建仓库，推荐先在桌面端新建仓库，再上传到 `GitHub`
- 修改仓库可见性: Settings - Danger Zone - Change repository visibility
- 删除仓库: Settings - Danger Zone - Delete this repository

### Commit & Fetch

一般的工作流程是这样的。创建一个新的仓库或已有一个仓库，在其中增删改文件完成某个目标之后，打开 `GitHub` 桌面端，在左下角填写 Summary（必填）、进一步的 Description（选填）并点击 Commit。这一切都发生在本地，`GitHub` 上的仓库并没有变化。完成若干次 Commit 之后，当决定将当前文件都上传到 `GitHub` 时，点击上方的 `Fetch`，即可“将本地仓库同步至远程仓库”，此时 `GitHub` 上的仓库会变化（这个把本地文件发送到 `GitHub` 的过程需要你能顺利连接国外的服务器）。可能存在多个本地仓库（单人多台电脑或多人合作）同步至同一个远程仓库的情况，此时如果同一个文件的同一个地方都被修改了，则会出现“冲突”，需要手动处理“合并/merge”。

![Commit & Fetch](../images/Git%20&%20GitHub.png)

## Epilogue & Refs

关于 `Git` 和 `GitHub` 的操作都需要非常小心，处理不当可能会丢失文档的修改，就像电脑死机或没电而你已经很长时间没有按 `Ctrl + S` 一样恶心。你可以尽可能多地学习 `Git` 的知识，变成一个专家并最大程度用 `Git` 方便工作和生活，或是和我一样在较为基础的层次上使用 `GitHub`：只是当做一个存储纯文本文件的网盘来使用，偶尔在几台电脑之间同步，有感兴趣的仓库时就在网页端浏览或下载 `.zip` 压缩文件到本地查看，发现自己为其他人的仓库做出一点点贡献时就在网页端简单地提出修改请求。

### 进阶内容

- action: 设定触发条件，建立自动化流程
- branch: 同一个仓库作为树根，生长出不同的分支
- iuuse: 对仓库及其内文件的评论、问题、建议等
- license: 添加许可证以规范第三方使用仓库内容
- tag/release: 在项目完成一定阶段后打上标签或发布版本
- `Git`

### 参考教程

- [Git + GitHub 10分钟完全入门](https://www.bilibili.com/video/BV1KD4y1S7FL/)
- [Git + GitHub 10分钟完全入门 (进阶)](https://www.bilibili.com/video/BV1hA411v7qX/)