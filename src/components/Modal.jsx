'use client';
import {useEffect,useRef} from 'react';
export default function Modal({title,onClose,children}) {
  const ref=useRef(null);
  useEffect(()=>{const dialog=ref.current;dialog.showModal();return()=>dialog.close();},[]);
  return <dialog ref={ref} aria-label={title} onCancel={event=>{event.preventDefault();onClose();}} className="w-[calc(100%_-_2rem)] max-w-2xl max-h-[90vh] rounded-2xl p-0 shadow-xl backdrop:bg-black/40">
    <div className="p-5 sm:p-6 space-y-4"><div className="flex items-center justify-between gap-3"><h2 className="font-bold text-xl">{title}</h2><button type="button" className="btn btn-ghost" aria-label="Close dialog" onClick={onClose}>Close</button></div>{children}</div>
  </dialog>;
}
