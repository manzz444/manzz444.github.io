// test-db.js
const db = require('./models/db');

async function testConnection() {
    try {
        const [rows] = await db.query('SELECT NOW() as time');
        console.log('✅ Database connected! Time:', rows[0].time);
        
        const [games] = await db.query('SELECT * FROM games');
        console.log('✅ Games in database:', games);
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.error('Full error:', error);
    }
}

testConnection();