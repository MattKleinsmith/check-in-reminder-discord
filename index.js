const { Client, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const { initRemind, remind } = require('./commands/remind.js');
const { announce } = require('./commands/announce.js');
const { initEnforce, enforce } = require('./commands/enforce.js');
const { test } = require('./commands/test.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

client.once('ready', () => {
    console.log('Ready!', client.user.username, "\n");

    initRemind.call(this);

    initEnforce.call(this, client);
    setInterval(enforce.bind(this, client), 2000);
});

client.on('voiceStateUpdate', announce);
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;
    console.log(commandName)

    if (commandName === 'start' || commandName === 'quietstart') {
        console.table(this.checkIns);

        if (commandName === 'start') {
            const checkInTimes = this.checkIns.map(checkIn => checkIn.start).join("\n");
            let msg = "I will ping at these times (PST):\n\n" + checkInTimes + "(for the daily report)\n\n"
            msg += "Don't rely on me, though. If my computer crashes or my Internet goes down, I won't be able to ping."
            await interaction.reply(msg);
        } else if (commandName === 'quietstart') {
            await interaction.reply(".", { ephemeral: true });
            await interaction.deleteReply();
        }

        if (!this.enforceId) this.enforceId = setInterval(remind.bind(this), 30 * 1000, interaction);
    } else if (commandName === 'test') {
        test.call(this, interaction);

    }
});

client.login(token);
