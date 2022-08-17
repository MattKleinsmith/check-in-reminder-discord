const initEnforce = function (client) {

    this.enforceKeywords = ["assessment", "asesment", "assessmeant", "accessment", "assessmetn", "assement", "asessment", "assesments", "asseessment", "assessmt", "assemsent", "assetment", "assestment", "assessemtn", "asssesment", "assessmnt", "assessemnt", "assessemt", "assesssment", "assessmsent", "assesement", "assesment", "assessement", "essesment", "assemment", "assessmetnt", "assessmet", "assesemnet", "assessent", "accesment", "assessmenst", "assesmet", "assessmsnt", "assessmant", "aseessment", "assssemant", "assisment", "assassment", "assessmen", "assessmemt", "asseesment", "asseement", "assesmnet", "assissment", "acessment", "assesstment", "asssessment", "assessmnet", "assessessment", "asessments", "assemenet", "essessment", "assesmetn", "assisments", "assescment", "assiment", "assment", "assessmnent", "assasment", "aassessment", "assesmsnt", "asscesment", "assesemsent", "assesmnent", "assessament", "assessmernt", "asssment"]
    this.enforceKeywords.push("exam");

    const generalChat = client.channels.cache.get("1001711778952130662");
    const questions = client.channels.cache.get("1001987003149209610");
    const generalCodingDiscussion = client.channels.cache.get("1004151041538920488");
    const resources = client.channels.cache.get("1001987027450990652");
    const projectIdeas = client.channels.cache.get("1001987149371031572");

    const channels = [generalChat, questions, generalCodingDiscussion, resources, projectIdeas]
    this.enforcedChannels = channels;
    // this.enforcedChannels = client.channels.cache.get("985966960334491671");  // Test server

    const assessmentPrep = client.channels.cache.get("1001987887669190666");
    // const assessmentPrep = client.channels.cache.get("1009505830225326190");  // Test server
    this.enforceReply = assessmentPrep.toString();
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
            .filter(message => message.content.includes(this.enforceReply) && message.reference)
            .map(message => message.reference.messageId);

        // Filter triggers
        const unrepliedTriggers = allTriggers.filter(message => !alreadyRepliedIds.includes(message.id))

        // Reply to each
        unrepliedTriggers.forEach(message => {
            console.log("Replying to", `"${message.content}"`, "by", message.author.username);
            message.reply(this.enforceReply);
        })
    }))

}

module.exports = { initEnforce, enforce }
