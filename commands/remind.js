const initRemind = function (client) {
    this.weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    this.checkIns = [
        { start: "7:55:00 AM", end: "8:03:00 AM", seen: false, type: "checkIn" },
        { start: "11:15:00 AM", end: "11:20:00 AM", seen: false, type: "break" },
        { start: "12:25:00 PM", end: "12:33:00 PM", seen: false, type: "checkIn" },
        { start: "2:45:00 PM", end: "2:50:00 PM", seen: false, type: "break" },
        { start: "2:55:00 PM", end: "3:03:00 PM", seen: false, type: "checkIn" },

        { start: "6:00:00 PM", end: "7:00:00 PM", seen: false, type: "report" },  // Report
    ];

    this.timezone = 'America/Los_Angeles';

    this.todayDoW = new Date().toLocaleString('en-US', { timeZone: this.timezone, weekday: 'long' });  // "Monday"

    this.reminderChannel = client.channels.cache.get("1013850605619531806");  // Cohort-only "general-chat"
    this.reminderRole = "1013844230269063240";  // "Cohort 8-29"

    console.table(this.checkIns);
}

const remind = function () {
    const dayOfWeek = new Date().toLocaleString('en-US', { timeZone: this.timezone, weekday: 'long' })  // "Monday"
    const fullDate = new Date().toLocaleString('en-US', { timeZone: this.timezone })  // '8/10/2022, 4:19:54 PM'
    const date = fullDate.split(',')[0]  // '8/10/2022'

    // Reset check-in reminders each day
    if (dayOfWeek !== this.todayDoW) {
        console.log("New day")
        this.todayDoW = dayOfWeek;
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

            if (checkIn.type === "report") {
                this.reminderChannel.send(`<@&${this.reminderRole}> Don't forget to fill out the daily report: https://progress.appacademy.io/`);
            } else if (checkIn.type === "checkIn") {
                this.reminderChannel.send(`<@&${this.reminderRole}> Don't forget to check in: https://progress.appacademy.io/`);
            } else if (checkIn.type === "break") {
                this.reminderChannel.send(`<@&${this.reminderRole}> Break time`);
            }
            checkIn.seen = true;
        }
    }
}

module.exports = { initRemind, remind }
