const router = require("express").Router();
const { userAuth } = require("../middlewares/auth");
const razorpayInstance = require("../utils/razorpay");
const Payment = require("../models/payment");
const User = require("../models/user");

const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");

router.post("/create", userAuth, async (req, res) => {
  try {
    const { membershipType } = req.body;
    const amount = membershipType === "silver" ? 700 : 1400;

    const order = await razorpayInstance.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt#1",
      notes: {
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        membershipType: membershipType,
      },
    });

    // Save it in my database
    const pay = new Payment({
      userId: req.user._id,
      orderId: order.id,
      status: order.status,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes,
    });

    const newSavedPayment = await pay.save();

    // Return back order details to frontend
    res.json({
      message: "Order created successfully",
      data: {
        ...newSavedPayment.toJSON(),
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message, success: false });
  }
});

router.post("/webhook", async (req, res) => {
  try {
    // const webhookSignature = req.get["x-razorpay-signature"];
    const webhookSignature = req.headers["x-razorpay-signature"];

    // console.log("webhookSignature", req.headers);

    const isWebhookValid = validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature,
      process.env.RAZORPAY_WEBHOOK_SECRET
    );

    if (!isWebhookValid) {
      return res.status(400).json({ message: "Webhook Signature is invalid." });
    }

    // Update payment status in DB
    const paymentDetails = req.body.payload.payment.entity;
    const payment = await Payment.findOne({ orderId: paymentDetails.order_id });
    payment.status = paymentDetails.status;
    await payment.save();

    // Update user as premium
    const user = await User.findOne({ _id: payment.userId });
    user.isPremium = true;
    user.membershipType = payment.notes.membershipType;
    await user.save();

    // Return success response to razorpay
    // if (req.body.event === "payment.captured") {
    // }

    // if (req.body.event === "payment.failed") {
    // }

    return res.status(200).json({ message: "Webhook received successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message, success: false });
  }
});

router.get("/premium/verify", userAuth, async (req, res) => {
  try {
    const user = req.user;
    if (user.isPremium) {
      res.json({ isPremium: true });
    } else {
      res.json({ isPremium: false });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message, success: false });
  }
});
module.exports = router;
