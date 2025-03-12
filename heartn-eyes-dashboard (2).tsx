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
      { day: 'Sun', minutes: 50, viewers: 175 }
    ],
    month: [
      { day: 'Week 1', minutes: 210, viewers: 850 },
      { day: 'Week 2', minutes: 180, viewers: 720 },
      { day: 'Week 3', minutes: 270, viewers: 1250 },
      { day: 'Week 4', minutes: 310, viewers: 1450 }
    ],
    year: [
      { day: 'Jan', minutes: 840, viewers: 3800 },
      { day: 'Feb', minutes: 920, viewers: 4200 },
      { day: 'Mar', minutes: 1100, viewers: 5100 },
      { day: 'Apr', minutes: 960, viewers: 4500 },
      { day: 'May', minutes: 1250, viewers: 6200 },
      { day: 'Jun', minutes: 1400, viewers: 7100 }
    ]
  };
  
  // Battery stats
  const batteryData = [
    { name: 'Recording', value: 45 },
    { name: 'Streaming', value: 30 },
    { name: 'Standby', value: 20 },
    { name: 'Other', value: 5 }
  ];
  
  // Storage usage
  const storageData = [
    { name: 'Used', value: 18.4 },
    { name: 'Free', value: 13.6 }
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
    errorRate: '0.02%'
  };
  
  // Recent recordings
  const recentRecordings = [
    { id: 'rec-001', title: 'Morning Walk', duration: '22:45', date: '2025-03-12', views: 342 },
    { id: 'rec-002', title: 'City Tour', duration: '48:12', date: '2025-03-10', views: 1205 },
    { id: 'rec-003', title: 'Conference Talk', duration: '32:18', date: '2025-03-07', views: 867 },
    { id: 'rec-004', title: 'Beach Sunset', duration: '15:33', date: '2025-03-05', views: 523 }
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Firmware Version</p>
              <p className="font-medium">{systemHealth.firmware}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Update</p>
              <p className="font-medium">{systemHealth.lastUpdate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Connection Strength</p>
              <p className="font-medium">{systemHealth.connectionStrength}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Latency</p>
              <p className="font-medium">{systemHealth.latency}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Error Rate</p>
              <p className="font-medium">{systemHealth.errorRate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Device ID</p>
              <p className="font-medium">HNE-27182818</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Recordings */}
      <div className="px-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Recent Recordings</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentRecordings.map((recording) => (
                  <tr key={recording.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{recording.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{recording.duration}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{recording.date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{recording.views}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800">View</button>
                        <button className="text-green-600 hover:text-green-800">Share</button>
                        <button className="text-red-600 hover:text-red-800">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
              <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-full text-blue-600 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <span className="text-sm font-medium">Start Recording</span>
            </button>
            
            <button className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition">
              <div className="w-12 h-12 flex items-center justify-center bg-purple-100 rounded-full text-purple-600 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-sm font-medium">Go Live</span>
            </button>
            
            <button className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition">
              <div className="w-12 h-12 flex items-center justify-center bg-green-100 rounded-full text-green-600 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium">Settings</span>
            </button>
            
            <button className="flex flex-col items-center justify-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition">
              <div className="w-12 h-12 flex items-center justify-center bg-yellow-100 rounded-full text-yellow-600 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <span className="text-sm font-medium">Sync Data</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="bg-white px-4 py-3 border-t">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">© 2025 HEART'N'EYES Technology</p>
          <div className="flex space-x-4">
            <a href="#" className="text-sm text-blue-600 hover:text-blue-800">Privacy Policy</a>
            <a href="#" className="text-sm text-blue-600 hover:text-blue-800">Terms of Service</a>
            <a href="#" className="text-sm text-blue-600 hover:text-blue-800">Support</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeartNEyesDashboard;