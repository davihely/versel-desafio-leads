import fs from "fs";
import path from "path";

const FILE_PATH = path.resolve("sessions.json");

class Session {
  constructor(id) {
    this.id = id;
    this.history = [];
    this.lastActivity = Date.now();
  }

  addMessage(username, message) {
    this.history.push({ username, message, timestamp: Date.now() });
    this.lastActivity = Date.now();
  }

  getHistory() {
    return this.history;
  }
}

class SessionManager {
  constructor(timeoutMs = 10 * 60 * 1000) {
    this.sessions = new Map();
    this.timeoutMs = timeoutMs;
    this.loadFromFile(); // carrega sessões anteriores
  }

  getSession(id) {
    let session = this.sessions.get(id);
    if (!session) {
      session = new Session(id);
      this.sessions.set(id, session);
      console.log(`🆕 Nova sessão criada: ${id}`);
      this.saveToFile();
    }
    session.lastActivity = Date.now();
    return session;
  }

  addMessage(id, username, message) {
    const session = this.getSession(id);
    session.addMessage(username, message);
    this.saveToFile();
  }

  cleanup() {
    const now = Date.now();
    for (const [id, session] of this.sessions.entries()) {
      if (now - session.lastActivity > this.timeoutMs) {
        console.log(`💤 Sessão expirada: ${id}`);
        this.sessions.delete(id);
      }
    }
    this.saveToFile();
  }

  saveToFile() {
    try {
      const obj = Object.fromEntries(this.sessions);
      fs.writeFileSync(FILE_PATH, JSON.stringify(obj, null, 2), "utf8");
    } catch (err) {
      console.error("❌ Erro ao salvar sessões:", err);
    }
  }

  loadFromFile() {
    if (!fs.existsSync(FILE_PATH)) return;

    try {
      const data = JSON.parse(fs.readFileSync(FILE_PATH, "utf8"));
      for (const [id, sessionData] of Object.entries(data)) {
        const session = new Session(id);
        session.history = sessionData.history || [];
        session.lastActivity = sessionData.lastActivity || Date.now();
        this.sessions.set(id, session);
      }
      console.log(`📂 ${this.sessions.size} sessões carregadas do arquivo.`);
    } catch (err) {
      console.error("❌ Erro ao carregar sessões:", err);
    }
  }
}

const sessionManager = new SessionManager();
setInterval(() => sessionManager.cleanup(), 5 * 60 * 1000);

export default sessionManager;
