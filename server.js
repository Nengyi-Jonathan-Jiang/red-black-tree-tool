const port = 3030;
const path = require("path");
const express = require("express");
const app = express();
app.use(express.static(__dirname));
app.get('/', (_req, res) => res.sendFile(path.join(__dirname, 'index.html')))
app.listen(port);