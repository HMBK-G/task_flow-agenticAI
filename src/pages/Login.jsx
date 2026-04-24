import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bot } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@taskflow.com');
  const [password, setPassword] = useState('password');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate login
    login({ id: '1', name: 'Admin User', role: 'Administrator', email });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-none">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="size-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Bot className="size-10" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">TaskFlow</CardTitle>
          <CardDescription>
            Enter your credentials to access your club workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 text-lg font-medium transition-all duration-200 shadow-lg shadow-indigo-100">
              Sign In
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-slate-500">
            Don't have an account? <span className="text-indigo-600 font-semibold cursor-pointer">Contact your administrator</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
