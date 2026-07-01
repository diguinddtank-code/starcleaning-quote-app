'use client';

import { useLead } from '@/context/LeadContext';
import { useLanguage } from '@/context/LanguageContext';
import { useQuote } from '@/context/QuoteContext';
import { User, Phone, Calendar, Mail, MapPin, Edit3, Trash2, X, Search, FileText, KanbanSquare, LayoutList, ChevronRight, Plus, Loader2, Save, Send, CheckSquare, Square, Check, Layers, Sparkles, Home, Bath } from 'lucide-react';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { Lead } from '@/lib/types';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';

const getStageConfig = (stageName: string) => {
  const name = (stageName || '').toLowerCase();
  
  if (name.includes('lead') || name === 'novo' || name.includes('new')) {
    return {
      borderColor: 'border-emerald-200/80 hover:border-emerald-300',
      bgColor: 'bg-emerald-50/10',
      headerBg: 'bg-emerald-50/80 border-emerald-100',
      badgeBg: 'bg-emerald-100 text-emerald-800',
      headingColor: 'text-emerald-900',
      indicatorDot: 'bg-emerald-500',
      accentBorder: 'border-l-4 border-l-emerald-500',
      shadowColor: 'hover:shadow-emerald-100/40',
      iconAccent: '✨',
      dragOverClasses: 'border-emerald-500 bg-emerald-50/45 shadow-lg scale-[1.01] ring-2 ring-emerald-500/15'
    };
  }
  
  if (name.includes('initial') || name.includes('contact') || name.includes('qualification') || name.includes('contato')) {
    return {
      borderColor: 'border-sky-200/85 hover:border-sky-300',
      bgColor: 'bg-sky-50/10',
      headerBg: 'bg-sky-50/80 border-sky-100',
      badgeBg: 'bg-sky-100 text-sky-800',
      headingColor: 'text-sky-900',
      indicatorDot: 'bg-sky-500',
      accentBorder: 'border-l-4 border-l-sky-500',
      shadowColor: 'hover:shadow-sky-100/40',
      iconAccent: '📞',
      dragOverClasses: 'border-sky-500 bg-sky-50/40 shadow-lg scale-[1.01] ring-2 ring-sky-500/15'
    };
  }

  if (name.includes('discovery') || name.includes('descoberta')) {
    return {
      borderColor: 'border-indigo-200/80 hover:border-indigo-300',
      bgColor: 'bg-indigo-50/10',
      headerBg: 'bg-indigo-100/50 border-indigo-200/60',
      badgeBg: 'bg-indigo-100 text-indigo-800',
      headingColor: 'text-indigo-950',
      indicatorDot: 'bg-indigo-500',
      accentBorder: 'border-l-4 border-l-indigo-500',
      shadowColor: 'hover:shadow-indigo-100/40',
      iconAccent: '🔍',
      dragOverClasses: 'border-indigo-500 bg-indigo-50/40 shadow-lg scale-[1.01] ring-2 ring-indigo-500/15'
    };
  }

  if (name.includes('solution') || name.includes('design') || name.includes('hot leads') || name.includes('hot')) {
    return {
      borderColor: 'border-rose-400/80 hover:border-rose-500',
      bgColor: 'bg-rose-50/30',
      headerBg: 'bg-gradient-to-r from-rose-500 to-orange-500 border-rose-500 text-white',
      badgeBg: 'bg-white/20 text-white font-black uppercase tracking-widest',
      headingColor: 'text-white font-black',
      indicatorDot: 'bg-white animate-pulse',
      accentBorder: 'border-l-4 border-l-rose-500',
      shadowColor: 'hover:shadow-rose-500/40',
      iconAccent: '🔥',
      dragOverClasses: 'border-rose-500 bg-rose-500/10 shadow-lg scale-[1.01] ring-2 ring-rose-500/30'
    };
  }

  if (name.includes('pricing') || name.includes('presentation') || name.includes('estimate') || name.includes('quote')) {
    return {
      borderColor: 'border-pink-200/80 hover:border-pink-300',
      bgColor: 'bg-pink-50/10',
      headerBg: 'bg-pink-100/45 border-pink-200/60',
      badgeBg: 'bg-pink-100 text-pink-800',
      headingColor: 'text-pink-950',
      indicatorDot: 'bg-pink-500',
      accentBorder: 'border-l-4 border-l-pink-500',
      shadowColor: 'hover:shadow-pink-100/40',
      iconAccent: '💵',
      dragOverClasses: 'border-pink-500 bg-pink-50/40 shadow-lg scale-[1.01] ring-2 ring-pink-500/15'
    };
  }

  if (name.includes('não responde') || name.includes('nao responde') || name.includes('no response') || name.includes('no_response')) {
    return {
      borderColor: 'border-amber-200/80 hover:border-amber-300',
      bgColor: 'bg-amber-50/10',
      headerBg: 'bg-amber-50/70 border-amber-100/80',
      badgeBg: 'bg-amber-100 text-amber-800 font-bold',
      headingColor: 'text-amber-900',
      indicatorDot: 'bg-amber-500 animate-pulse',
      accentBorder: 'border-l-4 border-l-amber-500',
      shadowColor: 'hover:shadow-amber-100/40',
      iconAccent: '😴',
      dragOverClasses: 'border-amber-500 bg-amber-50/40 shadow-lg scale-[1.01] ring-2 ring-amber-500/15'
    };
  }

  if (name.includes('not interested') || name.includes('not_interested') || name.includes('não tem interesse') || name.includes('nao tem interesse') || name.includes('desinteressado')) {
    return {
      borderColor: 'border-rose-200/80 hover:border-rose-300',
      bgColor: 'bg-rose-50/10',
      headerBg: 'bg-rose-50/70 border-rose-100/80',
      badgeBg: 'bg-rose-100 text-rose-800 font-bold',
      headingColor: 'text-rose-900',
      indicatorDot: 'bg-rose-500',
      accentBorder: 'border-l-4 border-l-rose-500',
      shadowColor: 'hover:shadow-rose-100/40',
      iconAccent: '👎',
      dragOverClasses: 'border-rose-500 bg-rose-50/40 shadow-lg scale-[1.01] ring-2 ring-rose-500/15'
    };
  }

  if (name.includes('closing') || name.includes('win') || name.includes('won') || name.includes('fechar') || name.includes('agendado') || name.includes('scheduled')) {
    return {
      borderColor: 'border-violet-200/80 hover:border-violet-300',
      bgColor: 'bg-violet-50/10',
      headerBg: 'bg-violet-50/80 border-violet-100',
      badgeBg: 'bg-violet-100 text-violet-800',
      headingColor: 'text-violet-900',
      indicatorDot: 'bg-violet-600',
      accentBorder: 'border-l-4 border-l-violet-600',
      shadowColor: 'hover:shadow-violet-100/40',
      iconAccent: '🏆',
      dragOverClasses: 'border-violet-500 bg-violet-50/40 shadow-lg scale-[1.01] ring-2 ring-violet-500/15'
    };
  }

  // Fallback
  return {
    borderColor: 'border-zinc-200 hover:border-zinc-300',
    bgColor: 'bg-zinc-50/20',
    headerBg: 'bg-zinc-100/50 border-zinc-200/60',
    badgeBg: 'bg-zinc-200 text-zinc-650',
    headingColor: 'text-zinc-800',
    indicatorDot: 'bg-zinc-400',
    accentBorder: 'border-l-4 border-l-zinc-400',
    shadowColor: 'hover:shadow-zinc-100/40',
    iconAccent: '📋',
    dragOverClasses: 'border-zinc-500 bg-zinc-50/40 shadow-lg scale-[1.01] ring-2 ring-zinc-500/15'
  };
};

