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
1. `git clone` the repository or install it using npm/yarn
2. Install any dependencies
3. Run `privtalk` to open up a client

You'll need a server running to connect to as well, here's the procedure:
1. `git clone` the server repository or install it using npm/yarn
2. Install any dependencies
3. Open `config.json` and change the port if required (default: 8080)
4. Start the server using index.js
5. Optionally start the server using a package manager like pm2

Then, any clients can connect using the public IP or localhost with that port, omitting the `ws://` prefix.

## Bugs
* Chat doesn't scroll or scale properly just yet
* Terminal resizing ruins message positioning

## Credits
PrivTalk makes use of [terminal-kit](https://github.com/cronvel/terminal-kit), [ora](https://github.com/sindresorhus/ora) and [figures](https://github.com/sindresorhus/figures) for terminal styling, [ws](https://github.com/websockets/ws) and [random-id](https://github.com/KingCosmic/random-id) for back-end work, and [clear](https://github.com/bahamas10/node-clear) for handy cross platform clearing.

## License
(c) 2020 ThatTonybo. Licensed under the MIT License. See `LICENSE` for more information.