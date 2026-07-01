const mongoose = require('mongoose');
const Recipe = require('./models/Recipe');
const User = require('./models/User');
require('dotenv').config();

const classicMenu = [
  // --- BREAKFAST ---
  {
    title: "Classic Fluffy Pancakes",
    category: "Breakfast",
    imageUrl: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&auto=format&fit=crop&q=80",
    ingredients: ["1 cup Flour", "2 tbsp Sugar", "1 tbsp Baking Powder", "1 cup Milk", "1 Egg", "2 tbsp Melted Butter"],
    instructions: ["Whisk dry ingredients in one bowl and wet ingredients in another.", "Pour wet ingredients into the dry mixture and stir gently until just combined.", "Heat a greased skillet over medium heat and pour batter circles.", "Flip when bubbles pop on the surface and cook until golden brown on both sides."],
    isPublic: true
  },
  {
    title: "Perfect French Toast",
    category: "Breakfast",
    imageUrl: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=600&auto=format&fit=crop&q=80",
    ingredients: ["4 Thick Slices of Bread", "2 Eggs", "1/4 cup Milk", "1 tsp Cinnamon", "1 tsp Vanilla Extract", "1 tbsp Butter"],
    instructions: ["Whisk eggs, milk, cinnamon, and vanilla extract together in a shallow bowl.", "Dip each slice of bread into the egg mixture for 10 seconds per side.", "Melt butter in a skillet over medium-high heat.", "Cook bread for 2-3 minutes on each side until perfectly golden brown."],
    isPublic: true
  },

  // --- LUNCH ---
  {
    title: "Gourmet Grilled Cheese",
    category: "Lunch",
    imageUrl: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80",
    ingredients: ["4 Slices of Sourdough Bread", "2 cups Shredded Cheddar & Mozzarella", "2 tbsp Butter", "1 tbsp Mayonnaise"],
    instructions: ["Spread a thin layer of mayonnaise on the outside of each bread slice.", "Place cheese generously between the slices.", "Melt butter in a skillet over medium heat.", "Toast the sandwich until the bread is crisp and brown, and the cheese is completely melted."],
    isPublic: true
  },
  {
    title: "Crispy Garlic Parmesan Fries",
    category: "Lunch",
    imageUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80",
    ingredients: ["4 Large Russet Potatoes", "3 tbsp Olive Oil", "4 Garlic Cloves (Minced)", "1/2 cup Grated Parmesan", "Salt & Pepper"],
    instructions: ["Cut potatoes into even matchsticks and dry thoroughly with a towel.", "Toss sticks with olive oil, salt, and pepper.", "Bake at 220°C (425°F) for 25 minutes, flipping halfway through.", "Toss immediately with fresh minced garlic and parmesan cheese while hot."],
    isPublic: true
  },

  // --- DINNER ---
  {
    title: "Fresh Basil Pesto Pasta",
    category: "Dinner",
    imageUrl: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&auto=format&fit=crop&q=80",
    ingredients: ["350g Spaghetti", "2 cups Fresh Basil Leaves", "2 Garlic Cloves", "1/2 cup Olive Oil", "1/2 cup Grated Parmesan"],
    instructions: ["Boil spaghetti in salted water until al dente, then drain.", "Blend basil, garlic, and olive oil in a food processor until smooth.", "Stir in parmesan cheese to finish the pesto.", "Toss hot pasta with the pesto until evenly coated."],
    isPublic: true
  },
  {
    title: "Zesty Garlic Butter Salmon",
    category: "Dinner",
    imageUrl: "https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=600&auto=format&fit=crop&q=80",
    ingredients: ["2 Salmon Fillets", "2 tbsp Butter", "3 Garlic Cloves (Minced)", "1 tbsp Lemon Juice", "Salt & Pepper"],
    instructions: ["Season salmon fillets on both sides with salt and pepper.", "Melt butter in a pan over medium-high heat and sear salmon for 4 minutes skin-side down.", "Flip the fillets, add minced garlic and lemon juice to the pan.", "Spoon the sizzling garlic butter over the salmon for 3 more minutes until cooked through."],
    isPublic: true
  },

  // --- DESSERT ---
  {
    title: "Warm Chocolate Mug Cake",
    category: "Dessert",
    imageUrl: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=600&auto=format&fit=crop&q=80",
    ingredients: ["4 tbsp Flour", "2 tbsp Sugar", "1 tbsp Cocoa Powder", "3 tbsp Milk", "1 tbsp Melted Butter", "1 tbsp Chocolate Chips"],
    instructions: ["Whisk flour, sugar, and cocoa powder directly inside your favorite ceramic mug.", "Add milk and melted butter, stirring until a smooth batter forms.", "Drop chocolate chips right into the center.", "Microwave on high for 60 to 70 seconds. Let cool for two minutes before eating."],
    isPublic: true
  },
  {
    title: "Classic Strawberries & Cream",
    category: "Dessert",
    imageUrl: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&auto=format&fit=crop&q=80",
    ingredients: ["2 cups Fresh Strawberries", "1 cup Heavy Whipping Cream", "2 tbsp Powdered Sugar", "1 tsp Vanilla Extract"],
    instructions: ["Wash, hull, and slice the fresh strawberries.", "In a cold bowl, whip heavy cream, powdered sugar, and vanilla until soft peaks form.", "Layer sliced strawberries into serving bowls.", "Top generously with the fresh whipped cream and garnish with a whole strawberry."],
    isPublic: true
  },

  // --- GENERAL ---
  {
    title: "Crispy Garlic Bread Slices",
    category: "General",
    imageUrl: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=600&auto=format&fit=crop&q=80",
    ingredients: ["1 Baguette (Cut in half)", "4 tbsp Softened Butter", "3 Garlic Cloves (Minced)", "1 tbsp Chopped Parsley"],
    instructions: ["Mix softened butter, minced garlic, and chopped parsley in a small bowl.", "Spread the garlic butter mix heavily over the open faces of the baguette halves.", "Bake at 200°C (400°F) for 10 minutes.", "Broil for an extra 1-2 minutes until bubbling and golden crisp around the edges."],
    isPublic: true
  },
  {
    title: "Homemade Guacamole & Chips",
    category: "General",
    imageUrl: "https://images.unsplash.com/photo-1541242348-e2159842f4c6?w=600&auto=format&fit=crop&q=80",
    ingredients: ["3 Ripe Avocados", "1 Lime (Juiced)", "1/4 cup Finely Chopped Onion", "1/4 cup Fresh Cilantro", "Salt to taste"],
    instructions: ["Slice open avocados, remove pits, and scoop the flesh into a bowl.", "Mash with a fork until chunky-smooth, adding lime juice immediately to prevent browning.", "Fold in the chopped onions, fresh cilantro, and salt.", "Serve immediately alongside a warm bag of crispy tortilla chips."],
    isPublic: true
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for clean-slate seeding...");

    // Find user 'roy'
    const user = await User.findOne({ username: 'roy' });
    if (!user) {
      console.error("Error: Please register the user 'roy' first before seeding.");
      process.exit(1);
    }

    // Wipe existing recipes cleanly to prevent duplicate stacking
    await Recipe.deleteMany({});
    console.log("Cleared old recipe collections...");

    // Map user ID to all 10 classic recipes
    const localizedMenu = classicMenu.map(recipe => ({
      ...recipe,
      user: user._id
    }));

    // Inject the pristine 2x5 grid
    await Recipe.insertMany(localizedMenu);
    console.log("Success! Perfect 10-recipe community grid injected successfully!");
    
    mongoose.connection.close();
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seedDatabase();