const matchTimeFilter = (l: Lead, filter: string, customStart?: string, customEnd?: string) => {
  if (filter === 'all') return true;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayEnd = new Date(todayEnd.getTime() - 24 * 60 * 60 * 1000);

  const dateCandidates: Date[] = [];
  
  if (l.created_at) {
    const d = new Date(l.created_at);
    if (!isNaN(d.getTime())) dateCandidates.push(d);
  }
  if (l.updated_at) {
    const d = new Date(l.updated_at);
    if (!isNaN(d.getTime())) dateCandidates.push(d);
  }
  if (l.UMSG) {
    const d = new Date(l.UMSG);
    if (!isNaN(d.getTime())) dateCandidates.push(d);
  }
  if (l.Data) {
    const d = new Date(l.Data);
    if (!isNaN(d.getTime())) dateCandidates.push(d);
  }

  if (dateCandidates.length === 0) {
    return false;
  }

  return dateCandidates.some(d => {
    if (filter === 'custom') {
      const start = customStart ? new Date(customStart + 'T00:00:00') : null;
      const end = customEnd ? new Date(customEnd + 'T23:59:59') : null;
      const hasStart = start && !isNaN(start.getTime());
      const hasEnd = end && !isNaN(end.getTime());

      if (hasStart && hasEnd) {
        return d >= start && d <= end;
      } else if (hasStart) {
        return d >= start;
      } else if (hasEnd) {
        return d <= end;
      }
      return true;
    }
    if (filter === 'today') {
      return d >= todayStart && d <= todayEnd;
    }
    if (filter === 'yesterday') {
      return d >= yesterdayStart && d <= yesterdayEnd;
    }
    if (filter === 'week') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return d >= sevenDaysAgo;
    }
    if (filter === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return d >= startOfMonth;
    }
    if (filter === 'last_month') {
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return d >= startOfLastMonth && d <= endOfLastMonth;
    }
    if (filter === '90days') {
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      return d >= ninetyDaysAgo;
    }
    return true;
  });
};

