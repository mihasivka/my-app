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
    ref: 'User', 
    required: true 
  },
  ratings: [
    {
      rater: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
      },
      score: { 
        type: Number, 
        min: 1, 
        max: 5 
      }
    }
  ],
  approved: { type: String, enum: ['pending', 'approved', 'denied'], default: 'pending' }
}, { timestamps: true });

const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);
export default Course;

