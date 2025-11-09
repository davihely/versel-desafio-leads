const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const OpenAI = require('openai');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket) => {
  console.log('Connected', socket.id);

  socket.on('newMessage', async (chat) => {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Você é um assistente de vendas do ChatFlow.' },
          { role: 'user', content: chat.message },
        ],
      });

      const reply = completion.choices[0].message.content;

      const botMessage = {
        username: 'Assistente',
        message: reply,
        timestamp: Date.now(),
        role: 'bot'
      };

      io.emit('message', botMessage);
    } catch (err) {
      console.error('Erro ao chamar OpenAI:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('Disconnected', socket.id);
  });
});

server.listen(3001, () => {
  console.log('Server is running on port 3001');
});
