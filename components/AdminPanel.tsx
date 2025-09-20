import React, { useRef, useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import Button from './common/Button';
import { downloadCSV } from '../utils/csv';
import { mockSheetService } from '../services/mockGoogleSheetService';

interface AdminPanelProps {
  navigateToDashboard: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ navigateToDashboard }) => {
  const printableRef = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState({ activeUsers: 0, newSignups: 0, mealPlansGenerated: 0, interactions: 0 });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const dashboardData = await mockSheetService.getDashboardStats();
      setStats(dashboardData.summaryStats);
      setChartData(dashboardData.interactionData);
    };
    fetchData();
  }, []);

  const handleDownloadData = async (sheetName: string) => {
    try {
      const csvData = await mockSheetService.getSheetAsCSV(sheetName);
      downloadCSV(csvData, `${sheetName}_Data.csv`);
    } catch (error) {
      console.error(`Failed to download ${sheetName} data:`, error);
      alert(`Could not download data for ${sheetName}.`);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=800,width=800');
    if (printWindow && printableRef.current) {
        printWindow.document.write('<html><head><title>Admin Dashboard Report</title>');
        printWindow.document.write('<script src="https://cdn.tailwindcss.com"></script>');
        printWindow.document.write('</head><body class="p-8">');
        printWindow.document.write(printableRef.current.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    }
  };


  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Admin Panel</h2>
        <div className="flex gap-2">
            <Button onClick={handlePrint} variant="ghost">Export to PDF</Button>
            <Button onClick={navigateToDashboard} variant="ghost">Back to Dashboard</Button>
        </div>
      </div>

    <div ref={printableRef} className="printable-content bg-white p-6 sm:p-8 rounded-xl shadow-md">
      {/* Summary Stats */}
      <h3 className="text-xl font-bold mb-4">Summary Statistics</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Active Users" value={stats.activeUsers} />
        <StatCard title="New Signups (24h)" value={stats.newSignups} />
        <StatCard title="Meal Plans Generated" value={stats.mealPlansGenerated} />
        <StatCard title="Total Interactions" value={stats.interactions} />
      </div>

      {/* Interactions Chart */}
      <h3 className="text-xl font-bold mb-4">Interactions per Module</h3>
      <div className="w-full h-80 bg-slate-50 p-4 rounded-lg">
        <ResponsiveContainer>
            <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="interactions" fill="#14b8a6" />
            </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Download Templates */}
      <h3 className="text-xl font-bold mt-8 mb-4">Download Google Sheet Data</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Button onClick={() => handleDownloadData('Users')} variant="secondary">Users</Button>
        <Button onClick={() => handleDownloadData('ParentingPlanner')} variant="secondary">Planner</Button>
        <Button onClick={() => handleDownloadData('MealPlans')} variant="secondary">Meal Plans</Button>
        <Button onClick={() => handleDownloadData('Recipes')} variant="secondary">Recipes</Button>
        <Button onClick={() => handleDownloadData('EmotionCheckins')} variant="secondary">Check-ins</Button>
        <Button onClick={() => handleDownloadData('ProductAvailability')} variant="secondary">Products</Button>
      </div>
      
      {/* Google Sheets Link */}
      <h3 className="text-xl font-bold mt-8 mb-4">Google Sheets Integration</h3>
      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
        <p className="text-slate-700 mb-2">
            Use the following link to access and manage the master <strong>users_data</strong> Google Sheet for automating user registration details.
        </p>
        <a 
            href="https://docs.google.com/spreadsheets/d/1aKYxQzEX_cXicoQTsZpRTSLqH6dFhJlz_MOCK_SHEET/edit#gid=0" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-semibold text-teal-600 hover:underline break-all"
        >
            https://docs.google.com/spreadsheets/d/1aKYxQzEX_cXicoQTsZpRTSLqH6dFhJlz_MOCK_SHEET/edit#gid=0
        </a>
      </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: number | string }> = ({ title, value }) => (
  <div className="bg-teal-50 p-4 rounded-lg border border-teal-100">
    <p className="text-sm text-teal-700">{title}</p>
    <p className="text-3xl font-bold text-teal-900">{value}</p>
  </div>
);

export default AdminPanel;