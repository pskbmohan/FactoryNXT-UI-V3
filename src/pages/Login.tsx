import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Factory } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError(null);
    try {
      // Backend uses OAuth2PasswordRequestForm — must send as form-urlencoded
      const formBody = new URLSearchParams({
        username: data.username,
        password: data.password,
      });

      const tokenRes = await apiClient.post(
        '/api/v1/auth/token',
        formBody.toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      const { access_token, refresh_token } = tokenRes.data;

      // Fetch the user profile using the new token
      const meRes = await apiClient.get('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const user = meRes.data; // { user_id, username, roles, plant_codes }

      login(user, access_token, refresh_token);
      navigate('/');
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Login failed. Check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Factory className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">FactoryNXT</CardTitle>
          <CardDescription>Manufacturing Execution System</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                autoComplete="username"
                {...register('username')}
                placeholder="e.g. admin"
              />
              {errors.username && (
                <p className="text-sm text-destructive">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password')}
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>

            {/* Seed credential hint — remove in production */}
            <p className="text-xs text-center text-muted-foreground pt-1">
              Seed accounts: <code>admin</code> / <code>operator1</code> / <code>engineer1</code>
              &nbsp;· password: <code>factorynxt2024</code>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
