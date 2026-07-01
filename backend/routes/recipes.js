const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const User = require('../models/User');
const auth = require('../middleware/auth');

// 1. GET USER RECIPES + SMART INGREDIENT FILTER (THE PERFECT FIX)
router.get('/', auth, async (req, res) => {
  try {
    let query = { user: req.user.id };
    
    if (req.query.ingredients) {
      // הופך את הקלט של המקרר למערך של מילים נקיות וקטנות
      const available = req.query.ingredients
        .split(',')
        .map(i => i.trim().toLowerCase())
        .filter(i => i !== '');

      if (available.length > 0) {
        // מביאים את כל המתכונים של המשתמש מהדאטה-בייס
        const allRecipes = await Recipe.find(query);
        
        // סינון חכם: מתכון יישאר אם יש התאמה בין המקרר לרכיבים
        const filteredRecipes = allRecipes.filter(recipe => {
          // בודק האם *לפחות אחד* מהרכיבים במתכון מכיל מילה שחיפשנו במקרר
          return recipe.ingredients.some(recipeIng => {
            return available.some(fridgeIng => 
              recipeIng.toLowerCase().includes(fridgeIng)
            );
          });
        });
        
        return res.json(filteredRecipes);
      }
    }

    // אם המקרר ריק או לא נשלח פרמטר, מחזירים את כל המתכונים כרגיל
    const recipes = await Recipe.find(query);
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// 2. GET PUBLIC COMMUNITY FEED
router.get('/public', async (req, res) => {
  try {
    const publicRecipes = await Recipe.find({ isPublic: true }).populate('user', 'username');
    res.json(publicRecipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// 3. POST NEW RECIPE
router.post('/', auth, async (req, res) => {
  const { title, category, imageUrl, ingredients, instructions, isPublic } = req.body;
  const recipe = new Recipe({
    user: req.user.id,
    title,
    category,
    imageUrl,
    ingredients,
    instructions,
    isPublic: isPublic || false
  });

  try {
    const newRecipe = await recipe.save();
    res.status(201).json(newRecipe);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 4. PUT UPDATE RECIPE
router.put('/:id', auth, async (req, res) => {
  try {
    let recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
    if (recipe.user.toString() !== req.user.id) return res.status(401).json({ message: 'Unauthorized' });

    recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(recipe);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 5. DELETE RECIPE
router.delete('/:id', auth, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
    if (recipe.user.toString() !== req.user.id) return res.status(401).json({ message: 'Unauthorized' });

    await Recipe.findByIdAndDelete(req.params.id);
    res.json({ message: 'Recipe removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 6. POST TOGGLE FAVORITE STATUS
router.post('/:id/favorite', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const recipeId = req.params.id;
    
    const index = user.favorites.indexOf(recipeId);
    if (index === -1) {
      user.favorites.push(recipeId); // הוספה למועדפים
    } else {
      user.favorites.splice(index, 1); // הסרה מהמועדפים
    }
    
    await user.save();
    res.json({ favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;