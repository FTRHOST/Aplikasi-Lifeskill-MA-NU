import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { ClassLevel, LifeSkill, Gender } from '../types';
import { CLASS_OPTIONS, LIFE_SKILL_OPTIONS } from '../constants';
import { useStudents } from '../hooks/useStudents';

declare const Swal: any;

export const RegistrationPage: React.FC = () => {
    const [fullName, setFullName] = useState('');
    const [classLevel, setClassLevel] = useState<ClassLevel | ''>('');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [lifeSkill, setLifeSkill] = useState<LifeSkill | ''>('');
    const [jenisKelamin, setJenisKelamin] = useState<Gender | ''>('');
    const { addStudent } = useStudents();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!fullName || !classLevel || !whatsappNumber || !lifeSkill || !jenisKelamin) {
            Swal.fire({
                icon: 'error',
                title: 'Data Belum Lengkap',
                text: 'Mohon pastikan semua kolom telah diisi.',
                confirmButtonColor: '#4f46e5',
            });
            return;
        }

        addStudent({ fullName, classLevel, whatsappNumber, lifeSkill, jenisKelamin });
        
        Swal.fire({
            icon: 'success',
            title: 'Pendaftaran Berhasil!',
            text: 'Terima kasih, data Anda telah berhasil kami simpan.',
            confirmButtonColor: '#10b981',
        });

        // Reset form
        setFullName('');
        setClassLevel('');
        setWhatsappNumber('');
        setLifeSkill('');
        setJenisKelamin('');
    };
    
    return (
        <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
            <div className="absolute top-4 right-4 print-hidden">
                <Link to="/login" className="text-sm font-medium text-slate-700 bg-white hover:bg-slate-200/50 px-4 py-2 rounded-lg shadow-sm transition-colors">
                    Admin Login
                </Link>
            </div>
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden animate-fade-in-up">
                <div className="bg-indigo-600 p-6 flex flex-col items-center">
                    <img src="https://manubanyuputih.id/wp-content/uploads/2020/05/cropped-logo-manu-baru-1.png" alt="Logo MA NU 01 Banyuputih" className="h-20 w-20 mb-4" />
                    <h1 className="text-3xl font-bold text-white text-center">Formulir Pendaftaran Life Skill</h1>
                    <p className="text-center text-indigo-200 mt-2 text-lg">MA NU 01 Banyuputih</p>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                        <input
                            type="text"
                            id="fullName"
                            value={fullName}
                            onInput={(e) => setFullName((e.target as HTMLInputElement).value.toUpperCase())}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            placeholder="Contoh: AHMAD FAUZI"
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Jenis Kelamin</label>
                        <div className="flex gap-x-6">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="jenisKelamin"
                                    value="Laki-laki"
                                    checked={jenisKelamin === 'Laki-laki'}
                                    onChange={(e) => setJenisKelamin(e.target.value as Gender)}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                                />
                                <span className="ml-2 text-sm text-slate-800">Laki-laki</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="jenisKelamin"
                                    value="Perempuan"
                                    checked={jenisKelamin === 'Perempuan'}
                                    onChange={(e) => setJenisKelamin(e.target.value as Gender)}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                                />
                                <span className="ml-2 text-sm text-slate-800">Perempuan</span>
                            </label>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="classLevel" className="block text-sm font-medium text-slate-700 mb-1">Kelas</label>
                        <select
                            id="classLevel"
                            value={classLevel}
                            onChange={(e) => setClassLevel(e.target.value as ClassLevel)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        >
                            <option value="" disabled>Pilih Kelas</option>
                            {CLASS_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="whatsappNumber" className="block text-sm font-medium text-slate-700 mb-1">Nomor WhatsApp</label>
                        <input
                            type="tel"
                            id="whatsappNumber"
                            value={whatsappNumber}
                            onChange={(e) => setWhatsappNumber(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            placeholder="Contoh: 081234567890"
                        />
                    </div>
                    <div>
                        <label htmlFor="lifeSkill" className="block text-sm font-medium text-slate-700 mb-1">Pilihan Life Skill</label>
                        <select
                            id="lifeSkill"
                            value={lifeSkill}
                            onChange={(e) => setLifeSkill(e.target.value as LifeSkill)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        >
                            <option value="" disabled>Pilih Life Skill</option>
                            {LIFE_SKILL_OPTIONS.map(ls => <option key={ls} value={ls}>{ls}</option>)}
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all duration-300"
                    >
                        Kirim Pendaftaran
                    </button>
                </form>
            </div>
             <footer className="text-center mt-8 text-slate-500 text-sm animate-fade-in">
                <p>&copy; {new Date().getFullYear()} MA NU 01 Banyuputih. All rights reserved.</p>
            </footer>
        </div>
    );
};