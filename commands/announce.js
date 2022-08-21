const { downloadFile } = require('../tools/download.js');
const { joinVoiceChannel, createAudioResource, createAudioPlayer, AudioPlayerStatus } = require('@discordjs/voice');
const googleTTS = require('google-tts-api');
const path = require('path');
const fs = require('fs');

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

const announce = async function (oldState, newState) {
    const oldChannel = oldState.channel ? snowflakeToString(oldState.channel.id) : oldState.channel;
    const newChannel = newState.channel ? snowflakeToString(newState.channel.id) : newState.channel;

    const userJoinedChannel = (oldChannel !== newChannel) && ((!oldChannel && newChannel) || (oldChannel && newChannel));
    if (userJoinedChannel &&
        newState.member.user.username !== this.username &&
        newState.channel.members.size >= 1) {  // Two or more users + one joiner

        console.log(newState.member.displayName, 'joined a voice channel', oldChannel, newChannel);

        const relativePath = `../cache/${newState.member.displayName}.mp3`;
        const absolutePath = path.resolve(__dirname, relativePath); // file destination
        if (!fs.existsSync(absolutePath)) {
            const utterance = newState.member.displayName + " has joined";
            const url = googleTTS.getAudioUrl(utterance, {
                lang: 'en',
                slow: false,
                host: 'https://translate.google.com',
            });
            console.log(url)
            console.log('Download to ' + absolutePath + ' ...');
            await downloadFile(url, absolutePath);
            console.log('Download success');
        } else {
            console.log("Already exists:", absolutePath);
        }

        const connection = joinVoiceChannel({
            channelId: newState.channel.id,
            guildId: newState.guild.id,
            adapterCreator: newState.guild.voiceAdapterCreator
        });

        const resource = createAudioResource(absolutePath, { inlineVolume: true })
        resource.volume.setVolume(.7 * resource.volume.volume)

        const player = createAudioPlayer();
        connection.subscribe(player)
        console.log('Playing', absolutePath);
        player.play(resource)

        player.on(AudioPlayerStatus.Idle, () => {
            console.log('Leaving the voice channel\n');
            connection.destroy();
        });
    }
}

module.exports = { announce };
