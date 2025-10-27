// import handleAsyncError from "../middleware/handleAsyncError.js";
// import { instance } from "../server.js";
// import crypto from "crypto";
// export const processPayment = handleAsyncError(async (req, res) => {
//   const options = {
//     amount: Number(req.body.amount * 100),
//     currency: "INR",
//   };
//   const order = await instance.orders.create(options);
//   res.status(200).json({
//     success: true,
//     order,
//   });
// });

// //Send API Key
// export const sendAPIKey = handleAsyncError(async (req, res) => {
//   res.status(200).json({
//     key: process.env.RAZORPAY_API_KEY,
//   });
// });

// //Payment Verification
// export const paymentVerification = handleAsyncError(async (req, res) => {
//   const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
//     req.body;
//   const body = razorpay_order_id + "|" + razorpay_payment_id;
//   const expectedSignature = crypto
//     .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
//     .update(body.toString())
//     .digest("hex");
//   const isAuthentic = expectedSignature === razorpay_signature;
//   if (isAuthentic) {
//     return res.status(200).json({
//       success: true,
//       message: "Payment verified successfully",
//       reference: razorpay_payment_id,
//     });
//   } else {
//     return res.status(200).json({
//       success: false,
//       message: "Payment verification failed",
//     });
//   }
// });




import handleAsyncError from "../middleware/handleAsyncError.js";
import { instance } from "../server.js";
import crypto from "crypto";
import Order from "../models/orderModel.js";

// 🔹 Process Online Payment (Razorpay)
export const processPayment = handleAsyncError(async (req, res) => {
  const options = {
    amount: Number(req.body.amount * 100),
    currency: "INR",
  };
  const order = await instance.orders.create(options);
  res.status(200).json({
    success: true,
    order,
  });
});

// 🔹 Send API Key
export const sendAPIKey = handleAsyncError(async (req, res) => {
  res.status(200).json({
    key: process.env.RAZORPAY_API_KEY,
  });
});

// 🔹 Verify Razorpay Payment
export const paymentVerification = handleAsyncError(async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
    req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
    .update(body.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      reference: razorpay_payment_id,
    });
  } else {
    return res.status(200).json({
      success: false,
      message: "Payment verification failed",
    });
  }
});

// 🔹 Cash on Delivery (only amount required)
export const cashOnDelivery = handleAsyncError(async (req, res) => {
  const { amount } = req.body;

  if (!amount) {
    return res.status(400).json({
      success: false,
      message: "Amount is required",
    });
  }

  const order = await Order.create({
    shippingInfo: {}, // optional
    orderItems: [],   // empty items
    user: req.user._id,
    paymentInfo: {
      id: null,
      status: "Pending",
      method: "COD",
    },
    itemPrice: amount,
    taxPrice: 0,
    shippingPrice: 0,
    totalPrice: amount,
  });

  res.status(201).json({
    success: true,
    message: "Order placed successfully with Cash on Delivery",
    order,
  });
});
