const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const auth = require('../middleware/auth');

// GET recipes belonging strictly to the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const recipes = await Recipe.find({ user: req.user.id });
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new recipe linked to user ID
router.post('/', auth, async (req, res) => {
  const recipe = new Recipe({
    user: req.user.id,
    title: req.body.title,
    category: req.body.category,
    imageUrl: req.body.imageUrl,
    ingredients: req.body.ingredients,
    instructions: req.body.instructions,
  });

  try {
    const newRecipe = await recipe.save();
    res.status(201).json(newRecipe);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// UPDATE a recipe (with ownership verification checking)
router.put('/:id', auth, async (req, res) => {
  try {
    let recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
    if (recipe.user.toString() !== req.user.id) return res.status(401).json({ message: 'Unauthorized action' });

    recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(recipe);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a recipe (with ownership verification checking)
router.delete('/:id', auth, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
    if (recipe.user.toString() !== req.user.id) return res.status(401).json({ message: 'Unauthorized action' });

    await Recipe.findByIdAndDelete(req.params.id);
    res.json({ message: 'Recipe removed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;