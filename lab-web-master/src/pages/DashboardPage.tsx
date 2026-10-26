import { UsersIcon, BeakerIcon, CubeIcon, ClockIcon, ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const statsCards = [
  { name: 'Total Customers', value: '120', icon: UsersIcon, color: 'bg-blue-500' },
  { name: 'Total Tests', value: '450', icon: BeakerIcon, color: 'bg-purple-500' },
  { name: 'Total Products', value: '89', icon: CubeIcon, color: 'bg-green-500' },
];

const testStatusCards = [
  { name: 'Todo', value: '45', icon: ClockIcon, color: 'bg-yellow-500' },
  { name: 'In Progress', value: '28', icon: ArrowPathIcon, color: 'bg-blue-500' },
  { name: 'Completed', value: '67', icon: CheckCircleIcon, color: 'bg-green-500' },
];

const chartData = {
  labels: ['Pending', 'In Progress', 'Completed'],
  datasets: [
    {
      data: [45, 28, 67],
      backgroundColor: ['#EAB308', '#3B82F6', '#22C55E'],
      borderColor: ['#FEF9C3', '#DBEAFE', '#DCFCE7'],
      borderWidth: 1,
    },
  ],
};

export const DashboardPage = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      
      {/* Main Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {statsCards.map((card) => (
          <div key={card.name} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{card.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Test Status Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {testStatusCards.map((card) => (
          <div key={card.name} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{card.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Test Status Distribution</h2>
        <div className="w-full max-w-md mx-auto h-64">
          <Doughnut 
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};