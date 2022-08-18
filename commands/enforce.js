const { MessageAttachment, Message } = require('discord.js');

const initEnforce = function (client) {

    this.enforceKeywords = ["assessment", "asesment", "assessmeant", "accessment", "assessmetn", "assement", "asessment", "assesments", "asseessment", "assessmt", "assemsent", "assetment", "assestment", "assessemtn", "asssesment", "assessmnt", "assessemnt", "assessemt", "assesssment", "assessmsent", "assesement", "assesment", "assessement", "essesment", "assemment", "assessmetnt", "assessmet", "assesemnet", "assessent", "accesment", "assessmenst", "assesmet", "assessmsnt", "assessmant", "aseessment", "assssemant", "assisment", "assassment", "assessmen", "assessmemt", "asseesment", "asseement", "assesmnet", "assissment", "acessment", "assesstment", "asssessment", "assessmnet", "assessessment", "asessments", "assemenet", "essessment", "assesmetn", "assisments", "assescment", "assiment", "assment", "assessmnent", "assasment", "aassessment", "assesmsnt", "asscesment", "assesemsent", "assesmnent", "assessament", "assessmernt", "asssment"]
    this.enforceKeywords.push("exam");

    // const assessmentPrep = client.channels.cache.get("1009505830225326190");  // Test server
    const assessmentPrep = client.channels.cache.get("1001987887669190666");

    const generalChat = client.channels.cache.get("1001711778952130662");
    const questions = client.channels.cache.get("1001987003149209610");
    const generalCodingDiscussion = client.channels.cache.get("1004151041538920488");
    const resources = client.channels.cache.get("1001987027450990652");
    const projectIdeas = client.channels.cache.get("1001987149371031572");

    const channels = [generalChat, questions, generalCodingDiscussion, resources, projectIdeas]
    this.enforcedChannels = channels;
    // this.enforcedChannels = client.channels.cache.get("985966960334491671");  // Test server

    // Meme channels
    const selfIntroduction = client.channels.cache.get("1001962467896852654");
    const pets = client.channels.cache.get("1001718649096245279");
    const music = client.channels.cache.get("1001988767407685682");
    const gaming = client.channels.cache.get("1001711778952130664");
    const otherTopics = client.channels.cache.get("1001711778952130665");
    const positiveAffirmations = client.channels.cache.get("1001989040574308432");
    const vent = client.channels.cache.get("1007377280865149008");
    this.memeChannels = channels.concat([assessmentPrep, selfIntroduction, pets, music, gaming, otherTopics, positiveAffirmations, vent])

    const oldReply = assessmentPrep.toString();
    // enforceReplies is an array to avoid spamming when changing it. Should only have a length of two.
    this.enforceReplies = [`To avoid a/A Code of Conduct violations, please use ${assessmentPrep} to discuss the assessment.`, oldReply]

    this.gigabrax = "<:gigabrax:1009607197547835573>"

    this.goodBot = "good bot"
    this.goodBotReply = ":D"

    this.badBot = "bad bot"
    this.badBotReply = "᲼"
}

const enforce = function (client) {
    this.enforcedChannels.forEach(channel => channel.messages.fetch({ limit: 10 }).then(messages => {
        // Get recent messages that include a keyword
        const allTriggers = messages.filter(message => {
            const words = message.content.toLowerCase().split(' ');
            return this.enforceKeywords.some(keyword => words.some(word => word === keyword)) &&
                message.author.username != client.user.username
        });

        // Get IDs of already-replied-to triggers
        const alreadyRepliedIds = messages
            .filter(message => this.enforceReplies.some(reply => message.content.includes(reply)) && message.reference)
            .map(message => message.reference.messageId);

        // Don't reply twice
        const unrepliedTriggers = allTriggers.filter(message => !alreadyRepliedIds.includes(message.id))

        // Reply to each
        unrepliedTriggers.forEach(message => {
            console.log("Replying to", `"${message.content}"`, "by", message.author.username);
            message.reply(this.enforceReplies[0]);
        })
    }))

    // GIGABRAX
    this.memeChannels.forEach(channel => channel.messages.fetch({ limit: 10 }).then(messages => {
        // Get recent messages that match the memeword
        const allTriggers = messages.filter(message => message.content === this.gigabrax && message.author.username != client.user.username);

        // Get IDs of already-replied-to triggers
        const alreadyRepliedIds = messages
            .filter(message => message.content === this.gigabrax && message.reference)
            .map(message => message.reference.messageId);

        // Don't reply twice
        const unrepliedTriggers = allTriggers.filter(message => !alreadyRepliedIds.includes(message.id))

        // Reply to each
        unrepliedTriggers.forEach(message => {
            console.log("Replying to", `"${message.content}"`, "by", message.author.username);
            message.reply(this.gigabrax);
        })
    }))


    // TODO: Make a helper function that takes in (keywords, reply, channels)
    // Good bot
    this.memeChannels.forEach(channel => channel.messages.fetch({ limit: 10 }).then(messages => {
        // Get recent messages that include a keyword
        const allTriggers = messages.filter(message => message.content.toLowerCase().includes(this.goodBot) && message.author.username != client.user.username);
        // console.log(allTriggers.map(m => m.content))

        // Get IDs of already-replied-to triggers
        const alreadyRepliedIds = messages
            .filter(message => message.content === this.goodBotReply && message.reference)
            .map(message => message.reference.messageId);

        // Don't reply twice
        const unrepliedTriggers = allTriggers.filter(message => !alreadyRepliedIds.includes(message.id))

        // Reply to each
        unrepliedTriggers.forEach(message => {
            console.log("Replying to", `"${message.content}"`, "by", message.author.username);
            message.reply(this.goodBotReply);
        })
    }))

    this.memeChannels.forEach(channel => channel.messages.fetch({ limit: 10 }).then(messages => {
        // Get recent messages that include a keyword
        const allTriggers = messages.filter(message => message.content.toLowerCase().includes(this.badBot) && message.author.username != client.user.username);

        // Get IDs of already-replied-to triggers
        const alreadyRepliedIds = messages
            .filter(message => message.attachments.size > 0 && message.reference)
            .map(message => message.reference.messageId);

        // Don't reply twice
        const unrepliedTriggers = allTriggers.filter(message => !alreadyRepliedIds.includes(message.id))

        // Reply to each
        unrepliedTriggers.forEach(message => {
            console.log("Replying to", `"${message.content}"`, "by", message.author.username);
            message.reply({ files: [{ attachment: "./cache/bad-bot.png" }] })
        })
    }))

}

module.exports = { initEnforce, enforce }
