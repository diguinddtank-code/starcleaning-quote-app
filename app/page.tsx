'use client';

import Link from 'next/link';
import { useLead } from '@/context/LeadContext';
import { Users, PlusCircle, History, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function DashboardPage() {
  const { leads } = useLead();
  
  const recentLeads = leads.slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 pb-24 md:pb-8 space-y-8">
      <header className="mb-8 border-b border-zinc-200 pb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-1">Welcome to Star Cleaning SC CRM & Estimate System.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-8 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center mb-2">
            <PlusCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-zinc-900">Create New Estimate</h2>
          <p className="text-sm text-zinc-500 max-w-xs">
            Generate a new cleaning quote for a client, calculate prices, and save the estimate.
          </p>
          <Link 
            href="/estimate" 
            className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-md"
          >
            Start Estimate <ArrowRight size={18} />
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-8 flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <History className="text-sky-500" size={20} /> Recent Leads
            </h2>
            <Link href="/leads" className="text-sm font-medium text-sky-600 hover:text-sky-700">
              View All
            </Link>
          </div>
          
          {recentLeads.length > 0 ? (
            <div className="space-y-3">
              {recentLeads.map((lead) => (
                <Link
                  href={`/leads/${lead.id}`}
                  key={lead.id} 
                  className="flex items-center justify-between p-3 rounded-lg border border-zinc-100 bg-zinc-50 hover:bg-sky-50 hover:border-sky-100 cursor-pointer transition-colors group"
                >
                  <div className="flex flex-col">
                    <p className="text-sm font-bold text-zinc-900 group-hover:text-sky-900">{lead.Nome || 'Unnamed Lead'}</p>
                    <p className="text-[11px] text-zinc-500">{lead.Data ? new Date(lead.Data).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-zinc-700">{lead.Cidade || 'N/A'}</p>
                    <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold mt-1 uppercase ${
                      lead.ETAPA?.toLowerCase().includes('new') ? 'bg-blue-100 text-blue-700' : 'bg-zinc-200 text-zinc-700'
                    }`}>
                      {lead.ETAPA || 'New'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-2 py-8">
              <Users className="text-zinc-300" size={32} />
              <p className="text-sm text-zinc-500">No leads available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
