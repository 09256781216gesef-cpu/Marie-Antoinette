const express = require('express');
const cors = require('cors');
const data = require('./data/matcha.json');

const app = express();
const PORT = 3000;

app.use(cors());

// GET /api/matcha - all matcha drinks
app.get('/api/matcha', (req, res) => {
  res.json(data.drinks);
});

// GET /api/shops - nearby matcha shops
app.get('/api/shops', (req, res) => {
  res.json(data.shops);
});

// GET /api/shops/:id/menu - menu for one shop
app.get('/api/shops/:id/menu', (req, res) => {
  const shopId = Number(req.params.id);
  const menu = data.drinks.filter((drink) => drink.shopId === shopId);
  res.json(menu);
});

app.listen(PORT, () => {
  console.log(`Matcha API running at http://localhost:${PORT}`);
  console.log('Endpoints:');
  console.log(`  GET http://localhost:${PORT}/api/matcha`);
  console.log(`  GET http://localhost:${PORT}/api/shops`);
  console.log(`  GET http://localhost:${PORT}/api/shops/1/menu`);
});
