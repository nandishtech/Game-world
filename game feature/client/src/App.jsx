import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Settings, FileCode, CheckCircle2, AlertTriangle, 
  Terminal, Download, Eye, RefreshCw, X, Folder, File, ChevronRight, ChevronDown 
} from 'lucide-react';

const backendHost = window.location.origin.includes('5173') ? 'http://localhost:5000' : '';

const defaultPhaseLogs = {
  analyzer: { title: 'Game Analyzer', desc: 'Decoding mechanics, state layouts and win conditions...', status: 'idle', detail: '' },
  generator: { title: 'Architecture Builder', desc: 'Procedurally generating game source files...', status: 'idle', detail: '' },
  validator: { title: 'Sandbox Validator', desc: 'Running test runner inside node validation sandbox...', status: 'idle', detail: '' },
  packer: { title: 'Project Archiver', desc: 'Compiling project zip file archive...', status: 'idle', detail: '' }
};

const themeColorPresets = {
  purple: { label: 'AMETHYST', primary: '#a855f7', glow: 'rgba(168, 85, 247, 0.25)', dim: 'rgba(168, 85, 247, 0.05)' },
  emerald: { label: 'EMERALD', primary: '#10b981', glow: 'rgba(16, 185, 129, 0.25)', dim: 'rgba(16, 185, 129, 0.05)' },
  indigo: { label: 'SAPPHIRE', primary: '#6366f1', glow: 'rgba(99, 102, 241, 0.25)', dim: 'rgba(99, 102, 241, 0.05)' },
  rose: { label: 'CRIMSON', primary: '#f43f5e', glow: 'rgba(244, 63, 94, 0.25)', dim: 'rgba(244, 63, 94, 0.05)' }
};

