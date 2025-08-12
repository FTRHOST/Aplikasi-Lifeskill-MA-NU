import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

declare const Swal: any;

// --- ICONS ---
const EyeIcon: React.FC<{className?: string}> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639l4.43-4.43a1.012 1.012 0 0 1 1.433 1.433L5.498 12l2.401 2.401a1.012 1.012 0 0 1-1.433 1.433l-4.43-4.43a1.012 1.012 0 0 1 0-.639Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5c4.97 0 9 4.03 9 9s-4.03 9-9 9-9-4.03-9-9 4.03-9 9-9Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);

const EyeSlashIcon: React.FC<{className?: string}> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.243 4.243L6.228 6.228" />
    </svg>
);

const ArrowLeftIcon: React.FC<{className?: string}> = ({ className = "w-4 h-4" }) => (
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
);

const API_URL = '/api'; // Use proxy, or http://localhost:5000/api

export const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('admin');
    const [password, setPassword] = useState('admin123');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('token', data.token);
                navigate('/admin');
            } else {
                throw new Error(data.message || 'Login Gagal');
            }
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Login Gagal',
                text: error.message || 'Username atau Password yang Anda masukkan salah.',
                confirmButtonColor: '#d33',
            });
            setPassword('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm animate-fade-in-up">
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <div className="flex justify-center mb-4">
                        <img src="https://manubanyuputih.id/wp-content/uploads/2020/05/cropped-logo-manu-baru-1.png" alt="Logo MA NU 01 Banyuputih" className="h-20 w-20" />
                    </div>
                    <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Admin Login</h2>
                    <p className="text-center text-slate-500 mb-6 text-base">MA NU 01 Banyuputih</p>
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                                placeholder="Masukkan username"
                                autoFocus
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                                    placeholder="Masukkan password"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-700 transition-colors"
                                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                                    disabled={loading}
                                >
                                    {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                                </button>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white font-bold py-2.5 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors mt-4 disabled:bg-indigo-400 disabled:cursor-not-allowed flex justify-center items-center"
                            disabled={loading}
                        >
                            {loading ? (
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : 'Masuk'}
                        </button>
                    </form>
                </div>
                 <div className="text-center mt-6">
                    <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors group">
                        <ArrowLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        Kembali ke Formulir
                    </Link>
                </div>
            </div>
        </div>
    );
};
