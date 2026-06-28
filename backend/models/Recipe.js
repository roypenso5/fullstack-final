const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  category: { type: String, default: 'General' },
  imageUrl: { type: String, default: '' },
  ingredients: { type: [String], required: true },
  instructions: { type: [String], required: true }
}, { timestamps: true });

module.exports = mongoose.model('Recipe', RecipeSchema);