require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());

// --- Modèle Mongoose ---
const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2 },
    description: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);
const Item = mongoose.models.Item || mongoose.model('Item', itemSchema);

// --- Données de démonstration (si pas de base) ---
const demoItems = [
  { _id: '1', name: 'Élément démo 1', description: 'Premier exemple' },
  { _id: '2', name: 'Élément démo 2', description: 'Deuxième exemple' },
];

// --- Connexion MongoDB (optionnelle pour l'instant) ---
const dbReady = () => mongoose.connection.readyState === 1;

if (process.env.MONGODB_URI) {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connecté'))
    .catch((err) => console.error('Erreur MongoDB :', err.message));
} else {
  console.warn('MONGODB_URI absente : mode démonstration');
}

// --- Routes ---
app.get('/', (req, res) => res.send('Hello from back'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API opérationnelle' });
});

app.get('/api/items', async (req, res) => {
  try {
    if (!dbReady()) return res.json(demoItems);
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/items', async (req, res) => {
  try {
    const { name, description } = req.body || {};
    if (typeof name !== 'string' || name.trim().length < 2) {
      return res
        .status(400)
        .json({ error: 'Le champ "name" est requis (2 caractères min.)' });
    }
    if (!dbReady()) {
      return res.status(503).json({ error: 'Base de données indisponible' });
    }
    const item = await Item.create({ name, description });
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// --- Route inconnue ---
app.use((req, res) => {
  res.status(404).json({ error: 'Route introuvable' });
});

app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));

module.exports = app;s