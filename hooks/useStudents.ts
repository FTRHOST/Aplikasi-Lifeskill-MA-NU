import { useState, useEffect, useCallback } from 'react';
import type { Student } from '../types';

const API_URL = 'https://apils.manubanyuputih.id/api/'; // Diatur untuk proxy, atau ganti dengan http://localhost:5000/api saat development

const getToken = () => sessionStorage.getItem('token');

export const useStudents = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStudents = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = getToken();
            if (!token) {
                 throw new Error("No authentication token found.");
            }
            
            const response = await fetch(`${API_URL}/students`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    sessionStorage.removeItem('isLoggedIn');
                    sessionStorage.removeItem('token');
                    window.location.href = '/login'; // Redirect to login
                }
                throw new Error(`Failed to fetch students: ${response.statusText}`);
            }
            const data: Student[] = await response.json();
            setStudents(data);
        } catch (err: any) {
            setError(err.message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
        if (isLoggedIn) {
             fetchStudents();
        } else {
            setLoading(false);
        }
    }, [fetchStudents]);

    const addStudent = async (student: Omit<Student, 'id'>) => {
        try {
            const token = getToken();
            const response = await fetch(`${API_URL}/students`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(student)
            });
            if (!response.ok) throw new Error('Failed to add student');
            await fetchStudents(); // Re-fetch to get the latest list
        } catch (err) {
            console.error(err);
             // Optionally, set an error state to show in the UI
        }
    };

    const updateStudent = async (updatedStudent: Student) => {
         try {
            const token = getToken();
            const response = await fetch(`${API_URL}/students/${updatedStudent.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedStudent)
            });
            if (!response.ok) throw new Error('Failed to update student');
            await fetchStudents(); // Re-fetch to get the latest list
        } catch (err) {
            console.error(err);
        }
    };

    const deleteStudent = async (studentId: string) => {
        try {
            const token = getToken();
            const response = await fetch(`${API_URL}/students/${studentId}`, {
                method: 'DELETE',
                 headers: {
                    'Authorization': `Bearer ${token}`
                },
            });
            if (!response.ok) throw new Error('Failed to delete student');
            await fetchStudents(); // Re-fetch to get the latest list
        } catch (err) {
            console.error(err);
        }
    };

    return { students, loading, error, addStudent, updateStudent, deleteStudent };
};
