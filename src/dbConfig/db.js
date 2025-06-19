import mongoose from 'mongoose';

export async function connect() {
    try {
        console.log('MONGO_URI:', process.env.MONGO_URI); // Add this line
        await mongoose.connect(process.env.MONGO_URI);

        mongoose.connection.on('connected', () => {
        console.log('Connected to the DB');
        });

    } catch (error) {
        console.error('Error connecting to DB:', error);
    }
    }