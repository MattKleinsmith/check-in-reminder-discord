var Discord = require('discord.io');

var logger = require('winston');

var auth = require('./auth.json');

// Configure logger settings

logger.remove(logger.transports.Console);

logger.add(new logger.transports.Console, { colorize: true });

logger.level = 'debug';

var bot = new Discord.Client({ token: auth.token, autorun: true });

bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');

    this.weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    this.checkIns = [
        { start: "7:55:00 AM", end: "8:03:00 AM", seen: false, isReport: false },
        { start: "12:25:00 PM", end: "1:03:00 PM", seen: false, isReport: false },
        { start: "2:55:00 PM", end: "3:03:00 PM", seen: false, isReport: false },

        { start: "6:00:00 PM", end: "11:59:00 PM", seen: false, isReport: true },  // Report
    ];

    this.timezone = 'America/Los_Angeles';

    this.today = new Date().toLocaleString('en-US', { timeZone: this.timezone, weekday: 'long' })  // Monday
});

bot.checkTime = function (channelID) {
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
            if (checkIn.isReport) {
                this.sendMessage({ to: channelID, message: "@here Don't forget to submit the report on Progress Tracker" });
            } else {
                this.sendMessage({ to: channelID, message: "@here Don't forget to check in" });
            }
            checkIn.seen = true;
        }
    }
}

bot.on('message', function (user, userID, channelID, message, evt) {

    if (message.substring(0, 1) == '!') {

        var args = message.substring(1).split(' ');
        var cmd = args.shift();

        switch (cmd) {

            case 'ping':
                bot.sendMessage({ to: channelID, message: 'Pong!' });
                break;

            case 'start':
                const times = bot.checkIns.map(checkIn => checkIn.start);
                const checkInTimes = times.slice(0, times.length - 1).join(", ");
                const reportTime = times[times.length - 1]
                bot.sendMessage({
                    to: channelID,
                    message: "I will ping at these times (PST): " + checkInTimes + ", and " + reportTime + ` (for the daily report). Don't rely on me, though. If my computer crashes or my Internet goes down, I won't be able to ping.`
                });
                if (!bot.checkerId) bot.checkerId = setInterval(bot.checkTime.bind(bot), 1000, channelID);
                break;

            // case 'stop':
            //     bot.sendMessage({ to: channelID, message: 'Stopping OPERATION REMIND-ALL-OF-CHECK-INS' });
            //     clearInterval(bot.checkerId)
            //     bot.checkerId = undefined;
            //     break;

        }

    }
});
