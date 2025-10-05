const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);
        
        return conn;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        
        // Información detallada del error
        if (error.name === 'MongoServerError') {
            if (error.code === 18) {
                console.error('🔐 Authentication failed. Please check:');
                console.error('   - Username and password in MONGODB_URI');
                console.error('   - Database user permissions');
                console.error('   - IP address whitelist in MongoDB Atlas');
            }
        }
        
        process.exit(1);
    }
};

module.exports = connectDB;