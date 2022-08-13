//  // guild ID

const { SlashCommandBuilder, Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { clientId, guildId, token } = require('./config.json');

const commands = [
    new SlashCommandBuilder().setName('start').setDescription('Starts the check in reminder loop'),
    new SlashCommandBuilder().setName('quietstart').setDescription('Quietly starts the check in reminder loop'),
]
    .map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

rest.put(Routes.applicationCommands(clientId), { body: commands })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);

// // for guild-based commands
// rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] })
//     .then(() => console.log('Successfully deleted all guild commands.'))
//     .catch(console.error);

// // for global commands
// rest.put(Routes.applicationCommands(clientId), { body: [] })
//     .then(() => console.log('Successfully deleted all application commands.'))
//     .catch(console.error);
