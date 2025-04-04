import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Register Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function VisitorChart() {
  // Set default dates (e.g., last 30 days)
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [endDate, setEndDate] = useState(new Date());
  const [groupBy, setGroupBy] = useState('daily');
  const [chartData, setChartData] = useState(null);
  const [visitorData, setVisitorData] = useState([]);

  // Helper to format the period based on grouping
  const formatPeriod = (period, group) => {
    // For weekly, assume period is in format "YYYYWW" (e.g., "202450")
    if (group === 'weekly') {
      const periodStr = period.toString();
      const year = periodStr.substring(0, 4);
      const week = periodStr.substring(4);
      return `Week ${week}, ${year}`;
    } else if (group === 'daily') {
      // For daily grouping, convert date string to locale format
      return new Date(period).toLocaleDateString();
    }
    // For monthly or yearly grouping, you can return the period as is or format it further if needed
    return period;
  };

  // Fetch data based on selected dates and grouping
  const fetchVisitorData = async () => {
    try {
      const res = await fetch(
        `https://api.museoningangeles.com/api/visitor-stats?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&groupBy=${groupBy}`
      );
      const data = await res.json();
      setVisitorData(data); // Save raw data for the list

      // Prepare chart data from the fetched data with formatted labels
      const labels = data.map(item => formatPeriod(item.period, groupBy));
      const visitors = data.map(item => item.visitors);
      setChartData({
        labels,
        datasets: [
          {
            label: 'Visitors',
            data: visitors,
            fill: false,
            backgroundColor: 'rgba(75,192,192,0.4)',
            borderColor: 'rgba(75,192,192,1)',
            tension: 0.1,
          },
        ],
      });
    } catch (error) {
      console.error('Error fetching visitor data:', error);
    }
  };

  // Re-fetch data when filters change
  useEffect(() => {
    fetchVisitorData();
  }, [startDate, endDate, groupBy]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Visitor Logs</h2>
      <div className="bg-white shadow rounded p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">Start Date</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              className="mt-1 block border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">End Date</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              className="mt-1 block border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">Group By</label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="mt-1 block border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>
        {chartData ? (
          <div className="h-96">
            <Line data={chartData} options={{ maintainAspectRatio: false }} />
          </div>
        ) : (
          <p className="text-gray-600">Loading chart data...</p>
        )}
      </div>
      <div className="bg-white shadow rounded p-4">
        <h3 className="text-xl font-semibold mb-4">Visitor Data List</h3>
        {visitorData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visitors</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {visitorData.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPeriod(item.period, groupBy)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.visitors}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600">No visitor data available for the selected date range.</p>
        )}
      </div>
    </div>
  );
}

export default VisitorChart;
