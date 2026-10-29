'use client';
import {useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {useAuth} from '@/contexts/AuthContext';
export default function StudentAccess({children}){
 const {user,loading}=useAuth(),router=useRouter();
 useEffect(()=>{if(!loading){if(!user)router.replace('/login');else if(user.mustChangePassword)router.replace('/change-password');else if(user.role!=='student')router.replace('/dashboard/teacher');}},[user,loading,router]);
 if(loading||!user||user.role!=='student'||user.mustChangePassword)return <p role="status" className="p-6">Checking student access…</p>;
 return children;
}
