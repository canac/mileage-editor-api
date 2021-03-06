import mongoose from 'mongoose';

export default mongoose.model('Journey', new mongoose.Schema({
  date: { type: Date, required: true },
  description: { type: String, required: true },
  to: { type: String, required: true },
  from: { type: String, required: true },
  miles: { type: Number, required: true },
}));
