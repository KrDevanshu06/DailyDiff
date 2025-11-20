import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';

type ViewState = 'landing' | 'dashboard';

function App() {
  const [view, setView] = useState<ViewState>('landing');

  return (
    <>
      {view === 'landing' ? (
        <LandingPage onLogin={() => setView('dashboard')} />
      ) : (
        <Dashboard onLogout={() => setView('landing')} />
      )}
    </>
  );
}

export default App;