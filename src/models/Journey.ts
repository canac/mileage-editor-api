import mongoose from 'mongoose';

export default mongoose.model('Journey', new mongoose.Schema({
  date: Date,
  description: String,
  to: String,
  from: String,
  miles: Number,
}));
