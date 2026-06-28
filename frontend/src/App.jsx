import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

const API_BASE = 'http://localhost:5000/api';

function App() {
  // Safe token initialization parsing
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('token');
    return savedToken && savedToken !== 'undefined' && savedToken !== 'null' ? savedToken : null;
  });
  
  const [username, setUsername] = useState(() => {
    const savedName = localStorage.getItem('username');
    return savedName || '';
  });

  const [authMode, setAuthMode] = useState('login'); 
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [recipes, setRecipes] = useState([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [imageUrl, setImageUrl] = useState('');
  const [ingredients, setIngredients] = useState(['']);
  const [instructions, setInstructions] = useState(['']);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    // Rigid validation perimeter check before firing hook
    if (token && token !== 'undefined' && token !== 'null') {
      fetchRecipes(token);
    } else {
      handleLogout();
    }
  }, [token]);

  const fetchRecipes = async (currentToken) => {
    try {
      const response = await axios.get(`${API_BASE}/recipes`, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      setRecipes(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching data assets:', error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const endpoint = authMode === 'login' ? 'login' : 'register';
      const response = await axios.post(`${API_BASE}/auth/${endpoint}`, {
        username: authUsername.trim(),
        password: authPassword
      });
      
      const { token: receivedToken, username: receivedName } = response.data;
      
      if (!receivedToken) {
        throw new Error("Server response did not include a token payload.");
      }
      
      localStorage.setItem('token', receivedToken);
      localStorage.setItem('username', receivedName);
      
      setUsername(receivedName);
      setAuthUsername('');
      setAuthPassword('');
      setToken(receivedToken); 
    } catch (err) {
      setAuthError(err.response?.data?.message || err.message || 'Authentication transaction failed');
    }
  };

  const handleLogout = () => {
    localStorage.clear(); // Wipes any broken, old, or malformed strings completely
    setToken(null);
    setUsername('');
    setRecipes([]);
  };

  const handleAddIngredient = () => setIngredients([...ingredients, '']);
  const handleIngredientChange = (index, value) => {
    const updated = [...ingredients];
    updated[index] = value;
    setIngredients(updated);
  };

  const handleAddInstruction = () => setInstructions([...instructions, '']);
  const handleInstructionChange = (index, value) => {
    const updated = [...instructions];
    updated[index] = value;
    setInstructions(updated);
  };

  const handleEditClick = (recipe) => {
    setEditingId(recipe._id);
    setTitle(recipe.title || '');
    setCategory(recipe.category || 'General');
    setImageUrl(recipe.imageUrl || '');
    setIngredients(Array.isArray(recipe.ingredients) ? recipe.ingredients : ['']);
    setInstructions(Array.isArray(recipe.instructions) ? recipe.instructions : ['']);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const cleanIngredients = ingredients.filter(item => item.trim() !== '');
    const cleanInstructions = instructions.filter(item => item.trim() !== '');

    const recipeData = { 
      title: title.trim(), 
      category, 
      imageUrl: imageUrl.trim(), 
      ingredients: cleanIngredients, 
      instructions: cleanInstructions 
    };

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (editingId) {
        const response = await axios.put(`${API_BASE}/recipes/${editingId}`, recipeData, config);
        setRecipes(recipes.map((r) => (r._id === editingId ? response.data : r)));
        setEditingId(null);
      } else {
        const response = await axios.post(`${API_BASE}/recipes`, recipeData, config);
        setRecipes([...recipes, response.data]);
      }

      setTitle('');
      setCategory('General');
      setImageUrl('');
      setIngredients(['']);
      setInstructions(['']);
    } catch (error) {
      console.error('Data pipeline preservation anomaly:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE}/recipes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecipes(recipes.filter((r) => r._id !== id));
    } catch (error) {
      console.error('Data link destruction error:', error);
    }
  };

  const filteredRecipes = recipes.filter((recipe) => {
    if (!recipe) return false;
    const titleString = recipe.title || '';
    const ingredientsArray = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
    
    const matchesSearch = titleString.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ingredientsArray.some(ing => ing.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || recipe.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!token) {
    return (
      <div className="app-container auth-wrapper">
        <div className="background-blobs">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="auth-card glass">
          <h2>{authMode === 'login' ? 'System Login' : 'Create Identity'}</h2>
          <p className="auth-subtitle">MERN Recipe Box Perimeter Protection</p>
          
          <form onSubmit={handleAuthSubmit}>
            <div className="form-group">
              <label>Ident-Name</label>
              <input type="text" value={authUsername} onChange={(e) => setAuthUsername(e.target.value)} required placeholder="Enter terminal handle..." />
            </div>
            <div className="form-group">
              <label>Pass-Phrase</label>
              <input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} required placeholder="••••••••" />
            </div>
            
            {authError && <div className="auth-error-banner">{authError}</div>}
            
            <button type="submit" className="submit-btn auth-submit-trigger">
              {authMode === 'login' ? 'Establish Link' : 'Register Core'}
            </button>
          </form>
          
          <div className="auth-toggle-footer">
            {authMode === 'login' ? (
              <p>New operator? <span onClick={() => { setAuthMode('register'); setAuthError(''); }}>Request clearance</span></p>
            ) : (
              <p>Already registered? <span onClick={() => { setAuthMode('login'); setAuthError(''); }}>Initialize link</span></p>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="background-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <header className="main-header">
        <div className="user-profile-badge glass">
          <span>Active Operator: <strong>{username}</strong></span>
          <button onClick={handleLogout} className="logout-trigger">Terminate Link</button>
        </div>
        <h1>Recipe Box HQ</h1>
        <p>Protected Full-Stack MERN Canvas Layer</p>
      </header>

      <div className="workspace">
        <aside className="control-panel glass">
          <h2>{editingId ? 'Modify Recipe' : 'New Blueprint'}</h2>
          <form onSubmit={handleFormSubmit}>
            <div className="form-group">
              <label>Recipe Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g., Cyber Sushi" />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="General">General</option>
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Dessert">Dessert</option>
              </select>
            </div>

            <div className="form-group">
              <label>Image URL</label>
              <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://images.unsplash.com/..." />
            </div>

            <div className="form-group">
              <label>Ingredients</label>
              {ingredients.map((ing, i) => (
                <input key={i} type="text" value={ing} onChange={(e) => handleIngredientChange(i, e.target.value)} required placeholder={`Ingredient #${i + 1}`} className="dynamic-input" />
              ))}
              <button type="button" onClick={handleAddIngredient} className="add-btn-sub">+ Add Ingredient</button>
            </div>

            <div className="form-group">
              <label>Instructions</label>
              {instructions.map((inst, i) => (
                <input key={i} type="text" value={inst} onChange={(e) => handleInstructionChange(i, e.target.value)} required placeholder={`Step #${i + 1}`} className="dynamic-input" />
              ))}
              <button type="button" onClick={handleAddInstruction} className="add-btn-sub">+ Add Step</button>
            </div>

            <button type="submit" className="submit-btn">
              {editingId ? 'Update Matrix' : 'Deploy Recipe'}
            </button>
          </form>
        </aside>

        <main className="display-panel">
          <div className="filter-bar glass">
            <input type="text" placeholder="Search by name or ingredient..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="search-input" />
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="category-select">
              <option value="All">All Categories</option>
              <option value="General">General</option>
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Dessert">Dessert</option>
            </select>
          </div>

          <motion.div layout className="cards-grid">
            <AnimatePresence>
              {filteredRecipes.map((recipe) => (
                <motion.div key={recipe._id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} className="recipe-card glass">
                  <div className="card-actions">
                    <button onClick={() => handleEditClick(recipe)} className="edit-btn" aria-label="Edit recipe">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                      </svg>
                    </button>
                    <button onClick={() => handleDelete(recipe._id)} className="delete-btn" aria-label="Delete recipe">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                  {recipe.imageUrl && <div className="card-image" style={{ backgroundImage: `url(${recipe.imageUrl})` }}></div>}
                  <div className="card-content">
                    <span className="card-badge">{recipe.category}</span>
                    <h3>{recipe.title}</h3>
                    <div className="card-section">
                      <h4>Ingredients</h4>
                      <ul>{Array.isArray(recipe.ingredients) && recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}</ul>
                    </div>
                    <div className="card-section">
                      <h4>Instructions</h4>
                      <ol>{Array.isArray(recipe.instructions) && recipe.instructions.map((inst, i) => <li key={i}>{inst}</li>)}</ol>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default App;