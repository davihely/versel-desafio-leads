// services/pipefy.js
// Troque por chamadas reais ao Pipefy (GraphQL/REST) quando desejar.
export async function registrarLead(lead) {
  // Regra: se já existe por e-mail → atualizar; senão → criar.
  // Mock: só “simula” um ID de card.
  const cardId = `pipefy_${Math.random().toString(36).slice(2, 8)}`;
  return { cardId, status: "ok" };
}
