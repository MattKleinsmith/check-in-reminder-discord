const initRemind = function (client) {
    this.weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    this.checkIns = [
        { start: "7:55:00 AM", end: "8:03:00 AM", seen: false, isReport: false },
        { start: "12:25:00 PM", end: "12:33:00 PM", seen: false, isReport: false },
        { start: "2:55:00 PM", end: "3:03:00 PM", seen: false, isReport: false },

        // { start: "12:00:00 AM", end: "11:59:00 PM", seen: false, isReport: false },  // test

        { start: "6:00:00 PM", end: "7:00:00 PM", seen: false, isReport: true },  // Report
    ];

    this.timezone = 'America/Los_Angeles';

    this.today = new Date().toLocaleString('en-US', { timeZone: this.timezone, weekday: 'long' });  // Monday

    this.reminderChannel = client.channels.cache.get("1001711778952130662");  // #general
    // this.reminderChannel = client.channels.cache.get("985966960334491671");  // Test server

    this.cohortGuild = client.guilds.cache.get("1001711778490744884");
    this.reminderRole = "1002792225727598644";  // Codebusters role
    this.friendRole = "1006573434161082508";  // Friend role

    console.table(this.checkIns);
}

const remind = function () {
    const dayOfWeek = new Date().toLocaleString('en-US', { timeZone: this.timezone, weekday: 'long' })  // "Monday"
    const fullDate = new Date().toLocaleString('en-US', { timeZone: this.timezone })  // '8/10/2022, 4:19:54 PM'
    const date = fullDate.split(',')[0]  // '8/10/2022'

    // console.log("Checking time:", dayOfWeek, fullDate, "PST")

    // Reset check-in reminders each day
    if (dayOfWeek !== this.today) {
        console.log("New day")
        this.today = dayOfWeek;
        for (let checkIn of this.checkIns) checkIn.seen = false;
    }

    // Don't remind on weekends
    if (!this.weekdays.includes(dayOfWeek)) {
        return;
    }

    // Check
    for (let checkIn of this.checkIns) {
        const start = date + ", " + checkIn.start;
        const end = date + ", " + checkIn.end;
        if (!checkIn.seen && new Date(fullDate) >= new Date(start) && new Date(fullDate) < new Date(end)) {
            console.log("Sending reminder", fullDate);

            if (checkIn.isReport) {
                // TODO: Do not follow up. Just send a message to that channel.
                this.reminderChannel.send(`<@&${this.reminderRole}> <@&${this.friendRole}> Don't forget to fill out the daily report: https://progress.appacademy.io/`);
            } else {
                this.reminderChannel.send(`<@&${this.reminderRole}> <@&${this.friendRole}> Don't forget to check in: https://progress.appacademy.io/`);
            }
            checkIn.seen = true;
        }
    }
}

module.exports = { initRemind, remind }
