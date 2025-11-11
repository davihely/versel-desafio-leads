// models/Lead.js
import mongoose from "mongoose";

const LeadSchema = new mongoose.Schema(
  {
    sessionId: { type: String, index: true },
    name: String,
    email: { type: String, index: true },
    company: String,
    need: String,             // necessidade/dor
    deadline: String,         // prazo (texto simples)
    interest_confirmed: { type: Boolean, default: false },
    meeting_link: String,
    meeting_datetime: Date,
    pipefy_card_id: String,   // id do card criado/atualizado no Pipefy
    source: { type: String, default: "webchat" },
  },
  { timestamps: true }
);

const Lead = mongoose.model("Lead", LeadSchema);
export default Lead;
