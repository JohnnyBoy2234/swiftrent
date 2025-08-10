import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export default function Verify() {
  const [code, setCode] = useState('');
  const [cooldown, setCooldown] = useState(30);
  const [timeLeft, setTimeLeft] = useState(10 * 60); // seconds
  const timerRef = useRef<number | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Verify your email - EasyRent';
  }, []);

  useEffect(() => {
    // Start countdowns
    timerRef.current = window.setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
      setCooldown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    // Send code once on mount (will respect server rate-limiting)
    supabase.functions.invoke('send-login-code').catch(() => {});
  }, []);

  const mmss = useMemo(() => {
    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const s = (timeLeft % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }, [timeLeft]);

  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.functions.invoke('verify-login-code', { body: { code } });
      if (error) throw error;
      if (data?.verified) {
        toast({ title: 'Verified!', description: 'You are now signed in.' });
        navigate('/dashboard');
      } else {
        throw new Error('Verification failed');
      }
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Invalid or expired code', description: err?.message ?? 'Please try again.' });
    }
  };

  const onResend = async () => {
    if (cooldown > 0) return;
    try {
      const { error } = await supabase.functions.invoke('send-login-code');
      if (error) throw error;
      setCooldown(30);
      toast({ title: 'Code sent', description: 'Check your email for a new code.' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Could not resend', description: err?.message ?? 'Please wait and try again.' });
    }
  };

  const expired = timeLeft === 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Verify your sign-in</CardTitle>
          <CardDescription>Enter the 6-digit code sent to your email. Expires in {mmss}.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={onVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Verification code</Label>
              <Input id="code" inputMode="numeric" pattern="^[0-9]{6}$" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" required />
            </div>
            <Button className="w-full" type="submit" disabled={expired || code.length !== 6}>
              {expired ? 'Code expired' : 'Verify'}
            </Button>
          </form>
          <Separator />
          <div className="text-sm text-muted-foreground text-center">
            Didn’t receive the code?{' '}
            <button className="underline" onClick={onResend} disabled={cooldown > 0}>
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
