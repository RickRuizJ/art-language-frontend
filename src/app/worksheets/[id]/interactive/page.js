'use client';
import {useParams} from 'next/navigation';
import {useAuth} from '@/contexts/AuthContext';
import PdfEditor from '@/components/interactive/PdfEditor';
export default function Page(){const {id}=useParams(),{user,loading}=useAuth();if(loading)return <p className="p-8">Loading…</p>;if(!['teacher','admin'].includes(user?.role))return <p className="p-8">Teacher access required.</p>;return <PdfEditor id={id}/>;}
