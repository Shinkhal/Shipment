import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { 
  Package, Users, DollarSign, MoreVertical,  
} from 'lucide-react';
import AdminLayout from './layout/AdminLayout';
import { fetchDashboardStats } from '../services/AdminApi';

const COLORS = ['#E0C68A', '#8EB69B', '#6B7280', '#1A1E2E', '#F1F3F5', '#E57373'];

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await fetchDashboardStats();
        setData(data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Failed to load dashboard');
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    const fetchStats = async () => {
      try {
        const { data } = await fetchDashboardStats();
        setData(data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Failed to load dashboard');
      }
      setLoading(false);
    };
    fetchStats();
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-accent/20 border-t-accent rounded-full animate-spin mx-auto mb-6" />
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-accent/60 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
            </div>
            <p className="text-textSecondary font-medium">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mb-6">
              <Package className="w-8 h-8 text-error" />
            </div>
            <h3 className="text-lg font-semibold text-textPrimary mb-2">Unable to Load Dashboard</h3>
            <p className="text-textSecondary mb-6">{error}</p>
            <button 
              onClick={handleRetry}
              className="px-6 py-3 bg-primary text-surface rounded-xl hover:bg-primary/90 transition-all duration-300 font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!data) return null;

  const { totalRevenue, totalShipments, totalUsers, statusCounts } = data;

  const statusData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status,
    value: count
  }));

  const StatCard = ({ title, value, icon: Icon, delay }) => (
    <div 
      className="group relative overflow-hidden rounded-2xl backdrop-blur-xl bg-surface/90 border border-border/50 hover:border-accent/30 transition-all duration-500 hover:shadow-[0_20px_40px_rgba(224,198,138,0.1)]"
      style={{
        animation: `fadeInUp 0.6s ease-out ${delay}s both`,
        backdropFilter: 'blur(20px)',
      }}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/3 to-transparent rounded-2xl" />
      </div>
      
      <div className="relative p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <p className="text-sm font-medium text-textSecondary uppercase tracking-wide">{title}</p>
            </div>
            <p className="text-3xl font-bold text-textPrimary mb-2 tracking-tight">{value}</p>
          </div>
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 group-hover:bg-accent/10 group-hover:border-accent/20 transition-all duration-500">
            <Icon className="w-6 h-6 text-primary group-hover:text-accent transition-colors duration-500" />
          </div>
        </div>
      </div>
    </div>
  );

  const ChartCard = ({ title, children, delay }) => (
    <div 
      className="relative overflow-hidden rounded-2xl backdrop-blur-xl bg-surface/90 border border-border/50 hover:border-accent/30 transition-all duration-500 group"
      style={{
        animation: `fadeInUp 0.6s ease-out ${delay}s both`,
        backdropFilter: 'blur(20px)',
      }}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/2 to-transparent rounded-2xl" />
      </div>
      
      <div className="relative">
        <div className="flex items-center justify-between p-6 border-b border-border/30">
          <h3 className="text-lg font-semibold text-textPrimary tracking-tight">{title}</h3>
          <button className="p-2 rounded-lg hover:bg-background/50 transition-colors duration-300">
            <MoreVertical className="w-5 h-5 text-textSecondary" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background">
        {/* Header */}
        <div className="sticky top-0 z-50 backdrop-blur-xl bg-surface/85 border-b border-border/50">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-textPrimary tracking-tight">Dashboard</h1>
                <p className="text-sm text-textSecondary">Welcome back, Admin</p>
              </div>
              
             
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Total Shipments"
              value={totalShipments?.toLocaleString() || '0'}
              icon={Package}
              delay={0.1}
            />
            <StatCard
              title="Total Users"
              value={totalUsers?.toLocaleString() || '0'}
              icon={Users}
              delay={0.2}
            />
            <StatCard
              title="Total Revenue"
              value={`₹${totalRevenue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`}
              icon={DollarSign}
              delay={0.3}
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Bar Chart */}
            <ChartCard title="Shipment Status Distribution" delay={0.4}>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={statusData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    stroke="#E5E7EB"
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#6B7280' }} 
                    stroke="#E5E7EB"
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid rgba(224, 198, 138, 0.2)',
                      borderRadius: '12px',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                      backdropFilter: 'blur(20px)',
                      color: '#111111'
                    }}
                    cursor={{ fill: 'rgba(224, 198, 138, 0.05)' }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#E0C68A" 
                    radius={[6, 6, 0, 0]}
                    name="Count"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Pie Chart */}
            <ChartCard title="Status Distribution" delay={0.5}>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={40}
                    paddingAngle={2}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                    fontSize={12}
                  >
                    {statusData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                        stroke="rgba(255, 255, 255, 0.8)"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid rgba(224, 198, 138, 0.2)',
                      borderRadius: '12px',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                      backdropFilter: 'blur(20px)',
                      color: '#111111'
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={50}
                    iconType="circle"
                    wrapperStyle={{ 
                      fontSize: '12px',
                      color: '#6B7280',
                      paddingTop: '20px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;