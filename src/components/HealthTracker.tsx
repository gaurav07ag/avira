import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { TrendingUp, Heart, Brain, Activity, Calendar } from 'lucide-react';
import { SmartWatchConnector } from './SmartWatchConnector';

// Generate sample health data
const generateHealthData = (days: number) => {
  const data = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      mood: Math.max(1, Math.min(10, 5 + Math.sin(i * 0.3) * 2 + Math.random() * 1.5)),
      anxiety: Math.max(1, Math.min(10, 4 + Math.cos(i * 0.2) * 2 + Math.random() * 1.2)),
      sleep: Math.max(4, Math.min(12, 7.5 + Math.sin(i * 0.1) * 1.5 + Math.random() * 0.8)),
      therapy: Math.random() > 0.7 ? 1 : 0,
      medication: Math.random() > 0.3 ? 1 : 0,
      exercise: Math.max(0, Math.min(120, 30 + Math.sin(i * 0.15) * 20 + Math.random() * 15)),
    });
  }
  
  return data;
};

export const HealthTracker = () => {
  const [healthData, setHealthData] = useState(() => generateHealthData(30));
  const [activeMetric, setActiveMetric] = useState('mood');

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setHealthData(prev => {
        const newData = [...prev.slice(1)];
        const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        newData.push({
          date: today,
          mood: Math.max(1, Math.min(10, 5 + Math.sin(Date.now() * 0.001) * 2 + Math.random() * 1.5)),
          anxiety: Math.max(1, Math.min(10, 4 + Math.cos(Date.now() * 0.001) * 2 + Math.random() * 1.2)),
          sleep: Math.max(4, Math.min(12, 7.5 + Math.sin(Date.now() * 0.0005) * 1.5 + Math.random() * 0.8)),
          therapy: Math.random() > 0.7 ? 1 : 0,
          medication: Math.random() > 0.3 ? 1 : 0,
          exercise: Math.max(0, Math.min(120, 30 + Math.sin(Date.now() * 0.0008) * 20 + Math.random() * 15)),
        });
        
        return newData;
      });
    }, 10000); // Update every 10 seconds for demo

    return () => clearInterval(interval);
  }, []);

  const getCurrentValue = (metric: string) => {
    const latest = healthData[healthData.length - 1];
    return latest ? latest[metric as keyof typeof latest] : 0;
  };

  const getTrend = (metric: string) => {
    if (healthData.length < 2) return 0;
    const latest = healthData[healthData.length - 1];
    const previous = healthData[healthData.length - 2];
    return Number(latest[metric as keyof typeof latest]) - Number(previous[metric as keyof typeof previous]);
  };

  const metrics = [
    { key: 'mood', label: 'Mood Score', icon: Brain, color: '#8B5CF6', unit: '/10' },
    { key: 'anxiety', label: 'Anxiety Level', icon: Heart, color: '#EF4444', unit: '/10' },
    { key: 'sleep', label: 'Sleep Hours', icon: Activity, color: '#06B6D4', unit: 'hrs' },
    { key: 'exercise', label: 'Exercise', icon: TrendingUp, color: '#10B981', unit: 'min' },
  ];

  return (
    <div className="space-y-6">
      {/* Smartwatch Connection Section */}
      <SmartWatchConnector />
      
      {/* Existing Health Tracking Content */}
      {/* Live Status Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary animate-pulse" />
              Live Health Tracking
              <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                <div className="w-2 h-2 bg-success rounded-full mr-2 animate-pulse" />
                Live
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Last 30 Days
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Metrics Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const value = getCurrentValue(metric.key);
          const trend = getTrend(metric.key);
          
          return (
            <Card 
              key={metric.key} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                activeMetric === metric.key ? 'ring-2 ring-primary/50 bg-primary/5' : ''
              }`}
              onClick={() => setActiveMetric(metric.key)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <p className="text-2xl font-bold" style={{ color: metric.color }}>
                      {typeof value === 'number' ? value.toFixed(1) : value}{metric.unit}
                    </p>
                    <div className="flex items-center gap-1 text-xs">
                      <TrendingUp 
                        className={`h-3 w-3 ${trend >= 0 ? 'text-success' : 'text-destructive'} ${
                          trend >= 0 ? 'rotate-0' : 'rotate-180'
                        }`} 
                      />
                      <span className={trend >= 0 ? 'text-success' : 'text-destructive'}>
                        {Math.abs(trend).toFixed(1)} {trend >= 0 ? '↑' : '↓'}
                      </span>
                    </div>
                  </div>
                  <Icon className="h-8 w-8 opacity-60" style={{ color: metric.color }} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <CardTitle>
            {metrics.find(m => m.key === activeMetric)?.label} Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="line" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="line">Line Chart</TabsTrigger>
              <TabsTrigger value="area">Area Chart</TabsTrigger>
              <TabsTrigger value="bar">Bar Chart</TabsTrigger>
            </TabsList>
            
            <TabsContent value="line" className="mt-6">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={healthData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey={activeMetric} 
                    stroke={metrics.find(m => m.key === activeMetric)?.color}
                    strokeWidth={3}
                    dot={{ fill: metrics.find(m => m.key === activeMetric)?.color, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: metrics.find(m => m.key === activeMetric)?.color, strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="area" className="mt-6">
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={healthData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey={activeMetric} 
                    stroke={metrics.find(m => m.key === activeMetric)?.color}
                    fill={metrics.find(m => m.key === activeMetric)?.color}
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="bar" className="mt-6">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={healthData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey={activeMetric} 
                    fill={metrics.find(m => m.key === activeMetric)?.color}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Treatment Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Therapy Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={healthData.slice(-14)}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="therapy" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Medication Adherence</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={healthData.slice(-14)}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="medication" fill="hsl(var(--success))" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};