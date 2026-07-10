'use client';

import React, { useState } from 'react';
import { useLead } from '@/context/LeadContext';
import { useLanguage } from '@/context/LanguageContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Download, ArrowUpRight, Target, Users, CalendarCheck, TrendingUp, Calendar, Filter, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#64748b', '#ec4899'];

type FilterPeriod = 'all' | 'this-week' | 'last-30' | 'this-month' | 'last-month' | 'custom';

export default function KPIPage() {
  const { leads: rawLeads } = useLead();
  const { language } = useLanguage();
  const [isExporting, setIsExporting] = useState(false);

  const uniqueEmails = new Set();
  const leads = rawLeads.filter(lead => {
    if (!lead.Email) return true;
    const email = lead.Email.toLowerCase().trim();
    if (uniqueEmails.has(email)) return false;
    uniqueEmails.add(email);
    return true;
  });
  
  // Date states
  const [filterType, setFilterType] = useState<FilterPeriod>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Helper to parse dates
  const getLeadDate = (lead: any) => {
    if (lead.created_at) {
      const d = new Date(lead.created_at);
      if (!isNaN(d.getTime())) return d;
    }
    if (lead.Data) {
      const d = new Date(lead.Data);
      if (!isNaN(d.getTime())) return d;
    }
    return null;
  };

  const isDateWithin = (dateObj: Date | null, type: FilterPeriod, customStart?: string, customEnd?: string) => {
    if (!dateObj) return type === 'all';

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (type === 'all') return true;

    if (type === 'this-week') {
      const sevenDaysAgo = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
      return dateObj >= sevenDaysAgo && dateObj <= now;
    }

    if (type === 'last-30') {
      const thirtyDaysAgo = new Date(todayStart.getTime() - 30 * 24 * 60 * 60 * 1000);
      return dateObj >= thirtyDaysAgo && dateObj <= now;
    }

    if (type === 'this-month') {
      return dateObj.getMonth() === now.getMonth() && dateObj.getFullYear() === now.getFullYear();
    }

    if (type === 'last-month') {
      const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return dateObj.getMonth() === lm.getMonth() && dateObj.getFullYear() === lm.getFullYear();
    }

    if (type === 'custom') {
      let match = true;
      if (customStart) {
        const sDate = new Date(customStart);
        sDate.setHours(0, 0, 0, 0);
        match = match && dateObj >= sDate;
      }
      if (customEnd) {
        const eDate = new Date(customEnd);
        eDate.setHours(23, 59, 59, 999);
        match = match && dateObj <= eDate;
      }
      return match;
    }

    return true;
  };

  const getCloseDate = (lead: any) => {
    if (lead.converted_at) return new Date(lead.converted_at);
    if (lead.updated_at) return new Date(lead.updated_at);
    return getLeadDate(lead); // Fallback
  };

  // Base created leads
  const createdLeads = leads.filter(l => isDateWithin(getLeadDate(l), filterType, startDate, endDate));
  
  // Calculate specific metrics
  const totalLeads = createdLeads.length;

  const activeCount = createdLeads.filter(l => {
    const s = l.ETAPA?.toLowerCase() || '';
    return s.includes('primeiro contato') || s.includes('negociando') || s.includes('agendado') || s.includes('initial contact') || s.includes('discovery') || s.includes('solution design') || s.includes('hot leads') || s.includes('hot');
  }).length;
  
  // Find all leads that are scheduled/closed NOW, and whose close date falls into this period.
  // This satisfies: "created last month, but closing this month -> shows as converted this month".
  const scheduledLeads = leads.filter(l => {
    const s = l.ETAPA?.toLowerCase() || '';
    const isClosed = s.includes('agendado') || s.includes('scheduling') || s.includes('closing') || s.includes('fechado') || s.includes('agendou');
    if (!isClosed) return false;
    
    return isDateWithin(getCloseDate(l), filterType, startDate, endDate);
  });
  
  const scheduledCount = scheduledLeads.length;

  const conversionRate = totalLeads === 0 ? 0 : Math.round((scheduledCount / totalLeads) * 100);

  const referralLeads = createdLeads.filter(l => l.is_referral);
  const internetLeads = createdLeads.filter(l => !l.is_referral);
  const referralCount = referralLeads.length;
  const internetCount = internetLeads.length;

  const referralScheduled = referralLeads.filter(l => {
    const s = l.ETAPA?.toLowerCase() || '';
    return s.includes('agendado') || s.includes('scheduling') || s.includes('closing') || s.includes('fechado') || s.includes('agendou');
  }).length;

  const internetScheduled = internetLeads.filter(l => {
    const s = l.ETAPA?.toLowerCase() || '';
    return s.includes('agendado') || s.includes('scheduling') || s.includes('closing') || s.includes('fechado') || s.includes('agendou');
  }).length;

  const referralConversion = referralCount === 0 ? 0 : Math.round((referralScheduled / referralCount) * 100);
  const internetConversion = internetCount === 0 ? 0 : Math.round((internetScheduled / internetCount) * 100);

  // Group by Stage - we'll group the combination of createdLeads and scheduledLeads for the pie chart
  // so it correctly reflects the activity in the current period.
  const allRelevantLeads = Array.from(new Set([...createdLeads, ...scheduledLeads]));
  
  const stageDataMap = allRelevantLeads.reduce((acc, lead) => {

    let stage = lead.ETAPA?.trim() || 'Novo';
    
    // Normalize stage names nicely
    if (stage.toLowerCase().includes('novo') || stage.toLowerCase().includes('new lead')) stage = language === 'en' ? 'New Lead' : 'Novo Lead';
    else if (stage.toLowerCase().includes('agendado') || stage.toLowerCase().includes('closing') || stage.toLowerCase().includes('fechado')) stage = language === 'en' ? 'Closed / Scheduled' : 'Agendado / Fechado';
    else if (stage.toLowerCase().includes('negociando') || stage.toLowerCase().includes('pricing') || stage.toLowerCase().includes('presentation') || stage.toLowerCase().includes('quote')) stage = language === 'en' ? 'Negotiation' : 'Em Negociação';
    else if (stage.toLowerCase().includes('primeiro contato') || stage.toLowerCase().includes('initial contact') || stage.toLowerCase().includes('qualification')) stage = language === 'en' ? 'Initial Contact' : 'Primeiro Contato';
    else if (stage.toLowerCase().includes('discovery')) stage = language === 'en' ? 'Discovery' : 'Alinhamento';
    else if (stage.toLowerCase().includes('solution') || stage.toLowerCase().includes('hot')) stage = language === 'en' ? 'Hot Leads' : 'Hot Leads';
    else if (stage.toLowerCase().includes('não responde') || stage.toLowerCase().includes('no response')) stage = language === 'en' ? 'No Response' : 'Sem Resposta';
    else stage = language === 'en' ? 'Others' : 'Outros';

    acc[stage] = (acc[stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const stageData = Object.entries(stageDataMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a,b) => b.value - a.value);

  // Leads over time graph grouping (Leads created vs Leads closed)
  const timeMap = allRelevantLeads.reduce((acc, lead) => {
    let createDateStr = 'Unknown';
    let closeDateStr = 'Unknown';
    
    // Determine creation date
    const createDateObj = getLeadDate(lead);
    if (createDateObj) {
      if (filterType === 'this-week' || filterType === 'last-30') {
        createDateStr = createDateObj.toLocaleDateString(language === 'en' ? 'en-US' : 'pt-BR', { day: '2-digit', month: '2-digit' });
      } else {
        createDateStr = createDateObj.toLocaleString(language === 'en' ? 'en-US' : 'pt-BR', { month: 'short', year: '2-digit' });
      }
      
      if (!acc[createDateStr]) acc[createDateStr] = { Leads: 0, ClosedLeads: 0, _date: createDateObj };
      acc[createDateStr].Leads += 1;
    }

    // Determine close date if the lead is won/closed
    const s = lead.ETAPA?.toLowerCase() || '';
    const isClosed = s.includes('agendado') || s.includes('scheduling') || s.includes('closing') || s.includes('fechado') || s.includes('agendou');
    
    if (isClosed) {
      // Use converted_at if available, otherwise fallback to creation date or today
      const closeDateObj = lead.converted_at ? new Date(lead.converted_at) : (createDateObj || new Date());
      if (closeDateObj && !isNaN(closeDateObj.getTime())) {
        if (filterType === 'this-week' || filterType === 'last-30') {
          closeDateStr = closeDateObj.toLocaleDateString(language === 'en' ? 'en-US' : 'pt-BR', { day: '2-digit', month: '2-digit' });
        } else {
          closeDateStr = closeDateObj.toLocaleString(language === 'en' ? 'en-US' : 'pt-BR', { month: 'short', year: '2-digit' });
        }
        
        if (!acc[closeDateStr]) acc[closeDateStr] = { Leads: 0, ClosedLeads: 0, _date: closeDateObj };
        acc[closeDateStr].ClosedLeads += 1;
      }
    }
    
    return acc;
  }, {} as Record<string, { Leads: number, ClosedLeads: number, _date: Date }>);
  
  const timeData = Object.entries(timeMap)
    .filter(([key]) => key !== 'Unknown')
    .map(([name, data]) => ({ name, Leads: data.Leads, ClosedLeads: data.ClosedLeads, _date: data._date }))
    .sort((a, b) => a._date.getTime() - b._date.getTime());

  const handleExportPDF = async () => {
    setIsExporting(true);
    const element = document.getElementById('dashboard-content');
    if (!element) {
      setIsExporting(false);
      return;
    }
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).jsPDF;
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`CRM_Report_${filterType}.pdf`);
    } catch (e) {
      console.error('Error exporting PDF', e);
    }
    setIsExporting(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 pb-24 md:pb-8 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">
            {language === 'en' ? 'Performance Dashboard' : 'Dashboard de Desempenho'}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {language === 'en' ? 'Real-time pipeline diagnostics, metrics, and funnel conversions.' : 'Análise cirúrgica de conversão de funil, métricas e diagnóstico do CRM.'}
          </p>
        </div>
        <button
          onClick={handleExportPDF}
          disabled={isExporting || totalLeads === 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-850 cursor-pointer active:scale-95 duration-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download size={14} />
          {isExporting ? (language === 'en' ? 'Exporting...' : 'Exportando...') : (language === 'en' ? 'Export PDF Report' : 'Exportar Relatório PDF')}
        </button>
      </header>

      {/* Persistent Beautiful Glassmorphic Date Picker Widget */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-4 md:p-6 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <Filter size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
                {language === 'en' ? 'Time Interval' : 'Intervalo de Tempo'}
              </h2>
              <p className="text-xs text-zinc-500 font-medium">
                {language === 'en' ? 'Filter and compare CRM indicators dynamically.' : 'Filtre e compare o comportamento comercial em tempo recorde.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {[
              { id: 'all', label: language === 'en' ? 'All Time' : 'Todo o Período' },
              { id: 'this-week', label: language === 'en' ? '7 Days' : 'Últimos 7 dias' },
              { id: 'last-30', label: language === 'en' ? '30 Days' : 'Últimos 30 dias' },
              { id: 'this-month', label: language === 'en' ? 'This Month' : 'Este Mês' },
              { id: 'last-month', label: language === 'en' ? 'Last Month' : 'Mês Passado' },
              { id: 'custom', label: language === 'en' ? 'Custom Range...' : 'Personalizado...' },
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => setFilterType(opt.id as FilterPeriod)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                  filterType === opt.id
                    ? 'bg-zinc-900 border border-zinc-900 text-white shadow-sm'
                    : 'bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 hover:border-zinc-300 text-zinc-650'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Range Inputs panel */}
        <AnimatePresence>
          {filterType === 'custom' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-zinc-100 pt-4 flex flex-col sm:flex-row items-center gap-4"
            >
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{language === 'en' ? 'From:' : 'De:'}</span>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={e => setStartDate(e.target.value)}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg border border-zinc-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-none cursor-pointer bg-white w-full sm:w-40"
                />
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{language === 'en' ? 'To:' : 'Até:'}</span>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={e => setEndDate(e.target.value)}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg border border-zinc-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-none cursor-pointer bg-white w-full sm:w-40"
                />
              </div>

              {(startDate || endDate) && (
                <button 
                  onClick={() => { setStartDate(''); setEndDate(''); }}
                  className="text-xs text-rose-600 font-bold hover:underline cursor-pointer py-1 block shrink-0"
                >
                  {language === 'en' ? 'Reset Dates' : 'Limpar Filtros'}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div id="dashboard-content" className="space-y-6 bg-zinc-50/50 p-3 sm:p-5 rounded-2xl border border-zinc-150 relative">
        
        {totalLeads === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-sm font-bold text-zinc-805 uppercase tracking-wider">
              {language === 'en' ? 'No data for this period' : 'Sem dados para este período'}
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm">
              {language === 'en' 
                ? 'No leads were matches within the active filters. Choose a broader interval or expand custom ranges.' 
                : 'Não há registros comercializados ou inseridos no período selecionado. Escolha um intervalo maior ou amplie as datas.'}
            </p>
          </div>
        ) : (
          <>
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Leads */}
              <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest">Total Leads</span>
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Users size={15} />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-zinc-900">{totalLeads}</h3>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1">{language === 'en' ? 'Registered' : 'Registrados'}</p>
                </div>
              </div>
              
              {/* Active Leads */}
              <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest">
                    {language === 'en' ? 'Active Pipeline' : 'Funil Ativo'}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Target size={15} />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-zinc-900">{activeCount}</h3>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1">{language === 'en' ? 'Opportunities' : 'Oportunidades em aberto'}</p>
                </div>
              </div>

              {/* Scheduled / Closed */}
              <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest">
                    {language === 'en' ? 'Scheduled Leads' : 'Leads Agendados'}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <CalendarCheck size={15} />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-zinc-900">{scheduledCount}</h3>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1">{language === 'en' ? 'Bookings Completed' : 'Agendamentos concluídos'}</p>
                </div>
              </div>

              {/* Conversion */}
              <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest">
                    {language === 'en' ? 'Conversion Rate' : 'Taxa de Conversão'}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <TrendingUp size={15} />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-zinc-900">{conversionRate}%</h3>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1">{language === 'en' ? 'Success Probability' : 'De Lead para Fechamento'}</p>
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Funnel Stage Bar Chart */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs">
                <div className="mb-4">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{language === 'en' ? 'FUNNEL BY STAGE' : 'LEADS POR ETAPA DO FUNIL'}</h3>
                  <p className="text-[11px] text-zinc-500 font-medium">{language === 'en' ? 'Quantity per CRM segment' : 'Distribuição quantitativa de clientes e leads por fase.'}</p>
                </div>
                <div className="h-68 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stageData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f4f4f5" />
                      <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#71717a' }} />
                      <YAxis dataKey="name" type="category" width={115} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#3f3f46', fontWeight: 600 }} />
                      <Tooltip 
                        cursor={{ fill: 'rgba(244,244,245,0.4)' }}
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e4e4e7', fontSize: '11px', fontWeight: 'bold' }} 
                      />
                      <Bar dataKey="value" fill="#0ea5e9" radius={[0, 4, 4, 0]}>
                        {stageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Status Pie Chart */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs">
                <div className="mb-4">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{language === 'en' ? 'STATUS DISTRIBUTION' : 'DISTRIBUIÇÃO DE METAS / STATUS'}</h3>
                  <p className="text-[11px] text-zinc-500 font-medium">{language === 'en' ? 'Relative market conversion share' : 'Participação das etapas no funil contratado.'}</p>
                </div>
                <div className="h-68 w-full flex flex-col justify-between">
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stageData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {stageData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: '1px solid #e4e4e7', fontSize: '11px', fontWeight: 'bold' }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Legend Grid */}
                  <div className="flex flex-wrap gap-x-3 gap-y-1 items-center justify-center text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                    {stageData.map((entry, index) => (
                      <div key={entry.name} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span>{entry.name} ({entry.value})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Leads Timeline Line Chart */}
            {timeData.length > 0 && (
              <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs">
                <div className="mb-4">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{language === 'en' ? 'CRM VELOCITY & TIMELINE' : 'VOLUME E CADÊNCIA COMERCIAL AO LONGO DO TEMPO'}</h3>
                  <p className="text-[11px] text-zinc-500 font-medium">{language === 'en' ? 'Ingestion trend chronological velocity' : 'Evolução cronológica de captação de leads e geração de propostas.'}</p>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeData} margin={{ top: 5, right: 15, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fafafa" />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#71717a', fontWeight: 650 }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#71717a' }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e4e4e7', fontSize: '11px', fontWeight: 'bold' }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="Leads" 
                        name={language === 'en' ? 'Leads' : 'Leads'}
                        stroke="#0ea5e9" 
                        strokeWidth={3} 
                        dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#0ea5e9' }} 
                        activeDot={{ r: 6 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="ClosedLeads" 
                        name={language === 'en' ? 'Closed' : 'Fechados'}
                        stroke="#10b981" 
                        strokeWidth={3} 
                        dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#10b981' }} 
                        activeDot={{ r: 6 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
