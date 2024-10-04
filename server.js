const dotenv = require('dotenv');

dotenv.config();

const port = process.env.PORT || 3000;
const app = require('./app');

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});