export default function App() {
  const [activeScreen, setActiveScreen] = useState('home'); // 'home' | 'generating' | 'workspace'
  const [gameName, setGameName] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  
  // Settings State
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('api_key') || '');
  const [apiType, setApiType] = useState(() => localStorage.getItem('api_type') || 'gemini');
  const [themeColor, setThemeColor] = useState(() => localStorage.getItem('theme_color') || 'purple');

  // Generator Pipeline States
  const [phaseLogs, setPhaseLogs] = useState(defaultPhaseLogs);
  const [consoleLogs, setConsoleLogs] = useState('');
  const consoleBottomRef = useRef(null);

  // Workspace Generated Metadata
  const [metadata, setMetadata] = useState(null);
  const [selectedFilePath, setSelectedFilePath] = useState('');
  const [selectedFileContent, setSelectedFileContent] = useState('');
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'preview' | 'specs'

  // Apply visual colors on mount and color changes
  useEffect(() => {
    const preset = themeColorPresets[themeColor];
    if (preset) {
      const root = document.documentElement;
      root.style.setProperty('--primary', preset.primary);
      root.style.setProperty('--primary-glow', preset.glow);
      root.style.setProperty('--primary-dim', preset.dim);
    }
  }, [themeColor]);

  // Autoscroll console logs
  useEffect(() => {
    if (consoleBottomRef.current) {
      consoleBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [consoleLogs]);

  const saveSettings = (key, type, col) => {
    setApiKey(key);
    setApiType(type);
    setThemeColor(col);
    localStorage.setItem('api_key', key);
    localStorage.setItem('api_type', type);
    localStorage.setItem('theme_color', col);
    setShowSettings(false);
  };

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!gameName.trim()) return;

    setActiveScreen('generating');
    setConsoleLogs('');
    setPhaseLogs(JSON.parse(JSON.stringify(defaultPhaseLogs))); // reset to default values

    try {
      const response = await fetch(`${backendHost}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameName: gameName.trim(),
          apiKey,
          apiType,
          options: { themeColor: themeColorPresets[themeColor].primary }
        })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value);
        const lines = buffer.split('\n\n');
        buffer = lines.pop(); // Keep partial line

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const rawData = line.substring(6);
            try {
              const parsed = JSON.parse(rawData);
              const { phase, status, detail, data } = parsed;

              if (phase === 'console') {
                setConsoleLogs(prev => prev + (data?.logs || ''));
              } else if (phase === 'complete') {
                setMetadata(data);
                // Load default first file in explorer if available
                if (data.fileTree && data.fileTree.length > 0) {
                  const firstFile = findFirstFileNode(data.fileTree);
                  if (firstFile) {
                    loadFileContent(data.sessionId, firstFile.path);
                  }
                }
                setActiveScreen('workspace');
              } else {
                setPhaseLogs(prev => ({
                  ...prev,
                  [phase]: {
                    ...prev[phase],
                    status,
                    detail: detail || prev[phase].detail
                  }
                }));
              }
            } catch (err) {
              console.error("Failed to parse log line:", rawData, err);
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      alert('Generation pipeline crashed: ' + err.message);
      setActiveScreen('home');
    }
  };

  const findFirstFileNode = (nodes) => {
    for (const node of nodes) {
      if (node.type === 'file') return node;
      if (node.children) {
        const found = findFirstFileNode(node.children);
        if (found) return found;
      }
    }
    return null;
  };

  const loadFileContent = async (sessionId, filePath) => {
    try {
      setSelectedFilePath(filePath);
      const res = await fetch(`${backendHost}/api/file-content?sessionId=${sessionId}&filePath=${encodeURIComponent(filePath)}`);
      if (res.ok) {
        const content = await res.text();
        setSelectedFileContent(content);
      } else {
        setSelectedFileContent('// File not found inside workspace');
      }
    } catch (err) {
      console.error(err);
      setSelectedFileContent('// Failed to read file content');
    }
  };

  const selectSuggestion = (name) => {
    setGameName(name);
    // Auto trigger generate
    setTimeout(() => {
      const searchBox = document.querySelector('.search-input');
      if (searchBox) searchBox.focus();
    }, 50);
  };

  return (
    <div className="app-container">
      {/* HEADER SECTION */}
      <nav className="navbar">
        <div className="logo-section">
          <FileCode size={28} className="logo-icon" />
          <span className="logo-text">GAME BUILDER</span>
        </div>
        <div className="nav-actions">
          <button className="action-btn-neon sub" onClick={() => setShowSettings(true)}>
            <Settings size={18} />
            SETTINGS
          </button>
        </div>
      </nav>

      {/* WORKSPACE VIEW WRAPPER */}
      <main className="main-content">
        
        {/* SCREEN 1: HOME PANEL */}
        {activeScreen === 'home' && (
          <div className="home-hero">
            <h2 className="hero-title">GAME SOURCE GENERATOR</h2>
            <p className="hero-subtitle">
              Generate fully playable, legally compliant retro game source code codebases, tests and configurations instantly.
            </p>
            
            <form className="generator-search-box" onSubmit={handleGenerate}>
              <div className="search-input-wrapper">
                <Play size={20} className="search-icon" />
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="Enter game name (e.g. Chess, Ludo, Snake...)"
                  value={gameName}
                  onChange={(e) => setGameName(e.target.value)}
                />
                <button type="submit" className="generate-btn">
                  GENERATE GAME
                </button>
              </div>
            </form>

            <div className="suggestions-container">
              <span className="suggestions-title">PRESET GAMES</span>
              <div className="suggestions-grid">
                {['Chess', 'Ludo', 'Snake', 'Flappy Bird', 'Sudoku', 'Memory Game'].map(name => (
                  <button key={name} className="suggest-tag" onClick={() => selectSuggestion(name)}>
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 2: PIPELINE LOADER PANEL */}
        {activeScreen === 'generating' && (
          <div className="pipeline-container">
            {/* Steps panel */}
            <div className="pipeline-card">
              <h3 className="pipeline-title">COMPILING WORKSPACE</h3>
              <div className="steps-list">
                {Object.entries(phaseLogs).map(([key, value]) => (
                  <div key={key} className={`step-item ${value.status}`}>
                    <div className="step-icon-wrapper">
                      {value.status === 'success' && <CheckCircle2 size={16} />}
                      {value.status === 'failure' && <AlertTriangle size={16} />}
                      {value.status === 'running' && <RefreshCw size={16} className="spin" />}
                      {value.status === 'idle' && <div style={{width: 8, height: 8, background: '#3f3f46', borderRadius: '50%'}}></div>}
                    </div>
                    <div className="step-details">
                      <span className="step-name">{value.title}</span>
                      <span className="step-desc">{value.detail || value.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Console Log Panel */}
            <div className="console-box">
              <div className="console-header">
                <span className="console-title-text">
                  <Terminal size={16} />
                  SANDBOX CONSOLE LOGS
                </span>
              </div>
              <div className="console-body">
                {consoleLogs || 'Initializing compiler validation sequence...'}
                <div ref={consoleBottomRef} />
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 3: GENERATED WORKSPACE VIEW */}
        {activeScreen === 'workspace' && metadata && (
          <div className="workspace-grid">
            
            {/* 1. LEFT FILE EXPLORER */}
            <div className="panel">
              <div className="explorer-header">PROJECT EXPLORER</div>
              <div className="explorer-tree">
                {metadata.fileTree && renderFileTree(metadata.fileTree, metadata.sessionId, selectedFilePath, loadFileContent)}
              </div>
            </div>

            {/* 2. CENTER PANEL FOR TABS (CODE / PREVIEW / SPECS) */}
            <div className="panel" style={{gridColumn: 'span 1'}}>
              <div className="tab-header">
                <button 
                  className={`tab-btn ${activeTab === 'editor' ? 'active' : ''}`}
                  onClick={() => setActiveTab('editor')}
                >
                  <FileCode size={16} />
                  SOURCE EDITOR
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('preview')}
                >
                  <Eye size={16} />
                  LIVE PREVIEW
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
                  onClick={() => setActiveTab('specs')}
                >
                  <Terminal size={16} />
                  GAME SPECS
                </button>
              </div>

              <div className="tab-content">
                {activeTab === 'editor' && (
                  <div className="code-editor-container">
                    <div className="line-numbers">
                      {selectedFileContent.split('\n').map((_, idx) => (
                        <div key={idx}>{idx + 1}</div>
                      ))}
                    </div>
                    <div className="editor-textarea" contentEditable={false} spellCheck={false}>
                      {selectedFileContent || '// Click a file in the explorer tree to view code'}
                    </div>
                  </div>
                )}

                {activeTab === 'preview' && (
                  <div className="preview-wrapper">
                    <iframe 
                      className="preview-iframe"
                      src={`${backendHost}${metadata.previewUrl}`}
                      title="Game Live Sandbox"
                    />
                  </div>
                )}

                {activeTab === 'specs' && (
                  <div className="specs-tab-view">
                    <div className="specs-block">
                      <h4 className="specs-block-title">Rules & Mechanics</h4>
                      <ul className="specs-list">
                        {metadata.spec?.rules?.map((r, i) => <li key={i}>{r}</li>) || <li>No rules listed</li>}
                      </ul>
                    </div>
                    <div className="specs-block">
                      <h4 className="specs-block-title">Win Conditions</h4>
                      <p style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>{metadata.spec?.winCondition || 'No Win Condition specified'}</p>
                    </div>
                    <div className="specs-block">
                      <h4 className="specs-block-title">Deployment Guide</h4>
                      <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6'}}>
                        This project is prepared with fully reusable static files. To deploy the frontend, drag and drop the files into Netlify, Vercel, or GitHub Pages. The tests are runnable locally with <code>npm test</code>.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3. RIGHT PANEL DOWNLOADS */}
            <div className="panel details-panel">
              <h3 className="explorer-header" style={{padding: 0, borderBottom: 'none'}}>GAME SUMMARY</h3>
              
              <div className="details-section">
                <span className="details-title">SPECIFICATION METRICS</span>
                <div className="spec-grid">
                  <div className="spec-row">
                    <span className="spec-label">Genre:</span>
                    <span className="spec-val">{metadata.spec?.genre || 'Arcade'}</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-label">Players Count:</span>
                    <span className="spec-val">{metadata.spec?.players || 1}P</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-label">Legal Status:</span>
                    <span className="spec-val" style={{color: '#10b981'}}>100% REUSABLE</span>
                  </div>
                </div>
              </div>

              <div className="details-section" style={{marginTop: 'auto', gap: '10px'}}>
                <a 
                  href={`${backendHost}${metadata.downloadUrl}`}
                  className="action-btn-neon"
                  style={{textDecoration: 'none'}}
                >
                  <Download size={18} />
                  DOWNLOAD COMPLETE ZIP
                </a>
                <button 
                  className="action-btn-neon sub"
                  onClick={() => setActiveScreen('home')}
                >
                  GENERATE NEW PROJECT
                </button>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* SETTINGS DIALOG MODAL */}
      {showSettings && (
        <SettingsModal 
          apiKey={apiKey}
          apiType={apiType}
          themeColor={themeColor}
          onClose={() => setShowSettings(false)}
          onSave={saveSettings}
        />
      )}
    </div>
  );
}

// Tree Node File node folder component helper
function renderFileTree(nodes, sessionId, selectedPath, onSelect) {
  return nodes.map(node => {
    if (node.type === 'directory') {
      return (
        <FolderNode 
          key={node.path}
          node={node}
          sessionId={sessionId}
          selectedPath={selectedPath}
          onSelect={onSelect}
        />
      );
    }
    const isActive = node.path === selectedPath;
    return (
      <div 
        key={node.path} 
        className={`tree-node file ${isActive ? 'active' : ''}`}
        onClick={() => onSelect(sessionId, node.path)}
      >
        <File size={14} style={{color: 'var(--primary)'}} />
        <span>{node.name}</span>
      </div>
    );
  });
}

function FolderNode({ node, sessionId, selectedPath, onSelect }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div key={node.path}>
      <div 
        className="tree-node dir"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <Folder size={14} style={{color: '#fbbf24'}} />
        <span>{node.name}</span>
      </div>
      {isOpen && node.children && (
        <div className="tree-node-children">
          {renderFileTree(node.children, sessionId, selectedPath, onSelect)}
        </div>
      )}
    </div>
  );
}

// SETTINGS DIALOG COMPONENT
function SettingsModal({ apiKey: currentKey, apiType: currentType, themeColor: currentTheme, onClose, onSave }) {
  const [key, setKey] = useState(currentKey);
  const [type, setType] = useState(currentType);
  const [theme, setTheme] = useState(currentTheme);

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <span className="modal-title">SYSTEM PREFERENCES</span>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>API MODEL ENGINE</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="gemini">Gemini Developer API (Recommended)</option>
              <option value="openai">OpenAI ChatGPT API</option>
            </select>
          </div>

          <div className="form-group">
            <label>API KEY CREDENTIAL</label>
            <input 
              type="password" 
              placeholder="Enter your API Key (AIzaSy... or sk-...)" 
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>SYSTEM COLOR SCHEME</label>
            <div className="theme-options-grid">
              {Object.entries(themeColorPresets).map(([keyName, item]) => {
                const isActive = theme === keyName;
                return (
                  <button 
                    key={keyName}
                    className="theme-color-select"
                    style={{ 
                      borderColor: isActive ? item.primary : '#2d2d3f',
                      color: isActive ? item.primary : '#a1a1aa'
                    }}
                    onClick={() => setTheme(keyName)}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <button 
          className="action-btn-neon" 
          onClick={() => onSave(key, type, theme)}
          style={{marginTop: '10px'}}
        >
          APPLY SETTINGS
        </button>
      </div>
    </div>
  );
}
