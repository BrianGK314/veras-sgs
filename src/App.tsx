import React from 'react';
import { JobProvider, useJobContext } from './context/JobContext';
import { Header } from './components/layout/Header';
import { WorkList } from './components/work/WorkList';
import { ReviewList } from './components/review/ReviewList';
import { ReportsList } from './components/reports/ReportsList';
import { JobWorkspace } from './components/job/JobWorkspace';
import { Sparkles } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeView, activeJobId, toastMessage } = useJobContext();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#19241E]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 bg-[#0E241A] text-white rounded-lg shadow-lg border border-[#24523D] text-xs font-medium animate-in fade-in slide-in-from-top-2 duration-200">
          <Sparkles className="w-4 h-4 text-[#BCE3CB] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header with max 3 primary navigation items (Work · Review · Reports) & role switcher */}
      <Header />

      {/* Main Work Surface */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeJobId ? (
          <JobWorkspace />
        ) : activeView === 'work' ? (
          <WorkList />
        ) : activeView === 'review' ? (
          <ReviewList />
        ) : (
          <ReportsList />
        )}
      </main>

      {/* Mandatory Global Footer */}
      <footer className="veras-global-footer">Veras is a New Deployment Platfrom</footer>
    </div>
  );
};

export default function App() {
  return (
    <JobProvider>
      <MainContent />
    </JobProvider>
  );
}
