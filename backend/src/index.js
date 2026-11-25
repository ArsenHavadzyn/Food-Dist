// Entry point: load project environment and start Express app
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const app = require('./app');
const port = process.env.PORT || 4000;

app.listen(port, () => console.log(`Server running on port ${port}`));
