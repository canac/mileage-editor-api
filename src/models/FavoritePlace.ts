import mongoose, { Document } from 'mongoose';

export default mongoose.model<Document>(
  'FavoritePlace',
  new mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
  }),
);
