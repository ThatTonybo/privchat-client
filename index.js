const Client = require('./src/Client');

const Terminal = require('terminal-kit');
const ora = require('ora');
const figures = require('figures');
const clear = require('clear');
const { stripIndents } = require('common-tags');

const options = require('./config.json');

const term = Terminal.terminal;

let appLocale = null;

const app = async () => {
    term.magenta(`     ____       _       ________          __ 
    / __ \\_____(_)   __/ ____/ /_  ____ _/ /_
   / /_/ / ___/ / | / / /   / __ \\/ __ \`/ __/
  / ____/ /  / /| |/ / /___/ / / / /_/ / /_  
 /_/   /_/  /_/ |___/\\____/_/ /_/\\__,_/\\__/  
                                             `);
    term.nextLine();
    term.bgMagenta.white(`PrivChat`);
    term.magenta(` 1.0.0 by ThatTonybo`);
    term.down(2).column(0);

    term.blue(figures.questionMarkPrefix).white(' Enter a server to logon to: ');
    const address = await term.inputField().promise;

    term.down(2).column(0);

    term.blue(figures.questionMarkPrefix).white(' Enter a username: ');
    const username = await term.inputField().promise;

    term.down(2).column(0);

    term.blue(figures.questionMarkPrefix).white(' Enter a locale (us, gb or other): ');
    appLocale = await term.inputField().promise;

    if (appLocale.toLowerCase() === 'us') appLocale = 'en-US';
    if (appLocale.toLowerCase() === 'gb' || appLocale.toLowerCase() === 'uk') appLocale = 'en-GB';

    clear();

    const loader = ora('Connecting to server').start();

    const client = new Client(`ws://${address}`, {
        username
    }, options.debug);

    client.events.on('ready', (user) => {
        loader.succeed(`Connected to server`);
        term('You are logged in as: ').magenta(`${username}`);

        setTimeout(() => {
            clear();

            handle(client);
        }, 750);
    });

    client.events.on('error', (err) => {
        loader.fail(`Couldn't connect to server`);
        term(err.toString());

        return process.exit();
    });

    client.events.on('message', (msg) => {
        if (msg.username === client.me.username) return;

        const time = timeNow();

        term.grey(time);
        term.white(` ${msg.username}`);
        term.white(` ${figures.arrowRight} ${msg.content}`);
        term.nextLine();
    });

    client.events.on('userLogon', (user) => {   
        const time = timeNow();

        term.grey(time);     
        term.magenta(` system`);
        term.green(` ${figures.arrowRight} ${user.username} logged on`);
        term.nextLine();
    });

    client.events.on('userLogoff', (user) => { 
        const time = timeNow();

        term.grey(time);       
        term.magenta(` system`);
        term.red(` ${figures.arrowRight} ${user.username} logged off`);
        term.nextLine();
    });
}

const writeToInputBox = (message) => {
    term.saveCursor();
    term.down(term.height);
    term.eraseLine().column(0).magenta('>').noFormat(` ${message}`);
    term.restoreCursor();
}

const timeNow = (raw = false) => {
    const now = new Date();

    const dateStr = now.toLocaleDateString(appLocale);
    const timeStr = now.toLocaleTimeString(appLocale);

    if (raw) return { dateStr, timeStr };
    else return `${dateStr} ${timeStr}`;
}

const handle = async (client) => {
    let message = '';

    term.grabInput();

    // set up
    term.saveCursor();
    term.down(term.height);
    term.magenta('>');
    term.restoreCursor();

    term.on('key', async (key, matches, data) => {
        // exit program
        if (key === 'CTRL_C') {
            term.grabInput(false);

            clear();

            term(`Logged off successfully`);
            
            return process.exit();
        }

        if (key === 'ENTER') {
            if (message.length < 1) {
                term.saveCursor();
                term.down(term.height - 1);
                term.red(`> Cannot send an empty message`);
                term.down(1);
                term.magenta('>');
                term.restoreCursor();

                return;
            }

            let send = message;

            // Commands
            if (send.startsWith('/')) {
                message = '';
                writeToInputBox(message);

                if (send === '/help') {
                    const time = timeNow();

                    term.grey(time);
                    term.blue(` local`);
                    term.white(` ${figures.arrowRight} ${stripIndents`Available commands (7):
                    /help: Shows a list of available commands
                    /users: Shows a list of users currently connected
                    /ping: Checks your latency to the server
                    /shrug: ¯\_(ツ)_/¯
                    /tableflip: (╯°□°）╯︵ ┻━┻
                    /unflip: ┬─┬ ノ( ゜-゜ノ)
                    /logoff: Log off the server, also possible using CTRL + C`}`);
                    term.nextLine();
    
                    return;
                }
    
                else if (send === '/users') {
                    await client.sendData({
                        // code 6 - data request/receive
                        code: 6,
                        // ev 1 - requesting online users
                        ev: 1,
                        data: {}
                    });
    
                    client.events.once('dataReceived', (data) => {
                        const time = timeNow();

                        term.grey(time);
                        term.blue(` local`);
                        term.white(` ${figures.arrowRight} Connected users (${data.length}): ${data.join(', ')}`);
                        term.nextLine();

                        return;
                    });
    
                    return;
                }

                else if (send === '/ping') {
                    const time = timeNow();

                    term.grey(time);
                    term.blue(` local`);
                    term.white(` ${figures.arrowRight} Your latency to the server is ${client.conn.latency}ms`);
                    term.nextLine();
    
                    return;
                }

                else if (send === '/shrug') {
                    send = '¯\_(ツ)_/¯';
                }

                else if (send === '/tableflip') {
                    send = '(╯°□°）╯︵ ┻━┻';
                }

                else if (send === '/unflip') {
                    send = '┬─┬ ノ( ゜-゜ノ)';
                }

                else if (send === '/logoff') {
                    term.grabInput(false);

                    clear();
        
                    term(`Logged off successfully`);
                    
                    return process.exit();
                }

                else {
                    const time = timeNow();

                    term.grey(time);
                    term.blue(` local`);
                    term.red(` ${figures.arrowRight} Unknown command, for a list of commands type /help`);
                    term.nextLine();

                    return;
                }
            }

            writeToInputBox('Sending...');

            await client.sendData({
                // code 5 - content
                code: 5,
                // ev 1 - message
                ev: 1,
                data: {
                    sessionID: client.conn.sessionID,
                    content: send
                }
            });

            message = '';
            writeToInputBox(message);

            const time = timeNow();

            term.grey(time);
            term.green(` ${client.me.username}`);
            term.white(` ${figures.arrowRight} ${send}`);
            term.nextLine();
        }

        // del char
        if (key === 'BACKSPACE') {
            if (message.length < 1) return;
            message = message.slice(0, -1);
            writeToInputBox(message);
        }

        // show char
        if (data.isCharacter) {  
            message = `${message}${key}`;
            writeToInputBox(message);
        }
    });
}

clear();

app();