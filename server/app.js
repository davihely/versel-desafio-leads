import express from "express";
import http from "http";
import { Server } from "socket.io";
import OpenAI from "openai";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// -----------------------------
// CONFIGURAÇÃO DE SESSÕES
// -----------------------------
const sessions = new Map();

// Timeout de 10 segundos para teste
const DEFAULT_TIMEOUT = 1000 * 30;

function createOrUpdateSession(sessionId, timeout = DEFAULT_TIMEOUT) {
  const now = Date.now();
  sessions.set(sessionId, {
    lastActivity: now,
    expiresIn: timeout,
  });
  console.log(`Sessão ${sessionId} atualizada (${timeout / 1000}s)`);
}

function isSessionActive(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) return false;
  const now = Date.now();
  const diff = now - session.lastActivity;

  if (diff > session.expiresIn) {
    console.log(`Sessão ${sessionId} expirada (${diff / 1000}s)`);
    sessions.delete(sessionId);
    return false;
  }
  return true;
}

// Limpeza automática (a cada 5 segundos para teste)
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of sessions.entries()) {
    if (now - session.lastActivity > session.expiresIn) {
      console.log(`Sessão removida automaticamente: ${id}`);
      sessions.delete(id);
    }
  }
}, 30000);

// -----------------------------
// CONFIGURAÇÃO OPENAI + CHAT
// -----------------------------
const openai = new OpenAI({
  apiKey: "SUA_API_KEY_AQUI",
});

const agentContext = `
Você é um agente SDR (vendas) da empresa Verzel.
Sua função é conversar naturalmente com leads interessados e coletar:
- Nome
- E-mail
- Empresa
- Necessidade/dor
- Prazo

Regras:
1. Cumprimente e se apresente de forma cordial.
2. Faça as perguntas uma de cada vez.
3. Quando o cliente fornecer todos os dados, pergunte se ele tem interesse em uma reunião.
4. Se disser SIM, ofereça 2 ou 3 horários.
5. Se disser NÃO, agradeça e encerre cordialmente.
`;

// -----------------------------
// SOCKET.IO
// -----------------------------
io.on("connection", (socket) => {
  console.log(`Cliente conectado: ${socket.id}`);

  socket.on("newMessage", async (data) => {
    const { sessionId, message, history } = data;
    createOrUpdateSession(sessionId, DEFAULT_TIMEOUT);
    console.log(sessionId);
    // ⚠️ Verifica se a sessão ainda está ativa
    if (!isSessionActive(sessionId)) {
      socket.emit("message", {
        message: "⚠️ Sessão expirada. Por favor, reinicie o chat.",
        timestamp: Date.now(),
        role: "bot",
      });
      return;
    }

    // ✅ Atualiza o timestamp da sessão

    try {
      const formattedHistory = history.map((item) => ({
        role: item.role === "bot" ? "assistant" : "user",
        content: item.message,
      }));

      formattedHistory.push({ role: "user", content: message.message });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: agentContext }, ...formattedHistory],
      });

      const reply = completion.choices[0].message.content;

      socket.emit("message", {
        message: reply,
        timestamp: Date.now(),
        role: "bot",
      });
    } catch (err) {
      console.error("Erro ao chamar OpenAI:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log(`Cliente desconectado: ${socket.id}`);
  });
});

server.listen(3001, () => {
  console.log("Servidor rodando na porta 3001");
});
