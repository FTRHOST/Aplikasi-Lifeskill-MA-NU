import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { useStudents } from '../hooks/useStudents';
import type { Student, ClassLevel, LifeSkill, Gender } from '../types';
import { CLASS_OPTIONS, LIFE_SKILL_OPTIONS } from '../constants';
import { StudentModal } from '../components/StudentModal';

declare const Swal: any;
declare const XLSX: any;

type AdminView = 'dashboard' | 'report-class' | 'report-lifeskill' | 'summary';
type SortConfig = { key: keyof Student; direction: 'ascending' | 'descending' } | null;

// SVG Icons for better UI
const ICONS = {
    DASHBOARD: (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>,
    CLASS_REPORT: (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.67c.12-.24.232-.49.335-.742M15 19.128a2.373 2.373 0 00.375-1.465c0-1.336-.91-2.5-2.125-2.5h-1.5c-1.215 0-2.125 1.164-2.125 2.5 0 .59.176 1.134.475 1.625m10.5-11.625a2.373 2.373 0 00-3.44-2.087c-1.302.94-2.401 2.06-3.134 3.325C7.996 11.23 7.5 12.24 7.5 13.312c0 1.336.91 2.5 2.125 2.5h1.5c.394 0 .764-.106 1.087-.298m10.5-11.625c.343.14.654.318.94.533m-9.444 6.363c.318-.19.654-.347.94-.533m5.124 5.124c.318.19.654.347.94.533" /></svg>,
    LIFESKILL_REPORT: (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>,
    SUMMARY: (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125h17.25c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504-1.125-1.125 1.125m-17.25 0h.008v.015h-.008V19.5zm17.25 0h.008v.015h-.008V19.5zM3.375 16.125c0-.621.504-1.125 1.125-1.125h15c.621 0 1.125.504 1.125 1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-15c-.621 0-1.125.504-1.125 1.125v1.5zM3.375 12.375c0-.621.504-1.125 1.125-1.125h15c.621 0 1.125.504 1.125 1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-15c-.621 0-1.125.504-1.125 1.125v1.5zM3.375 8.625c0-.621.504-1.125 1.125-1.125h15c.621 0 1.125.504 1.125 1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-15c-.621 0-1.125.504-1.125 1.125v1.5z" /></svg>,
    LOGOUT: (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>,
    PENCIL: (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>,
    TRASH: (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>,
    MENU: (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>,
    CLOSE: (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>,
    SEARCH: (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>,
};


export const AdminPage: React.FC = () => {
    const [activeView, setActiveView] = useState<AdminView>('dashboard');
    const [isModalOpen, setModalOpen] = useState(false);
    const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
    const [filter, setFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'fullName', direction: 'ascending' });
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [summaryLifeSkillFilter, setSummaryLifeSkillFilter] = useState<LifeSkill | '' | 'SEMUA'>('');
    const [summaryClassFilter, setSummaryClassFilter] = useState<ClassLevel | '' | 'SEMUA'>('');


    const { students, loading, addStudent, updateStudent, deleteStudent } = useStudents();
    const navigate = useNavigate();
    
    useEffect(() => {
        if(isSidebarOpen) {
            setSidebarOpen(false);
        }
    }, [activeView]);

    const printContent = (title: string, content: string) => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            const html = `
                <html>
                <head>
                    <title>Cetak - ${title}</title>
                    <link rel="preconnect" href="https://fonts.googleapis.com">
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
                    <style>
                        @media print { @page { size: 8.5in 13in; margin: 2cm 1.5cm; } }
                        body { font-family: 'Poppins', sans-serif; color: #000; }
                        .kop-sekolah { 
                            display: flex;
                            align-items: center;
                            gap: 20px;
                            text-align: left;
                            border-bottom: 3px solid black; 
                            padding-bottom: 10px; 
                            margin-bottom: 25px; 
                        }
                        .kop-sekolah img {
                             width: 85px;
                             height: 85px;
                        }
                        .kop-sekolah .text-container { flex-grow: 1; text-align: center; }
                        .kop-sekolah h2, .kop-sekolah h3, .kop-sekolah p { margin: 0; line-height: 1.4; }
                        .kop-sekolah h2 { font-size: 16pt; font-weight: 600; }
                        .kop-sekolah h3 { font-size: 18pt; font-weight: 700; }
                        .kop-sekolah p { font-size: 11pt; font-weight: 400; }
                        .report-main-title { text-align: center; font-size: 14pt; font-weight: bold; margin-bottom: 20px; text-transform: uppercase; text-decoration: underline; }
                        .table-title { font-size: 12pt; font-weight: bold; margin-top: 20px; margin-bottom: 10px; }
                        table { width: 100%; border-collapse: collapse; font-size: 11pt; }
                        th, td { border: 1px solid black; padding: 6px; text-align: left; vertical-align: top; }
                        th { font-weight: bold; background-color: #EFEFEF; text-align: center; }
                        td.number, td.center { text-align: center; }
                        tfoot td { font-weight: bold; background-color: #EFEFEF; }
                    </style>
                </head>
                <body>
                    <div class="kop-sekolah">
                         <img src="https://manubanyuputih.id/wp-content/uploads/2020/05/cropped-logo-manu-baru-1.png" alt="Logo Sekolah" />
                         <div class="text-container">
                             <h2>LEMBAGA PENDIDIKAN MAARIF NU</h2>
                             <h3>MA NU 01 BANYUPUTIH</h3>
                             <p>Alamat : Jl. Lapangan 9A Banyuputih Batang Jawa Tengah, 51271</p>
                         </div>
                    </div>
                    <div class="report-main-title">${title}</div>
                    ${content}
                </body>
                </html>
            `;
            printWindow.document.write(html);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
        }
    };
    
    const tableToHtml = (data: Record<string, any>[], includeTotal: boolean = false) => {
        if (!data || data.length === 0) return '<p>Tidak ada data untuk ditampilkan.</p>';
        const headers = Object.keys(data[0]);
        const headerRow = `<tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`;
        const bodyRows = data.map(row => 
            `<tr>${headers.map(h => {
                const val = row[h];
                const cssClass = typeof val === 'number' ? 'class="center"' : '';
                return `<td ${cssClass}>${val}</td>`;
            }).join('')}</tr>`
        ).join('');

        let footerRow = '';
        if (includeTotal) {
            const total = data.reduce((sum, item) => sum + (item['Jumlah Pendaftar'] || 0), 0);
            if (headers.length > 1) {
                footerRow = `<tfoot><tr><td colspan="${headers.length - 1}">Total</td><td class="center">${total}</td></tr></tfoot>`;
            }
        }

        return `<table><thead>${headerRow}</thead><tbody>${bodyRows}</tbody>${footerRow}</table>`;
    };

    const handleLogout = () => {
        sessionStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('token');
        navigate('/login');
    };

    const openCreateModal = () => {
        setStudentToEdit(null);
        setModalOpen(true);
    };

    const openEditModal = (student: Student) => {
        setStudentToEdit(student);
        setModalOpen(true);
    };

    const handleSaveStudent = (studentData: Omit<Student, 'id'> | Student) => {
        if ('id' in studentData) {
            updateStudent(studentData);
            Swal.fire({title: 'Sukses!', text: 'Data siswa berhasil diperbarui.', icon: 'success', confirmButtonColor: '#10b981'});
        } else {
            addStudent(studentData);
            Swal.fire({title: 'Sukses!', text: 'Siswa baru berhasil ditambahkan.', icon: 'success', confirmButtonColor: '#10b981'});
        }
        setModalOpen(false);
    };

    const handleDeleteStudent = (student: Student) => {
        Swal.fire({
            title: 'Anda yakin?',
            text: `Anda akan menghapus data siswa "${student.fullName}". Aksi ini tidak dapat dibatalkan.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        }).then((result:any) => {
            if (result.isConfirmed) {
                deleteStudent(student.id);
                Swal.fire('Terhapus!', 'Data siswa telah dihapus.', 'success');
            }
        });
    };
    
    const handleDownload = (data: any[], filename: string) => {
        if (data.length === 0) {
            Swal.fire('Informasi', 'Tidak ada data untuk diunduh.', 'info');
            return;
        }
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan");
        XLSX.writeFile(workbook, `${filename}_${new Date().toLocaleDateString('id-ID')}.xlsx`);
    };

    const requestSort = (key: keyof Student) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const filteredAndSortedStudents = useMemo(() => {
        let result: Student[] = [...students];

        if (filter) {
            if (activeView === 'report-class') {
                result = result.filter(s => s.classLevel === filter);
            } else if (activeView === 'report-lifeskill') {
                result = result.filter(s => s.lifeSkill === filter);
            }
        }

        if (searchQuery) {
            const lowercasedQuery = searchQuery.toLowerCase();
            result = result.filter(s => 
                s.fullName.toLowerCase().includes(lowercasedQuery) ||
                s.jenisKelamin.toLowerCase().includes(lowercasedQuery) ||
                s.classLevel.toLowerCase().includes(lowercasedQuery) ||
                s.whatsappNumber.toLowerCase().includes(lowercasedQuery) ||
                s.lifeSkill.toLowerCase().includes(lowercasedQuery)
            );
        }
        
        if (sortConfig) {
            result.sort((a, b) => {
                const valA = a[sortConfig.key];
                const valB = b[sortConfig.key];
                if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [students, filter, searchQuery, activeView, sortConfig]);

    const detailedCountSummary = useMemo(() => {
        if (summaryLifeSkillFilter === '' || summaryClassFilter === '') {
            return { title: '', data: [], headers: [] };
        }

        const isAllSkills = summaryLifeSkillFilter === 'SEMUA';
        const isAllClasses = summaryClassFilter === 'SEMUA';

        let filteredStudents = students;
        if (!isAllSkills) {
            filteredStudents = filteredStudents.filter(s => s.lifeSkill === summaryLifeSkillFilter);
        }
        if (!isAllClasses) {
            filteredStudents = filteredStudents.filter(s => s.classLevel === summaryClassFilter);
        }

        if (!isAllSkills && isAllClasses) {
            const title = `Jumlah Pendaftar ${summaryLifeSkillFilter} per Kelas`;
            const headers = ["Kelas", "Jumlah Pendaftar"];
            const counts = CLASS_OPTIONS.reduce((acc, classLevel) => ({ ...acc, [classLevel]: 0 }), {} as Record<ClassLevel, number>);
            filteredStudents.forEach(s => { counts[s.classLevel]++; });
            const data = Object.entries(counts).map(([kelas, jumlah]) => ({ "Kelas": kelas, "Jumlah Pendaftar": jumlah }));
            return { title, data, headers };
        }

        if (isAllSkills && !isAllClasses) {
            const title = `Jumlah Pendaftar per Life Skill di Kelas ${summaryClassFilter}`;
            const headers = ["Program Life Skill", "Jumlah Pendaftar"];
            const counts = LIFE_SKILL_OPTIONS.reduce((acc, skill) => ({ ...acc, [skill]: 0 }), {} as Record<LifeSkill, number>);
            filteredStudents.forEach(s => { counts[s.lifeSkill]++; });
            const data = Object.entries(counts).map(([skill, jumlah]) => ({ "Program Life Skill": skill, "Jumlah Pendaftar": jumlah }));
            return { title, data, headers };
        }

        if (!isAllSkills && !isAllClasses) {
            const title = `Jumlah Pendaftar ${summaryLifeSkillFilter} di Kelas ${summaryClassFilter}`;
            const headers = ["Keterangan", "Jumlah Pendaftar"];
            const data = [{ "Keterangan": `${summaryLifeSkillFilter} - Kelas ${summaryClassFilter}`, "Jumlah Pendaftar": filteredStudents.length }];
            return { title, data, headers };
        }

        if (isAllSkills && isAllClasses) {
            const title = `Jumlah Pendaftar per Life Skill (Semua Kelas)`;
            const headers = ["Program Life Skill", "Jumlah Pendaftar"];
            const counts = LIFE_SKILL_OPTIONS.reduce((acc, skill) => ({ ...acc, [skill]: 0 }), {} as Record<LifeSkill, number>);
            students.forEach(s => { counts[s.lifeSkill]++; });
            const data = Object.entries(counts).map(([skill, jumlah]) => ({ "Program Life Skill": skill, "Jumlah Pendaftar": jumlah }));
            return { title, data, headers };
        }

        return { title: '', data: [], headers: [] };
    }, [students, summaryLifeSkillFilter, summaryClassFilter]);

    const LoadingSpinner = () => (
        <div className="flex justify-center items-center h-64">
            <svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>
    );

    const renderContent = () => {
        if (loading) return <LoadingSpinner />;
        switch (activeView) {
            case 'dashboard':
                return <DashboardView students={students} />;
            case 'report-class':
            case 'report-lifeskill': {
                 const isClassReport = activeView === 'report-class';
                 const reportTitle = isClassReport ? 'Laporan per Kelas' : 'Laporan per Pilihan Life Skill';
                 const filterOptions = isClassReport ? CLASS_OPTIONS : LIFE_SKILL_OPTIONS;
                 const filterLabel = isClassReport ? 'Filter Kelas' : 'Filter Life Skill';
                 
                 const dataToDownload = filteredAndSortedStudents.map(({id, ...rest}, index) => ({
                    'No.': index + 1,
                    'Nama Lengkap': rest.fullName,
                    'Jenis Kelamin': rest.jenisKelamin,
                    'Kelas': rest.classLevel,
                    'No. WhatsApp': rest.whatsappNumber,
                    'Pilihan Life Skill': rest.lifeSkill,
                }));
                 const dataToPrint = dataToDownload;

                let printTitle = `Laporan Pendaftar Life Skill`;
                if (filter) printTitle += ` ${isClassReport ? 'Kelas' : 'Pilihan'} ${filter}`;
                else printTitle = "Laporan Seluruh Pendaftar Life Skill";

                const handleSingleReportPrint = () => {
                    if (dataToPrint.length === 0) {
                        Swal.fire('Informasi', 'Tidak ada data untuk dicetak.', 'info');
                        return;
                    }
                    printContent(printTitle, tableToHtml(dataToPrint));
                };

                return (
                    <div className="bg-white p-6 rounded-lg shadow-md animate-fade-in">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4 print-hidden">
                            <h2 className="text-2xl font-bold text-slate-800">{reportTitle}</h2>
                            <div className="flex gap-2">
                                <button onClick={handleSingleReportPrint} className="bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium">Cetak</button>
                                <button onClick={() => handleDownload(dataToDownload, reportTitle.replace(/\s+/g, '_'))} className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium">Unduh Excel</button>
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4 print-hidden">
                            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                                <div className="relative w-full sm:w-auto">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                        <ICONS.SEARCH className="w-5 h-5 text-slate-400" />
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="Cari siswa..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="border border-slate-300 rounded-md py-2 pl-10 pr-4 w-full sm:w-60 focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <label htmlFor="filter" className="text-sm font-medium text-slate-600 whitespace-nowrap">{filterLabel}:</label>
                                    <select id="filter" value={filter} onChange={e => setFilter(e.target.value)} className="border border-slate-300 rounded-md px-2 py-2 bg-white w-full focus:ring-2 focus:ring-indigo-500">
                                        <option value="">Semua</option>
                                        {filterOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                            </div>
                            <button onClick={openCreateModal} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors w-full md:w-auto flex-shrink-0 font-medium">Tambah Siswa</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white">
                                <thead className="bg-slate-100">
                                    <tr>
                                        <th className="py-3 px-4 text-center text-sm font-semibold text-slate-600 w-12">No.</th>
                                        <ThSortable title="Nama" sortKey="fullName" sortConfig={sortConfig} onRequestSort={requestSort} />
                                        <ThSortable title="Jenis Kelamin" sortKey="jenisKelamin" sortConfig={sortConfig} onRequestSort={requestSort} />
                                        <ThSortable title="Kelas" sortKey="classLevel" sortConfig={sortConfig} onRequestSort={requestSort} />
                                        <th className="py-3 px-4 text-left text-sm font-semibold text-slate-600">WhatsApp</th>
                                        <ThSortable title="Life Skill" sortKey="lifeSkill" sortConfig={sortConfig} onRequestSort={requestSort} />
                                        <th className="py-3 px-4 text-center text-sm font-semibold text-slate-600 print-hidden">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAndSortedStudents.map((s, index) => (
                                        <tr key={s.id} className="border-b border-slate-200 hover:bg-slate-50">
                                            <td className="py-3 px-4 text-center text-slate-500">{index + 1}</td>
                                            <td className="py-3 px-4">{s.fullName}</td>
                                            <td className="py-3 px-4 text-center">{s.jenisKelamin}</td>
                                            <td className="py-3 px-4 text-center">{s.classLevel}</td>
                                            <td className="py-3 px-4">{s.whatsappNumber}</td>
                                            <td className="py-3 px-4">{s.lifeSkill}</td>
                                            <td className="py-3 px-4 flex justify-center gap-3 print-hidden">
                                                <button onClick={() => openEditModal(s)} className="text-blue-600 hover:text-blue-800 transition-colors" aria-label={`Ubah ${s.fullName}`}><ICONS.PENCIL className="w-5 h-5"/></button>
                                                <button onClick={() => handleDeleteStudent(s)} className="text-red-600 hover:text-red-800 transition-colors" aria-label={`Hapus ${s.fullName}`}><ICONS.TRASH className="w-5 h-5"/></button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredAndSortedStudents.length === 0 && (
                                        <tr><td colSpan={7} className="text-center py-8 text-slate-500">Tidak ada data untuk ditampilkan.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            }
            case 'summary': {
                const summaryByLifeSkill = LIFE_SKILL_OPTIONS.map((ls, index) => ({ "No.": index + 1, "Life Skill": ls, "Jumlah Pendaftar": students.filter(s => s.lifeSkill === ls).length }));
                const summaryByClass = CLASS_OPTIONS.map((c, index) => ({ "No.": index + 1, "Kelas": c, "Jumlah Pendaftar": students.filter(s => s.classLevel === c).length }));
                
                const handleDetailedSummaryPrint = () => {
                    if (detailedCountSummary.data.length === 0) {
                        Swal.fire('Informasi', 'Tidak ada data untuk dicetak.', 'info');
                        return;
                    }
                    printContent(detailedCountSummary.title, tableToHtml(detailedCountSummary.data, true));
                };

                const handleDetailedSummaryDownload = () => {
                     handleDownload(detailedCountSummary.data, detailedCountSummary.title.replace(/\s+/g, '_'));
                };

                return (
                    <div className="space-y-8 animate-fade-in">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                             <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-slate-800">Laporan Rekapitulasi</h2>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                 <SummaryTable 
                                    title="Rekap per Pilihan Life Skill" 
                                    data={summaryByLifeSkill} 
                                    onPrint={() => printContent("Rekapitulasi per Pilihan Life Skill", tableToHtml(summaryByLifeSkill, true))}
                                    onDownload={() => handleDownload(summaryByLifeSkill, 'Rekap_Life_Skill')}
                                />
                                <SummaryTable 
                                    title="Rekap per Kelas" 
                                    data={summaryByClass} 
                                    onPrint={() => printContent("Rekapitulasi per Kelas", tableToHtml(summaryByClass, true))}
                                    onDownload={() => handleDownload(summaryByClass, 'Rekap_Kelas')}
                                />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold text-slate-800 mb-2">Rincian Jumlah Pendaftar</h2>
                            <p className="text-slate-600 mb-6">Pilih filter untuk melihat rincian jumlah pendaftar secara spesifik.</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label htmlFor="summaryLifeSkillFilter" className="block text-sm font-medium text-slate-700 mb-1">Program Life Skill</label>
                                    <select id="summaryLifeSkillFilter" value={summaryLifeSkillFilter} onChange={e => setSummaryLifeSkillFilter(e.target.value as any)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500">
                                        <option value="">Pilih Life Skill</option>
                                        <option value="SEMUA">Semua Program Life Skill</option>
                                        {LIFE_SKILL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="summaryClassFilter" className="block text-sm font-medium text-slate-700 mb-1">Kelas</label>
                                    <select id="summaryClassFilter" value={summaryClassFilter} onChange={e => setSummaryClassFilter(e.target.value as any)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500">
                                        <option value="">Pilih Kelas</option>
                                        <option value="SEMUA">Semua Kelas</option>
                                        {CLASS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                            </div>

                            {summaryLifeSkillFilter && summaryClassFilter && (
                                <div className="animate-fade-in mt-6">
                                    {detailedCountSummary.data.length > 0 ? (
                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-lg font-semibold text-slate-700">
                                                    {detailedCountSummary.title}
                                                </h3>
                                                <div className="flex gap-2">
                                                    <button onClick={handleDetailedSummaryPrint} className="bg-slate-600 text-white px-3 py-1.5 rounded-md hover:bg-slate-700 transition-colors text-sm font-medium">Cetak</button>
                                                    <button onClick={handleDetailedSummaryDownload} className="bg-emerald-600 text-white px-3 py-1.5 rounded-md hover:bg-emerald-700 transition-colors text-sm font-medium">Unduh Excel</button>
                                                </div>
                                            </div>
                                            <DynamicSummaryTable summary={detailedCountSummary} />
                                        </div>
                                    ) : (
                                         <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg">
                                            Tidak ada data pendaftar yang cocok dengan filter ini.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                );
            }
            default:
                return null;
        }
    };
    
    const changeView = (view: AdminView) => {
        setActiveView(view);
        setFilter('');
        setSearchQuery('');
        setSummaryClassFilter('');
        setSummaryLifeSkillFilter('');
    };

    return (
        <div className="h-screen bg-slate-100 flex overflow-hidden">
            {isSidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)}></div>}
            
            <nav className={`fixed lg:relative inset-y-0 left-0 w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col transition-transform duration-300 ease-in-out transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 z-30 print-hidden`}>
                <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="https://manubanyuputih.id/wp-content/uploads/2020/05/cropped-logo-manu-baru-1.png" alt="Logo Sekolah" className="h-10 w-10" />
                        <div>
                            <h1 className="text-lg font-bold text-white">Admin Panel</h1>
                            <p className="text-xs text-slate-400">Life Skill MANUSA</p>
                        </div>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white" aria-label="Tutup menu"><ICONS.CLOSE className="w-6 h-6" /></button>
                </div>
                <ul className="flex-1 p-2">
                    <NavItem icon={ICONS.DASHBOARD} text="Dashboard" active={activeView === 'dashboard'} onClick={() => changeView('dashboard')} />
                    <NavItem icon={ICONS.CLASS_REPORT} text="Laporan per Kelas" active={activeView === 'report-class'} onClick={() => changeView('report-class')} />
                    <NavItem icon={ICONS.LIFESKILL_REPORT} text="Laporan Life Skill" active={activeView === 'report-lifeskill'} onClick={() => changeView('report-lifeskill')} />
                    <NavItem icon={ICONS.SUMMARY} text="Laporan Rekap" active={activeView === 'summary'} onClick={() => changeView('summary')} />
                </ul>
                <div className="p-2 border-t border-slate-700/50">
                    <NavItem icon={ICONS.LOGOUT} text="Logout" onClick={handleLogout} />
                </div>
            </nav>
            
            <div className="flex-1 flex flex-col overflow-y-auto">
                <header className="sticky top-0 bg-slate-100/80 backdrop-blur-sm z-10 p-2 flex items-center justify-between lg:hidden print-hidden shadow-sm">
                    <div className="flex items-center gap-2">
                        <img src="https://manubanyuputih.id/wp-content/uploads/2020/05/cropped-logo-manu-baru-1.png" alt="Logo Sekolah" className="h-8 w-8 ml-2" />
                        <span className="font-bold text-slate-700 text-lg">Admin Panel</span>
                    </div>
                    <button onClick={() => setSidebarOpen(true)} className="p-2 mr-2 text-slate-600 hover:text-indigo-600" aria-label="Buka menu"><ICONS.MENU className="w-6 h-6" /></button>
                </header>

                <main className="flex-1 p-4 sm:p-6">
                    {renderContent()}
                </main>
            </div>

            <StudentModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onSave={handleSaveStudent} studentToEdit={studentToEdit} />
        </div>
    );
};

const ThSortable: React.FC<{
    title: string;
    sortKey: keyof Student;
    sortConfig: SortConfig;
    onRequestSort: (key: keyof Student) => void;
    className?: string;
}> = ({ title, sortKey, sortConfig, onRequestSort, className = '' }) => {
    const isActive = sortConfig?.key === sortKey;
    const icon = isActive ? (sortConfig?.direction === 'ascending' ? '▲' : '▼') : '↕';

    return (
        <th className={`py-3 px-4 text-left text-sm font-semibold text-slate-600 ${className}`}>
            <button onClick={() => onRequestSort(sortKey)} className="group inline-flex items-center gap-2 focus:outline-none">
                <span>{title}</span>
                <span className={`transition-opacity ${isActive ? 'opacity-100 text-indigo-600' : 'opacity-30 text-slate-400 group-hover:opacity-100'}`}>
                    {icon}
                </span>
            </button>
        </th>
    );
};

const NavItem = ({ icon: Icon, text, active = false, onClick }: any) => (
    <li>
        <button onClick={onClick} className={`flex items-center w-full p-3 my-1 rounded-lg transition-colors duration-200 ${active ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-slate-700/50'}`}>
            <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
            <span className="font-medium">{text}</span>
        </button>
    </li>
);

const SummaryTable: React.FC<{
    title: string; 
    data: any[];
    onPrint: () => void;
    onDownload: () => void;
}> = ({title, data, onPrint, onDownload}) => {
    const headers = data.length > 0 ? Object.keys(data[0]) : [];
    const totalPendaftar = data.reduce((sum, item) => sum + (item['Jumlah Pendaftar'] || 0), 0);

    return(
        <div>
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-slate-700">{title}</h3>
                <div className="flex gap-2 print-hidden">
                    <button onClick={onPrint} className="bg-slate-600 text-white px-3 py-1 text-sm rounded-md hover:bg-slate-700 transition-colors">Cetak</button>
                    <button onClick={() => onDownload()} className="bg-emerald-600 text-white px-3 py-1 text-sm rounded-md hover:bg-emerald-700 transition-colors">Unduh Excel</button>
                </div>
            </div>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="min-w-full bg-white">
                    <thead className="bg-slate-100">
                        <tr>
                            {headers.map(header => <th key={header} className={`py-2 px-4 text-left font-semibold text-sm text-slate-600 ${typeof data[0]?.[header] === 'number' ? 'text-center' : 'text-left'}`}>{header}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                        <tr key={index} className="border-b border-slate-200 last:border-b-0">
                            {headers.map(header => <td key={header} className={`py-2 px-4 ${typeof item[header] === 'number' ? 'text-center' : 'text-left'}`}>{item[header]}</td>)}
                        </tr>
                        ))}
                        {data.length === 0 && (
                           <tr>
                               <td colSpan={headers.length || 3} className="text-center py-6 text-slate-500">Tidak ada data untuk ditampilkan.</td>
                           </tr>
                        )}
                    </tbody>
                     {data.length > 0 && (
                        <tfoot className="bg-slate-100 font-bold text-slate-800">
                            <tr>
                                <td className="py-2 px-4 text-left" colSpan={headers.length - 1}>Total</td>
                                <td className="py-2 px-4 text-center">{totalPendaftar}</td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </div>
    );
}

const DynamicSummaryTable: React.FC<{
    summary: { data: any[], headers: string[] }
}> = ({ summary }) => {
    const { data, headers } = summary;
    const total = data.reduce((sum, item) => sum + (item['Jumlah Pendaftar'] || 0), 0);

    return (
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="min-w-full bg-white">
                <thead className="bg-slate-100">
                    <tr>
                        {headers.map(header => (
                            <th key={header} className={`py-2 px-4 text-left font-semibold text-sm text-slate-600 ${header.includes('Jumlah') ? 'text-center' : 'text-left'}`}>{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={index} className="border-b border-slate-200 last:border-b-0">
                            {headers.map(header => (
                                <td key={header} className={`py-2 px-4 ${header.includes('Jumlah') ? 'text-center' : 'text-left'}`}>{item[header]}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
                {data.length > 0 && headers.length > 1 && (
                    <tfoot className="bg-slate-100 font-bold text-slate-800">
                        <tr>
                            <td className="py-2 px-4 text-left" colSpan={headers.length - 1}>Total</td>
                            <td className="py-2 px-4 text-center">{total}</td>
                        </tr>
                    </tfoot>
                )}
            </table>
        </div>
    );
};

const StatCard: React.FC<{title: string, value: string | number, color: string}> = ({title, value, color}) => (
    <div className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${color}`}>
        <h3 className="text-base font-medium text-slate-500">{title}</h3>
        <p className="text-3xl font-bold text-slate-800 mt-2">{value}</p>
    </div>
)

const DashboardView: React.FC<{students: Student[]}> = ({ students }) => {
    const totalStudents = students.length;
    const totalMale = students.filter(s => s.jenisKelamin === 'Laki-laki').length;
    const totalFemale = students.filter(s => s.jenisKelamin === 'Perempuan').length;

    const dataByLifeSkill = useMemo(() => {
        const counts = students.reduce((acc, s) => {
            acc[s.lifeSkill] = (acc[s.lifeSkill] || 0) + 1;
            return acc;
        }, {} as Record<LifeSkill, number>);
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [students]);

    const dataByClass = useMemo(() => {
        return CLASS_OPTIONS.map(c => ({
            name: c,
            pendaftar: students.filter(s => s.classLevel === c).length
        }));
    }, [students]);

    const PIE_COLORS = ['#3b82f6', '#14b8a6', '#f97316', '#84cc16', '#6366f1', '#db2777'];

    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-3xl font-bold text-slate-800">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Pendaftar" value={totalStudents} color="border-indigo-500" />
                <StatCard title="Total Laki-laki" value={totalMale} color="border-blue-500" />
                <StatCard title="Total Perempuan" value={totalFemale} color="border-pink-500" />
                <StatCard title="Pilihan Life Skill" value={LIFE_SKILL_OPTIONS.length} color="border-teal-500" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-4 text-slate-700">Pendaftar per Kelas</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={dataByClass} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <XAxis dataKey="name" fontSize={12} tick={{ fill: '#475569' }} />
                            <YAxis allowDecimals={false} fontSize={12} tick={{ fill: '#475569' }} />
                            <Tooltip wrapperClassName="!border-slate-300 !bg-white/80 !backdrop-blur-sm !rounded-lg" cursor={{ fill: 'rgba(79, 70, 229, 0.1)' }}/>
                            <Legend wrapperStyle={{ fontSize: '14px' }} />
                            <Bar dataKey="pendaftar" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                     <h3 className="text-xl font-semibold mb-4 text-slate-700">Distribusi Life Skill</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={dataByLifeSkill} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                                const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                                return (percent > 0.05) ? <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">{(percent * 100).toFixed(0)}%</text> : null;
                            }}>
                                {dataByLifeSkill.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="white" strokeWidth={2} />)}
                            </Pie>
                            <Tooltip wrapperClassName="!border-slate-300 !bg-white/80 !backdrop-blur-sm !rounded-lg" />
                            <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
