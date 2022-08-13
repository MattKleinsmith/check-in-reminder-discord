// Require the necessary discord.js classes
const { Client, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const { downloadFile } = require('./download.js');
const { joinVoiceChannel, createAudioResource, createAudioPlayer, AudioPlayerStatus } = require('@discordjs/voice');
const googleTTS = require('google-tts-api');
const path = require('path');
const fs = require('fs');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

// When the client is ready, run this code (only once)
client.once('ready', () => {
    console.log('Ready!', client.user.username);

    client.weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    client.checkIns = [
        { start: "7:55:00 AM", end: "8:03:00 AM", seen: false, isReport: false },
        { start: "12:25:00 PM", end: "1:03:00 PM", seen: false, isReport: false },
        { start: "2:55:00 PM", end: "3:03:00 PM", seen: false, isReport: false },

        // { start: "12:00:00 AM", end: "11:59:00 PM", seen: false, isReport: false },  // test

        { start: "6:00:00 PM", end: "7:00:00 PM", seen: false, isReport: true },  // Report
    ];

    client.timezone = 'America/Los_Angeles';

    client.today = new Date().toLocaleString('en-US', { timeZone: this.timezone, weekday: 'long' })  // Monday

    // Get guild object via guild name substring "App Academy August-01-2022 Cohort"
    // Get channel object via channel id: 1001711778952130662

});

client.checkTime = async function (interaction) {
    const dayOfWeek = new Date().toLocaleString('en-US', { timeZone: this.timezone, weekday: 'long' })  // "Monday"
    const fullDate = new Date().toLocaleString('en-US', { timeZone: this.timezone })  // '8/10/2022, 4:19:54 PM'
    const date = fullDate.split(',')[0]  // '8/10/2022'

    console.log("Checking time:", dayOfWeek, fullDate, "PST")

    // Reset check in reminders each day
    if (dayOfWeek !== this.today) {
        console.log("New day")
        this.today = dayOfWeek;
        for (let checkIn of this.checkIns) checkIn.seen = false;
    }

    // Don't remind on weekends
    if (!this.weekdays.includes(dayOfWeek)) {
        console.log("Invalid weekday")
        return;
    }

    // Check
    for (let checkIn of this.checkIns) {
        const start = date + ", " + checkIn.start;
        const end = date + ", " + checkIn.end;
        if (!checkIn.seen && new Date(fullDate) >= new Date(start) && new Date(fullDate) < new Date(end)) {
            console.log("Sending reminder");

            const role = interaction.guild.roles.cache.find(r => r.name === "Codebusters");

            if (checkIn.isReport) {
                // TODO: Do not follow up. Just send a message to that channel.
                await interaction.channel.send(`<@&${role.id}> Don't forget to fill out the daily report`);
            } else {
                await interaction.channel.send(`<@&${role.id}> Don't forget to check in`);
            }
            checkIn.seen = true;
        }
    }
}

client.test = async function (interaction) {
    console.log("Running test");
    await interaction.reply(".", { ephemeral: true });
    await interaction.deleteReply();
    // const role = interaction.guild.roles.cache.find(r => r.name === "Codebusters");
    // await interaction.channel.send(`<@&${role.id}> This is a test. Sorry for the spam.`);
}

const EPOCH = 1420070400000n;

function getTimestamp(snowflake) {
    return Number((BigInt(snowflake) >> BigInt(22)) + EPOCH);
}

function getWorkerId(snowflake) {
    return Number((BigInt(snowflake) & BigInt(0x3e0000)) >> BigInt(17));
}

function getProcessId(snowflake) {
    return Number((BigInt(snowflake) & BigInt(0x1f000)) >> BigInt(12));
}

function getIncrement(snowflake) {
    return Number(BigInt(snowflake) & BigInt(0xfff));
}

// https://github.com/IanMitchell/interaction-kit/blob/main/packages/discord-snowflake/src/snowflake.ts
function snowflakeToString(snowflake) {
    if (snowflake !== undefined && snowflake !== null) {
        return `${getTimestamp(snowflake)}${getWorkerId(snowflake)}${getProcessId(snowflake)}${getIncrement(snowflake)}`;
    } else if (snowflake === undefined) {
        return undefined
    } else if (snowflake === null) {
        return null
    }
}

client.on('voiceStateUpdate', async (oldState, newState) => {
    const oldChannel = oldState.channel ? snowflakeToString(oldState.channel.id) : oldState.channel;
    const newChannel = newState.channel ? snowflakeToString(newState.channel.id) : newState.channel;

    const userJoinedChannel = (!oldChannel && newChannel) || (oldChannel && newChannel);
    if (userJoinedChannel && newState.member.displayName !== client.user.username) {
        console.log(newState.member.displayName, 'joined a voice channel', oldChannel, newChannel);

        const literalPath = `cache/${newState.member.displayName}.mp3`;
        const dest = path.resolve(__dirname, literalPath); // file destination
        if (!fs.existsSync(literalPath)) {
            const url = googleTTS.getAudioUrl("Hi " + newState.member.displayName, {
                lang: 'en',
                slow: false,
                host: 'https://translate.google.com',
            });
            console.log(url)
            console.log('Download to ' + dest + ' ...');
            await downloadFile(url, dest);
            console.log('Download success');
        } else {
            console.log("Already exists:", dest);
        }

        const connection = joinVoiceChannel({
            channelId: newState.channel.id,
            guildId: newState.guild.id,
            adapterCreator: newState.guild.voiceAdapterCreator
        });

        const resource =
            createAudioResource(dest, {
                inlineVolume: true
            })

        const player = createAudioPlayer();
        connection.subscribe(player)
        console.log('Playing', dest);
        player.play(resource)

        player.on(AudioPlayerStatus.Idle, () => {
            console.log('Leaving the voice channel');
            connection.destroy();
        });
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'ping') {

        console.log("ping")
        await interaction.reply("Pong! (but it's a reply and ephemeral)", { ephemeral: true });
        await interaction.deleteReply();
        await interaction.channel.send('Pong!')

    } else if (commandName === 'start') {

        console.log("start")
        const times = client.checkIns.map(checkIn => checkIn.start);
        const checkInTimes = times.join("\n");
        const msg = "I will ping at these times (PST):\n\n" + checkInTimes + ` (for the daily report)\n\nDon't rely on me, though. If my computer crashes or my Internet goes down, I won't be able to ping.`
        await interaction.reply(msg);
        if (!client.checkerId) client.checkerId = setInterval(client.checkTime.bind(client), 30 * 1000, interaction);

    } else if (commandName === 'quietstart') {

        console.log("quietstart")
        await interaction.reply(".", { ephemeral: true });
        await interaction.deleteReply();
        if (!client.checkerId) client.checkerId = setInterval(client.checkTime.bind(client), 30 * 1000, interaction);

    } else if (commandName === 'test') {

        client.test(interaction);

    }
});

// Login to Discord with your client's token
client.login(token);
