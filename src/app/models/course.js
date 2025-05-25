import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
    id: {
    type: String,
    required: true,
    unique: true
    },
    //owner??
    title: {
    type: String,
    required: true
    },
    description: {
    type: String,
    required: true
    },
    genre: {
    type: String,
    required: true
    },
    predictedTime: {
    type: String,
    required: true
    },
    level: {
    type: String,
    required: true
    },
    userScore: {
    type: Double,
    default: 0
    },



  });


const Course = mongoose.models.courses || mongoose.model('Course', courseSchema);
export default Course;

