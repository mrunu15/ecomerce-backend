import ChatMessage from "../models/chatModel.js";
import HandleError from "../utils/handleError.js";
import handleAsyncError from "../middleware/handleAsyncError.js";


export const userSendMessage = handleAsyncError(async (req, res, next) => {
  const { message } = req.body;
  const userId = req.user._id; 

  const newMsg = await ChatMessage.create({
    sender: "user",
    userId,
    message,
  });

  res.status(201).json({ success: true, data: newMsg });
});


export const adminSendMessage = handleAsyncError(async (req, res, next) => {
  const { userId, message } = req.body;

  const newMsg = await ChatMessage.create({
    sender: "admin",
    userId,
    message,
  });

  res.status(201).json({ success: true, data: newMsg });
});


export const getConversation = handleAsyncError(async (req, res, next) => {
  const userId = req.params.userId;

  const messages = await ChatMessage.find({ userId }).sort({ createdAt: 1 });

  res.status(200).json({ success: true, data: messages });
});


export const editMessage = handleAsyncError(async (req, res, next) => {
  const { messageId } = req.params;
  const { message } = req.body;

  let msg = await ChatMessage.findById(messageId);
  if (!msg) return next(new HandleError("Message not found", 404));

  if (
    msg.sender === "user" &&
    msg.userId.toString() !== req.user._id.toString()
  ) {
    return next(new HandleError("Not authorized", 403));
  }

  msg.message = message;
  msg.isEdited = true;
  await msg.save();

  res.status(200).json({ success: true, data: msg });
});


export const deleteMessage = handleAsyncError(async (req, res, next) => {
  const { messageId } = req.params;

  let msg = await ChatMessage.findById(messageId);
  if (!msg) return next(new HandleError("Message not found", 404));

  if (req.user.role !== "admin") {
    return next(new HandleError("Only admin can delete messages", 403));
  }

  await msg.deleteOne();

  res.status(200).json({ success: true, message: "Message deleted" });
});
