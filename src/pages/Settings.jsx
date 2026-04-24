import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  User, 
  Bell, 
  Shield, 
  Globe,
  Database,
  Key,
  Moon,
  Sun
} from 'lucide-react';
import Header from '@/components/Header';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

export default function Settings({ onOpenChat }) {
  const [settings, setSettings] = React.useState({ openai_key: '', groq_key: '' });
  const [loading, setLoading] = React.useState(true);
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  React.useEffect(() => {
    // Check initial dark mode state
    setIsDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleDarkMode = (checked) => {
    setIsDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${API_BASE}/settings`);
        setSettings(res.data);
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      await axios.post(`${API_BASE}/settings`, settings);
      alert('Settings saved successfully!');
    } catch (err) {
      alert('Failed to save settings.');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <Header 
        title="Settings" 
        subtitle="Configure your workspace and preferences" 
        onOpenChat={onOpenChat} 
      />

      <div className="grid grid-cols-1 gap-6">
        <Card className="border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="size-5 text-indigo-600" />
              Profile Information
            </CardTitle>
            <CardDescription>Update your account details and public profile.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input defaultValue="Admin User" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input defaultValue="admin@taskflow.com" />
              </div>
            </div>
            <Button className="bg-indigo-600 hover:bg-indigo-700">Save Changes</Button>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="size-5 text-indigo-600" />
              Appearance
            </CardTitle>
            <CardDescription>Customize the look and feel of your workspace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="space-y-0.5">
                <Label className="text-base font-bold text-slate-900">Dark Mode</Label>
                <p className="text-sm text-slate-500">Enable dark mode for a better nighttime experience.</p>
              </div>
              <div className="flex items-center gap-2">
                <Sun className="size-4 text-slate-400" />
                <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
                <Moon className="size-4 text-slate-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="size-5 text-indigo-600" />
              AI Configuration
            </CardTitle>
            <CardDescription>Manage your LLM API keys for AI-powered management.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>OpenAI API Key</Label>
              <Input 
                type="password" 
                placeholder="sk-..." 
                value={settings.openai_key}
                onChange={(e) => setSettings({...settings, openai_key: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Groq API Key</Label>
              <Input 
                type="password" 
                placeholder="gsk_..." 
                value={settings.groq_key}
                onChange={(e) => setSettings({...settings, groq_key: e.target.value})}
              />
            </div>
            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleSave}>Update Keys</Button>
          </CardContent>
        </Card>

        <Card className="border-red-100 bg-red-50/30">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <Shield className="size-5" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 mb-4">Deleting your account is permanent and cannot be undone.</p>
            <Button variant="destructive">Delete Account</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
