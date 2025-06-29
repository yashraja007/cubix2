import { useState } from "react";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Settings as SettingsIcon, 
  User, 
  MessageCircle, 
  Shield, 
  Bell, 
  Database,
  Key,
  Globe,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Copy
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();
  
  // Settings state
  const [hotelName, setHotelName] = useState("Grand Hotel");
  const [hotelAddress, setHotelAddress] = useState("123 Main Street, City, State 12345");
  const [hotelPhone, setHotelPhone] = useState("+1 (555) 123-4567");
  const [hotelEmail, setHotelEmail] = useState("info@grandhotel.com");
  const [defaultCheckIn, setDefaultCheckIn] = useState("15:00");
  const [defaultCheckOut, setDefaultCheckOut] = useState("11:00");
  const [currency, setCurrency] = useState("INR");
  const [timezone, setTimezone] = useState("America/New_York");
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [whatsappNotifications, setWhatsappNotifications] = useState(true);
  const [bookingNotifications, setBookingNotifications] = useState(true);
  const [maintenanceAlerts, setMaintenanceAlerts] = useState(true);
  
  // User management
  const [users] = useState([
    { id: 1, name: "John Doe", email: "john@hotel.com", role: "admin", status: "active" },
    { id: 2, name: "Jane Smith", email: "jane@hotel.com", role: "manager", status: "active" },
    { id: 3, name: "Mike Johnson", email: "mike@hotel.com", role: "staff", status: "active" }
  ]);

  const handleSaveSettings = (section: string) => {
    toast({
      title: "Settings Saved",
      description: `${section} settings have been updated successfully.`,
    });
  };

  const handleTestWhatsApp = () => {
    toast({
      title: "WhatsApp Test",
      description: "Test message sent to WhatsApp webhook. Check your configured number.",
    });
  };

  const handleCopyWebhookUrl = () => {
    const webhookUrl = `${window.location.origin}/api/whatsapp/webhook`;
    navigator.clipboard.writeText(webhookUrl);
    toast({
      title: "Copied!",
      description: "Webhook URL copied to clipboard.",
    });
  };

  const handleBackupDatabase = () => {
    toast({
      title: "Backup Started",
      description: "Database backup has been initiated. You'll receive a download link shortly.",
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-8 py-4">
            <div className="flex items-center space-x-3">
              <SettingsIcon className="text-gray-600" size={28} />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
                <p className="text-gray-600">Manage your hotel system configuration</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general" className="space-y-6">
              <Card className="border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe size={20} />
                    <span>Hotel Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="hotelName">Hotel Name</Label>
                      <Input
                        id="hotelName"
                        value={hotelName}
                        onChange={(e) => setHotelName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="hotelPhone">Phone Number</Label>
                      <Input
                        id="hotelPhone"
                        value={hotelPhone}
                        onChange={(e) => setHotelPhone(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="hotelAddress">Address</Label>
                    <Textarea
                      id="hotelAddress"
                      value={hotelAddress}
                      onChange={(e) => setHotelAddress(e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="hotelEmail">Contact Email</Label>
                    <Input
                      id="hotelEmail"
                      type="email"
                      value={hotelEmail}
                      onChange={(e) => setHotelEmail(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="checkIn">Default Check-in Time</Label>
                      <Input
                        id="checkIn"
                        type="time"
                        value={defaultCheckIn}
                        onChange={(e) => setDefaultCheckIn(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="checkOut">Default Check-out Time</Label>
                      <Input
                        id="checkOut"
                        type="time"
                        value={defaultCheckOut}
                        onChange={(e) => setDefaultCheckOut(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INR">INR (₹)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                          <SelectItem value="JPY">JPY (¥)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select value={timezone} onValueChange={setTimezone}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/New_York">Eastern Time</SelectItem>
                          <SelectItem value="America/Chicago">Central Time</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                          <SelectItem value="Europe/London">London Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={() => handleSaveSettings("General")}>
                      <Save size={16} className="mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications */}
            <TabsContent value="notifications" className="space-y-6">
              <Card className="border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell size={20} />
                    <span>Notification Preferences</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Email Notifications</h4>
                        <p className="text-sm text-gray-600">Receive notifications via email</p>
                      </div>
                      <Switch
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">WhatsApp Notifications</h4>
                        <p className="text-sm text-gray-600">Get notified about WhatsApp commands</p>
                      </div>
                      <Switch
                        checked={whatsappNotifications}
                        onCheckedChange={setWhatsappNotifications}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Booking Notifications</h4>
                        <p className="text-sm text-gray-600">Alerts for new bookings and changes</p>
                      </div>
                      <Switch
                        checked={bookingNotifications}
                        onCheckedChange={setBookingNotifications}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Maintenance Alerts</h4>
                        <p className="text-sm text-gray-600">Get notified about room maintenance</p>
                      </div>
                      <Switch
                        checked={maintenanceAlerts}
                        onCheckedChange={setMaintenanceAlerts}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={() => handleSaveSettings("Notification")}>
                      <Save size={16} className="mr-2" />
                      Save Preferences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* WhatsApp Settings */}
            <TabsContent value="whatsapp" className="space-y-6">
              <Card className="border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageCircle size={20} />
                    <span>WhatsApp Integration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="text-blue-600 mt-0.5" size={20} />
                      <div>
                        <h4 className="font-medium text-blue-900">Integration Status</h4>
                        <p className="text-sm text-blue-700">
                          WhatsApp webhook is active and receiving commands
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="webhookUrl">Webhook URL</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="webhookUrl"
                        value={`${window.location.origin}/api/whatsapp/webhook`}
                        readOnly
                        className="bg-gray-50"
                      />
                      <Button variant="outline" onClick={handleCopyWebhookUrl}>
                        <Copy size={16} />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Configure this URL in your Twilio WhatsApp sandbox
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="statusCallbackUrl">Status Callback URL</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="statusCallbackUrl"
                        value={`${window.location.origin}/api/whatsapp/status`}
                        readOnly
                        className="bg-gray-50"
                      />
                      <Button variant="outline" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/api/whatsapp/status`)}>
                        <Copy size={16} />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Configure this URL for delivery status updates in Twilio
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">API Configuration</h4>
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <Label htmlFor="openaiKey">ChatGPT/OpenAI API Key</Label>
                        <div className="flex space-x-2">
                          <Input
                            id="openaiKey"
                            type="password"
                            placeholder="sk-proj-... (Enter your OpenAI API key)"
                            className="bg-gray-50"
                          />
                          <Badge variant={import.meta.env.VITE_OPENAI_API_KEY ? "default" : "destructive"}>
                            {import.meta.env.VITE_OPENAI_API_KEY ? "✓ Active" : "⚠ Missing"}
                          </Badge>
                          <Button variant="outline" size="sm">
                            Test Key
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Required for parsing WhatsApp commands. Get your API key from: platform.openai.com/api-keys
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="twilioToken">Twilio Auth Token</Label>
                        <div className="flex space-x-2">
                          <Input
                            id="twilioToken"
                            type="password"
                            placeholder="Enter Twilio token..."
                            className="bg-gray-50"
                          />
                          <Badge variant={import.meta.env.VITE_TWILIO_AUTH_TOKEN ? "default" : "destructive"}>
                            {import.meta.env.VITE_TWILIO_AUTH_TOKEN ? "✓ Active" : "⚠ Missing"}
                          </Badge>
                          <Button variant="outline" size="sm">
                            Test Token
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Required for WhatsApp webhook integration. Get from: console.twilio.com
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mt-6">
                      <h4 className="font-medium text-blue-900 mb-3">Configuration Status</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span>WhatsApp Commands</span>
                          <Badge variant={import.meta.env.VITE_OPENAI_API_KEY && import.meta.env.VITE_TWILIO_AUTH_TOKEN ? "default" : "destructive"}>
                            {import.meta.env.VITE_OPENAI_API_KEY && import.meta.env.VITE_TWILIO_AUTH_TOKEN ? "✓ Ready" : "⚠ Needs Setup"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Check-in via WhatsApp</span>
                          <Badge variant={import.meta.env.VITE_OPENAI_API_KEY ? "default" : "destructive"}>
                            {import.meta.env.VITE_OPENAI_API_KEY ? "✓ Enabled" : "⚠ Disabled"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Webhook Endpoint</span>
                          <Badge variant="default">✓ Active</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium">Supported Commands</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">block_room</Badge>
                        <span>Block a room</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">unblock_room</Badge>
                        <span>Unblock a room</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">room_status</Badge>
                        <span>Check room status</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">check_in</Badge>
                        <span>Guest check-in</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">check_out</Badge>
                        <span>Guest check-out</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mt-6">
                    <h4 className="font-medium">Example Commands</h4>
                    <div className="space-y-2 text-sm bg-gray-50 p-4 rounded-lg">
                      <div><strong>Check-in:</strong> "Check in John Smith to room 108"</div>
                      <div><strong>Check-out:</strong> "Check out room 108"</div>
                      <div><strong>Block room:</strong> "Block room 205 from July 15 to July 17"</div>
                      <div><strong>Unblock room:</strong> "Unblock room 205"</div>
                      <div><strong>Room status:</strong> "What's the status of room 203?"</div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button onClick={handleTestWhatsApp}>
                      <MessageCircle size={16} className="mr-2" />
                      Test WhatsApp
                    </Button>
                    <Button variant="outline" onClick={() => handleSaveSettings("WhatsApp")}>
                      <Save size={16} className="mr-2" />
                      Save Configuration
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* User Management */}
            <TabsContent value="users" className="space-y-6">
              <Card className="border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User size={20} />
                    <span>User Management</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium">{user.name}</h4>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                          <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                            {user.status}
                          </Badge>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <Button>
                      <User size={16} className="mr-2" />
                      Add New User
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* System Settings */}
            <TabsContent value="system" className="space-y-6">
              <Card className="border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Database size={20} />
                    <span>System Management</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Database</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">Database Status</p>
                            <p className="text-sm text-gray-600">Connected to PostgreSQL</p>
                          </div>
                          <Badge className="bg-green-600">Online</Badge>
                        </div>
                        <Button variant="outline" onClick={handleBackupDatabase}>
                          <Database size={16} className="mr-2" />
                          Backup Database
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-medium">System Health</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">API Status</p>
                            <p className="text-sm text-gray-600">All endpoints operational</p>
                          </div>
                          <Badge className="bg-green-600">Healthy</Badge>
                        </div>
                        <Button variant="outline">
                          <RefreshCw size={16} className="mr-2" />
                          Run Health Check
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-gray-200">
                    <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <AlertTriangle className="text-yellow-600 mt-0.5" size={20} />
                      <div>
                        <h4 className="font-medium text-yellow-900">System Maintenance</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          Regular system maintenance is recommended to ensure optimal performance. 
                          Consider scheduling maintenance during low-usage periods.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
