import mongoose from 'mongoose';

export async function connect() {
    try {
        
        await mongoose.connect(process.env.MONGODB_URI);

        mongoose.connection.on('connected', () => {
        console.log('Connected to the DB');
        });

    } catch (error) {
        console.error('Error connecting to DB:', error);
    }
    }