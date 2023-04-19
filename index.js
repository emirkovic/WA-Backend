const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const RouterUser = require('./routes/user');
const RouterQuiz = require('./routes/kvizevi');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 9000;

app.use(cors({
  origin: ["http://localhost:9000", "https://kviz-mern-app.onrender.com"]
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use('/api/users', RouterUser);
app.use('/api/quizzes', RouterQuiz);

mongoose.connect(process.env.DB_URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true
}).then(() => console.log('Database connected'))
.catch(error => console.log('Error connecting:', error));

app.listen(PORT, () => {
  console.log(`Node server running on port: ${PORT}`);
});