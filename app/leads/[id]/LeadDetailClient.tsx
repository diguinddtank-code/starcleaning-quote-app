'use client';

import { useLead } from '@/context/LeadContext';
import { useQuote } from '@/context/QuoteContext';
import { notFound, useRouter } from 'next/navigation';
import { User, Mail, Phone, MapPin, Calendar, Edit3, MessageCircle, FileText, ArrowLeft, Loader2, Save, X, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Lead } from '@/lib/types';
import { motion, AnimatePresence } from 'motion/react';

export function LeadDetailClient({ id }: { id: string }) {
  const { leads, updateLead } = useLead();
  const { savedQuotes } = useQuote();
  const router = useRouter();
  const lead = leads.find(l => l.id === id);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Lead>>(lead || {});
  const [isSaving, setIsSaving] = useState(false);

  const [isEditingComms, setIsEditingComms] = useState(false);
  const [commsForm, setCommsForm] = useState({ FOLLOWUP: lead?.FOLLOWUP || '', UMSG: lead?.UMSG || '' });

  if (!leads.length) {
    return <div className="flex h-screen items-center justify-center text-zinc-500"><Loader2 className="animate-spin w-8 h-8" /></div>;
  }

  if (!lead) {
    return notFound();
  }

  const leadQuotes = savedQuotes.filter(q => q.leadId === id);

  const handleSave = async () => {
    setIsSaving(true);
    await updateLead(lead.id, editForm);
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleSaveComms = async () => {
    setIsSaving(true);
    await updateLead(lead.id, commsForm);
    setIsSaving(false);
    setIsEditingComms(false);
  };

  const updateStatus = async (newStatus: string) => {
    await updateLead(lead.id, { ETAPA: newStatus });
  };

  const getStatusColor = (status?: string) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('agendado')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (s.includes('novo')) return 'bg-emerald-500 text-white border-emerald-600 shadow-sm shadow-emerald-500/30';
    if (s.includes('sem interesse') || s.includes('not interest') || s.includes('perdido')) return 'bg-zinc-100 text-zinc-600 border-zinc-200';
    if (s.includes('contato') || s.includes('stand') || s.includes('nego') || s.includes('responde')) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-zinc-50 text-zinc-700 border-zinc-200';
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 pb-24 md:pb-8 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/leads" className="p-2 text-zinc-400 hover:bg-white hover:text-zinc-900 rounded-full transition-colors border border-transparent hover:border-zinc-200">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">{lead.Nome || 'Unnamed Lead'}</h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(lead.ETAPA)}`}>
                {lead.ETAPA || 'NOVA'}
              </span>
            </div>
            <p className="text-sm text-zinc-500 mt-1 flex items-center gap-1.5">
              <MapPin size={14} /> {lead.Cidade ? `${lead.Cidade}, SC` : 'Unknown Location'} {lead.ZIP && `- ${lead.ZIP}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          <div className="hidden lg:flex bg-zinc-100 p-1 rounded-lg gap-1 border border-zinc-200 overflow-x-auto whitespace-nowrap scrollbar-hide max-w-[400px]">
            <button onClick={() => updateStatus('Primeiro Contato')} className="px-2 py-1 text-[11px] font-semibold rounded hover:bg-white hover:text-zinc-900 transition-colors">Primeiro Contato</button>
            <button onClick={() => updateStatus('Negociando')} className="px-2 py-1 text-[11px] font-semibold rounded hover:bg-white hover:text-zinc-900 transition-colors">Negociando</button>
            <button onClick={() => updateStatus('Não Responde')} className="px-2 py-1 text-[11px] font-semibold rounded hover:bg-white hover:text-zinc-900 transition-colors">Não Responde</button>
            <button onClick={() => updateStatus('Agendado')} className="px-2 py-1 text-[11px] font-semibold rounded hover:bg-white hover:text-zinc-900 transition-colors">Agendado</button>
            <button onClick={() => updateStatus('Sem Interesse')} className="px-2 py-1 text-[11px] font-semibold rounded hover:bg-white hover:text-zinc-900 transition-colors">Sem Interesse</button>
          </div>
          <Link 
            href={`/estimate?leadId=${lead.id}`}
            className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
          >
            <FileText size={16} /> Create Estimate
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {leadQuotes.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
              <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex justify-between items-center">
                <h3 className="font-bold text-zinc-900 flex items-center gap-2"><DollarSign size={18} className="text-zinc-400"/> Generated Estimates</h3>
                <span className="bg-zinc-200 text-zinc-700 text-xs px-2 py-0.5 rounded-full font-bold">{leadQuotes.length}</span>
              </div>
              <div className="divide-y divide-zinc-100">
                {leadQuotes.map(q => (
                  <div key={q.id} className="p-4 hover:bg-zinc-50 flex items-center justify-between transition-colors">
                    <div>
                      <h4 className="font-semibold text-zinc-900">{q.serviceType} <span className="text-zinc-500 font-normal uppercase text-xs">({q.frequency})</span></h4>
                      <p className="text-xs text-zinc-500 mt-1">{new Date(q.date).toLocaleDateString()} &middot; {q.sqFt} sqft</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-zinc-900">${q.total}</div>
                      <div className="text-xs text-zinc-500 font-semibold uppercase">{q.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-900">Lead Details</h2>
              <button 
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                disabled={isSaving}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 font-semibold rounded-lg transition-colors"
              >
                {isEditing ? (isSaving ? 'Saving...' : <><Save size={14} /> Save</>) : <><Edit3 size={14} /> Edit</>}
              </button>
            </div>

            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 uppercase">Customer Name</label>
                  <input type="text" value={editForm.Nome || ''} onChange={e => setEditForm({...editForm, Nome: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500/20" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 uppercase">Status (ETAPA)</label>
                  <input type="text" value={editForm.ETAPA || ''} onChange={e => setEditForm({...editForm, ETAPA: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500/20" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 uppercase">Phone</label>
                  <input type="text" value={editForm.Telefone || ''} onChange={e => setEditForm({...editForm, Telefone: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500/20" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 uppercase">Email</label>
                  <input type="email" value={editForm.Email || ''} onChange={e => setEditForm({...editForm, Email: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500/20" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 uppercase">Bedrooms</label>
                  <input type="text" value={editForm.Quartos || ''} onChange={e => setEditForm({...editForm, Quartos: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500/20" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 uppercase">Bathrooms</label>
                  <input type="text" value={editForm.Banheiros || ''} onChange={e => setEditForm({...editForm, Banheiros: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500/20" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 uppercase">Service Type</label>
                  <input type="text" value={editForm.Service || ''} onChange={e => setEditForm({...editForm, Service: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500/20" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 uppercase">Frequency</label>
                  <input type="text" value={editForm.Frequencia || ''} onChange={e => setEditForm({...editForm, Frequencia: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500/20" />
                </div>
                <div className="col-span-1 md:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 uppercase">Notes (OBSERVACOES)</label>
                  <textarea rows={4} value={editForm.OBSERVACOES || ''} onChange={e => setEditForm({...editForm, OBSERVACOES: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500/20 resize-none" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
                <div>
                  <dt className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Phone size={14} /> Phone</dt>
                  <dd className="font-medium text-zinc-900">{lead.Telefone || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Mail size={14} /> Email</dt>
                  <dd className="font-medium text-zinc-900 truncate pr-4" title={lead.Email}>{lead.Email || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Calendar size={14} /> Created</dt>
                  <dd className="font-medium text-zinc-900">{lead.Data ? new Date(lead.Data).toLocaleDateString() : 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Beds / Baths</dt>
                  <dd className="font-medium text-zinc-900">{lead.Quartos || '-'} BR / {lead.Banheiros || '-'} BA</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Service requested</dt>
                  <dd className="font-medium text-zinc-900 capitalize">{lead.Service || 'Any'} <span className="text-zinc-400 text-xs ml-1 lowercase">({lead.Frequencia})</span></dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Estimated Value</dt>
                  <dd className="font-bold text-sky-700">{lead.Inicial || '--'} {lead.Final ? `- ${lead.Final}` : ''}</dd>
                </div>
                
                <div className="col-span-1 sm:col-span-2 md:col-span-3 pt-4 border-t border-zinc-100">
                  <dt className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Observations & Notes</dt>
                  <dd className="text-sm text-zinc-700 leading-relaxed bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                    {lead.OBSERVACOES || 'No observations recorded yet.'}
                  </dd>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-800 text-white rounded-2xl shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <MessageCircle size={100} />
            </div>
            
            <div className="p-6 relative z-10 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold mb-1">Communications</h2>
                <p className="text-sm text-zinc-400">Track messages and followups</p>
              </div>
              <button 
                onClick={() => isEditingComms ? handleSaveComms() : setIsEditingComms(true)}
                disabled={isSaving}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/10"
              >
                {isEditingComms ? (isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />) : <Edit3 size={16} />}
              </button>
            </div>
            
            <div className="p-6 pt-4 space-y-4 relative z-10">
              {isEditingComms ? (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400 block">Followup Date / Notes</label>
                    <input 
                      type="text" 
                      value={commsForm.FOLLOWUP || ''} 
                      onChange={e => setCommsForm({...commsForm, FOLLOWUP: e.target.value})} 
                      placeholder="e.g. Call back on Friday"
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400 block">Last Message Details (UMSG)</label>
                    <textarea 
                      rows={3}
                      value={commsForm.UMSG || ''} 
                      onChange={e => setCommsForm({...commsForm, UMSG: e.target.value})} 
                      placeholder="e.g. Sent price quote, waiting for wife to reply..."
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 resize-none" 
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/10">
                    <span className="text-xs text-zinc-400 block mb-1">Followup</span>
                    <p className="text-sm font-medium">{lead.FOLLOWUP || 'No followup set.'}</p>
                  </div>
                  <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/10">
                    <span className="text-xs text-zinc-400 block mb-1">Last Message / Result</span>
                    <p className="text-sm font-medium whitespace-normal break-words">{lead.UMSG || 'No message recorded.'}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
