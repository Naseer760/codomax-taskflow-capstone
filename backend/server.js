const mysql = require('mysql2/promise');
const { createApp } = require('./app');

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME || 'taskflow',
  user: process.env.DB_USER || 'taskflow',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 10
});

const app = createApp(pool);
const port = Number(process.env.PORT || 5000);

app.listen(port, '0.0.0.0', () => {
  console.log(`TaskFlow API listening on port ${port}`);
});
