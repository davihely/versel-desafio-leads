// state/sessionState.js
const sessions = new Map();

export function getSessionState(sessionId) {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      collected: { name: null, email: null, company: null, need: null, deadline: null },
      interest_confirmed: false,
      offered_slots: [], // [{id, iso, label}]
      stage: "intro"     // intro -> collecting -> offer_slots -> scheduled | no_interest
    });
  }
  return sessions.get(sessionId);
}

export function setSessionState(sessionId, next) {
  sessions.set(sessionId, next);
}
