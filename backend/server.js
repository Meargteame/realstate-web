const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const propertyRoutes = require('./routes/propertyRoutes');
const agentRoutes = require('./routes/agentRoutes');
const leadRoutes = require('./routes/leadRoutes');
const authRoutes = require('./routes/authRoutes');
const opportunityRoutes = require('./routes/opportunityRoutes');

app.use('/api/properties', propertyRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/opportunities', opportunityRoutes);

// General health route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'KW Real Estate Backend is active.' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
