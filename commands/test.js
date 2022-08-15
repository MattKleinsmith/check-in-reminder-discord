const test = async function (interaction) {
    console.log("Running test");
    await interaction.reply(".", { ephemeral: true });
    await interaction.deleteReply();
    // const role = interaction.guild.roles.cache.find(r => r.name === "Codebusters");
    // await interaction.channel.send(`<@&${role.id}> This is a test. Sorry for the spam.`);
}

module.exports = { test }
