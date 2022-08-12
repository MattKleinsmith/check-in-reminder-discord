//  // guild ID

const { SlashCommandBuilder, Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { clientId, guildId, token } = require('./config.json');

const commands = [
    new SlashCommandBuilder().setName('ping').setDescription('Replies with pong!'),
    new SlashCommandBuilder().setName('start').setDescription('Starts the check in reminder loop'),
    new SlashCommandBuilder().setName('quietstart').setDescription('Quietly starts the check in reminder loop'),
    new SlashCommandBuilder().setName('test').setDescription('Placeholder command for testing things'),
]
    .map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

rest.put(Routes.applicationCommands(clientId), { body: commands })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);
