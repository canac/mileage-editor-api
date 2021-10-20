import mongoose, { Document } from 'mongoose';

export default mongoose.model<Document>(
  'Journey',
  new mongoose.Schema({
    userId: { type: String, required: true },
    date: { type: Date, required: true },
    description: { type: String, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    miles: { type: Number, required: true },
    tolls: { type: Number, required: true },
  }),
);
