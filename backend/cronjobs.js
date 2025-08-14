import cron from "node-cron";
import sendReminderEmail from "./routes/ReminderEmail.js";

cron.schedule('* * * * *', async () => {
    console.log(`Cron job active on ${new Date().toISOString()}`);
    await sendReminderEmail();
}, {
    scheduled: true,
    timezone: "Asia/Jakarta"
});

// * * * * *
// | | | | |
// | | | | +-- Day of the Week (0 - 6) (0 = Sunday, 6 = Saturday)
// | | | +---- Month (1 - 12)
// | | +------ Day of the Month (1 - 31)
// | +-------- Hour (0 - 23)
// +---------- Minute (0 - 59)

console.log("Cron job for send reminder email has been active.");
