import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

const API_BASE = 'http://localhost:5000/api';
axios.defaults.withCredentials = true; // Crucial: forces Axios to include secure cookies automatically

function App() {
  const [tokenActive, setTokenActive] = useState(() => !!localStorage.getItem('username'));
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [authMode, setAuthMode] = useState('login'); 
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [recipes, setRecipes] = useState([]);
  const [viewMode, setViewMode] = useState('private'); // 'private', 'public', or 'favorites'
  const [userFavorites, setUserFavorites] = useState([]);
  
  // Form values
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [imageUrl, setImageUrl] = useState('');
  const [ingredients, setIngredients] = useState(['']);
  const [instructions, setInstructions] = useState(['']);
  const [isPublic, setIsPublic] = useState(false);

  // Search, Category, and Fridge availability values
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [fridgeInput, setFridgeInput] = useState(''); 
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (tokenActive) {
      fetchUserData();
      loadActiveDashboard();
    }
  }, [tokenActive, viewMode]);

  const fetchUserData = async () => {
    try {
      const res = await axios.get(`${API_BASE}/auth/me`);
      setUserFavorites(res.data.favorites || []);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
    }
  };

  const loadActiveDashboard = async (ingredientsQuery = '') => {
    try {
      if (viewMode === 'public') {
        const res = await axios.get(`${API_BASE}/recipes/public`);
        setRecipes(res.data);
      } else {
        const url = ingredientsQuery ? `${API_BASE}/recipes?ingredients=${ingredientsQuery}` : `${API_BASE}/recipes`;
        const res = await axios.get(url);
        setRecipes(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Local file upload to Base64 encoder helper
  const handleImageUploadChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImageUrl(reader.result); // Saves the entire file as a simple text string
      reader.readAsDataURL(file);
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
      localStorage.setItem('username', response.data.username);
      setUsername(response.data.username);
      setTokenActive(true);
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Authentication error');
    }
  };

  const handleLogout = async () => {
    try { await axios.post(`${API_BASE}/auth/logout`); } catch(e){}
    localStorage.clear();
    setTokenActive(false);
    setUsername('');
    setRecipes([]);
  };

  const handleToggleFavorite = async (id) => {
    try {
      const res = await axios.post(`${API_BASE}/recipes/${id}/favorite`);
      setUserFavorites(res.data.favorites);
    } catch (err) { console.error(err); }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const recipeData = { 
      title: title.trim(), category, imageUrl, 
      ingredients: ingredients.filter(i => i.trim() !== ''), 
      instructions: instructions.filter(i => i.trim() !== ''),
      isPublic
    };

    try {
      if (editingId) {
        await axios.put(`${API_BASE}/recipes/${editingId}`, recipeData);
        setEditingId(null);
      } else {
        await axios.post(`${API_BASE}/recipes`, recipeData);
      }
      setTitle(''); setCategory('General'); setImageUrl('');
      setIngredients(['']); setInstructions(['']); setIsPublic(false);
      loadActiveDashboard();
    } catch (err) { console.error(err); }
  };

  const handleEditClick = (recipe) => {
    setEditingId(recipe._id);
    setTitle(recipe.title);
    setCategory(recipe.category);
    setImageUrl(recipe.imageUrl);
    setIngredients(recipe.ingredients);
    setInstructions(recipe.instructions);
    setIsPublic(recipe.isPublic || false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE}/recipes/${id}`);
      loadActiveDashboard();
    } catch (err) { console.error(err); }
  };

  const triggerFridgeFiltering = (e) => {
    e.preventDefault();
    loadActiveDashboard(fridgeInput);
  };

  const filteredRecipes = recipes.filter((recipe) => {
    if (viewMode === 'favorites' && !userFavorites.includes(recipe._id)) return false;
    const titleString = recipe.title || '';
    const matchesSearch = titleString.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.ingredients.some(ing => ing.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || recipe.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!tokenActive) {
    return (
      <div className="app-container auth-wrapper">
        <div className="auth-card glass">
          <h2>{authMode === 'login' ? 'System Login' : 'Create Identity'}</h2>
          <form onSubmit={handleAuthSubmit}>
            <div className="form-group"><label>Ident-Name</label><input type="text" value={authUsername} onChange={(e) => setAuthUsername(e.target.value)} required /></div>
            <div className="form-group"><label>Pass-Phrase</label><input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} required /></div>
            {authError && <div className="auth-error-banner">{authError}</div>}
            <button type="submit" className="submit-btn">{authMode === 'login' ? 'Establish Link' : 'Register Core'}</button>
          </form>
          <div className="auth-toggle-footer">
            {authMode === 'login' ? <p>New operator? <span onClick={() => setAuthMode('register')}>Request clearance</span></p> : <p>Registered? <span onClick={() => setAuthMode('login')}>Initialize link</span></p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="main-header">
        <div className="user-profile-badge glass">
          <span>Operator: <strong>{username}</strong></span>
          <button onClick={handleLogout} className="logout-trigger">Terminate Link</button>
        </div>
        <h1>Recipe Box HQ</h1>
        <div className="navigation-tabs">
          <button className={viewMode === 'private' ? 'active' : ''} onClick={() => setViewMode('private')}>Personal Vault</button>
          <button className={viewMode === 'public' ? 'active' : ''} onClick={() => setViewMode('public')}>Community Feed</button>
          <button className={viewMode === 'favorites' ? 'active' : ''} onClick={() => setViewMode('favorites')}>Starred Database</button>
        </div>
      </header>

      <div className="workspace">
        <aside className="control-panel glass">
          <h2>{editingId ? 'Modify Blueprint' : 'New Blueprint'}</h2>
          <form onSubmit={handleFormSubmit}>
            <div className="form-group"><label>Title</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
            <div className="form-group"><label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="General">General</option><option value="Breakfast">Breakfast</option><option value="Lunch">Lunch</option><option value="Dinner">Dinner</option><option value="Dessert">Dessert</option>
              </select>
            </div>
            <div className="form-group">
              <label>Upload Local Image File</label>
              <input type="file" accept="image/*" onChange={handleImageUploadChange} />
              {imageUrl && <img src={imageUrl} alt="Preview" style={{ width: '100%', borderRadius: '8px', marginTop: '10px' }} />}
            </div>
            <div className="form-group"><label>Ingredients</label>
              {ingredients.map((ing, i) => <input key={i} type="text" value={ing} onChange={(e) => { const u = [...ingredients]; u[i] = e.target.value; setIngredients(u); }} required className="dynamic-input" />)}
              <button type="button" onClick={() => setIngredients([...ingredients, ''])} className="add-btn-sub">+ Add Ingredient</button>
            </div>
            <div className="form-group"><label>Instructions</label>
              {instructions.map((inst, i) => <input key={i} type="text" value={inst} onChange={(e) => { const u = [...instructions]; u[i] = e.target.value; setInstructions(u); }} required className="dynamic-input" />)}
              <button type="button" onClick={() => setInstructions([...instructions, ''])} className="add-btn-sub">+ Add Step</button>
            </div>
            <div className="form-group checkbox-group">
              <label><input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} /> Broadcast to Community Feed (Public)</label>
            </div>
            <button type="submit" className="submit-btn">{editingId ? 'Update Matrix' : 'Deploy Recipe'}</button>
          </form>
        </aside>

        <main className="display-panel">
          <div className="filter-bar glass">
            <input type="text" placeholder="Search parameters..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="search-input" />
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="category-select">
              <option value="All">All Categories</option><option value="General">General</option><option value="Breakfast">Breakfast</option><option value="Lunch">Lunch</option><option value="Dinner">Dinner</option><option value="Dessert">Dessert</option>
            </select>
          </div>

          {viewMode !== 'public' && (
            <form onSubmit={triggerFridgeFiltering} className="fridge-filter-form glass">
              <input type="text" placeholder="What's in your fridge? (e.g. egg, milk, flour)" value={fridgeInput} onChange={(e) => setFridgeInput(e.target.value)} />
              <button type="submit">Scan Availability</button>
            </form>
          )}

          <motion.div layout className="cards-grid">
            <AnimatePresence>
              {filteredRecipes.map((recipe) => (
                <motion.div key={recipe._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="recipe-card glass">
                  <div className="card-actions">
                    <button onClick={() => handleToggleFavorite(recipe._id)} className={`fav-btn ${userFavorites.includes(recipe._id) ? 'starred' : ''}`}>★</button>
                    {viewMode !== 'public' && (
                      <>
                        <button onClick={() => handleEditClick(recipe)} className="edit-btn">✏️</button>
                        <button onClick={() => handleDelete(recipe._id)} className="delete-btn">🗑️</button>
                      </>
                    )}
                  </div>
                  {recipe.imageUrl && <div className="card-image" style={{ backgroundImage: `url(${recipe.imageUrl})` }}></div>}
                  <div className="card-content">
                    <span className="card-badge">{recipe.category}</span>
                    {viewMode === 'public' && <span className="author-badge">By: {recipe.user?.username}</span>}
                    <h3>{recipe.title}</h3>
                    <h4>Ingredients</h4><ul>{recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}</ul>
                    <h4>Instructions</h4><ol>{recipe.instructions.map((inst, i) => <li key={i}>{inst}</li>)}</ol>
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