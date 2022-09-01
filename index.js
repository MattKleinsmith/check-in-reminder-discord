const { Client, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const { initRemind, remind } = require('./commands/remind.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

client.once('ready', () => {
    console.log('Ready!', client.user.username, "\n");

    initRemind.call(this, client);
    setInterval(remind.bind(this), 30 * 1000)

    this.username = client.user.username;
});

client.on('shardError', error => {
    console.error('A websocket connection encountered an error:', error);
});

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

client.login(token);
