const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const rateLimit = require('express-rate-limit');
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ 
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/youtube-analyzer', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB Connected')
}).catch((err) => {
  console.error('MongoDB connection error:', err)
})

const limiter = rateLimit({ //limits for too many tries
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: "Too many requests, please try again later."
});

app.use('/api/youtube', require('./routes/youtube'));
app.use('/api/cache', require('./routes/cache'));



app.get('/', (req, res) => {
  res.json({ message: 'YouTube Analyzer API' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});