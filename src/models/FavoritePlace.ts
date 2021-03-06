import mongoose from 'mongoose';

export default mongoose.model('FavoritePlace', new mongoose.Schema({
  name: String,
  address: String,
}));
