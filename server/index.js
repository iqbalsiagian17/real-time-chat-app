const express = require('express');
const http = require('http');
const cors = require('cors');
require('dotenv').config();
const { sequelize } = require('./models');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const conversationRoutes = require('./routes/conversationRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('✅ Server & DB ready!'));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); // <== ini penting
app.use('/api/chat', chatRoutes);
app.use('/api/conversations', conversationRoutes);

// ✅ BUAT server dulu
const server = http.createServer(app);

// ✅ LALU initSocket dipanggil setelah server siap
const initSocket = require('./socket');
initSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  try {
    await sequelize.authenticate();
    console.log('✅ Sequelize connected to DB!');
  } catch (err) {
    console.error('❌ Sequelize DB connection error:', err);
  }
});
