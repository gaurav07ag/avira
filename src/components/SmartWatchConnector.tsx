import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Watch, 
  Bluetooth, 
  Heart, 
  Activity, 
  Moon, 
  Thermometer,
  Droplets,
  Zap,
  CheckCircle,
  AlertTriangle,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface BiometricData {
  heartRate: number;
  oxygenLevel: number;
  stressLevel: number;
  sleepQuality: number;
  steps: number;
  temperature: number;
  timestamp: Date;
}

interface SmartWatchDevice {
  id: string;
  name: string;
  type: 'apple' | 'samsung' | 'fitbit' | 'garmin' | 'amazfit';
  connected: boolean;
}

export const SmartWatchConnector: React.FC = () => {
  const [devices, setDevices] = useState<SmartWatchDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [biometrics, setBiometrics] = useState<BiometricData | null>(null);
  const [scanning, setScanning] = useState(false);
  const { toast } = useToast();

  // Simulate available devices
  const availableDevices: SmartWatchDevice[] = [
    { id: '1', name: 'Apple Watch Series 9', type: 'apple', connected: false },
    { id: '2', name: 'Samsung Galaxy Watch 6', type: 'samsung', connected: false },
    { id: '3', name: 'Fitbit Sense 2', type: 'fitbit', connected: false },
    { id: '4', name: 'Garmin Venu 3', type: 'garmin', connected: false },
    { id: '5', name: 'Amazfit GTR 4', type: 'amazfit', connected: false },
  ];

  useEffect(() => {
    // Simulate device scanning
    if (scanning) {
      const timer = setTimeout(() => {
        setDevices(availableDevices);
        setScanning(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [scanning]);

  useEffect(() => {
    // Simulate live biometric data when connected
    if (connected) {
      const interval = setInterval(() => {
        setBiometrics({
          heartRate: 60 + Math.random() * 40, // 60-100 BPM
          oxygenLevel: 95 + Math.random() * 5, // 95-100%
          stressLevel: Math.random() * 100, // 0-100%
          sleepQuality: 60 + Math.random() * 40, // 60-100%
          steps: Math.floor(2000 + Math.random() * 8000), // 2000-10000 steps
          temperature: 98.6 + (Math.random() - 0.5) * 2, // ~98.6°F ± 1°F
          timestamp: new Date(),
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [connected]);

  const scanForDevices = () => {
    setScanning(true);
    setDevices([]);
    toast({
      title: "Scanning for devices",
      description: "Looking for nearby smartwatches...",
    });
  };

  const connectToDevice = async () => {
    if (!selectedDevice) return;
    
    setConnecting(true);
    
    // Simulate connection process
    setTimeout(() => {
      setConnected(true);
      setConnecting(false);
      const device = devices.find(d => d.id === selectedDevice);
      toast({
        title: "Device connected",
        description: `Successfully connected to ${device?.name}`,
      });
    }, 2000);
  };

  const disconnectDevice = () => {
    setConnected(false);
    setBiometrics(null);
    setSelectedDevice('');
    toast({
      title: "Device disconnected",
      description: "Smartwatch has been disconnected",
    });
  };

  const getStressLevelColor = (level: number) => {
    if (level < 30) return 'text-success';
    if (level < 60) return 'text-warning';
    return 'text-destructive';
  };

  const getStressLevelText = (level: number) => {
    if (level < 30) return 'Low';
    if (level < 60) return 'Moderate';
    return 'High';
  };

  const getHealthRecommendation = () => {
    if (!biometrics) return null;

    const { heartRate, stressLevel, oxygenLevel } = biometrics;
    
    if (stressLevel > 70) {
      return {
        type: 'warning',
        message: 'High stress detected. Consider taking a 5-minute breathing break.',
        action: 'Start breathing exercise'
      };
    }
    
    if (heartRate > 100) {
      return {
        type: 'info',
        message: 'Elevated heart rate. Take a moment to relax and hydrate.',
        action: 'View relaxation techniques'
      };
    }
    
    if (oxygenLevel < 96) {
      return {
        type: 'warning',
        message: 'Lower oxygen levels detected. Consider some gentle movement or fresh air.',
        action: 'View wellness tips'
      };
    }

    return {
      type: 'success',
      message: 'Your vitals look good! Keep up the great self-care.',
      action: 'Continue monitoring'
    };
  };

  const recommendation = getHealthRecommendation();

  return (
    <div className="space-y-6">
      {/* Device Connection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Watch className="h-5 w-5" />
            Smartwatch Connection
            {connected && (
              <Badge variant="secondary" className="ml-auto">
                <Wifi className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!connected ? (
            <>
              <div className="flex gap-2">
                <Button 
                  onClick={scanForDevices} 
                  disabled={scanning}
                  variant="outline"
                  className="flex-1"
                >
                  <Bluetooth className="h-4 w-4 mr-2" />
                  {scanning ? 'Scanning...' : 'Scan for Devices'}
                </Button>
              </div>

              {devices.length > 0 && (
                <div className="space-y-3">
                  <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a smartwatch" />
                    </SelectTrigger>
                    <SelectContent>
                      {devices.map((device) => (
                        <SelectItem key={device.id} value={device.id}>
                          <div className="flex items-center gap-2">
                            <Watch className="h-4 w-4" />
                            {device.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button 
                    onClick={connectToDevice}
                    disabled={!selectedDevice || connecting}
                    className="w-full"
                  >
                    {connecting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Bluetooth className="h-4 w-4 mr-2" />
                        Connect Device
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-sm">Device connected and monitoring</span>
                </div>
                <Button 
                  onClick={disconnectDevice}
                  variant="outline"
                  size="sm"
                >
                  <WifiOff className="h-4 w-4 mr-2" />
                  Disconnect
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Biometric Data */}
      {connected && biometrics && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Live Biometric Data
                <Badge variant="secondary" className="ml-auto">
                  <div className="w-2 h-2 bg-success rounded-full mr-2 animate-pulse" />
                  Real-time
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Heart Rate */}
                <div className="p-4 rounded-lg bg-card border">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium">Heart Rate</span>
                  </div>
                  <div className="text-2xl font-bold text-red-500">
                    {Math.round(biometrics.heartRate)}
                  </div>
                  <div className="text-xs text-muted-foreground">BPM</div>
                </div>

                {/* Oxygen Level */}
                <div className="p-4 rounded-lg bg-card border">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Blood Oxygen</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-500">
                    {Math.round(biometrics.oxygenLevel)}%
                  </div>
                  <div className="text-xs text-muted-foreground">SpO2</div>
                </div>

                {/* Stress Level */}
                <div className="p-4 rounded-lg bg-card border">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">Stress Level</span>
                  </div>
                  <div className={`text-2xl font-bold ${getStressLevelColor(biometrics.stressLevel)}`}>
                    {getStressLevelText(biometrics.stressLevel)}
                  </div>
                  <Progress 
                    value={biometrics.stressLevel} 
                    className="mt-2"
                  />
                </div>

                {/* Sleep Quality */}
                <div className="p-4 rounded-lg bg-card border">
                  <div className="flex items-center gap-2 mb-2">
                    <Moon className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium">Sleep Quality</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-500">
                    {Math.round(biometrics.sleepQuality)}%
                  </div>
                  <Progress 
                    value={biometrics.sleepQuality} 
                    className="mt-2"
                  />
                </div>

                {/* Steps */}
                <div className="p-4 rounded-lg bg-card border">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Steps Today</span>
                  </div>
                  <div className="text-2xl font-bold text-green-500">
                    {biometrics.steps.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">steps</div>
                </div>

                {/* Temperature */}
                <div className="p-4 rounded-lg bg-card border">
                  <div className="flex items-center gap-2 mb-2">
                    <Thermometer className="h-4 w-4 text-red-400" />
                    <span className="text-sm font-medium">Body Temp</span>
                  </div>
                  <div className="text-2xl font-bold text-red-400">
                    {biometrics.temperature.toFixed(1)}°F
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {((biometrics.temperature - 32) * 5/9).toFixed(1)}°C
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Wellness Recommendations */}
          {recommendation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  AI Wellness Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert className={
                  recommendation.type === 'warning' ? 'border-warning bg-warning/10' :
                  recommendation.type === 'success' ? 'border-success bg-success/10' :
                  'border-primary bg-primary/10'
                }>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="ml-2">
                    <div className="space-y-2">
                      <p>{recommendation.message}</p>
                      <Button variant="outline" size="sm">
                        {recommendation.action}
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Supported Devices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Apple Watch (Series 4 and newer)</p>
            <p>• Samsung Galaxy Watch (4 and newer)</p>
            <p>• Fitbit (Sense, Versa series)</p>
            <p>• Garmin (Venu, Vivoactive series)</p>
            <p>• Amazfit (GTR, GTS series)</p>
            <p className="mt-3 text-xs">
              <strong>Privacy Note:</strong> All biometric data is processed locally and encrypted. 
              No health data is stored on external servers.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};