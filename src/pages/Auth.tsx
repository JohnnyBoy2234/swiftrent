import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Eye, EyeOff, ArrowLeft } from 'lucide-react';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password validation criteria
const PASSWORD_CRITERIA = {
  minLength: 8,
  hasUppercase: /[A-Z]/,
  hasLowercase: /[a-z]/,
  hasNumber: /\d/,
  hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/
};

// Validate email format
const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  if (!EMAIL_REGEX.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  return { isValid: true };
};

// Validate password security
const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < PASSWORD_CRITERIA.minLength) {
    errors.push(`At least ${PASSWORD_CRITERIA.minLength} characters`);
  }
  if (!PASSWORD_CRITERIA.hasUppercase.test(password)) {
    errors.push('At least one uppercase letter');
  }
  if (!PASSWORD_CRITERIA.hasLowercase.test(password)) {
    errors.push('At least one lowercase letter');
  }
  if (!PASSWORD_CRITERIA.hasNumber.test(password)) {
    errors.push('At least one number');
  }
  if (!PASSWORD_CRITERIA.hasSpecialChar.test(password)) {
    errors.push('At least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'tenant' | 'landlord'>('tenant');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('signin');
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { signIn, signUp, signInWithGoogle, signInWithProvider, resetPassword, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Real-time email validation
  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (value && !EMAIL_REGEX.test(value)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  // Real-time password validation for signup
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (activeTab === 'signup') {
      const validation = validatePassword(value);
      setPasswordErrors(validation.errors);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Validate email format
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      toast({
        variant: "destructive",
        title: "Invalid email",
        description: emailValidation.error
      });
      setLoading(false);
      return;
    }

    // Basic password check for signin
    if (!password) {
      toast({
        variant: "destructive",
        title: "Password required",
        description: "Please enter your password"
      });
      setLoading(false);
      return;
    }
    
    const { error } = await signIn(email, password);
    
    if (error) {
      // Provide specific error messages based on error type
      let errorTitle = "Sign in failed";
      let errorDescription = "Please check your credentials and try again";
      
      if (error.message.includes('Invalid login credentials')) {
        errorTitle = "Invalid credentials";
        errorDescription = "The email or password you entered is incorrect.";
      } else if (error.message.includes('Email not confirmed')) {
        errorTitle = "Email not confirmed";
        errorDescription = "Please check your email and click the confirmation link before signing in.";
      } else if (error.message.includes('User not found')) {
        errorTitle = "Account not found";
        errorDescription = "No account found with this email address.";
      } else if (error.message.includes('Too many requests')) {
        errorTitle = "Too many attempts";
        errorDescription = "Too many sign-in attempts. Please wait a moment and try again.";
      } else if (error.message.includes('rate limit')) {
        errorTitle = "Too many attempts";
        errorDescription = "Please wait before trying again.";
      }
      
      toast({
        variant: "destructive",
        title: errorTitle,
        description: errorDescription
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in."
      });
      navigate('/');
    }
    
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Validate email format
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      toast({
        variant: "destructive",
        title: "Invalid email",
        description: emailValidation.error
      });
      setLoading(false);
      return;
    }

    // Validate password security
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      toast({
        variant: "destructive",
        title: "Password doesn't meet requirements",
        description: `Password must have: ${passwordValidation.errors.join(', ')}`
      });
      setLoading(false);
      return;
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "Please ensure both password fields are the same"
      });
      setLoading(false);
      return;
    }
    
    const { error, isNewUser } = await signUp(email, password, role);
    
    if (error) {
      // Provide specific error messages
      let errorTitle = "Sign up failed";
      let errorDescription = "Please try again";
      
      if (error.message.includes('User already registered')) {
        errorTitle = "Account already exists";
        errorDescription = "An account with this email already exists. Please sign in instead.";
      } else if (error.message.includes('Invalid email')) {
        errorTitle = "Invalid email";
        errorDescription = "Please enter a valid email address";
      } else if (error.message.includes('Password should be at least')) {
        errorTitle = "Password too weak";
        errorDescription = "Password must meet security requirements";
      } else if (error.message.includes('rate limit')) {
        errorTitle = "Too many attempts";
        errorDescription = "Please wait a moment before trying again";
      }
      
      toast({
        variant: "destructive",
        title: errorTitle,
        description: errorDescription
      });
    } else {
      toast({
        title: "Account created successfully!",
        description: isNewUser 
          ? "Please check your email for a verification link before signing in." 
          : "You're now signed in to your account."
      });
      
      if (isNewUser) {
        // Switch to sign in tab for new users to verify email first
        setActiveTab('signin');
        setPassword(''); // Clear password for security
        setConfirmPassword('');
      } else {
        navigate('/');
      }
    }
    
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error } = await signInWithProvider('google', 'tenant');
    if (error) {
      toast({
        variant: "destructive",
        title: "Google sign in failed",
        description: error.message
      });
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    const { error } = await signInWithProvider('apple', 'tenant');
    if (error) {
      toast({ variant: 'destructive', title: 'Apple sign in failed', description: error.message });
      setLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setLoading(true);
    const { error } = await signInWithProvider('facebook', 'tenant');
    if (error) {
      toast({ variant: 'destructive', title: 'Facebook sign in failed', description: error.message });
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      toast({
        variant: "destructive",
        title: "Invalid email",
        description: emailValidation.error
      });
      setLoading(false);
      return;
    }

    const { error } = await resetPassword(email);
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Reset failed",
        description: "Failed to send reset email. Please try again."
      });
    } else {
      setResetSent(true);
      toast({
        title: "Reset email sent",
        description: "Check your email for password reset instructions."
      });
    }
    
    setLoading(false);
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setEmailError('');
    setPasswordErrors([]);
    setResetMode(false);
    setResetSent(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">EasyRent</CardTitle>
          <CardDescription>
            Connect landlords and tenants across South Africa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <div className="space-y-4">
                {!resetMode && !resetSent && (
                  <>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full" 
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </Button>
                    <Button type="button" variant="outline" className="w-full" onClick={handleAppleSignIn} disabled={loading}>
                      Continue with Apple
                    </Button>
                    <Button type="button" variant="outline" className="w-full" onClick={handleFacebookSignIn} disabled={loading}>
                      Continue with Facebook
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          Or continue with email
                        </span>
                      </div>
                    </div>

                    {/* Email Sign In Form */}
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signin-email">Email</Label>
                        <Input
                          id="signin-email"
                          type="email"
                          value={email}
                          onChange={(e) => handleEmailChange(e.target.value)}
                          required
                          className={emailError ? "border-destructive" : ""}
                        />
                        {emailError && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{emailError}</AlertDescription>
                          </Alert>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signin-password">Password</Label>
                        <div className="relative">
                          <Input
                            id="signin-password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                      </Button>
                      <div className="text-center">
                        <Button 
                          type="button" 
                          variant="link" 
                          onClick={() => setResetMode(true)}
                          className="text-sm"
                        >
                          Forgot your password?
                        </Button>
                      </div>
                    </form>
                  </>
                )}

                {/* Password Reset Form */}
                {resetMode && !resetSent && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setResetMode(false);
                          resetForm();
                        }}
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <div>
                        <h3 className="font-semibold">Reset Password</h3>
                        <p className="text-sm text-muted-foreground">Enter your email to receive reset instructions</p>
                      </div>
                    </div>
                    <form onSubmit={handlePasswordReset} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="reset-email">Email</Label>
                        <Input
                          id="reset-email"
                          type="email"
                          value={email}
                          onChange={(e) => handleEmailChange(e.target.value)}
                          required
                          className={emailError ? "border-destructive" : ""}
                        />
                        {emailError && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{emailError}</AlertDescription>
                          </Alert>
                        )}
                      </div>
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Sending...' : 'Send Reset Link'}
                      </Button>
                    </form>
                  </div>
                )}

                {/* Reset Confirmation */}
                {resetSent && (
                  <div className="space-y-4 text-center">
                    <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Check your email</h3>
                      <p className="text-sm text-muted-foreground">
                        We've sent password reset instructions to {email}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setResetSent(false);
                        setResetMode(false);
                        resetForm();
                      }}
                    >
                      Back to Sign In
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="signup">
              <div className="space-y-4">
                {/* Google Sign Up */}
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with email
                    </span>
                  </div>
                </div>

                {/* Email Sign Up Form */}
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      required
                      className={emailError ? "border-destructive" : ""}
                    />
                    {emailError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{emailError}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password Requirements</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => handlePasswordChange(e.target.value)}
                        required
                        className={passwordErrors.length > 0 ? "border-destructive" : ""}
                        placeholder="Enter a secure password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {/* Password criteria display */}
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        {password.length >= PASSWORD_CRITERIA.minLength ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        ) : (
                          <AlertCircle className="h-3 w-3 text-muted-foreground" />
                        )}
                        <span className={password.length >= PASSWORD_CRITERIA.minLength ? "text-green-600" : "text-muted-foreground"}>
                          At least {PASSWORD_CRITERIA.minLength} characters
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {PASSWORD_CRITERIA.hasUppercase.test(password) ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        ) : (
                          <AlertCircle className="h-3 w-3 text-muted-foreground" />
                        )}
                        <span className={PASSWORD_CRITERIA.hasUppercase.test(password) ? "text-green-600" : "text-muted-foreground"}>
                          One uppercase letter
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {PASSWORD_CRITERIA.hasLowercase.test(password) ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        ) : (
                          <AlertCircle className="h-3 w-3 text-muted-foreground" />
                        )}
                        <span className={PASSWORD_CRITERIA.hasLowercase.test(password) ? "text-green-600" : "text-muted-foreground"}>
                          One lowercase letter
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {PASSWORD_CRITERIA.hasNumber.test(password) ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        ) : (
                          <AlertCircle className="h-3 w-3 text-muted-foreground" />
                        )}
                        <span className={PASSWORD_CRITERIA.hasNumber.test(password) ? "text-green-600" : "text-muted-foreground"}>
                          One number
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {PASSWORD_CRITERIA.hasSpecialChar.test(password) ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        ) : (
                          <AlertCircle className="h-3 w-3 text-muted-foreground" />
                        )}
                        <span className={PASSWORD_CRITERIA.hasSpecialChar.test(password) ? "text-green-600" : "text-muted-foreground"}>
                          One special character
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className={confirmPassword && password !== confirmPassword ? "border-destructive" : ""}
                        placeholder="Confirm your password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>Passwords don't match</AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div className="space-y-3">
                    <Label>Account Type</Label>
                    <RadioGroup value={role} onValueChange={(value) => setRole(value as 'tenant' | 'landlord')}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="tenant" id="tenant" />
                        <Label htmlFor="tenant">Tenant - Looking for property</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="landlord" id="landlord" />
                        <Label htmlFor="landlord">Landlord - Listing property</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}