export default function LeadsPage() {
  const { leads, deleteLead, updateLead, addLead } = useLead();
  const { savedQuotes } = useQuote();
  const { language, t, translateStage } = useLanguage();
  const [filterQuery, setFilterQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [kpiTimeRange, setKpiTimeRange] = useState<'all' | 'today' | 'yesterday' | 'week' | 'month' | 'last_month' | '90days' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'default' | 'asc' | 'desc'>('default');

  // Batch/Lote Action States
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [isBatchMode, setIsBatchMode] = useState(false);

  // Inline Quick-Add states per Kanban column
  const [activeInlineAddingStage, setActiveInlineAddingStage] = useState<string | null>(null);
  const [inlineName, setInlineName] = useState('');
  const [inlinePhone, setInlinePhone] = useState('');
  const [inlineValue, setInlineValue] = useState('');
  const [isInlineSaving, setIsInlineSaving] = useState(false);

  const getDisplayPrice = useCallback((lead: Lead) => {
    const leadQuote = savedQuotes.find(q => q.leadId === lead.id);
    if (leadQuote && leadQuote.total) {
      return `$${leadQuote.total}`;
    }
    const val = lead.Inicial || '0';
    if (val.startsWith('$')) return val;
    if (val.toLowerCase().includes('formulário sem preço') || val.toLowerCase().includes('formulario sem preco')) {
      return language === 'en' ? 'No Price' : 'Sem Preço';
    }
    return `$${val}`;
  }, [savedQuotes, language]);

  const parseFloatValue = (val?: string | number): number => {
    if (val === undefined || val === null) return 0;
    if (typeof val === 'number') return val;
    const cleaned = val.toString().replace(/[^0-9.]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  const getColumnTotalValue = useCallback((columnLeads: Lead[]): number => {
    return columnLeads.reduce((sum, lead) => sum + parseFloatValue(getDisplayPrice(lead)), 0);
  }, [getDisplayPrice]);

  const toggleSelectLead = (leadId: string) => {
    setSelectedLeadIds(prev => 
      prev.includes(leadId) ? prev.filter(id => id !== leadId) : [...prev, leadId]
    );
  };

  const handleBatchStatusChange = async (targetStage: string) => {
    if (selectedLeadIds.length === 0) return;
    try {
      await Promise.all(selectedLeadIds.map(leadId => updateLead(leadId, { ETAPA: targetStage })));
      setSelectedLeadIds([]);
      setIsBatchMode(false);
    } catch (err) {
      console.error('Error batch updating', err);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedLeadIds.length === 0) return;
    const confirmed = window.confirm(
      language === 'en' 
        ? `Are you sure you want to delete ${selectedLeadIds.length} selected leads?`
        : `Tem certeza que deseja deletar os ${selectedLeadIds.length} leads selecionados?`
    );
    if (!confirmed) return;
    try {
      await Promise.all(selectedLeadIds.map(leadId => deleteLead(leadId)));
      setSelectedLeadIds([]);
      setIsBatchMode(false);
    } catch (err) {
      console.error('Error batch deleting', err);
    }
  };

  const handleInlineQuickCreate = async (e: React.FormEvent, stageName: string) => {
    e.preventDefault();
    if (!inlineName.trim()) return;
    setIsInlineSaving(true);
    try {
      await addLead({
        Nome: inlineName.trim(),
        Telefone: inlinePhone.trim() || '',
        Email: '',
        Cidade: '',
        ZIP: '',
        Quartos: '3',
        Banheiros: '2',
        Service: 'residential',
        Frequencia: 'one-time',
        Inicial: inlineValue.trim() || undefined,
        Final: inlineValue.trim() || undefined,
        ETAPA: stageName,
        OBSERVACOES: '',
        FOLLOWUP: '',
        UMSG: '',
        REMINDER_DATE: ''
      });
      setInlineName('');
      setInlinePhone('');
      setInlineValue('');
      setActiveInlineAddingStage(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsInlineSaving(false);
    }
  };

  const [isAddingLead, setIsAddingLead] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState<Partial<Lead>>({ ETAPA: 'New Lead', Service: 'residential', Frequencia: 'one-time', Quartos: '3', Banheiros: '2' });
  const [isCreating, setIsCreating] = useState(false);

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
  const [activeDrawerTab, setActiveDrawerTab] = useState<'info' | 'estimate'>('info');

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.Nome) {
      alert('Por favor, informe o Nome do Lead.');
      return;
    }
    setIsCreating(true);
    try {
      await addLead({
        Nome: newLeadForm.Nome || '',
        Email: newLeadForm.Email || '',
        Telefone: newLeadForm.Telefone || '',
        Cidade: newLeadForm.Cidade || '',
        ZIP: newLeadForm.ZIP || '',
        Quartos: newLeadForm.Quartos || '',
        Banheiros: newLeadForm.Banheiros || '',
        Service: newLeadForm.Service || 'residential',
        Frequencia: newLeadForm.Frequencia || 'one-time',
        Inicial: newLeadForm.Inicial || '',
        Final: newLeadForm.Final || '',
        ETAPA: newLeadForm.ETAPA || 'New Lead',
        OBSERVACOES: newLeadForm.OBSERVACOES || '',
        FOLLOWUP: newLeadForm.FOLLOWUP || '',
        UMSG: newLeadForm.UMSG || '',
        REMINDER_DATE: newLeadForm.REMINDER_DATE || ''
      });
      setIsAddingLead(false);
      setNewLeadForm({ ETAPA: 'New Lead', Service: 'residential', Frequencia: 'one-time', Quartos: '3', Banheiros: '2' });
    } catch (error) {
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  const [activeDropColumn, setActiveDropColumn] = useState<string | null>(null);
  const [dragEnteredColumns, setDragEnteredColumns] = useState<Record<string, number>>({});

  const handleDragStart = (e: any, leadId: string) => {
    if (e.dataTransfer) {
      e.dataTransfer.setData('text/plain', leadId);
      e.dataTransfer.effectAllowed = 'move';
    }
    const el = document.getElementById(`kanban-lead-${leadId}`);
    if (el) {
      setTimeout(() => {
        el.classList.add('opacity-40', 'scale-[0.98]', 'rotate-1');
      }, 0);
    }
  };

  const handleDragEnd = (leadId: string) => {
    const el = document.getElementById(`kanban-lead-${leadId}`);
    if (el) {
      el.classList.remove('opacity-40', 'scale-[0.98]', 'rotate-1');
    }
    setActiveDropColumn(null);
    setDragEnteredColumns({});
  };

  const handleDragOver = (e: any, stage: string) => {
    if (e.preventDefault) {
      e.preventDefault();
    }
  };

  const handleDragEnter = (e: any, stage: string) => {
    if (e.preventDefault) {
      e.preventDefault();
    }
    setDragEnteredColumns(prev => {
      const count = (prev[stage] || 0) + 1;
      if (count === 1) {
        setActiveDropColumn(stage);
      }
      return { ...prev, [stage]: count };
    });
  };

  const handleDragLeave = (e: any, stage: string) => {
    setDragEnteredColumns(prev => {
      const count = Math.max(0, (prev[stage] || 0) - 1);
      if (count === 0 && activeDropColumn === stage) {
        setActiveDropColumn(null);
      }
      return { ...prev, [stage]: count };
    });
  };

  const handleDrop = async (e: any, targetStage: string) => {
    if (e.preventDefault) {
      e.preventDefault();
    }
    setActiveDropColumn(null);
    setDragEnteredColumns({});
    const leadId = e.dataTransfer ? e.dataTransfer.getData('text/plain') : null;
    if (!leadId) return;
    await handleStatusChange(leadId, targetStage);
  };

  const kanbanColumns = [
    t('stage.novo'), 
    t('stage.initial_contact'), 
    t('stage.discovery'), 
    t('stage.solution_design'),
    t('stage.pricing_presentation'), 
    t('stage.no_response'),
    t('stage.not_interested'),
    t('stage.closing')
  ];

  const getKanbanStage = (status?: string) => {
    return translateStage(status || '');
  };

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

  // Refined: Apply the selected period filter on top of the search results
  const timeFilteredLeads = useMemo(() => {
    return searchedLeads.filter(l => matchTimeFilter(l, kpiTimeRange, customStartDate, customEndDate));
  }, [searchedLeads, kpiTimeRange, customStartDate, customEndDate]);

  // Memoize filtered and sorted leads
  const filteredLeads = useMemo(() => {
    return timeFilteredLeads
      .filter(l => {
        if (statusFilter !== 'ALL' && getKanbanStage(l.ETAPA) !== statusFilter) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'asc') return (a.Nome || '').localeCompare(b.Nome || '');
        if (sortOrder === 'desc') return (b.Nome || '').localeCompare(a.Nome || '');

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeFilteredLeads, statusFilter, sortOrder]);

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    await updateLead(leadId, { ETAPA: newStatus });
  };

  const handleEditClick = (lead: Lead) => {
    setEditingLead(lead);
    setEditForm({ ...lead });
    setActiveDrawerTab('info');
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
    if (s.includes('hot leads') || s.includes('hot') || s.includes('solution design')) return 'bg-rose-500 text-white border-rose-600 shadow-sm animate-pulse';
    if (s.includes('agendado') || s.includes('closing')) return 'bg-violet-100 text-violet-700 border-violet-200 hover:bg-violet-200';
    if (s.includes('deposit') || s.includes('depósito') || s.includes('deposito')) return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
    if (s.includes('novo') || s.includes('new lead')) return 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200';
    if (s.includes('sem interesse') || s.includes('not interest') || s.includes('perdido')) return 'bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-200';
    if (s.includes('contato') || s.includes('contact') || s.includes('initial')) return 'bg-sky-100 text-sky-800 border-sky-200 hover:bg-sky-200';
    if (s.includes('descoberta') || s.includes('discovery') || s.includes('nego') || s.includes('stand')) return 'bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200';
    if (s.includes('pricing') || s.includes('presentation') || s.includes('estimate') || s.includes('quote')) return 'bg-pink-100 text-pink-800 border-pink-200 hover:bg-pink-200';
    if (s.includes('responde') || s.includes('no response')) return 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200';
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

  const isDateInPeriod = useCallback((d: Date | null, filter: string, customStart?: string, customEnd?: string) => {
    if (!d) return filter === 'all';
    if (isNaN(d.getTime())) return false;
    
    if (filter === 'all') return true;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayEnd = new Date(todayEnd.getTime() - 24 * 60 * 60 * 1000);

    if (filter === 'custom') {
      const start = customStart ? new Date(customStart + 'T00:00:00') : null;
      const end = customEnd ? new Date(customEnd + 'T23:59:59') : null;
      const hasStart = start && !isNaN(start.getTime());
      const hasEnd = end && !isNaN(end.getTime());

      if (hasStart && hasEnd) {
        return d >= start && d <= end;
      } else if (hasStart) {
        return d >= start;
      } else if (hasEnd) {
        return d <= end;
      }
      return true;
    }
    if (filter === 'today') {
      return d >= todayStart && d <= todayEnd;
    }
    if (filter === 'yesterday') {
      return d >= yesterdayStart && d <= yesterdayEnd;
    }
    if (filter === 'week') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return d >= sevenDaysAgo;
    }
    if (filter === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return d >= startOfMonth;
    }
    if (filter === 'last_month') {
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return d >= startOfLastMonth && d <= endOfLastMonth;
    }
    if (filter === '90days') {
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      return d >= ninetyDaysAgo;
    }
    return true;
  }, []);

  const getLeadCreationDate = (l: Lead) => {
    if (l.created_at) return new Date(l.created_at);
    if (l.Data) return new Date(l.Data);
    return null;
  };

  const getLeadCloseDate = (l: Lead) => {
    if (l.converted_at) return new Date(l.converted_at);
    if (l.updated_at) return new Date(l.updated_at);
    return getLeadCreationDate(l);
  };

  const createdKPILeads = useMemo(() => {
    return leads.filter(l => isDateInPeriod(getLeadCreationDate(l), kpiTimeRange, customStartDate, customEndDate));
  }, [leads, kpiTimeRange, customStartDate, customEndDate, isDateInPeriod]);

  const totalLeads = createdKPILeads.length;
  const newLeadsCount = createdKPILeads.filter(l => getKanbanStage(l.ETAPA) === t('stage.novo')).length;
  const activeCount = createdKPILeads.filter(l => getKanbanStage(l.ETAPA) !== t('stage.novo') && getKanbanStage(l.ETAPA) !== t('stage.closing') && getKanbanStage(l.ETAPA) !== t('stage.no_response') && getKanbanStage(l.ETAPA) !== t('stage.not_interested')).length;

  const convertedCount = useMemo(() => {
    return leads.filter(l => {
      if (getKanbanStage(l.ETAPA) !== t('stage.closing')) return false;
      return isDateInPeriod(getLeadCloseDate(l), kpiTimeRange, customStartDate, customEndDate);
    }).length;
  }, [leads, kpiTimeRange, customStartDate, customEndDate, isDateInPeriod, t]);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 pb-24 md:pb-8 space-y-6">
      <header className="mb-8 space-y-6 block">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-black text-zinc-950 tracking-tight leading-none">Lead CRM</h1>
              <button 
                onClick={() => {
                  setNewLeadForm({ ETAPA: 'New Lead', Service: 'residential', Frequencia: 'one-time', Quartos: '3', Banheiros: '2' });
                  setIsAddingLead(true);
                }}
                className="inline-flex items-center gap-1.5 my-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-emerald-600/15 hover:scale-[1.02] active:scale-[0.98] border border-emerald-500/10 cursor-pointer"
              >
                <Plus size={14} className="stroke-[3]" />
                {language === 'en' ? 'Add Lead' : 'Novo Lead'}
              </button>
            </div>
            <p className="text-sm font-medium text-zinc-500 mt-1.5">{t('leads.manage_all')}</p>
          </div>
          
          <div className="flex flex-col items-stretch md:items-end gap-2.5">
            {/* KPI & CRM Time Filter Selector */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 bg-zinc-50 border border-zinc-200 rounded-2xl p-1.5 shadow-3xs transition-all duration-300 hover:shadow-2xs hover:border-zinc-300/90 self-end max-w-full">
              <div className="flex items-center justify-between sm:justify-start gap-2 px-1">
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold whitespace-nowrap">{language === 'en' ? 'Period:' : 'Período:'}</span>
                <select
                  value={kpiTimeRange}
                  onChange={(e) => setKpiTimeRange(e.target.value as any)}
                  className="bg-white border border-zinc-250 hover:border-zinc-350 text-zinc-900 text-xs font-black rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/15 cursor-pointer shadow-3xs transition-all pr-6 max-w-xs appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem top 50%', backgroundSize: '0.6rem auto' }}
                >
                  <option value="all">{language === 'en' ? 'All Time' : 'Todo o Período'}</option>
                  <option value="today">{language === 'en' ? 'Today' : 'Hoje'}</option>
                  <option value="yesterday">{language === 'en' ? 'Yesterday' : 'Ontem'}</option>
                  <option value="week">{language === 'en' ? 'Last 7 Days' : 'Últimos 7 dias'}</option>
                  <option value="month">{language === 'en' ? 'This Month' : 'Este Mês'}</option>
                  <option value="last_month">{language === 'en' ? 'Last Month' : 'Mês Passado'}</option>
                  <option value="90days">{language === 'en' ? 'Last 90 Days' : 'Últimos 90 dias'}</option>
                  <option value="custom">{language === 'en' ? 'Custom Filter' : 'Período Personalizado'}</option>
                </select>
              </div>

              <div className="hidden sm:block h-5 w-px bg-zinc-200"></div>

              <div className={`flex items-center justify-between sm:justify-start gap-1.5 px-2 py-1 rounded-xl transition-all duration-300 ${kpiTimeRange === 'custom' ? 'bg-emerald-500/5 ring-1 ring-emerald-500/10' : ''}`}>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => {
                    setCustomStartDate(e.target.value);
                    setKpiTimeRange('custom');
                  }}
                  className={`bg-white border rounded-lg px-2 py-1 text-[11px] font-bold text-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer shadow-3xs transition-all ${kpiTimeRange === 'custom' ? 'border-emerald-500/30' : 'border-zinc-250 hover:border-zinc-350'}`}
                />
                <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-widest px-0.5">{language === 'en' ? 'to' : 'até'}</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => {
                    setCustomEndDate(e.target.value);
                    setKpiTimeRange('custom');
                  }}
                  className={`bg-white border rounded-lg px-2 py-1 text-[11px] font-bold text-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer shadow-3xs transition-all ${kpiTimeRange === 'custom' ? 'border-emerald-500/30' : 'border-zinc-250 hover:border-zinc-350'}`}
                />

                {(customStartDate || customEndDate) && (
                  <button
                    onClick={() => {
                      setCustomStartDate('');
                      setCustomEndDate('');
                      setKpiTimeRange('all');
                    }}
                    className="ml-1.5 px-2 py-0.5 bg-zinc-200 hover:bg-zinc-305 text-zinc-600 hover:text-zinc-900 rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    {language === 'en' ? 'Clear' : 'Limpar'}
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 w-full md:w-auto">
              <div className="bg-white p-3 md:p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col items-center justify-center min-w-[90px]">
                <span className="text-zinc-500 text-[11px] md:text-sm font-semibold uppercase tracking-wider mb-1">Total KPI</span>
                <span className="text-xl md:text-2xl font-bold text-zinc-900">{totalLeads}</span>
              </div>
              <div className="bg-emerald-500 p-3 md:p-4 rounded-xl border border-emerald-600 shadow-sm shadow-emerald-500/20 flex flex-col items-center justify-center min-w-[90px] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-1.5"><div className="w-1.5 h-1.5 bg-white rounded-full animate-ping opacity-75"></div></div>
                <span className="text-emerald-50 text-[11px] md:text-sm font-semibold uppercase tracking-wider mb-1">{language === 'en' ? 'New' : 'Novos'}</span>
                <span className="text-xl md:text-2xl font-bold text-white">{newLeadsCount}</span>
              </div>
              <div className="bg-white p-3 md:p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col items-center justify-center min-w-[90px]">
                <span className="text-zinc-500 text-[11px] md:text-sm font-semibold uppercase tracking-wider mb-1">{t('db.active')}</span>
                <span className="text-xl md:text-2xl font-bold text-sky-600">{activeCount}</span>
              </div>
              <div className="bg-white p-3 md:p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col items-center justify-center min-w-[90px]">
                <span className="text-zinc-500 text-[11px] md:text-sm font-semibold uppercase tracking-wider mb-1">{language === 'en' ? 'Converted' : 'Convertidos'}</span>
                <span className="text-xl md:text-2xl font-bold text-indigo-600">{convertedCount}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pb-2 border-b border-zinc-200">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'ALL', label: language === 'en' ? 'All' : 'Todos' },
                ...kanbanColumns.map(stage => ({ id: stage, label: stage }))
              ].map(stage => {
                const count = stage.id === 'ALL' ? timeFilteredLeads.length : timeFilteredLeads.filter(l => getKanbanStage(l.ETAPA) === stage.id).length;
                return (
                <button
                  key={stage.id}
                  onClick={() => setStatusFilter(stage.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    statusFilter === stage.id 
                      ? 'bg-zinc-900 text-white shadow-md scale-105'
                      : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300'
                  } ${(stage.id === 'Novo' || stage.id === 'New') && statusFilter !== stage.id ? 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100' : ''}`}
                >
                  {(stage.id === 'Novo' || stage.id === 'New') && <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>}
                  {stage.label} <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${statusFilter === stage.id ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-500'}`}>{count}</span>
                </button>
              )})}
            </div>
            
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsBatchMode(!isBatchMode);
                  setSelectedLeadIds([]);
                }}
                className={`px-3.5 py-2 text-xs font-bold rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
                  isBatchMode 
                    ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                    : 'bg-white border-zinc-200 text-zinc-650 hover:bg-zinc-50'
                }`}
              >
                <Layers size={13} />
                {language === 'en' ? 'Bulk Select' : 'Ações em Lote'}
                {selectedLeadIds.length > 0 && (
                  <span className="bg-white/20 text-white rounded-full px-1.5 py-0.2 text-[10px] font-black shrink-0">
                    {selectedLeadIds.length}
                  </span>
                )}
              </button>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                <input 
                  type="text" 
                  placeholder={t('leads.search')}
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 w-full md:w-64 bg-white border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all placeholder:text-zinc-400"
                />
              </div>
              <div className="flex bg-zinc-100 p-1 rounded-lg border border-zinc-200">
                <button
                  onClick={() => setSortOrder(sortOrder === 'default' ? 'asc' : sortOrder === 'asc' ? 'desc' : 'default')}
                  className={`p-1.5 rounded-md flex items-center justify-center transition-all ${sortOrder !== 'default' ? 'bg-white shadow-sm text-sky-600 font-bold' : 'text-zinc-500 hover:text-zinc-700'}`}
                  title={language === 'en' ? 'Sort Alphabetically' : 'Ordem Alfabética'}
                >
                  {sortOrder === 'asc' ? <span className="text-[10px] uppercase font-bold px-1">A-Z</span> : sortOrder === 'desc' ? <span className="text-[10px] uppercase font-bold px-1">Z-A</span> : <span className="text-[10px] uppercase font-bold px-1 text-zinc-400">A-Z</span>}
                </button>
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
          <h2 className="text-lg font-bold text-zinc-900 mb-2">{t('leads.empty')}</h2>
          <p className="text-sm text-zinc-500">{t('leads.empty_desc')}</p>
        </div>
      ) : viewMode === 'kanban' ? (
        <div className="flex gap-3 overflow-x-auto pb-6 snap-x min-h-[65vh] select-none">
          {kanbanColumns.map(stage => {
            const columnLeads = leadsByStage[stage] || [];
            if (columnLeads.length === 0 && stage === 'Outros') return null;
            const isOver = activeDropColumn === stage;
            const config = getStageConfig(stage);
            const colTotal = getColumnTotalValue(columnLeads);
            
            return (
              <div 
                key={stage} 
                onDragOver={(e) => handleDragOver(e, stage)}
                onDragEnter={(e) => handleDragEnter(e, stage)}
                onDragLeave={(e) => handleDragLeave(e, stage)}
                onDrop={(e) => handleDrop(e, stage)}
                className={`flex flex-col min-w-[215px] w-[215px] snap-center rounded-xl border transition-all duration-300 relative shadow-xs ${
                  isOver 
                    ? config.dragOverClasses
                    : `${config.borderColor} ${config.bgColor}`
                }`}
              >
                {/* Visual glow indicator for active drag-over column */}
                {isOver && (
                  <div className="absolute inset-0 bg-white/5 rounded-xl pointer-events-none" />
                )}

                <div className={`p-2.5 border-b flex items-center justify-between rounded-t-xl transition-colors ${config.headerBg}`}>
                  <h3 className={`font-extrabold ${config.headingColor} text-[10px] uppercase tracking-wider flex items-center gap-1.5 truncate max-w-[85%]`} title={stage}>
                    <span className="text-xs">{config.iconAccent}</span>
                    <span className="truncate">{stage}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold transition-all border border-black/5 ${config.badgeBg}`}>{columnLeads.length}</span>
                    {colTotal > 0 && (
                      <span className="text-[9px] font-black text-zinc-650 tracking-tight bg-black/5 py-0.2 px-1 rounded ml-1 hover:bg-black/10 transition-colors">
                        ${colTotal.toLocaleString()}
                      </span>
                    )}
                  </h3>
                  {/* Subtle active status dot */}
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.indicatorDot}`} />
                </div>
                
                <div className="p-2 space-y-2 flex-1 overflow-y-auto max-h-[58vh] min-h-[45vh] transition-colors relative">
                  {columnLeads.map(lead => (
                    <motion.div 
                      layout
                      id={`kanban-lead-${lead.id}`}
                      key={lead.id} 
                      draggable={!isBatchMode}
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      onDragEnd={() => handleDragEnd(lead.id)}
                      className={`bg-white border hover:border-zinc-300 p-2.5 rounded-lg shadow-xs transition-colors duration-200 group relative flex flex-col gap-1 ${
                        isBatchMode ? 'cursor-default' : 'cursor-grab active:cursor-grabbing hover:shadow-xs'
                      } ${config.accentBorder} ${config.shadowColor} ${selectedLeadIds.includes(lead.id) ? 'ring-2 ring-amber-500/45 border-amber-350 bg-amber-50/5' : ''}`}
                    >
                      <div className="flex justify-between items-start gap-1">
                        {isBatchMode && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleSelectLead(lead.id);
                            }}
                            className="mr-1.5 shrink-0 text-zinc-400 hover:text-amber-500 cursor-pointer transition-all duration-150"
                          >
                            {selectedLeadIds.includes(lead.id) ? (
                              <CheckSquare size={14} className="text-amber-500 fill-amber-500/10" />
                            ) : (
                              <Square size={14} />
                            )}
                          </button>
                        )}
                        <Link 
                          href={`/leads/${lead.id}`} 
                          className="font-bold text-zinc-800 text-xs hover:text-sky-650 truncate transition-colors pr-2 leading-snug flex-1 flex items-center gap-1.5"
                          title={lead.Nome || 'Unnamed Lead'}
                        >
                          <span className="truncate">{lead.Nome || 'Unnamed Lead'}</span>
                          {lead.is_promo && (
                            <span className="shrink-0 inline-flex items-center bg-rose-100 text-rose-700 text-[8px] font-black uppercase tracking-widest px-1 py-0.5 rounded-full border border-rose-200">
                              <Sparkles size={6} className="text-rose-500 mr-0.5" />
                              Promo
                            </span>
                          )}
                        </Link>
                        <button 
                          onClick={() => handleEditClick(lead)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-zinc-450 hover:text-sky-600 hover:bg-sky-50 rounded shrink-0 self-center"
                          title="Quick Edit"
                        >
                          <Edit3 size={11} />
                        </button>
                      </div>

                      {(lead.Inicial || savedQuotes.find(q => q.leadId === lead.id)) && (
                        <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-0.5">
                          <span className="text-sky-700 bg-sky-50/70 border border-sky-100/60 px-1 py-0.2 rounded font-extrabold">{getDisplayPrice(lead)}</span>
                          <Link 
                            href={`/leads/${lead.id}`}
                            className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-sky-650 font-semibold transition-all cursor-pointer"
                          >
                            Ver lead →
                          </Link>
                        </div>
                      )}
                    </motion.div>
                  ))}
                  
                  {columnLeads.length === 0 && (
                    <div className="h-16 border-2 border-dashed border-zinc-200/40 rounded-lg flex flex-col items-center justify-center text-zinc-300 text-[10px] font-bold p-2 bg-zinc-50/10 transition-colors">
                      <span className="text-[9px] uppercase tracking-widest">drop here</span>
                    </div>
                  )}
                </div>

                {/* Column Footer: Inline Quick Add Form */}
                <div className="p-2 border-t border-zinc-150/40 bg-zinc-50/10 shrink-0">
                  {activeInlineAddingStage === stage ? (
                    <motion.form
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onSubmit={(e) => handleInlineQuickCreate(e, stage)}
                      className="bg-white border border-zinc-250 p-2 rounded-xl shadow-md flex flex-col gap-2"
                    >
                      <div>
                        <input
                          type="text"
                          required
                          placeholder={language === 'en' ? 'Client Name...' : 'Nome do Cliente...'}
                          value={inlineName}
                          onChange={(e) => setInlineName(e.target.value)}
                          className="w-full px-2 py-1.5 text-xs font-bold border border-zinc-200 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-none transition-all"
                          autoFocus
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          type="text"
                          placeholder={language === 'en' ? 'Phone...' : 'Telefone...'}
                          value={inlinePhone}
                          onChange={(e) => setInlinePhone(e.target.value)}
                          className="w-full px-2 py-1 text-[11px] border border-zinc-200 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-none transition-all"
                        />
                        <input
                          type="text"
                          placeholder={language === 'en' ? 'Value ($)...' : 'Valor ($)...'}
                          value={inlineValue}
                          onChange={(e) => setInlineValue(e.target.value)}
                          className="w-full px-2 py-1 text-[11px] border border-zinc-200 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-none transition-all"
                        />
                      </div>
                      <div className="flex justify-end gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveInlineAddingStage(null);
                            setInlineName('');
                            setInlinePhone('');
                            setInlineValue('');
                          }}
                          className="px-2 py-1 text-[10px] font-bold text-zinc-500 hover:bg-zinc-100 rounded-lg cursor-pointer transition-colors"
                        >
                          {language === 'en' ? 'Cancel' : 'Cancelar'}
                        </button>
                        <button
                          type="submit"
                          disabled={isInlineSaving}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-[10px] font-bold rounded-lg cursor-pointer flex items-center gap-1 transition-colors"
                        >
                          <Check size={10} strokeWidth={3} />
                          {isInlineSaving ? '...' : (language === 'en' ? 'Add' : 'Adicionar')}
                        </button>
                      </div>
                    </motion.form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveInlineAddingStage(stage);
                        setInlineName('');
                        setInlinePhone('');
                        setInlineValue('');
                      }}
                      className="w-full py-1.5 border border-dashed border-zinc-250 hover:border-zinc-400 hover:bg-white rounded-xl text-[10px] font-extrabold text-zinc-500 hover:text-zinc-800 transition-all flex items-center justify-center gap-1 cursor-pointer hover:shadow-2xs active:scale-98"
                    >
                      <Plus size={12} strokeWidth={2.5} />
                      {language === 'en' ? 'Quick Add Lead' : 'Adicionar Lead Rápido'}
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col h-[75vh]">
          <div className="overflow-x-auto flex-1 custom-scrollbar">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-[#fbfcff] border-b border-zinc-200 text-zinc-500 uppercase text-[10px] font-bold tracking-wider sticky top-0 z-10 shadow-sm">
                <tr>
                  {isBatchMode && (
                    <th className="pl-4 w-10 text-center py-3">
                      <button
                        type="button"
                        onClick={() => {
                          const allAvailableIds = filteredLeads.map(l => l.id);
                          const allSelected = allAvailableIds.every(id => selectedLeadIds.includes(id));
                          if (allSelected) {
                            setSelectedLeadIds(prev => prev.filter(id => !allAvailableIds.includes(id)));
                          } else {
                            setSelectedLeadIds(prev => {
                              const newSet = new Set([...prev, ...allAvailableIds]);
                              return Array.from(newSet);
                            });
                          }
                        }}
                        className="text-zinc-505 hover:text-sky-500 transition-colors cursor-pointer block mt-1"
                        title={language === 'en' ? 'Select all filtered leads' : 'Selecionar todos os leads filtrados'}
                      >
                        {filteredLeads.map(l => l.id).every(id => selectedLeadIds.includes(id)) ? (
                          <CheckSquare size={14} className="text-sky-500 fill-sky-500/10" />
                        ) : (
                          <Square size={14} />
                        )}
                      </button>
                    </th>
                  )}
                  <th className={`${isBatchMode ? 'px-2' : 'pl-4'} pr-2 py-3`}>Status</th>
                  <th className="px-3 py-3 w-[250px]">Name & Contact</th>
                  <th className="px-3 py-3">Location</th>
                  <th className="px-3 py-3 w-[150px]">Details</th>
                  <th className="px-4 py-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100/80">
                {filteredLeads.map((lead) => (
                  <tr 
                    key={lead.id} 
                    className={`hover:bg-slate-50 transition-colors group ${
                      selectedLeadIds.includes(lead.id) ? 'bg-sky-50/40 hover:bg-sky-50/60' : ''
                    }`}
                  >
                    {isBatchMode && (
                      <td className="pl-4 text-center py-2.5 w-10 align-middle">
                        <button
                          type="button"
                          onClick={() => toggleSelectLead(lead.id)}
                          className="text-zinc-400 hover:text-sky-500 cursor-pointer transition-colors block mt-1"
                        >
                          {selectedLeadIds.includes(lead.id) ? (
                            <CheckSquare size={14} className="text-sky-500 fill-sky-500/10" />
                          ) : (
                            <Square size={14} />
                          )}
                        </button>
                      </td>
                    )}
                    <td className={`${isBatchMode ? 'px-2' : 'pl-4'} pr-2 py-2.5 align-middle min-w-[140px]`}>
                      <div className="flex flex-col items-start gap-1">
                        <select
                          value={getKanbanStage(lead.ETAPA)}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-tight border appearance-none pr-5 w-auto max-w-[140px] truncate ${getStatusColor(lead.ETAPA)}`}
                          style={{ cursor: 'pointer', backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.35rem top 50%', backgroundSize: '0.45rem auto' }}
                        >
                          {kanbanColumns.map(stage => (
                            <option key={stage} value={stage}>{stage}</option>
                          ))}
                        </select>
                        {lead.UMSG && <div className="text-[9px] text-amber-700 font-medium truncate max-w-[140px]" title={lead.UMSG}><span className="opacity-70">UMSG:</span> {lead.UMSG}</div>}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 align-middle w-[250px]">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2 max-w-[200px]">
                          <Link href={`/leads/${lead.id}`} className="font-bold text-zinc-900 text-[13px] hover:text-sky-600 truncate block" title={lead.Nome || 'Unnamed'}>{lead.Nome || 'Unnamed'}</Link>
                          {lead.is_promo && (
                            <span className="shrink-0 inline-flex items-center gap-0.5 bg-rose-100 text-rose-700 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full border border-rose-200">
                              <Sparkles size={8} className="text-rose-500" />
                              Promo
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-zinc-500 text-[10.5px]">
                          {lead.Telefone ? <span className="flex items-center gap-0.5"><Phone size={10} className="text-zinc-400" />{lead.Telefone}</span> : null}
                          {lead.Email ? <span className="flex items-center gap-0.5 truncate max-w-[120px]" title={lead.Email}><Mail size={10} className="text-zinc-400" />{lead.Email}</span> : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 align-middle">
                      <div className="flex flex-col gap-0.5 text-zinc-600 text-[11px]">
                        <span className="font-medium flex items-center gap-1"><MapPin size={11} className="text-zinc-400" /><span className="truncate max-w-[140px]" title={lead.Cidade || '--'}>{lead.Cidade || '--'}</span></span>
                        {lead.ZIP && <span className="text-[10px] text-zinc-400 ml-4">Zip: {lead.ZIP}</span>}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 align-middle w-[150px]">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="text-[9px] font-bold text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded uppercase tracking-wider">{lead.Service || 'Any'}</span>
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                          <span className="flex items-center gap-0.5"><Home size={10} className="text-zinc-400" />{lead.Quartos || '-'} Bd</span>
                          <span className="flex items-center gap-0.5"><Bath size={10} className="text-zinc-400" />{lead.Banheiros || '-'} Ba</span>
                          <span className="font-bold text-emerald-600 px-1 border border-emerald-100 bg-emerald-50 rounded">{getDisplayPrice(lead)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 align-middle text-right">
                      <div className="flex justify-end gap-1.5 items-center opacity-70 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        <button 
                          onClick={() => handleEditClick(lead)}
                          className="p-1.5 text-zinc-400 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors"
                          title="Quick Edit"
                        >
                          <Edit3 size={14} />
                        </button>
                        <Link 
                          href={`/leads/${lead.id}`}
                          className="p-1.5 text-zinc-400 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors"
                          title="View Details"
                        >
                          <ChevronRight size={15} strokeWidth={2.5} />
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
              <div className="flex items-center justify-between p-4 border-b border-zinc-200 bg-zinc-50/20">
                <div>
                  <h3 className="font-bold text-lg text-zinc-900">
                    {language === 'en' ? 'Quick Actions' : 'Ações Rápidas'}
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-medium font-mono uppercase tracking-widest mt-0.5">
                    Lead: {editForm.Nome || 'No Name'}
                  </p>
                </div>
                <button onClick={() => setEditingLead(null)} className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-full cursor-pointer transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="px-4 pt-4 flex border-b border-zinc-150 bg-zinc-50/40 gap-1 sm:rounded-tl-2xl sm:rounded-tr-2xl">
                <button
                  type="button"
                  onClick={() => setActiveDrawerTab('info')}
                  className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 -mb-[2px] ${
                    activeDrawerTab === 'info'
                      ? 'border-zinc-900 text-zinc-950 bg-white font-black'
                      : 'border-transparent text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  {language === 'en' ? 'Lead Info' : 'Dados do Lead'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDrawerTab('estimate')}
                  className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 -mb-[2px] flex items-center gap-1.5 ${
                    activeDrawerTab === 'estimate'
                      ? 'border-zinc-900 text-zinc-950 bg-white font-black'
                      : 'border-transparent text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  <Sparkles size={12} className="text-amber-500 fill-amber-500/10" />
                  {language === 'en' ? 'Create Estimate (Price)' : 'Criar Orçamento (Preço)'}
                </button>
              </div>
              
              <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
                {activeDrawerTab === 'estimate' ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 bg-slate-50 border border-slate-200/50 p-4 rounded-2xl flex flex-col gap-1 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-800 font-bold uppercase tracking-wider">
                        <Sparkles size={13} className="text-amber-500" />
                        {language === 'en' ? 'Smart Estimate Helper' : 'Gerador de Orçamento Pro'}
                      </div>
                      <p className="text-zinc-500 leading-normal">
                        {language === 'en' 
                          ? 'Set the price estimate for this lead. You can manually type values, or click the auto-calculate button below to determine a recommended pricing range based on property specifications.' 
                          : 'Configure o orçamento do lead. Você pode preencher os preços manualmente ou usar o botão estimador inteligente para sugerir uma faixa recomendada com base nas especificações do imóvel.'}
                      </p>
                    </div>

                    <div className="col-span-1 space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
                        {language === 'en' ? 'Starting Price ($)' : 'Preço Inicial ($)'}
                      </label>
                      <input 
                        type="text" 
                        placeholder="e.g. 150"
                        value={editForm.Inicial || ''} 
                        onChange={e => setEditForm({...editForm, Inicial: e.target.value})}
                        className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-2 focus:ring-sky-500/20 font-bold text-zinc-800"
                      />
                    </div>

                    <div className="col-span-1 space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
                        {language === 'en' ? 'Ending/Max Price ($)' : 'Preço Máximo ($)'}
                      </label>
                      <input 
                        type="text" 
                        placeholder="e.g. 210"
                        value={editForm.Final || ''} 
                        onChange={e => setEditForm({...editForm, Final: e.target.value})}
                        className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-2 focus:ring-sky-500/20 font-bold text-zinc-800"
                      />
                    </div>

                    <div className="col-span-1 space-y-1">
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">
                        {language === 'en' ? 'Service Type' : 'Tipo de Serviço'}
                      </label>
                      <select
                        value={editForm.Service || 'residential'}
                        onChange={e => setEditForm({...editForm, Service: e.target.value})}
                        className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg bg-white text-zinc-800 focus:ring-2 focus:ring-sky-500/20 cursor-pointer"
                      >
                        <option value="residential">{language === 'en' ? 'Residential Cleaning' : 'Limpeza Residencial'}</option>
                        <option value="commercial">{language === 'en' ? 'Commercial / Office' : 'Limpeza Comercial'}</option>
                        <option value="deep">{language === 'en' ? 'Deep Cleaning' : 'Limpeza Pesada / Deep'}</option>
                        <option value="move">{language === 'en' ? 'Move-In / Move-Out' : 'Limpeza pós-mudança (Move)'}</option>
                        <option value="airbnb">{language === 'en' ? 'Short Term / Airbnb' : 'Airbnb'}</option>
                        <option value="post-construction">{language === 'en' ? 'Post Construction' : 'Pós-Obra'}</option>
                      </select>
                    </div>

                    <div className="col-span-1 space-y-1">
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">
                        {language === 'en' ? 'Frequency' : 'Frequência'}
                      </label>
                      <select
                        value={editForm.Frequencia || 'one-time'}
                        onChange={e => setEditForm({...editForm, Frequencia: e.target.value})}
                        className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg bg-white text-zinc-800 focus:ring-2 focus:ring-sky-500/20 cursor-pointer"
                      >
                        <option value="one-time">{language === 'en' ? 'One-time' : 'Avulsa / Única'}</option>
                        <option value="weekly">{language === 'en' ? 'Weekly' : 'Semanal'}</option>
                        <option value="bi-weekly">{language === 'en' ? 'Bi-Weekly' : 'Quinzenal'}</option>
                        <option value="monthly">{language === 'en' ? 'Monthly' : 'Mensal'}</option>
                      </select>
                    </div>

                    <div className="col-span-1 space-y-1">
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">
                        {language === 'en' ? 'Bedrooms' : 'Quartos'}
                      </label>
                      <select
                        value={editForm.Quartos || '3'}
                        onChange={e => setEditForm({...editForm, Quartos: e.target.value})}
                        className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg bg-white text-zinc-800 focus:ring-2 focus:ring-sky-500/20 cursor-pointer"
                      >
                        {['1', '2', '3', '4', '5', '6', '7'].map(n => (
                          <option key={n} value={n}>{n} {language === 'en' ? 'Beds' : 'Quartos'}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-1 space-y-1">
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">
                        {language === 'en' ? 'Bathrooms' : 'Banheiros'}
                      </label>
                      <select
                        value={editForm.Banheiros || '2'}
                        onChange={e => setEditForm({...editForm, Banheiros: e.target.value})}
                        className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg bg-white text-zinc-800 focus:ring-2 focus:ring-sky-500/20 cursor-pointer"
                      >
                        {['1', '1.5', '2', '2.5', '3', '3.5', '4', '5'].map(n => (
                          <option key={n} value={n}>{n} {language === 'en' ? 'Baths' : 'Banheiros'}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-1 space-y-1">
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">
                        {language === 'en' ? 'City' : 'Cidade'}
                      </label>
                      <input 
                        type="text" 
                        value={editForm.Cidade || ''} 
                        onChange={e => setEditForm({...editForm, Cidade: e.target.value})}
                        className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-2 focus:ring-sky-500/20 text-zinc-800"
                      />
                    </div>

                    <div className="col-span-1 space-y-1">
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">ZIP Code</label>
                      <input 
                        type="text" 
                        value={editForm.ZIP || ''} 
                        onChange={e => setEditForm({...editForm, ZIP: e.target.value})}
                        className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-2 focus:ring-sky-500/20 text-zinc-800"
                      />
                    </div>

                    <div className="col-span-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          const rooms = parseInt(editForm.Quartos || '3');
                          const baths = parseFloat(editForm.Banheiros || '2');
                          let priceBase = 110;
                          
                          const factor = (editForm.Service === 'deep' || editForm.Service === 'move') ? 1.5 : 1.0;
                          priceBase += (rooms * 30) + (Math.floor(baths) * 20);
                          const suggestedInicial = Math.round(priceBase * factor);
                          const suggestedFinal = Math.round((priceBase + 45) * factor);
                          
                          setEditForm({
                            ...editForm,
                            Inicial: suggestedInicial.toString(),
                            Final: suggestedFinal.toString(),
                            ETAPA: 'Pricing & Estimate Presentation'
                          });
                        }}
                        className="w-full py-2.5 border border-sky-200 hover:border-sky-350 bg-sky-50/50 hover:bg-sky-50 text-sky-700 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
                      >
                        <Sparkles size={12} className="text-sky-600 fill-sky-600/10" />
                        {language === 'en' ? 'Calculate Suggested Price & Advance to Presentation Phase' : 'Calcular Preço Recomendado & Avançar p/ Apresentação'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Mudar Etapa do Lead</label>
                      <div className="flex flex-wrap gap-1.5 p-1.5 bg-zinc-50 border border-zinc-200 rounded-xl">
                        {['New Lead', 'Initial Contact & Qualification', 'Discovery', 'HOT LEADS', 'Pricing & Estimate Presentation', 'No Response', 'Not Interested', 'Closing'].map((stageName) => {
                          const isCurrent = (editForm.ETAPA || '').toLowerCase() === stageName.toLowerCase();
                          return (
                            <button
                              key={stageName}
                              type="button"
                              onClick={() => setEditForm({ ...editForm, ETAPA: stageName })}
                              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer border ${
                                isCurrent
                                  ? 'bg-sky-600 text-white border-sky-700 shadow-sm'
                                  : 'bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                              }`}
                            >
                              {stageName}
                            </button>
                          );
                        })}
                      </div>
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
                )}
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

      {/* Add Lead Drawer */}
      <AnimatePresence>
        {isAddingLead && (
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
              <div className="flex items-center justify-between p-4 border-b border-zinc-200 bg-zinc-50 sm:rounded-t-2xl">
                <h3 className="font-bold text-lg text-zinc-900 flex items-center gap-2">
                  <User size={18} className="text-emerald-600" />
                  {language === 'en' ? 'Add New CRM Lead' : 'Adicionar Novo Lead'}
                </h3>
                <button onClick={() => setIsAddingLead(false)} className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-full cursor-pointer">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleCreateLead} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* Lead Stage selection */}
                  <div className="col-span-2 space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Etapa Inicial do Lead</label>
                    <div className="flex flex-wrap gap-1.5 p-1.5 bg-zinc-50 border border-zinc-200 rounded-xl">
                      {['New Lead', 'Initial Contact & Qualification', 'Discovery', 'HOT LEADS', 'Pricing & Estimate Presentation', 'No Response', 'Not Interested', 'Closing'].map((stageName) => {
                        const isCurrent = (newLeadForm.ETAPA || 'New Lead').toLowerCase() === stageName.toLowerCase();
                        return (
                          <button
                            key={stageName}
                            type="button"
                            onClick={() => setNewLeadForm({ ...newLeadForm, ETAPA: stageName })}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer border ${
                              isCurrent
                                ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                                : 'bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                            }`}
                          >
                            {stageName}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="col-span-2 md:col-span-1 space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Nome do Cliente *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Maria Oliveira"
                      value={newLeadForm.Nome || ''} 
                      onChange={e => setNewLeadForm({...newLeadForm, Nome: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-none transition-all"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1 space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Telefone</label>
                    <input 
                      type="text" 
                      placeholder="e.g. (48) 99999-9999"
                      value={newLeadForm.Telefone || ''} 
                      onChange={e => setNewLeadForm({...newLeadForm, Telefone: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-none transition-all"
                    />
                  </div>

                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Email</label>
                    <input 
                      type="email" 
                      placeholder="e.g. maria@gmail.com"
                      value={newLeadForm.Email || ''} 
                      onChange={e => setNewLeadForm({...newLeadForm, Email: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Property Info */}
                  <div className="col-span-1 space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Cidade</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Florianópolis"
                      value={newLeadForm.Cidade || ''} 
                      onChange={e => setNewLeadForm({...newLeadForm, Cidade: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-none transition-all"
                    />
                  </div>
                  <div className="col-span-1 space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">ZIP / CEP</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 88000-000"
                      value={newLeadForm.ZIP || ''} 
                      onChange={e => setNewLeadForm({...newLeadForm, ZIP: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-none transition-all"
                    />
                  </div>

                  {/* House Specs */}
                  <div className="col-span-1 space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Quartos (Beds)</label>
                    <input 
                      type="number" 
                      min="0"
                      placeholder="3"
                      value={newLeadForm.Quartos || ''} 
                      onChange={e => setNewLeadForm({...newLeadForm, Quartos: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-none transition-all"
                    />
                  </div>
                  <div className="col-span-1 space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Banheiros (Baths)</label>
                    <input 
                      type="number" 
                      min="0"
                      placeholder="2"
                      value={newLeadForm.Banheiros || ''} 
                      onChange={e => setNewLeadForm({...newLeadForm, Banheiros: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Services & Frequency */}
                  <div className="col-span-1 space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Frequência</label>
                    <select 
                      value={newLeadForm.Frequencia || 'one-time'} 
                      onChange={e => setNewLeadForm({...newLeadForm, Frequencia: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-none transition-all"
                    >
                      <option value="one-time">One-time</option>
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div className="col-span-1 space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Serviço</label>
                    <select 
                      value={newLeadForm.Service || 'residential'} 
                      onChange={e => setNewLeadForm({...newLeadForm, Service: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-none transition-all"
                    >
                      <option value="residential">Residential</option>
                      <option value="deep">Deep Clean</option>
                      <option value="move">Move In/Out</option>
                      <option value="vacation">Vacation/Airbnb</option>
                    </select>
                  </div>

                  {/* Pricing Estimation Range */}
                  <div className="col-span-1 space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Valor Inicial ($)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 150"
                      value={newLeadForm.Inicial || ''} 
                      onChange={e => setNewLeadForm({...newLeadForm, Inicial: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-none transition-all"
                    />
                  </div>
                  <div className="col-span-1 space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Valor Final ($)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 240"
                      value={newLeadForm.Final || ''} 
                      onChange={e => setNewLeadForm({...newLeadForm, Final: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Notes / Obs */}
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Observações & Notas</label>
                    <textarea 
                      placeholder="Anotações sobre a casa, pets, solicitações específicas..."
                      value={newLeadForm.OBSERVACOES || ''} 
                      onChange={e => setNewLeadForm({...newLeadForm, OBSERVACOES: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-none resize-none transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-200 flex justify-end gap-2 bg-white">
                  <button 
                    type="button"
                    onClick={() => setIsAddingLead(false)}
                    className="px-4 py-2 bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    {language === 'en' ? 'Cancel' : 'Cancelar'}
                  </button>
                  <button 
                    type="submit"
                    disabled={isCreating}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        {language === 'en' ? 'Save Lead' : 'Salvar Lead'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Batch Actions Bar */}
      <AnimatePresence>
        {isBatchMode && selectedLeadIds.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-zinc-950 border border-zinc-800 text-white px-5 py-4 rounded-2xl shadow-xl z-50 flex flex-col md:flex-row items-center gap-4 max-w-full w-[90%] md:w-auto overflow-hidden"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Layers size={16} />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold whitespace-nowrap">
                  {language === 'en' ? `${selectedLeadIds.length} Leads Selected` : `${selectedLeadIds.length} Leads Selecionados`}
                </p>
                <p className="text-[10px] text-zinc-400 font-medium whitespace-nowrap">
                  {language === 'en' ? 'Apply a bulk phase change or delete' : 'Mude etapa em lote ou remova os leads'}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-extrabold mr-1">Move to:</span>
              <div className="flex flex-wrap gap-1.5 max-w-sm md:max-w-none">
                {kanbanColumns.map(stage => (
                  <button
                    key={stage}
                    onClick={() => handleBatchStatusChange(stage)}
                    className="bg-zinc-900 hover:bg-zinc-850 text-white border border-zinc-700/60 hover:border-zinc-500 rounded-lg px-2 py-1 text-[10px] font-bold cursor-pointer transition-all"
                  >
                    {stage}
                  </button>
                ))}
              </div>

              <div className="h-4 w-px bg-zinc-850 hidden md:block mx-1" />

              <button
                onClick={handleBatchDelete}
                className="bg-rose-600/15 hover:bg-rose-600 text-rose-500 hover:text-white border border-rose-500/30 rounded-lg px-2.5 py-1 text-[10px] font-bold cursor-pointer transition-all shrink-0"
              >
                <Trash2 size={11} className="inline mr-1" />
                {language === 'en' ? 'Delete' : 'Excluir'}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setSelectedLeadIds([]);
                  setIsBatchMode(false);
                }}
                className="text-zinc-400 hover:text-white px-2 py-1 text-[10px] font-bold cursor-pointer rounded-lg hover:bg-zinc-900 transition-all shrink-0"
              >
                {language === 'en' ? 'Cancel' : 'Cancelar'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
