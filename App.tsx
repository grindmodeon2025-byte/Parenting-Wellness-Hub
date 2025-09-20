
import React, { useState, useCallback } from 'react';
import { View } from './types';
import Dashboard from './components/Dashboard';
import ParentingPlanner from './components/ParentingPlanner';
import MealPlanner from './components/MealPlanner';
import EmotionCheckin from './components/EmotionCheckin';
import AdminPanel from './components/AdminPanel';
import Header from './components/common/Header';
import Login from './components/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const MainApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const { logout, user } = useAuth();

  const navigateTo = useCallback((view: View) => {
    setCurrentView(view);
  }, []);

  const renderView = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return <Dashboard navigateTo={navigateTo} />;
      case View.PARENTING_PLANNER:
        return <ParentingPlanner navigateToDashboard={() => navigateTo(View.DASHBOARD)} />;
      case View.MEAL_PLANNER:
        return <MealPlanner navigateToDashboard={() => navigateTo(View.DASHBOARD)} />;
      case View.EMOTION_CHECKIN:
        return <EmotionCheckin navigateToDashboard={() => navigateTo(View.DASHBOARD)} />;
      case View.ADMIN_PANEL:
        if (user?.userType !== 'admin') {
            // If user is not an admin, redirect them to the dashboard
            return <Dashboard navigateTo={navigateTo} />;
        }
        return <AdminPanel navigateToDashboard={() => navigateTo(View.DASHBOARD)} />;
      default:
        return <Dashboard navigateTo={navigateTo} />;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800">
      <Header />
      <div className="absolute top-4 right-4">
        <button onClick={logout} className="bg-rose-500 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-rose-600 transition-colors">
          Logout
        </button>
      </div>
      <main className="p-4 sm:p-6 md:p-8">
        {renderView()}
      </main>
      <footer className="text-center p-4 text-slate-500 text-sm">
        <p>&copy; 2024 Parenting Wellness Hub. All rights reserved.</p>
      </footer>
    </div>
  );
}


const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // You might want a full-page loading spinner here
    return <div className="flex justify-center items-center min-h-screen"><div>Loading...</div></div>;
  }

  return isAuthenticated ? <MainApp /> : <Login />;
}

export default App;