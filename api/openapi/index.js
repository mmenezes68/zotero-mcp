const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  try {
    const p = path.join(process.cwd(), 'public', 'openapi.yaml');
    const text = fs.readFileSync(p, 'utf8');
    res.setHeader('Content-Type', 'text/yaml; charset=utf-8');
    return res.status(200).send(text);
  } catch (err) {
    return res.status(500).send('Failed to load openapi.yaml');
  }
};
