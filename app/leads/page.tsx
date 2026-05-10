'use client';

import { useLead } from '@/context/LeadContext';
import { User, Phone, Calendar, Mail, MapPin, Edit3, Trash2, X, Search, FileText, KanbanSquare, LayoutList, ChevronRight } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { Lead } from '@/lib/types';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';

export default function LeadsPage() {
  const { leads, deleteLead, updateLead } = useLead();
  const [filterQuery, setFilterQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(filterQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [filterQuery]);
  
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [editForm, setEditForm] = useState<Partial<Lead>>({});
  const [isSaving, setIsSaving] = useState(false);

  const getKanbanStage = (status?: string) => {
    const s = status?.trim()?.toLowerCase() || '';
    if (s === 'agendado') return 'Agendado';
    if (s === 'primeiro contato') return 'Primeiro Contato';
    if (s === 'negociando') return 'Negociando';
    if (s === 'não responde' || s === 'nao responde') return 'Não Responde';
    if (s === 'sem interesse') return 'Sem Interesse';
    if (s === 'novo' || s === 'novos' || s === 'nova' || s === 'new' || s === '') return 'Novo';
    
    // Fallbacks just in case
    if (s.includes('agendado')) return 'Agendado';
    if (s.includes('contato')) return 'Primeiro Contato';
    if (s.includes('nego')) return 'Negociando';
    if (s.includes('respond')) return 'Não Responde';
    if (s.includes('interes')) return 'Sem Interesse';
    return 'Outros';
  };

  const kanbanColumns = ['Novo', 'Primeiro Contato', 'Negociando', 'Agendado', 'Não Responde', 'Sem Interesse', 'Outros'];

  // Memoize searched leads using the debounced query
  const searchedLeads = useMemo(() => {
    if (!debouncedQuery) return leads;
    const lowerQuery = debouncedQuery.toLowerCase();
    return leads.filter(l => (
      l.Nome?.toLowerCase().includes(lowerQuery) ||
      l.Email?.toLowerCase().includes(lowerQuery) ||
      l.Telefone?.toLowerCase().includes(lowerQuery) ||
      l.ETAPA?.toLowerCase().includes(lowerQuery) ||
      l.UMSG?.toLowerCase().includes(lowerQuery) ||
      l.OBSERVACOES?.toLowerCase().includes(lowerQuery)
    ));
  }, [leads, debouncedQuery]);

  // Memoize filtered and sorted leads
  const filteredLeads = useMemo(() => {
    return searchedLeads
      .filter(l => {
        if (statusFilter !== 'Todos' && getKanbanStage(l.ETAPA) !== statusFilter) return false;
        return true;
      })
      .sort((a, b) => {
        if (a.UMSG && !b.UMSG) return -1;
        if (!a.UMSG && b.UMSG) return 1;
        if (a.UMSG && b.UMSG) {
          const dateA = new Date(a.UMSG).getTime();
          const dateB = new Date(b.UMSG).getTime();
          if (!isNaN(dateA) && !isNaN(dateB)) {
            return dateB - dateA;
          }
          return b.UMSG.localeCompare(a.UMSG);
        }
        const timeA = a.updated_at ? new Date(a.updated_at).getTime() : (a.created_at ? new Date(a.created_at).getTime() : 0);
        const timeB = b.updated_at ? new Date(b.updated_at).getTime() : (b.created_at ? new Date(b.created_at).getTime() : 0);
        return timeB - timeA;
      });
  }, [searchedLeads, statusFilter]);

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    await updateLead(leadId, { ETAPA: newStatus });
  };

  const handleEditClick = (lead: Lead) => {
    setEditingLead(lead);
    setEditForm({ ...lead });
  };

  const handleSaveLead = async () => {
    if (!editingLead) return;
    setIsSaving(true);
    await updateLead(editingLead.id, editForm);
    setIsSaving(false);
    setEditingLead(null);
  };

  const getStatusColor = (status?: string) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('agendado')) return 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100';
    if (s.includes('novo')) return 'bg-emerald-500 text-white border-emerald-600 shadow-sm shadow-emerald-500/30 hover:bg-emerald-600';
    if (s.includes('sem interesse') || s.includes('not interest') || s.includes('perdido')) return 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200';
    if (s.includes('contato') || s.includes('stand') || s.includes('nego') || s.includes('responde')) return 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100';
    return 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100';
  };

  const leadsByStage = kanbanColumns.reduce((acc, stage) => {
    acc[stage] = filteredLeads.filter(l => getKanbanStage(l.ETAPA) === stage).sort((a, b) => {
      // Sort by UMSG, fallback to updated_at
      if (a.UMSG && !b.UMSG) return -1;
      if (!a.UMSG && b.UMSG) return 1;
      if (a.UMSG && b.UMSG) {
        const dateA = new Date(a.UMSG).getTime();
        const dateB = new Date(b.UMSG).getTime();
        if (!isNaN(dateA) && !isNaN(dateB)) {
          return dateB - dateA;
        }
        return b.UMSG.localeCompare(a.UMSG);
      }
      const timeA = a.updated_at ? new Date(a.updated_at).getTime() : (a.created_at ? new Date(a.created_at).getTime() : 0);
      const timeB = b.updated_at ? new Date(b.updated_at).getTime() : (b.created_at ? new Date(b.created_at).getTime() : 0);
      return timeB - timeA;
    });
    return acc;
  }, {} as Record<string, Lead[]>);

  const totalLeads = leads.length;
  const newLeadsCount = leads.filter(l => getKanbanStage(l.ETAPA) === 'Novo').length;
  const activeCount = leads.filter(l => ['Primeiro Contato', 'Negociando', 'Agendado'].includes(getKanbanStage(l.ETAPA))).length;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 pb-24 md:pb-8 space-y-6">
      <header className="mb-8 space-y-6 block">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">Lead CRM</h1>
            <p className="text-sm text-zinc-500 mt-1">Gerencie todos os seus contatos e orçamentos em um lugar.</p>
          </div>
          
          <div className="grid grid-cols-3 gap-3 md:gap-6">
            <div className="bg-white p-3 md:p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col items-center justify-center min-w-[100px]">
              <span className="text-zinc-500 text-[11px] md:text-xs font-semibold uppercase tracking-wider mb-1">Total</span>
              <span className="text-xl md:text-2xl font-bold text-zinc-900">{totalLeads}</span>
            </div>
            <div className="bg-emerald-500 p-3 md:p-4 rounded-xl border border-emerald-600 shadow-sm shadow-emerald-500/20 flex flex-col items-center justify-center min-w-[100px] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-1.5"><div className="w-1.5 h-1.5 bg-white rounded-full animate-ping opacity-75"></div></div>
              <span className="text-emerald-50 text-[11px] md:text-xs font-semibold uppercase tracking-wider mb-1">Novos</span>
              <span className="text-xl md:text-2xl font-bold text-white">{newLeadsCount}</span>
            </div>
            <div className="bg-white p-3 md:p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col items-center justify-center min-w-[100px]">
              <span className="text-zinc-500 text-[11px] md:text-xs font-semibold uppercase tracking-wider mb-1">Ativos</span>
              <span className="text-xl md:text-2xl font-bold text-sky-600">{activeCount}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pb-2 border-b border-zinc-200">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex flex-wrap items-center gap-1.5">
              {['Todos', ...kanbanColumns].map(stage => {
                const count = stage === 'Todos' ? searchedLeads.length : searchedLeads.filter(l => getKanbanStage(l.ETAPA) === stage).length;
                return (
                <button
                  key={stage}
                  onClick={() => setStatusFilter(stage)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    statusFilter === stage 
                      ? 'bg-zinc-900 text-white shadow-md scale-105'
                      : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300'
                  } ${stage === 'Novo' && statusFilter !== 'Novo' ? 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100' : ''}`}
                >
                  {stage === 'Novo' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>}
                  {stage} <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${statusFilter === stage ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-500'}`}>{count}</span>
                </button>
              )})}
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Buscar lead..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 w-full md:w-64 bg-white border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all placeholder:text-zinc-400"
                />
              </div>
              <div className="flex bg-zinc-100 p-1 rounded-lg border border-zinc-200">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md flex items-center justify-center transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-zinc-900 font-bold' : 'text-zinc-500 hover:text-zinc-700'}`}
                  title="List View"
                >
                  <LayoutList size={18} />
                </button>
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`p-1.5 rounded-md flex items-center justify-center transition-all ${viewMode === 'kanban' ? 'bg-white shadow-sm text-zinc-900 font-bold' : 'text-zinc-500 hover:text-zinc-700'}`}
                  title="Kanban View"
                >
                  <KanbanSquare size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {filteredLeads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-zinc-100 text-zinc-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={32} />
          </div>
          <h2 className="text-lg font-bold text-zinc-900 mb-2">No leads found</h2>
          <p className="text-sm text-zinc-500">Wait for new leads or adjust your search.</p>
        </div>
      ) : viewMode === 'kanban' ? (
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x min-h-[60vh]">
          {kanbanColumns.map(stage => {
            const columnLeads = leadsByStage[stage] || [];
            if (columnLeads.length === 0 && stage === 'Outros') return null;
            return (
              <div key={stage} className="flex flex-col min-w-[280px] w-[280px] snap-center bg-zinc-50/50 rounded-xl rounded-t-lg border border-zinc-200">
                <div className="p-3 border-b border-zinc-200 flex items-center justify-between bg-zinc-100/50 rounded-t-lg">
                  <h3 className="font-bold text-zinc-800 text-sm flex items-center gap-2">
                    {stage}
                    <span className="bg-zinc-200 text-zinc-600 text-xs px-2 py-0.5 rounded-full font-semibold">{columnLeads.length}</span>
                  </h3>
                </div>
                <div className="p-3 space-y-3 flex-1 overflow-y-auto">
                  {columnLeads.map(lead => (
                    <div key={lead.id} className="bg-white border border-zinc-200 p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow group relative flex flex-col gap-2">
                      <div className="flex justify-between items-start gap-2">
                        <Link href={`/leads/${lead.id}`} className="font-bold text-zinc-900 text-sm hover:text-sky-600 truncate">{lead.Nome || 'Unnamed Lead'}</Link>
                        <button 
                          onClick={() => handleEditClick(lead)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-zinc-400 hover:text-sky-600 hover:bg-sky-50 rounded"
                        >
                          <Edit3 size={14} />
                        </button>
                      </div>
                      
                      <div className="flex flex-col gap-1 text-xs text-zinc-500">
                        {lead.Telefone && <span className="flex items-center gap-1.5"><Phone size={12} className="text-zinc-400 shrink-0" /> <span className="truncate">{lead.Telefone}</span></span>}
                        {lead.Email && <span className="flex items-center gap-1.5"><Mail size={12} className="text-zinc-400 shrink-0" /> <span className="truncate">{lead.Email}</span></span>}
                      </div>

                      {lead.UMSG && (
                        <div className="mt-1 text-[11px] text-amber-700 bg-amber-50 p-1.5 rounded border border-amber-100 line-clamp-2" title={lead.UMSG}>
                          <span className="font-semibold">Last msg:</span> {lead.UMSG}
                        </div>
                      )}

                      <div className="mt-1 flex items-center justify-between text-[11px]">
                        <span className="text-sky-700 font-semibold">{lead.Inicial || '--'}</span>
                        <Link href={`/leads/${lead.id}`} className="text-zinc-400 hover:text-zinc-700 flex items-center gap-0.5">
                          Open <ChevronRight size={12} />
                        </Link>
                      </div>
                    </div>
                  ))}
                  {columnLeads.length === 0 && (
                    <div className="h-20 border-2 border-dashed border-zinc-200 rounded-lg flex items-center justify-center text-zinc-400 text-xs font-medium">
                      Drop area
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-zinc-50/50 border-b border-zinc-200 text-zinc-500 uppercase text-xs font-semibold tracking-wider">
                <tr>
                  <th className="pl-6 pr-4 py-4">Status & Notes</th>
                  <th className="px-4 py-4">Name & Contact</th>
                  <th className="px-4 py-4">Location</th>
                  <th className="px-4 py-4">Details</th>
                  <th className="px-4 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-zinc-50/50 transition-colors group">
                    <td className="pl-6 pr-4 py-4 min-w-[200px]">
                      <select
                        value={getKanbanStage(lead.ETAPA)}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        className={`inline-flex items-center px-1 py-1 rounded-md text-xs font-bold tracking-tight border appearance-none pr-6 ${getStatusColor(lead.ETAPA)}`}
                        style={{ cursor: 'pointer', backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem top 50%', backgroundSize: '0.65rem auto' }}
                      >
                        {kanbanColumns.map(stage => (
                          <option key={stage} value={stage}>{stage}</option>
                        ))}
                      </select>
                      <div className="text-[11px] text-zinc-400 mt-1.5 flex flex-col gap-0.5 whitespace-normal max-w-[200px]">
                        {lead.UMSG && <div className="text-amber-700 font-medium break-words"><span className="opacity-70">UMSG:</span> {lead.UMSG}</div>}
                        {lead.OBSERVACOES && <div className="line-clamp-2" title={lead.OBSERVACOES}>{lead.OBSERVACOES}</div>}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Link href={`/leads/${lead.id}`} className="font-semibold text-zinc-900 text-base hover:text-sky-600 block">{lead.Nome || 'Unnamed'}</Link>
                      <div className="flex flex-col gap-0.5 mt-1 text-zinc-500 text-xs text-wrap max-w-[200px] truncate">
                        {lead.Telefone && <span className="flex items-center gap-1.5"><Phone size={12} className="shrink-0" /> {lead.Telefone}</span>}
                        {lead.Email && <span className="flex items-center gap-1.5"><Mail size={12} className="shrink-0" /> {lead.Email}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 text-zinc-700">
                        <MapPin size={14} className="text-zinc-400 shrink-0" />
                        <span className="font-medium text-wrap max-w-[150px] truncate">{lead.Cidade || 'Unknown City'}</span>
                      </div>
                      <div className="text-xs text-zinc-500 mt-1 pl-5">ZIP: {lead.ZIP || '--'}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded text-[11px] font-semibold border border-zinc-200 truncate max-w-[120px]">
                          {lead.Service || 'Any'}
                        </span>
                        <span className="text-xs text-zinc-500 font-medium">
                          {lead.Quartos || '-'} BR / {lead.Banheiros || '-'} BA
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-zinc-900 mt-1.5">
                        Est: {lead.Inicial || '--'} {lead.Final ? `- ${lead.Final}` : ''}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2 items-center">
                        <button 
                          onClick={() => handleEditClick(lead)}
                          className="p-1.5 text-zinc-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors border border-transparent hover:border-sky-200"
                          title="Quick Edit"
                        >
                          <Edit3 size={16} />
                        </button>
                        <Link 
                          href={`/leads/${lead.id}`}
                          className="p-1.5 text-zinc-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors border border-transparent hover:border-sky-200"
                          title="View Details"
                        >
                          <ChevronRight size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Drawer */}
      <AnimatePresence>
        {editingLead && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 md:p-4"
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-xl sm:rounded-2xl shadow-xl flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-4 border-b border-zinc-200">
                <h3 className="font-bold text-lg text-zinc-900">Quick Edit Lead</h3>
                <button onClick={() => setEditingLead(null)} className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-full">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Etapa (Status)</label>
                    <input 
                      type="text" 
                      value={editForm.ETAPA || ''} 
                      onChange={e => setEditForm({...editForm, ETAPA: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1 space-y-1">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Name</label>
                    <input 
                      type="text" 
                      value={editForm.Nome || ''} 
                      onChange={e => setEditForm({...editForm, Nome: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1 space-y-1">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Phone</label>
                    <input 
                      type="text" 
                      value={editForm.Telefone || ''} 
                      onChange={e => setEditForm({...editForm, Telefone: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Email</label>
                    <input 
                      type="email" 
                      value={editForm.Email || ''} 
                      onChange={e => setEditForm({...editForm, Email: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Observações</label>
                    <textarea 
                      value={editForm.OBSERVACOES || ''} 
                      onChange={e => setEditForm({...editForm, OBSERVACOES: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-2 focus:ring-sky-500/20 resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-zinc-200 bg-zinc-50 sm:rounded-b-2xl flex justify-between items-center">
                <button 
                  onClick={() => deleteLead(editingLead.id).then(() => setEditingLead(null))}
                  className="px-3 py-1.5 text-red-600 hover:bg-red-50 text-sm font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 size={16} /> Delete
                </button>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setEditingLead(null)}
                    className="px-4 py-2 bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-sm font-semibold rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveLead}
                    disabled={isSaving}
                    className="px-6 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    {isSaving ? 'Saving...' : 'Save Lead'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
