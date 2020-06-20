# PrivChat
PrivChat is a small, self-hostable chat server that runs out of the terminal and communicates using websockets. It's not anything particularly great, but it works and that's pretty cool. There's some slash commands too.

> This repo only has the client code. You'll need the server code, found at [privchat-server](https://github.com/ThatTonybo/privchat-server)

## Features
* Terminal-based chat
* Non-unique "usernames" and no permanent accounts - it's all temporary
* Data is only stored in memory when being used, all gone when closed
* Tableflips, shrugs, unflips and other handy slash commands
* Built with websockets, super easy to hack and modify for your needs

## Setup
First, you'll need a server. Install the privchat-server package, and start a server:
```
npm install privchat-server --global
```
```
privchat-server
// => Opened server on port 8080
```
Note that you can change the prefix if needed:
```
privchat-server --port 80
// => Opened server on port 80
```

Next, you can install the privchat-client package:
```
npm install privchat-client --global
```
Now, you're ready to start the client:
```
privchat
```
Clients can connect using the public IP or localhost with the server port, omitting the `ws://` prefix (as this is added by the client).

## Bugs
* Chat doesn't scroll or scale properly just yet
* Terminal resizing ruins message positioning

## Credits
PrivTalk makes use of [terminal-kit](https://github.com/cronvel/terminal-kit), [ora](https://github.com/sindresorhus/ora) and [figures](https://github.com/sindresorhus/figures) for terminal styling, [ws](https://github.com/websockets/ws) and [random-id](https://github.com/KingCosmic/random-id) for back-end work, and [clear](https://github.com/bahamas10/node-clear) for handy cross platform clearing.

## License
(c) 2020 ThatTonybo. Licensed under the MIT License. See `LICENSE` for more information.