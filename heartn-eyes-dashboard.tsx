import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const HeartNEyesDashboard = () => {
  // Mock data
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  
  // Streaming activity data
  const streamingData = {
    week: [
      { day: 'Mon', minutes: 45, viewers: 128 },
      { day: 'Tue', minutes: 30, viewers: 96 },
      { day: 'Wed', minutes: 60, viewers: 215 },
      { day: 'Thu', minutes: 20, viewers: 64 },
      { day: 'Fri', minutes: 75, viewers: 327 },
      { day: 'Sat', minutes: 90, viewers: 482 },
      { day: 'Sun', minutes: 50, viewers: 175 },
    ],
    month: [
      { day: 'Week 1', minutes: 210, viewers: 850 },
      { day: 'Week 2', minutes: 180, viewers: 720 },
      { day: 'Week 3', minutes: 270, viewers: 1250 },
      { day: 'Week 4', minutes: 310, viewers: 1450 },
    ],
    year: [
      { day: 'Jan', minutes: 840, viewers: 3800 },
      { day: 'Feb', minutes: 920, viewers: 4200 },
      { day: 'Mar', minutes: 1100, viewers: 5100 },
      { day: 'Apr', minutes: 960, viewers: 4500 },
      { day: 'May', minutes: 1250, viewers: 6200 },
      { day: 'Jun', minutes: 1400, viewers: 7100 },
    ]
  };
  
  // Battery stats
  const batteryData = [
    { name: 'Recording', value: 45 },
    { name: 'Streaming', value: 30 },
    { name: 'Standby', value: 20 },
    { name: 'Other', value: 5 },
  ];
  
  // Storage usage
  const storageData = [
    { name: 'Used', value: 18.4 },
    { name: 'Free', value: 13.6 },
  ];
  
  // Color schemes
  const BATTERY_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];
  const STORAGE_COLORS = ['#0088FE', '#BBBBBB'];
  
  // System health stats
  const systemHealth = {
    firmware: 'v2.1.3',
    lastUpdate: '2024-12-15',
    temperature: '37.2°C',
    connectionStrength: '92%',
    latency: '22ms',
    errorRate: '0.02%',
  };
  
  // Recent recordings
  const recentRecordings = [
    { id: 'rec-001', title: 'Morning Walk', duration: '22:45', date: '2025-03-12', views: 342 },
    { id: 'rec-002', title: 'City Tour', duration: '48:12', date: '2025-03-10', views: 1205 },
    { id: 'rec-003', title: 'Conference Talk', duration: '32:18', date: '2025-03-07', views: 867 },
    { id: 'rec-004', title: 'Beach Sunset', duration: '15:33', date: '2025-03-05', views: 523 },
  ];
  
  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">HEART'N'EYES Dashboard</h1>
        <p className="text-sm">Monitoring and analytics for your smart contact lens</p>
      </div>
      
      {/* System Status */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-sm font-medium text-gray-500">Device Status</h3>
            <div className="flex items-center mt-2">
              <div className="h-4 w-4 rounded-full bg-green-500 mr-2"></div>
              <p className="text-xl font-semibold">Connected</p>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-sm font-medium text-gray-500">Battery Level</h3>
            <div className="flex items-center mt-2">
              <div className="relative w-8 h-4 bg-gray-200 rounded mr-2">
                <div className="absolute top-0 left-0 h-4 rounded bg-green-500" style={{ width: '75%' }}></div>
              </div>
              <p className="text-xl font-semibold">75%</p>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-sm font-medium text-gray-500">Storage Used</h3>
            <div className="flex items-center mt-2">
              <div className="relative w-8 h-4 bg-gray-200 rounded mr-2">
                <div className="absolute top-0 left-0 h-4 rounded bg-blue-500" style={{ width: '57%' }}></div>
              </div>
              <p className="text-xl font-semibold">18.4 GB / 32 GB</p>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-sm font-medium text-gray-500">Temperature</h3>
            <div className="flex items-center mt-2">
              <p className="text-xl font-semibold">{systemHealth.temperature}</p>
              <span className="ml-2 px-2 py-1 text-xs rounded bg-green-100 text-green-800">Normal</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Usage Charts */}
      <div className="px-4 mb-6">
        <div className="mb-4 bg-white p-4 rounded shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Streaming Activity</h2>
            <div className="flex space-x-2">
              <button 
                onClick={() => setSelectedTimeframe('week')}
                className={`px-3 py-1 rounded ${selectedTimeframe === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              >
                Week
              </button>
              <button 
                onClick={() => setSelectedTimeframe('month')}
                className={`px-3 py-1 rounded ${selectedTimeframe === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              >
                Month
              </button>
              <button 
                onClick={() => setSelectedTimeframe('year')}
                className={`px-3 py-1 rounded ${selectedTimeframe === 'year' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              >
                Year
              </button>
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={streamingData[selectedTimeframe]}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="minutes" stroke="#8884d8" name="Stream Minutes" />
                <Line yAxisId="right" type="monotone" dataKey="viewers" stroke="#82ca9d" name="Viewers" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">Battery Usage</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={batteryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {batteryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={BATTERY_COLORS[index % BATTERY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">Storage Usage</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={storageData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name} ${value} GB`}
                  >
                    {storageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STORAGE_COLORS[index % STORAGE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
      
      {/* System Information */}
      <div className="px-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">System Information</h2>
          <div className="