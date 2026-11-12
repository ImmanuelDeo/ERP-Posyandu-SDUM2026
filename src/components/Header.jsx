// src/components/Header.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Heart } from 'lucide-react';

export default function Header() {
  const { getTenantData } = useAuth();
  const tenant = getTenantData();

  return (
    <header className="bg-posyandu-700 text-white px-5 sm:px-8 py-3.5 flex items-center justify-between shadow-md relative z-20 flex-shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center border border-white/20 shadow-xs">
          <Heart className="w-5 h-5 text-teal-200 fill-teal-200/30" />
        </div>
        <div>
          <h1 className="font-bold text-base tracking-tight leading-tight">
            {tenant?.title || 'Posyandu Cerdas'}
          </h1>
          <p className="text-[11px] text-teal-100/90 flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
            <span>Kader Posyandu Aktif</span>
          </p>
        </div>
      </div>
      <div className="w-10" />
    </header>
  );
}
