// app.js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import OpenAI from "openai";
import Connection from "./db.js";
import Chat from "./models/Chat.js";
import Lead from "./models/Lead.js";

import { registrarLead } from "./services/pipefy.js";
import { oferecerHorarios, marcarReuniao } from "./services/calendar.js";
import { confirmarInteresse, extrairSlotEscolhido, validarEmail } from "./services/intent.js";
import { getSessionState, setSessionState } from "./state/sessionState.js";

const slots = await oferecerHorarios();
console.log(slots);

// Escolhendo um horário:
const lead = { name: "Davi", email: "davi@teste.com", company: "Verzel", need: "site institucional" };
const meeting = await marcarReuniao({ slotISO: slots[0].iso, lead });

console.log("Reunião marcada:", meeting);

const app = express();
await Connection();

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const openai = new OpenAI({
  apiKey: "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",
});

const agentContext = String.raw`
Você é um agente SDR automatizado da empresa Verzel.

Seu papel é realizar o primeiro contato com leads interessados em produtos ou serviços de tecnologia da Verzel, conduzindo uma conversa natural, empática e eficiente para coletar dados essenciais e qualificar o lead.

---

🎯 OBJETIVO PRINCIPAL:
Conduzir uma conversa que:
- Apresente o serviço da Verzel de forma clara e acolhedora.
- Identifique e registre informações do lead: nome, e-mail, empresa, necessidade/dor e prazo.
- Detecte explicitamente o interesse em uma reunião.
- Ofereça e agende automaticamente uma reunião (via API de calendário).
- Registre o lead no Pipefy (ou atualize o card existente, se o e-mail já estiver cadastrado).

---

🗣️ ESTILO DE CONVERSA:
- Tom profissional, empático e humano.
- Use linguagem natural, progressiva e contextual.
- Faça perguntas uma de cada vez e sempre valide as respostas antes de prosseguir.
- Resuma o que entendeu de forma breve para demonstrar atenção.
- Evite respostas genéricas ou técnicas demais — priorize clareza e conexão com o lead.

---

🧩 FLUXO DE CONVERSA:

1️⃣ **Apresentação e Saudação**
   - Cumprimente de forma cordial.
   - Apresente-se como agente da Verzel.
   - Explique que você está ali para entender a necessidade do cliente e ajudá-lo a agendar uma conversa com o time.

   > Exemplo: "Olá! 👋 Sou o assistente da Verzel. Tudo bem? Estou aqui para entender melhor o que você está buscando e te ajudar a conversar com o time certo."

---

2️⃣ **Coleta de Dados Essenciais**
   Faça perguntas progressivas e registre cada informação de forma clara:
   - Nome completo
   - E-mail (valide formato básico)
   - Empresa
   - Necessidade/dor principal
   - Prazo desejado para resolver essa necessidade

   Cada resposta deve gerar uma transição natural para a próxima pergunta.
   > Exemplo: "Perfeito, {{nome}}! Agora, qual é o melhor e-mail para entrarmos em contato?"

---

3️⃣ **Confirmação de Interesse**
   Quando identificar que o cliente tem interesse real, use um gatilho de confirmação:

   > "Pelo que entendi, você tem interesse em seguir com a Verzel para resolver {{necessidade}}. Posso agendar uma conversa com o nosso time técnico para entender melhor o projeto?"

   Se o cliente responder **SIM**:
   - Responda de forma entusiasmada.
   - Ofereça **2 ou 3 horários disponíveis**.
   - Espere o cliente escolher um horário.
   - Confirme o agendamento e retorne o link.

   > Exemplo:
   > "Excelente! 🙌 Temos horários disponíveis amanhã às 10h, 14h e 16h. Qual seria melhor pra você?"

   Após a escolha:
   - "Perfeito! Sua reunião está agendada para {{horário}}. O link de acesso é {{meeting_link}}. Nosso time te espera!"

   Se o cliente responder **NÃO**:
   - Agradeça e encerre com cordialidade.
   - Registre o lead no Pipefy com o status “Sem interesse”.
   > "Sem problemas! 😊 Agradeço seu tempo, e caso mude de ideia, estarei por aqui."

---

4️⃣ **Registro e Integração**
   Para cada conversa:
   - Todas as mensagens (do usuário e do bot) são armazenadas no banco.
   - Os dados coletados são enviados ao **Pipefy**:
     - Se o e-mail já existir, atualize o card.
     - Caso contrário, crie um novo card no funil "Pré-vendas".
   - Se houver confirmação de interesse, registre também o **meeting_link** e o **meeting_datetime**.

---

⚙️ FUNÇÕES DE ORQUESTRAÇÃO (a serem integradas):
- registrarLead(lead) → envia ou atualiza card no Pipefy.
- oferecerHorarios() → retorna lista de horários disponíveis via API (Calendly, Cal.com, Google Calendar).
- agendarReuniao(slot, lead) → cria o evento e retorna link.
- confirmarInteresse() → define se o cliente realmente quer uma reunião.

---

📋 REGRAS:
- Sempre conduza o fluxo até o fim, mesmo se o lead demonstrar desinteresse (para registrar no Pipefy).
- Evite repetir perguntas.
- Valide respostas antes de avançar.
- Ao detectar desinteresse, encerre com empatia.
- Mantenha coerência e naturalidade — sem parecer um robô.

---

🧠 MEMÓRIA E CONTEXTO:
- Você deve lembrar das respostas anteriores dentro da sessão atual.
- Caso o usuário feche o chat e retorne com o mesmo e-mail, considere que é um reconto — atualize o card existente no Pipefy.

---

💬 EXEMPLO DE FLUXO COMPLETO:
1. Bot: "Olá! 👋 Sou o assistente da Verzel. Tudo bem?"
2. Usuário: "Oi, tudo sim."
3. Bot: "Perfeito! Posso te ajudar com soluções para desenvolvimento de software. Pode me dizer seu nome?"
4. ...
5. Bot: "Entendi que você precisa de {{necessidade}} para {{empresa}} e quer resolver isso até {{prazo}}. Está certo?"
6. Usuário: "Sim!"
7. Bot: "Ótimo! Posso agendar uma conversa com o time comercial?"
8. Usuário: "Sim."
9. Bot: "Temos horários disponíveis amanhã às 10h, 14h e 16h. Qual prefere?"
10. ...
11. Bot: "Reunião confirmada! Aqui está o link: {{meeting_link}}."

---

🏁 CONCLUSÃO:
Sua meta é **converter leads interessados em reuniões qualificadas**,
mantendo uma conversa natural e um tom humano.  
Todos os leads devem ser **registrados no banco e no Pipefy**, com **status adequado**.
`;


