import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  sessionId: String,
  role: String,
  message: String,
  timestamp: Number,
});

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;