import { UserRole, UserProfile } from '../types';
import { useState } from 'react';
import { ShieldCheck, Sparkles, Eye, EyeOff, User, Mail, Lock, Phone, Upload, Check } from 'lucide-react';

export default function AuthPage({ onLogin }: { onLogin: (user: UserProfile) => void }) {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signupFullName, setSignupFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const handleSignup = async (role: UserRole) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupFullName,
          email: signupEmail,
          password: signupPassword,
          role,
          photo: profileImage
        })
      });
      if (response.ok) {
        const user = await response.json();
        onLogin(user);
      } else {
        const text = await response.text();
        setError(text || 'Signup failed');
      }
    } catch (e) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    alert("Google Auth is a mock for this demo.");
  };

  const handleSignupNext = () => {
      if (!signupFullName || !signupEmail || !signupPassword || !confirmPassword) {
          setError('Please fill all fields.');
          return;
      }
      if (signupPassword !== confirmPassword) {
          setError('Passwords do not match.');
          return;
      }
      setError('');
      setStep(2);
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (response.ok) {
        const user = await response.json();
        onLogin(user);
      } else {
        const text = await response.text();
        setError(text || 'Invalid email or account does not exist.');
      }
    } catch (e) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-12 z-10 relative">
        {/* Left Panel */}
        <div className="hidden md:flex flex-col justify-center space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <ShieldCheck size={28} />
            </div>
            <div>
                <h1 className="text-xl font-bold text-white tracking-tight">CivicHero <span className="text-blue-500">AI</span></h1>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Autonomous Agent Platform</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-1 bg-gray-800 text-amber-400 rounded-full px-3 py-1 text-[10px] font-bold font-mono tracking-wider uppercase w-fit">
            <Sparkles className="h-3 w-3" />
            Google AI Studio Hackathon
          </div>
          <h2 className="text-5xl font-black text-white tracking-tight leading-tight">
            AI-Powered <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              Community
            </span> <br />
            Problem Solver
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-md">
            Transform civic complaints into autonomous resolution workflows with Gemini vision, crowd verification, and predictive analytics.
          </p>
          <div className="grid grid-cols-2 gap-3 max-w-sm">
            {['Gemini Vision AI', 'Duplicate Detection', 'Crowd Verification', 'Hero Rewards'].map(feature => (
                <div key={feature} className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                    <Check size={14} className="text-emerald-500" />
                    {feature}
                </div>
            ))}
          </div>
        </div>

        {/* Right Auth Card */}
        <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-800 p-8 rounded-3xl shadow-2xl flex flex-col justify-between">
          <div className="flex gap-4 mb-8">
            <button 
              onClick={() => { setActiveTab('login'); setStep(1); }}
              className={`flex-1 py-2 text-sm font-bold transition-all ${activeTab === 'login' ? 'text-white border-b border-blue-500' : 'text-gray-500'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => { setActiveTab('signup'); setStep(1); }}
              className={`flex-1 py-2 text-sm font-bold transition-all ${activeTab === 'signup' ? 'text-white border-b border-blue-500' : 'text-gray-500'}`}
            >
              Create Account
            </button>
          </div>

          {activeTab === 'login' ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white">Welcome back</h3>
                <p className="text-sm text-gray-500">Sign in to your CivicHero account</p>
              </div>
              
              <button onClick={handleGoogleAuth} className="w-full bg-gray-800 text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-700">
                Continue with Google
              </button>
              
              <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-800"></div></div>
                  <span className="bg-gray-900 px-4 text-xs text-gray-500 font-mono">or with email</span>
              </div>

              <div className="space-y-4">
                <div className="relative">
                    <Mail className="absolute left-3 top-3.5 text-gray-500" size={16} />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" className="w-full bg-gray-950 border border-gray-800 text-white p-3 pl-10 rounded-xl outline-none focus:border-blue-500" />
                </div>
                <div className="relative">
                    <Lock className="absolute left-3 top-3.5 text-gray-500" size={16} />
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full bg-gray-950 border border-gray-800 text-white p-3 pl-10 rounded-xl outline-none focus:border-blue-500" />
                    <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-gray-500">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>
                {error && <p className="text-red-500 text-xs">{error}</p>}
                <div className='text-right'>
                    <button className='text-xs text-blue-400 hover:underline'>Forgot password?</button>
                </div>
                <button disabled={loading} onClick={handleSignIn} className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold mt-4 flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50">
                    {loading ? 'Signing in...' : 'Sign In ➔'}
                </button>
              </div>
              <p className='text-center text-xs text-gray-500'>No account? <button onClick={() => setActiveTab('signup')} className='text-blue-400 font-bold'>Create one free</button></p>
            </div>
          ) : (
            <div className="space-y-6">
              {step === 1 ? (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-6">
                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                        <span className="text-sm font-bold text-white">Account</span>
                        <span className="w-12 h-[1px] bg-gray-700"></span>
                        <span className="w-6 h-6 rounded-full bg-gray-800 text-gray-500 flex items-center justify-center text-xs font-bold">2</span>
                        <span className="text-sm text-gray-500">Profile Setup</span>
                    </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Create your account</h3>
                    <p className="text-sm text-gray-500">Enter your basic credentials to get started</p>
                  </div>
                  <input type="text" value={signupFullName} onChange={e => setSignupFullName(e.target.value)} placeholder="Full name" className="w-full bg-gray-950 border border-gray-800 text-white p-3 rounded-xl outline-none focus:border-blue-500" />
                  <input type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} placeholder="Email address" className="w-full bg-gray-950 border border-gray-800 text-white p-3 rounded-xl outline-none focus:border-blue-500" />
                  <input type="password" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} placeholder="Password (min 6 characters)" className="w-full bg-gray-950 border border-gray-800 text-white p-3 rounded-xl outline-none focus:border-blue-500" />
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm password" className="w-full bg-gray-950 border border-gray-800 text-white p-3 rounded-xl outline-none focus:border-blue-500" />
                  {error && <p className="text-red-500 text-xs">{error}</p>}
                  <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-800"></div></div>
                    <span className="bg-gray-900 px-4 text-xs text-gray-500 font-mono">or</span>
                  </div>
                  <button onClick={handleGoogleAuth} className="w-full bg-gray-800 text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-700">
                    Sign up with Google
                  </button>
                  <button onClick={handleSignupNext} className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700">
                    Continue ➔
                  </button>
                  <p className='text-center text-xs text-gray-500'>Already have an account? <button onClick={() => setActiveTab('login')} className='text-blue-400 font-bold'>Sign in</button></p>
                </div>
              ) : (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-6">
                        <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold"><Check size={14}/></span>
                        <span className="text-sm font-bold text-gray-500">Account</span>
                        <span className="w-12 h-[1px] bg-emerald-700"></span>
                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">2</span>
                        <span className="text-sm font-bold text-white">Profile Setup</span>
                    </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Set up your profile</h3>
                    <p className="text-sm text-gray-500">Choose your role and personalise your account</p>
                  </div>
                  <div className='flex gap-4 items-center'>
                    <div className='w-16 h-16 rounded-xl bg-gray-950 border-2 border-dashed border-gray-700 flex items-center justify-center text-gray-500 cursor-pointer overflow-hidden' onClick={() => document.getElementById('file-upload')?.click()}>
                        {profileImage ? <img src={profileImage} alt="Profile" className="w-full h-full object-cover" /> : <User/>}
                    </div>
                    <input id="file-upload" type="file" onChange={handleImageUpload} accept="image/*" className="hidden" />
                    <input type="text" placeholder="Or paste photo URL" className="flex-1 bg-gray-950 border border-gray-800 text-white p-3 rounded-xl outline-none focus:border-blue-500" />
                  </div>
                  <input type="tel" placeholder="Phone number (optional)" className="w-full bg-gray-950 border border-gray-800 text-white p-3 rounded-xl outline-none focus:border-blue-500" />
                  <p className="text-white font-bold text-sm">YOUR DESIGNATION *</p>
                  <div className="grid grid-cols-2 gap-3">
                    {(['Citizen', 'Volunteer', 'Department Officer', 'Administrator'] as UserRole[]).map(role => (
                      <button key={role} onClick={() => handleSignup(role)} className="p-3 border border-gray-700 rounded-xl text-xs text-gray-300 hover:bg-gray-800 text-left">
                        <span className='font-bold'>{role}</span>
                        <p className='text-[10px] text-gray-500'>Description here...</p>
                      </button>
                    ))}
                  </div>
                  <div className='flex gap-2 pt-4'>
                    <button onClick={() => setStep(1)} className='flex-1 border border-gray-700 p-3 rounded-xl text-white font-bold hover:bg-gray-800'>Back</button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className='text-center text-[10px] font-mono text-gray-600 pt-8'>
            CIVICHERO AI • POWERED BY GEMINI • SECURE AUTH
          </div>
        </div>
      </div>
    </div>
  );
}