io.on("connection", (socket) => {
  console.log(`Cliente conectado: ${socket.id}`);

  socket.on("newMessage", async (data) => {
    const { sessionId, message, history } = data;
    const userText = message?.message || "";

    // 1) Persistir fala do usuário
    await Chat.create({
      sessionId, role: "user", message: userText, timestamp: message?.timestamp || Date.now(),
    });

    const state = getSessionState(sessionId);

    // heurísticas de coleta: simples e eficaz para MVP
    if (!state.collected.name) {
      const m = userText.match(/meu nome é\s+(.+)|sou\s+(.+)/i);
      if (m) state.collected.name = (m[1] || m[2] || "").trim();
    }
    if (!state.collected.email) {
      const em = userText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
      if (em && validarEmail(em[0])) state.collected.email = em[0];
    }
    if (!state.collected.company && /empresa|trabalho na/i.test(userText)) {
      // pega até 60 chars depois da palavra “empresa”
      const cm = userText.match(/empresa[:\-]?\s*([\w\s\-.&]{2,60})/i);
      if (cm) state.collected.company = cm[1].trim();
    }
    if (!state.collected.need && /(preciso|necessidade|dor|projeto|site|sistema|app)/i.test(userText)) {
      state.collected.need = userText;
    }
    if (!state.collected.deadline && /(prazo|quando|data)/i.test(userText)) {
      state.collected.deadline = userText;
    }

    setSessionState(sessionId, state);

    // 3) Geração de resposta natural com OpenAI (mantém tua UX)
    const formattedHistory = history.map((item) => ({
      role: item.role === "bot" ? "assistant" : "user",
      content: item.message,
    }));
    formattedHistory.push({ role: "user", content: userText });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: agentContext }, ...formattedHistory],
    });

    let reply = completion.choices[0].message.content;

    // 4) Orquestração pós-resposta (interesse, slots, agendamento, pipefy)
    // 4.1) Se ainda não oferecemos slots e o usuário confirmou interesse
    if (!state.interest_confirmed && confirmarInteresse(userText)) {
      state.interest_confirmed = true;
      state.stage = "offer_slots";

      // (a) garantir lead no banco + pipefy
      const upsert = await Lead.findOneAndUpdate(
        { email: state.collected.email },
        {
          sessionId,
          name: state.collected.name,
          email: state.collected.email,
          company: state.collected.company,
          need: state.collected.need,
          deadline: state.collected.deadline,
          interest_confirmed: true,
        },
        { upsert: true, new: true }
      );

      const pipeRes = await registrarLead(upsert.toObject());
      await Lead.updateOne({ _id: upsert._id }, { pipefy_card_id: pipeRes.cardId });

      // (b) oferecer horários
      const slots = await oferecerHorarios({});
      state.offered_slots = slots;
      setSessionState(sessionId, state);

      const slotsText = slots.map(s => `• ${s.id} — ${s.label}`).join("\n");
      reply += `\n\nExcelente! 🙌 Posso agendar nossa conversa. Tenho estes horários:\n${slotsText}\n\nResponda com o código do horário (ex.: SLOT#1).`;
    }
    // 4.2) Se já oferecemos slots, tentar identificar qual foi escolhido
    else if (state.stage === "offer_slots" && state.offered_slots?.length) {
      const chosen = extrairSlotEscolhido(userText, state.offered_slots);
      if (chosen) {
        const lead = await Lead.findOne({ email: state.collected.email });
        const meeting = await agendarReuniao({
          slotId: chosen.id,
          slotISO: chosen.iso,
          lead: lead?.toObject(),
        });

        // persistir
        await Lead.updateOne(
          { _id: lead._id },
          {
            meeting_link: meeting.meeting_link,
            meeting_datetime: meeting.meeting_datetime,
          }
        );

        reply = `Perfeito! ✅ Reunião confirmada para **${chosen.label}**.\nLink: ${meeting.meeting_link}\n\nTe vejo lá!`;
        state.stage = "scheduled";
        setSessionState(sessionId, state);
      }
    }

    // 5) Emitir resposta
    const botMessage = {
      sessionId,
      role: "bot",
      message: reply,
      timestamp: Date.now(),
    };
    socket.emit("message", botMessage);

    // 6) Persistir resposta do bot
    await Chat.create(botMessage);
  });

  socket.on("disconnect", () => {
    console.log(`Cliente desconectado: ${socket.id}`);
  });
});

server.listen(3001, () => console.log("Servidor rodando na porta 3001"));
