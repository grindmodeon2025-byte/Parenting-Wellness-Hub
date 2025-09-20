
import React, { useState, useRef, useEffect } from 'react';
import { AIGeneratedPlan } from '../types';
import Button from './common/Button';
import LoadingSpinner from './common/LoadingSpinner';
import { generateParentingPlan } from '../services/geminiService';
import { useAuth } from '../contexts/AuthContext';

interface ParentingPlannerProps {
  navigateToDashboard: () => void;
}

const ParentingPlanner: React.FC<ParentingPlannerProps> = ({ navigateToDashboard }) => {
  const { user } = useAuth();
  const [birthDate, setBirthDate] = useState('');
  const [plan, setPlan] = useState<AIGeneratedPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const printableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.BabyBirthDate) {
      setBirthDate(user.BabyBirthDate);
    }
  }, [user]);

  const handleGeneratePlan = async () => {
    if (!birthDate) {
      setError('Birth date is not available from your profile.');
      return;
    }
    setError('');
    setIsLoading(true);
    setPlan(null);
    try {
      const result = await generateParentingPlan(birthDate);
      if (result) {
        setPlan(result);
      } else {
        setError('Failed to generate a plan. The AI service may be unavailable.');
      }
    } catch (e) {
      setError('An unexpected error occurred.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=800,width=800');
    if (printWindow && printableRef.current) {
        printWindow.document.write('<html><head><title>Parenting Plan</title>');
        printWindow.document.write('<script src="https://cdn.tailwindcss.com"></script>');
        printWindow.document.write('</head><body class="p-8">');
        printWindow.document.write(printableRef.current.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    }
  };


  return (
    <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">AI Parenting Planner</h2>
        <Button onClick={navigateToDashboard} variant="ghost">Back to Dashboard</Button>
      </div>
      
      <div className="space-y-4 mb-6 p-4 bg-rose-50 rounded-lg border border-rose-100">
        <label htmlFor="birthDate" className="block text-lg font-semibold text-rose-800">Baby's Birth Date</label>
        <p className="text-rose-700">Your baby's date of birth from your profile is used to generate a personalized daily routine for their current developmental stage.</p>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
            <input
            type="date"
            id="birthDate"
            value={birthDate}
            readOnly
            className="w-full sm:w-auto p-2 border border-rose-300 rounded-lg bg-rose-100 cursor-not-allowed"
            />
            <Button onClick={handleGeneratePlan} disabled={isLoading || !birthDate} variant="secondary">
            {isLoading ? 'Generating...' : 'Generate Plan'}
            </Button>
        </div>
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>

      {isLoading && <LoadingSpinner />}

      {plan && (
        <div className="animate-fade-in">
          <div className="flex justify-end gap-2 mb-4">
              <Button onClick={handlePrint} variant="ghost">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                Print / Save as PDF
              </Button>
          </div>
          <div ref={printableRef} className="printable-content space-y-6">
            <h3 className="text-2xl font-bold text-center border-b pb-2 mb-4">Personalized Daily Routine</h3>
            <div id="plan-content">
                <PlanSection title="Feeding Routine" items={plan.FeedingRoutine} icon="🍼" />
                <PlanSection title="Sleeping Routine" items={plan.SleepingRoutine} icon="😴" />
                <PlanSection title="Playtime Routine" items={plan.PlaytimeRoutine} icon="🧸" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface PlanSectionProps {
    title: string;
    items: string[];
    icon: string;
}

const PlanSection: React.FC<PlanSectionProps> = ({ title, items, icon }) => (
    <div className="mb-6 p-4 bg-slate-50 rounded-lg">
        <h4 className="text-xl font-semibold mb-3 text-teal-700 flex items-center">{icon} <span className="ml-2">{title}</span></h4>
        <ul className="list-disc list-inside space-y-2 text-slate-600">
            {items.map((item, index) => <li key={index}>{item}</li>)}
        </ul>
    </div>
);


export default ParentingPlanner;
