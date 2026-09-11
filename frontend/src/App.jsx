import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Server, 
  Code2, 
  Zap, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  Terminal,
  Cpu
} from 'lucide-react';

export default function App() {
  const [health, setHealth] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', category: 'Backend' });
  const [submitting, setSubmitting] = useState(false);

  // Ping Latency
  const [latency, setLatency] = useState(null);

  const fetchHealth = async () => {
    setLoadingHealth(true);
    const start = performance.now();
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      const end = performance.now();
      setLatency(Math.round(end - start));
      setHealth(data);
    } catch (err) {
      console.error('Health fetch failed:', err);
      setHealth(null);
      setLatency(null);
    } finally {
      setLoadingHealth(false);
    }
  };

  const fetchItems = async () => {
    setLoadingItems(true);
    try {
      const res = await fetch('/api/items');
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error('Items fetch failed:', err);
    } finally {
      setLoadingItems(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    fetchItems();
  }, []);

  const handleCreateItem = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;
    
    setSubmitting(true);
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        await fetchItems();
        setFormData({ title: '', description: '', category: 'Backend' });
        setShowAddForm(false);
      }
    } catch (err) {
      console.error('Failed to create item:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      const res = await fetch(`/api/items/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setItems(prev => prev.filter(item => item.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  const categories = ['All', 'Backend', 'Frontend', 'Architecture', 'General'];

  const filteredItems = activeCategory === 'All' 
    ? items 
    : items.filter(item => item.category.toLowerCase() === activeCategory.toLowerCase());

  const getTagStyle = (cat) => {
    switch (cat.toLowerCase()) {
      case 'backend': return 'tag-backend';
      case 'frontend': return 'tag-frontend';
      case 'architecture': return 'tag-architecture';
      default: return 'tag-general';
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px' }}>
      
      {/* HEADER BAR */}
      <header className="glass-panel" style={{ padding: '20px 28px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: 'linear-gradient(135deg, #0284c7, #7c3aed)', padding: '10px', borderRadius: '12px', display: 'flex' }}>
            <Zap size={26} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.5px', lineHeight: '1.2' }}>
              Gli<span className="gradient-text">Tch</span> <span style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '4px', verticalAlign: 'middle', marginLeft: '6px' }}>v1.0</span>
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              React + Python FastAPI + <span className="font-mono" style={{ color: 'var(--accent-cyan)' }}>uv</span> Stack
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="status-badge">
            <span className={`status-dot ${health ? 'online' : 'offline'}`}></span>
            <span style={{ fontSize: '0.85rem' }}>
              {loadingHealth ? 'Checking backend...' : health ? 'FastAPI Connected' : 'Backend Offline'}
            </span>
            {latency && (
              <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', background: 'rgba(52, 211, 153, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                {latency}ms
              </span>
            )}
          </div>

          <button className="btn-secondary" onClick={() => { fetchHealth(); fetchItems(); }} title="Refresh Backend Health">
            <RefreshCw size={16} className={loadingHealth ? 'spin' : ''} />
            <span>Sync</span>
          </button>
        </div>
      </header>

      {/* DASHBOARD STATS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        
        <div className="glass-panel glass-panel-interactive" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500' }}>FastAPI Engine</p>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginTop: '6px' }}>
                {health ? 'Online' : 'Disconnected'}
              </h3>
            </div>
            <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '10px', borderRadius: '10px' }}>
              <Server size={22} color="var(--accent-cyan)" />
            </div>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '12px' }}>
            Port 8000 &bull; Python {health?.python_version || '3.14'}
          </p>
        </div>

        <div className="glass-panel glass-panel-interactive" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500' }}>Package Manager</p>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginTop: '6px' }}>uv 0.12</h3>
            </div>
            <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '10px', borderRadius: '10px' }}>
              <Cpu size={22} color="var(--accent-violet)" />
            </div>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '12px' }}>
            Ultra-fast Rust package resolver
          </p>
        </div>

        <div className="glass-panel glass-panel-interactive" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500' }}>Frontend Framework</p>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginTop: '6px' }}>React 18</h3>
            </div>
            <div style={{ background: 'rgba(52, 211, 153, 0.1)', padding: '10px', borderRadius: '10px' }}>
              <Code2 size={22} color="var(--accent-emerald)" />
            </div>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '12px' }}>
            Vite Dev Server &bull; Port 5173
          </p>
        </div>

        <div className="glass-panel glass-panel-interactive" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500' }}>Total Components</p>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginTop: '6px' }}>{items.length}</h3>
            </div>
            <div style={{ background: 'rgba(251, 191, 36, 0.1)', padding: '10px', borderRadius: '10px' }}>
              <Layers size={22} color="var(--accent-amber)" />
            </div>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '12px' }}>
            Active REST API endpoints loaded
          </p>
        </div>

      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
        
        {/* RESOURCE MANAGER CARD */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Application Resources</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Manage live resources fetched from Python FastAPI backend</p>
            </div>

            <button className="btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
              <Plus size={18} />
              <span>Add Resource</span>
            </button>
          </div>

          {/* ADD ITEM FORM EXPANDABLE */}
          {showAddForm && (
            <form onSubmit={handleCreateItem} className="glass-panel" style={{ padding: '20px', marginBottom: '24px', background: 'rgba(10, 13, 20, 0.7)', border: '1px solid var(--border-glow)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px', color: 'var(--accent-cyan)' }}>
                New Resource Entry
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Async SQLite Database"
                    value={formData.title} 
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select 
                    className="form-select"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Backend">Backend</option>
                    <option value="Frontend">Frontend</option>
                    <option value="Architecture">Architecture</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Description</label>
                <textarea 
                  className="form-textarea" 
                  rows="3"
                  placeholder="Describe the component feature or route specification..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Create Resource'}
                </button>
              </div>
            </form>
          )}

          {/* CATEGORY FILTER TABS */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: activeCategory === cat ? 'var(--accent-cyan)' : 'var(--border-glass)',
                  background: activeCategory === cat ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  color: activeCategory === cat ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  fontSize: '0.85rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* ITEMS GRID */}
          {loadingItems ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading resource items...
            </div>
          ) : filteredItems.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-glass)', borderRadius: '12px' }}>
              No items found in category "{activeCategory}".
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {filteredItems.map(item => (
                <div key={item.id} className="glass-panel glass-panel-interactive" style={{ padding: '20px', background: 'rgba(15, 23, 42, 0.4)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <span className={`tag ${getTagStyle(item.category)}`}>
                      {item.category}
                    </span>
                    <button className="btn-icon" onClick={() => handleDeleteItem(item.id)} title="Delete item">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <h4 style={{ fontSize: '1.05rem', fontWeight: '600', marginBottom: '8px' }}>{item.title}</h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>
                    {item.description}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-glass)', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                    <span>ID: #{item.id}</span>
                    <span>{item.created_at}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SYSTEM TELEMETRY / HEALTH INSPECTOR */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Terminal size={20} color="var(--accent-cyan)" />
            <h2 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Live API Telemetry</h2>
          </div>
          
          <pre className="font-mono" style={{ 
            background: '#07090e', 
            padding: '16px', 
            borderRadius: '10px', 
            border: '1px solid var(--border-glass)', 
            color: '#38bdf8', 
            fontSize: '0.85rem',
            overflowX: 'auto' 
          }}>
            {health ? JSON.stringify(health, null, 2) : '// FastAPI backend unreachable at http://127.0.0.1:8000/api/health'}
          </pre>
        </div>

      </div>

    </div>
  );
}
