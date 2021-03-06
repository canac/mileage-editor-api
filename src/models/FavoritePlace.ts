import mongoose from 'mongoose';

export default mongoose.model('FavoritePlace', new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
}));
