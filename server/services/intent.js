// services/intent.js
export function confirmarInteresse(ultimaMensagemDoUsuario = "") {
  const s = (ultimaMensagemDoUsuario || "").toLowerCase();
  // Palavras/falas que indicam interesse claro
  const gatilhos = [
    "sim", "claro", "tenho interesse", "pode agendar", "quero marcar",
    "vamos marcar", "topo", "ok", "gostaria de agendar", "quero reunião"
  ];
  return gatilhos.some(g => s.includes(g));
}

export function extrairSlotEscolhido(texto = "", oferecidos = []) {
  // Aceita “SLOT#1” ou “10h/14h/16h” por label
  const t = (texto || "").toUpperCase();

  // 1) por ID
  const idFound = oferecidos.find(s => t.includes(s.id.toUpperCase()));
  if (idFound) return idFound;

  // 2) tentativa por hora (ex.: "10", "10h")
  for (const s of oferecidos) {
    const hour = new Date(s.iso).getHours();
    if (t.includes(`${hour}H`) || t.includes(`${hour}:00`)) {
      return s;
    }
  }
  return null;
}

export function validarEmail(email = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
