import React, { useState } from 'react';
import { useHubData } from './hooks/useHubData.js';
import { LoadingView, ErrorView } from './components/StateViews.jsx';
import { Sidebar } from './components/Sidebar.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { AiInsight } from './pages/AiInsight.jsx';
import { DataNotes } from './pages/DataNotes.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';

export default function App() {
  const { status, data, error, retry } = useHubData();
  const [activePage, setActivePage] = useState('dashboard');

  if (status === 'loading') {
    return (
      <div className="app-layout" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <LoadingView />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="app-layout" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
        <ErrorView error={error} onRetry={retry} />
      </div>
    );
  }

  const { hubs, aiSummary, aiSummaryError, metrics } = data;

  // Format last updated timestamp if present in data
  let lastUpdatedText = null;
  if (metrics?.generated_at) {
    try {
      const date = new Date(metrics.generated_at);
      const timeStr = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      lastUpdatedText = `Last updated: ${timeStr} WIB`;
    } catch {
      lastUpdatedText = null;
    }
  }

  const pageTitles = {
    dashboard: 'Hub Dwell Monitor',
    'ai-insight': 'AI Operational Insight',
    'data-notes': 'Operational Data Notes'
  };

  return (
    <div className="app-layout">
      {/* Sidebar for Desktop & Bottom Nav for Mobile */}
      <Sidebar activePage={activePage} onSelectPage={setActivePage} />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <header className="page-header">
          <div className="page-header-left">
            <h1>{pageTitles[activePage]}</h1>
          </div>
          {lastUpdatedText && (
            <div className="last-updated">{lastUpdatedText}</div>
          )}
        </header>

        <main className="content-container">
          {activePage === 'dashboard' && (
            <ErrorBoundary name="DashboardPage">
              <Dashboard hubs={hubs} />
            </ErrorBoundary>
          )}
          {activePage === 'ai-insight' && (
            <ErrorBoundary name="AiInsightPage">
              <AiInsight
                aiSummary={aiSummary}
                aiSummaryError={aiSummaryError}
                onRetry={retry}
                hubs={hubs}
              />
            </ErrorBoundary>
          )}
          {activePage === 'data-notes' && (
            <ErrorBoundary name="DataNotesPage">
              <DataNotes />
            </ErrorBoundary>
          )}
        </main>
      </div>
    </div>
  );
}
