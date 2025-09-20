
import React from 'react';
import { View } from '../types';
import Card from './common/Card';
import { useAuth } from '../contexts/AuthContext';

interface DashboardProps {
  navigateTo: (view: View) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ navigateTo }) => {
  const { user } = useAuth();

  const allFeatures = [
    {
      view: View.PARENTING_PLANNER,
      title: 'AI Parenting Planner',
      description: 'Get a dynamic daily routine for your baby based on their age.',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
    },
    {
      view: View.MEAL_PLANNER,
      title: 'AI Meal & Nutrition',
      description: 'Generate weekly meal plans with local food suggestions.',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    },
    {
      view: View.EMOTION_CHECKIN,
      title: 'Emotion Check-in',
      description: 'Track your mood and receive positive affirmations.',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    },
    {
      view: View.ADMIN_PANEL,
      title: 'Admin Panel',
      description: 'View statistics and manage application data.',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
      adminOnly: true,
    },
  ];

  const features = allFeatures.filter(feature => !feature.adminOnly || (feature.adminOnly && user?.userType === 'admin'));

  return (
    <div className="max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-2 text-center">Welcome, {user?.Name}!</h2>
      <p className="text-slate-600 text-center mb-6">What would you like to do today?</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature) => (
          <Card
            key={feature.view}
            title={feature.title}
            description={feature.description}
            icon={feature.icon}
            onClick={() => navigateTo(feature.view)}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
