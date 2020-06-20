const ws = require('ws');
const events = require('events');
const randomID = require('random-id');

class Client extends ws {
    constructor(address, opts, debug = false) {
        super(address);

        this.debug = debug;
        this.opts = opts;
        this.me = {};
        this.conn = {
            sessionID: null,
            latency: 0
        };

        this.events = new events.EventEmitter();

        this.on('open', () => {
            if (this.debug) console.debug(`Connected to server`);
        });

        this.on('message', (str) => {
            const data = JSON.parse(str);
            return this.message(data);
        });

        this.on('error', (err) => {
           this.events.emit('error', err); 
        });
    }

    async sendData(data) {
        return this.send(JSON.stringify(data));
    }

    async message({ code, data, ev = null }) {
        // code 0 - hello
        if (code === 0) {
            this.conn.sessionID = data.sessionID;
            if (this.debug) console.debug(`Server assigned session ID: ${data.sessionID}`);

            this.ping(data.pingInterval);
            if (this.debug) console.debug(`Started pinging server at interval: ${data.pingInterval}s`);
            
            const uniqueAuth = randomID();

            await this.sendData({
                // code 1 - authorize
                code: 1, data: {
                    username: this.opts.username,
                    uniqueAuth
                }
            });

            if (this.debug) console.debug(`Sent authorization using UAK: ${uniqueAuth}`);
        }

        // code 2 - authorized
        if (code === 2) {
            this.me = data;
            if (this.debug) console.debug(`Server authorized successfully`);

            this.events.emit('ready', (this.me));
        }

        // code 4 - ping acknowledged
        if (code === 4) {
            clearTimeout(this.conn.pingTimeout);

            this.ping = {
                sentAt: this.ping.sentAt,
                receivedAt: Date.now(),
                pingReceived: true,
                pingTimeout: null
            }

            this.conn.latency = Math.round(Date.now() - this.ping.sentAt);

            if (this.debug) console.debug(`Ping acknowledged`);
        }

        // code 5 - content
        if (code === 5) {
            // ev 1 - message
            if (ev === 1) {
                this.events.emit('message', data);
            }

            // ev 2 - user logged on
            if (ev === 2) {
                if (data.username === this.me.username) return;
                this.events.emit('userLogon', data);
            }

            // ev 3 - user logged off
            if (ev === 3) {
                if (data.username === this.me.username) return;
                this.events.emit('userLogoff', data);
            }
        }

        // code 6 - data request/receive
        if (code === 6) {
            // ev 1 - requesting online users
            if (ev === 1) {
                return this.events.emit('dataReceived', data.users);
            }
        }
    }

    async ping(interval) {
        const pingServer = async () => {
            await this.sendData({
                // code 3 - ping
                code: 3, data: {}
            });

            this.ping = {
                sentAt: Date.now(),
                receivedAt: null,
                pingReceived: false,
                pingTimeout: null
            }

            if (this.debug) console.debug(`Ping sent`);

            this.conn.pingTimeout = setTimeout(() => {
                throw new Error(`Ping timed out`);
            }, interval * 1000);
        }

        setInterval(async () => {
            pingServer();
        }, interval * 1000);

        pingServer();
    }
}

module.exports = Client;