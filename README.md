# Chat Room Lite JS-Ver

## Usage
### As Server
1. Install Node.js
2. Install npm package `ws`,`readline-sync` & `readline`. Also, you should install `showdown`, `showdown-highlight`, `showdown-katex` for Markdown & LaTeX.
3. Use command `node Server.js` and follow the instruction to start a chat room server

### As Member
1. Use your browser(WebSocket support needed) to open `index.html` and follow the instruction to join in a chat room

### Authority
By default, the server-side control panel has the maximum accessibility to the server.

The user-side terminal is able to get the administrator authority through the automatically generated verification code on Server.

#### Server Side
A commandline panel is provided to manage the server.

All available commands:

- list
- ban
- banip
- recover
- setDev(deprecated)
- unsetDev(deprecated)
- setAdmin
- unsetAdmin

For more detail, please click [here](#server-side-command-usage).

#### User side
The user-side terminal provides a simple way to get and exercise administrator authority.

When starting the server, a verification code will be automatically generated.(By default, its length will be 40)

use command `/verify <Verification Code>` to send a request to get administrator authority.

use command `/ban <User ID> <Time(secs)>` to shut somebody up. If `<Time>` is not specified, it will be 60.

use command `/unban <User ID>` to clear somebody's mute status.

## Feature
1. WLAN support
2. light and fast
3. strong expansion
4. readable code
5. runs everywhere

## Server-Side Command Usage

### `list`

`list`

Description: Output the UserID and IP information of all users currently in the server.

`list bannedip`

Description: Output all the currently banned ips.

### `ban`

`ban <User List>`

Description: Force users in the User List(If exists) to quit the server.

### `banip`

`banip <IP List>`

Description: Permanently ban IPs in the IP List.

### `recover`

`recover <IP List>`

Description: End the banned states of IP in the IP List.

### `setDev`(deprecated)

`setDev <IP>`

Description: This command and its related function are still under development. Not recommended for use.

### `unsetDev`(deprecated)

`unsetDev <IP>`

Description: This command and its related function are still under development. Not recommended for use.

### `setAdmin`

`setAdmin <User List>`

Description: Grant the users in the User List administrator authority.

### `unsetAdmin`

`unsetAdmin <User List>`

Description: Reset the users in the User List to common user.