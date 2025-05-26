import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
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
  courseScore: { 
    type: Number, 
    default: 0 
  },
  creator: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
});


const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);
export default Course;

