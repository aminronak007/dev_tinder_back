const cron = require("node-cron");
const ConnectionRequest = require("../models/connectionRequest");
const { subDays, startOfDay, endOfDay } = require("date-fns");
const sendEmail = require("./sendEmail");

// This cron job will run every morning at 8am.
cron.schedule("0 8 * * *", async () => {
  // Send emails to all people who got requests yesterday
  try {
    const yesterday = subDays(new Date(), 1);
    const yesterdayStart = startOfDay(yesterday);
    const yesterdayEnd = endOfDay(yesterday);

    const pendingRequests = await ConnectionRequest.find({
      status: "interested",
      createdAt: {
        $gte: yesterdayStart,
        $lt: yesterdayEnd,
      },
    }).populate("fromUserId toUserId");

    //  console.log("pendingRequests", pendingRequests);

    const listOfEmails = [
      ...new Set(pendingRequests.map((req) => req.toUserId.email)),
    ];

    // ---------- This is suitable for less amount of data like 500 or 1000 users -----------
    for (const email of listOfEmails) {
      try {
        const res = await sendEmail.run(
          `New Friend Request pending for ${email}`,
          "There are so many friend request pending, please login to DevTinder and accept or reject the request"
        );
        console.log("res", res);
      } catch (error) {
        console.log(error);
      }
    }
    // ---------- This is suitable for less amount of data like 500 or 1000 or even 5000 to 10000 users -----------

    // ---------- For data like lakhs of users you can use batch processing or queue for sending emails ----------
  } catch (error) {
    console.log(error);
  }
});
