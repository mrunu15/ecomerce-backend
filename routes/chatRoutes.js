import express from "express";
import {
  userSendMessage,
  adminSendMessage,
  getConversation,
  editMessage,
  deleteMessage,
} from "../controller/chatController.js";
import { verifyUserAuth } from "../middleware/userAuth.js";

const router = express.Router();

router.post("/send", verifyUserAuth, userSendMessage);

router.post("/admin/send", verifyUserAuth, adminSendMessage);

router.get("/:userId", verifyUserAuth, getConversation);

router.put("/edit/:messageId", verifyUserAuth, editMessage);

router.delete("/delete/:messageId", verifyUserAuth, deleteMessage);

export default router;
