import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  createdCourses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    }
  ],
  enrolledCourses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    }
  ],
  ratings: [
    {
      rater: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // who rated
      score: { type: Number, min: 1, max: 5 }
    }
  ],
}, {
  timestamps: true
});

// Virtual for average userScore
userSchema.virtual('userScore').get(function () {
  if (!this.ratings || this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((acc, curr) => acc + curr.score, 0);
  return (sum / this.ratings.length).toFixed(2);
});

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });


export default mongoose.models.User || mongoose.model('User', userSchema);;