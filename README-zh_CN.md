# Chat Room Lite

## 使用方法
### 作为服务端
1. 安装 Node.js
2. 安装 npm 包 `ws`, `readline-sync`, `readline`, `showdown`, `showdown-highlight`& `showdown-katex`.
3. 在Shell或终端下使用命令 `node Server.js` 然后根据指引输入配置信息以启动服务器。你需要输入的配置信息包括端口，房间名与房间描述。

### 作为客户端
1. 使用浏览器(要求支持WebSocket) 打开 `index.html` 然后跟随指引加入房间，输入服务端的IP及端口。默认情况下我们提供了一个公网房间。

### 权限
默认情况下服务端命令行对服务器有着最大权限。

客户端方面能够通过一串在服务端自动生成的验证码来获取管理员权限。

#### 服务端方面
通过标准输入（stdin）能够使用一个自带的服务端命令行。

全部可用指令:

- list
- ban
- banip
- recover
- setDev(不建议)
- unsetDev(不建议)
- setAdmin
- unsetAdmin

要获取关于这些指令的详细信息，请点[这](#服务端命令行命令指南).

#### 客户端方面
通过验证码客户端能够非常方便地获取管理员权限。

启动服务器时将会生成一串随机验证码。(默认情况下验证码长度40)

使用命令 `/verify <Verification Code>` 来获取管理员权限。

使用命令 `/ban <User ID> <Time(secs)>` 来禁言某人. 如果 `<Time>` 事件没有指定，默认是60。

使用命令 `/unban <User ID>` 来清除某人的禁言状态。

使用命令 `/cls` 来清除输出区。

使用命令 `/exit` 来退出聊天室。

使用命令 `/notice` 来切换是否启用网页标题的新消息提醒。 `(<New Message Number>)Chat Room Lite`.

使用快捷键 `Ctrl+Shift+A` 或点击输入区下方图标来切换输入模式。一共有两种输入模式：

1. 单行输入 - 快速发送单行消息。 使用 `Enter` 来发送消息。

2. 多行输入 - 发送多行消息。 使用 `Ctrl+Enter` 来发送消息。

对于用户列表中的每个用户，其前将会有三个图标。

🔔 : 表示该用户的消息是否被你忽略，点击以切换忽略/显示的状态。

✔️🚫 : 表示该用户当前是否在该房间中被禁言，点击以快速添加 `/[ban/unban] <User ID>` （禁言/解禁命令）到输入区中。

@ : 点击以添加 `@<User ID> ` 到输入区中。 注意: 只有被@的对象才会高亮显示@部分内容。 你应该在每一个 `@<User ID>` 后添加一个空格，即使这是消息的末尾。

## 特性
1. 同时支持公网与局域网
2. 简洁且高效
3. 大力拓展
4. 可读的代码（正在变得不可读）
5. 跨平台

## 服务端命令行命令指南

### `list`

`list`

描述：输出当前服务器中所有用户的用户名与IP信息。

`list bannedip`

描述： 输出当前所有被禁用的IP。

### `ban`

`ban <User List>`

描述： 强制踢出 User List 中的所有用户(如果存在)。

### `banip`

`banip <IP List>`

描述： 永久禁用 IP List 中的IP。

### `recover`

`recover <IP List>`

描述：结束 IP List 中的 IP 的被禁用状态

### `setDev`(不建议)

`setDev <IP>`

描述：这个指令及其对应功能仍在开发（其实是之前就搞出来了但是出锅删掉了）。不建议使用。

### `unsetDev`(不建议)

`unsetDev <IP>`

描述：这个指令及其对应功能仍在开发。不建议使用。

### `setAdmin`

`setAdmin <User List>`

描述：为 User List 中的用户添加管理员权限

### `unsetAdmin`

`unsetAdmin <User List>`

描述：清除 User List 中的用户的管理员权限。
