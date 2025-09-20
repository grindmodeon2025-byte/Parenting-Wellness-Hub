import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Button from './common/Button';

type ViewMode = 'login' | 'register' | 'forgotPassword' | 'resetPassword';

const Login: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('login');
  const { login, register, resetPassword } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [formState, setFormState] = useState({
    Name: 'Test User',
    Email: 'user@example.com',
    password: 'password123',
    confirmPassword: 'password123',
    ParentAge: 30,
    BabyBirthDate: '2024-06-01',
    PINCode: '110001',
    FamilyPreferences: 'Vegetarian, not spicy'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormState(prevState => ({
      ...prevState,
      [name]: type === 'number' && value ? parseInt(value, 10) : value,
    }));
  };

  const handleLoginOrRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (viewMode === 'register') {
        if (formState.password !== formState.confirmPassword) {
            throw new Error("Passwords do not match.");
        }
        const { password, confirmPassword, ...registrationData } = formState;
        await register(registrationData, password);
      } else { // 'login'
        await login(formState.Email, formState.password);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetRequest = (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setSuccess('');
      if (!formState.Email) {
          setError('Please enter your email address.');
          return;
      }
      // For this mock, we just proceed to the next step.
      setViewMode('resetPassword');
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formState.password !== formState.confirmPassword) {
        setError("Passwords do not match.");
        return;
    }
    if (!formState.password) {
        setError("Password cannot be empty.");
        return;
    }

    setIsLoading(true);
    try {
        await resetPassword(formState.Email, formState.password);
        setSuccess('Password has been reset successfully! Please log in.');
        setViewMode('login');
        setFormState(prev => ({...prev, password: '', confirmPassword: ''}));
    } catch (err: any) {
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
  }

  const switchView = (newView: ViewMode) => {
      setError('');
      setSuccess('');
      setViewMode(newView);
  }

  const renderContent = () => {
    switch (viewMode) {
        case 'register':
            return (
                <form onSubmit={handleLoginOrRegister} className="space-y-4">
                    <h2 className="text-xl font-semibold text-center text-slate-700">Create Your Account</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <InputField containerClassName="sm:col-span-2" label="Full Name" name="Name" type="text" value={formState.Name} onChange={handleChange} required />
                      <InputField label="Parent Age" name="ParentAge" type="number" value={formState.ParentAge} onChange={handleChange} required />
                      <InputField label="Baby's Date of Birth" name="BabyBirthDate" type="date" value={formState.BabyBirthDate} onChange={handleChange} required />
                      <InputField label="Area PIN Code" name="PINCode" type="text" value={formState.PINCode} onChange={handleChange} required />
                      <InputField label="Food Preference" name="FamilyPreferences" type="text" value={formState.FamilyPreferences} onChange={handleChange} required placeholder="e.g., Vegetarian" />
                      <InputField containerClassName="sm:col-span-2" label="Email Address" name="Email" type="email" value={formState.Email} onChange={handleChange} required />
                      <InputField containerClassName="sm:col-span-2" label="Password" name="password" type="password" value={formState.password} onChange={handleChange} required />
                      <InputField containerClassName="sm:col-span-2" label="Confirm Password" name="confirmPassword" type="password" value={formState.confirmPassword} onChange={handleChange} required />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Processing...' : 'Register'}</Button>
                    <p className="text-sm text-center text-slate-600">
                        Already have an account?{' '}
                        <button type="button" onClick={() => switchView('login')} className="font-semibold text-teal-600 hover:underline">Login here</button>
                    </p>
                </form>
            );
        case 'forgotPassword':
            return (
                <form onSubmit={handleResetRequest} className="space-y-4">
                    <h2 className="text-xl font-semibold text-center text-slate-700">Forgot Password</h2>
                    <p className="text-sm text-center text-slate-500">Enter your email to reset your password.</p>
                    <InputField label="Email Address" name="Email" type="email" value={formState.Email} onChange={handleChange} required />
                    <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Processing...' : 'Continue'}</Button>
                    <p className="text-sm text-center text-slate-600">
                        Remember your password?{' '}
                        <button type="button" onClick={() => switchView('login')} className="font-semibold text-teal-600 hover:underline">Back to Login</button>
                    </p>
                </form>
            );
        case 'resetPassword':
            return (
                 <form onSubmit={handlePasswordReset} className="space-y-4">
                    <h2 className="text-xl font-semibold text-center text-slate-700">Set New Password</h2>
                    <p className="text-sm text-center text-slate-500">Setting a new password for <strong>{formState.Email}</strong>.</p>
                    <InputField label="New Password" name="password" type="password" value={formState.password} onChange={handleChange} required />
                    <InputField label="Confirm New Password" name="confirmPassword" type="password" value={formState.confirmPassword} onChange={handleChange} required />
                    <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Processing...' : 'Set New Password'}</Button>
                 </form>
            );
        case 'login':
        default:
            return (
                <form onSubmit={handleLoginOrRegister} className="space-y-4">
                    <h2 className="text-xl font-semibold text-center text-slate-700">Welcome Back!</h2>
                    <InputField label="Email Address" name="Email" type="email" value={formState.Email} onChange={handleChange} required />
                    <InputField label="Password" name="password" type="password" value={formState.password} onChange={handleChange} required />
                    <div className="text-right text-sm">
                        <button type="button" onClick={() => switchView('forgotPassword')} className="font-semibold text-teal-600 hover:underline">Forgot Password?</button>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Processing...' : 'Login'}</Button>
                    <p className="text-sm text-center text-slate-600">
                        Don't have an account?{' '}
                        <button type="button" onClick={() => switchView('register')} className="font-semibold text-teal-600 hover:underline">Register now</button>
                    </p>
                </form>
            );
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center mb-8">
           <h1 className="text-3xl font-bold text-teal-600">Parenting Wellness Hub</h1>
           <p className="text-slate-500">Your AI-powered parenting companion</p>
        </div>
        {error && <p className="text-red-500 text-sm text-center mb-4 p-2 bg-red-50 rounded-md">{error}</p>}
        {success && <p className="text-green-600 text-sm text-center mb-4 p-2 bg-green-50 rounded-md">{success}</p>}
        
        {renderContent()}
        
      </div>
    </div>
  );
};

interface InputFieldProps {
  label: string;
  name: string;
  type: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
  containerClassName?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, name, containerClassName, ...props }) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const toggleVisibility = () => {
    setIsPasswordVisible(prev => !prev);
  };
  
  const isPasswordField = props.type === 'password';

  const inputClassName = `w-full p-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 ${isPasswordField ? 'pr-10' : ''}`;

  return (
    <div className={containerClassName}>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <div className="relative">
        <input 
          id={name} 
          name={name} 
          {...props} 
          type={isPasswordField ? (isPasswordVisible ? 'text' : 'password') : props.type}
          className={inputClassName}
        />
        {isPasswordField && (
          <button 
            type="button" 
            onClick={toggleVisibility}
            className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500 hover:text-slate-700"
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
          >
            {isPasswordVisible ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a9.97 9.97 0 01-1.563 3.029m0 0l-3.59-3.59m0 0l-3.59 3.59" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default Login;