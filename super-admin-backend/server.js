require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => console.log(`Super Admin API listening on ${PORT}`));
