import React, { useState, FormEvent } from 'react';
import { LockIcon } from './Icons';

interface LockScreenProps {
  onUnlock: () => void;
}

const PASSWORD_STORAGE_KEY = 'teachers_assistant_password';

const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const storedPasswordValue = window.localStorage.getItem(PASSWORD_STORAGE_KEY);
    
    if (!storedPasswordValue) {
      setError('لا توجد كلمة مرور مسجلة.');
      return;
    }

    let correctPassword;
    try {
      // New format is a JSON-encoded string (e.g., "\"1234\""). Parsing gives the string "1234".
      // Old format might be a raw string that looks like a number (e.g., "1234"). Parsing gives the number 1234.
      const parsed = JSON.parse(storedPasswordValue);
      // We always compare string against string, so we convert the parsed result.
      correctPassword = String(parsed);
    } catch (e) {
      // If parsing fails, it means it's a raw string that isn't valid JSON (e.g., an old non-numeric password).
      // In this case, the raw value is the correct password.
      correctPassword = storedPasswordValue;
    }

    if (passwordInput === correctPassword) {
      onUnlock();
    } else {
      setError('كلمة المرور غير صحيحة. حاول مرة أخرى.');
      setPasswordInput('');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900">
      <div className="w-full max-w-sm p-8 space-y-8 bg-white dark:bg-slate-800 rounded-lg shadow-xl">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-teal-100 dark:bg-teal-900/50">
            <LockIcon className="h-6 w-6 text-teal-600 dark:text-teal-400" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-slate-100">التطبيق مؤمن</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">
            يرجى إدخال كلمة المرور للمتابعة.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="password-input" className="sr-only">Password</label>
              <input
                id="password-input"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="input-style text-center"
                placeholder="كلمة المرور"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <p className="text-center text-sm text-red-500">{error}</p>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
            >
              فتح القفل
            </button>
          </div>
        </form>
      </div>
      <style>{`
        .input-style {
            background-color: #f8fafc;
            border: 1px solid #cbd5e1;
            border-radius: 0.375rem;
            padding: 0.75rem;
            color: #1e293b;
            width: 100%;
        }
        .input-style:focus {
            outline: none;
            box-shadow: 0 0 0 2px #14b8a6;
            border-color: #14b8a6;
        }
        .dark .input-style {
            background-color: #334155;
            border-color: #475569;
            color: #f1f5f9;
        }
      `}</style>
    </div>
  );
};

export default LockScreen;