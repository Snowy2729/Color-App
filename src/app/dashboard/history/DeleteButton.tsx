'use client';

import { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DeleteButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent the parent link click

    if (!confirm('Are you sure you want to delete this analysis?')) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/analyses/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Delete failed');

      router.refresh();
    } catch (err) {
      console.error(err);
      alert('Something went wrong');
      setIsDeleting(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-red-500/80 backdrop-blur-md flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
    >
      {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
    </button>
  );
}
