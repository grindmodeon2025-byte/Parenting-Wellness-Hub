
import React, { useState } from 'react';
import type { EmotionCheckinRecord, AIGeneratedEmotionSupport } from '../types';
import { generateEmotionSupport } from '../services/geminiService';
import Button from './common/Button';
import LoadingSpinner from './common/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';

interface EmotionCheckinProps {
  navigateToDashboard: () => void;
}

const moods = [
  { name: 'Happy', emoji: '😊' },
  { name: 'Calm', emoji: '😌' },
  { name: 'Tired', emoji: '😴' },
  { name: 'Stressed', emoji: '😩' },
  { name: 'Overwhelmed', emoji: '🤯' },
  { name: 'Grateful', emoji: '🙏' },
];

const EmotionCheckin: React.FC<EmotionCheckinProps> = ({ navigateToDashboard }) => {
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [supportContent, setSupportContent] = useState<AIGeneratedEmotionSupport | null>(null);
  const [history, setHistory] = useState<EmotionCheckinRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleMoodSelect = async (mood: string) => {
    if (!user) {
        setError("User not found. Please log in again.");
        return;
    }
    setSelectedMood(mood);
    setIsLoading(true);
    setSupportContent(null);
    setError('');
    try {
      const result = await generateEmotionSupport(mood);
      if (result) {
        setSupportContent(result);
        const newRecord: EmotionCheckinRecord = {
          CheckinID: new Date().toISOString(),
          UserID: user.UserID,
          CheckinDate: new Date().toLocaleString(),
          Mood: mood,
          ...result,
        };
        setHistory(prev => [newRecord, ...prev]);
      } else {
        setError('Could not generate support content at this time.');
      }
    } catch (e) {
      setError('An error occurred while fetching your support content.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Emotion Check-in</h2>
        <Button onClick={navigateToDashboard} variant="ghost">Back to Dashboard</Button>
      </div>

      <div className="p-4 bg-rose-50 rounded-lg border border-rose-100 mb-6">
        <h3 className="text-lg font-semibold text-rose-800 mb-3 text-center">How are you feeling today?</h3>
        <div className="flex flex-wrap justify-center gap-3">
          {moods.map(mood => (
            <button
              key={mood.name}
              onClick={() => handleMoodSelect(mood.name)}
              disabled={isLoading}
              className={`p-3 px-4 rounded-full flex items-center gap-2 transition-colors border-2 ${selectedMood === mood.name ? 'bg-rose-500 text-white border-rose-500' : 'bg-white hover:bg-rose-100 border-rose-200'}`}
            >
              <span className="text-2xl">{mood.emoji}</span>
              <span className="font-medium">{mood.name}</span>
            </button>
          ))}
        </div>
      </div>
      
      {isLoading && <LoadingSpinner />}
      {error && <p className="text-red-500 text-center my-4">{error}</p>}
      
      {supportContent && (
        <div className="my-6 space-y-4 animate-fade-in">
            <SupportCard title="✨ Your Affirmation" content={supportContent.Affirmation} />
            <SupportCard title="🧘‍♀️ A Quick Stress Relief Exercise" content={supportContent.StressReliefExercise} />
            <SupportCard title="📣 A Little Pep Talk" content={supportContent.PepTalk} />
        </div>
      )}

      {history.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mt-8 mb-4 border-b pb-2">Your Check-in History</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {history.map(record => (
              <div key={record.CheckinID} className="p-4 bg-slate-50 rounded-lg">
                <p className="font-semibold">{record.Mood} Check-in</p>
                <p className="text-slate-600 italic mt-1">"{record.Affirmation}"</p>
                <p className="text-xs text-slate-400 text-right mt-2">{record.CheckinDate}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SupportCard: React.FC<{title: string, content: string}> = ({title, content}) => (
    <div className="p-4 bg-teal-50 border-l-4 border-teal-400 rounded-r-lg">
        <h4 className="font-bold text-teal-800 mb-1">{title}</h4>
        <p className="text-teal-900">{content}</p>
    </div>
)

export default EmotionCheckin;
