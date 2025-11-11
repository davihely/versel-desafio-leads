// server/services/calendar.js
import { google } from "googleapis";
import fs from "fs";

// Caminho para suas credenciais baixadas do Google Cloud Console
const CREDENTIALS_PATH = "./verzel-lead-teste-de6c4ad1fac8.json";

/**
 * Retorna o cliente autenticado do Google Calendar
 */
function getGoogleCalendarClient() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  const calendar = google.calendar({ version: "v3", auth });
  return calendar;
}

/**
 * Retorna 3 horários de exemplo (poderia ser dinâmico)
 */
export async function oferecerHorarios() {
  const now = new Date();
  const baseDate = new Date(now.setDate(now.getDate() + 1)); // amanhã
  const slots = [
    {
      id: "SLOT#1",
      label: "Amanhã às 10h",
      iso: new Date(baseDate.setHours(10, 0, 0, 0)).toISOString(),
    },
    {
      id: "SLOT#2",
      label: "Amanhã às 14h",
      iso: new Date(baseDate.setHours(14, 0, 0, 0)).toISOString(),
    },
    {
      id: "SLOT#3",
      label: "Amanhã às 16h",
      iso: new Date(baseDate.setHours(16, 0, 0, 0)).toISOString(),
    },
  ];
  return slots;
}

/**
 * Cria o evento no Google Calendar e retorna o link Meet
 */
export async function marcarReuniao({ slotISO, lead }) {
  try {
    const calendar = getGoogleCalendarClient();

    const event = {
      summary: `Reunião Verzel com ${lead.name || "Lead"}`,
      description: `Contato: ${lead.email || "não informado"}
Empresa: ${lead.company || "não informada"}
Necessidade: ${lead.need || "não informada"}`,
      start: { dateTime: slotISO, timeZone: "America/Sao_Paulo" },
      end: {
        dateTime: new Date(new Date(slotISO).getTime() + 30 * 60000).toISOString(),
        timeZone: "America/Sao_Paulo",
      },
    };

    const res = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
    });

    console.log("✅ Evento criado:", res.data.htmlLink);

    // Gerar link genérico de reunião
    const fakeMeet = `https://meet.google.com/${Math.random().toString(36).substring(2, 5)}-${Math.random()
      .toString(36)
      .substring(2, 6)}-${Math.random().toString(36).substring(2, 9)}`;

    return {
      meeting_link: fakeMeet,
      meeting_datetime: slotISO,
    };
  } catch (err) {
    console.error("❌ Erro ao criar evento no Google Calendar:", err.message);
    throw err;
  }
}
