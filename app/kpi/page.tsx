'use client';

import React, { useState } from 'react';
import { useLead } from '@/context/LeadContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Download, ArrowUpRight, Target, Users, CalendarCheck, TrendingUp } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#64748b', '#ec4899'];

export default function KPIPage() {
  const { leads } = useLead();
  const [isExporting, setIsExporting] = useState(false);

  // Derive metrics
  const totalLeads = leads.length;
  const activeCount = leads.filter(l => {
    const s = l.ETAPA?.toLowerCase() || '';
    return s.includes('primeiro contato') || s.includes('negociando') || s.includes('agendado');
  }).length;
  
  const scheduledCount = leads.filter(l => {
    const s = l.ETAPA?.toLowerCase() || '';
    return s.includes('agendado');
  }).length;

  const conversionRate = totalLeads === 0 ? 0 : Math.round((scheduledCount / totalLeads) * 100);

  // Group by Stage
  const stageDataMap = leads.reduce((acc, lead) => {
    let stage = lead.ETAPA?.trim() || 'Novo';
    // Normalize string somewhat to match kanban
    if (stage.toLowerCase().includes('novo')) stage = 'Novo';
    else if (stage.toLowerCase().includes('agendado')) stage = 'Agendado';
    else if (stage.toLowerCase().includes('negociando')) stage = 'Negociando';
    else if (stage.toLowerCase().includes('primeiro contato')) stage = 'Primeiro Contato';
    else if (stage.toLowerCase().includes('não responde')) stage = 'Não Responde';
    else if (stage.toLowerCase().includes('interesse')) stage = 'Sem Interesse';
    else stage = 'Outros';

    acc[stage] = (acc[stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const stageData = Object.entries(stageDataMap).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);

  // Leads over time (by month created) - simplistic fallback
  const timeMap = leads.reduce((acc, lead) => {
    let dateStr = 'Unknown';
    const timeRef = lead.UMSG || lead.created_at;
    if (timeRef) {
      const d = new Date(timeRef);
      if (!isNaN(d.getTime())) {
        dateStr = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      } else if (!isNaN(Number(timeRef))) {
        // Fallback for unix timestamp if UMSG is stored as a number string
        const dNum = new Date(Number(timeRef));
        if (!isNaN(dNum.getTime())) {
          dateStr = dNum.toLocaleString('default', { month: 'short', year: '2-digit' });
        }
      }
    }
    acc[dateStr] = (acc[dateStr] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const timeData = Object.entries(timeMap)
    .filter(([key]) => key !== 'Unknown')
    .map(([name, Leads]) => ({ name, Leads }))
    .reverse(); // Assuming descending data, make ascending

  const handleExportPDF = async () => {
    setIsExporting(true);
    const element = document.getElementById('dashboard-content');
    if (!element) {
      setIsExporting(false);
      return;
    }
    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('CRM_Dashboard_Report.pdf');
    } catch (e) {
      console.error('Error exporting PDF', e);
    }
    setIsExporting(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 pb-24 md:pb-8 space-y-6">
      <header className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">Performance Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-1">Visão geral e KPIs do negócio.</p>
        </div>
        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50"
        >
          <Download size={16} />
          {isExporting ? 'Exportando...' : 'Exportar PDF'}
        </button>
      </header>

      <div id="dashboard-content" className="space-y-6 bg-zinc-50 p-2 sm:p-4 rounded-xl">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users size={20} />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500 mb-1">Total Leads</p>
              <h3 className="text-2xl font-bold text-zinc-900">{totalLeads}</h3>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                <Target size={20} />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500 mb-1">Leads Ativos (Oportunidades)</p>
              <h3 className="text-2xl font-bold text-zinc-900">{activeCount}</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                <CalendarCheck size={20} />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500 mb-1">Agendados</p>
              <h3 className="text-2xl font-bold text-zinc-900">{scheduledCount}</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp size={20} />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500 mb-1">Taxa de Conversão (Agendado)</p>
              <div className="flex items-end gap-2">
                <h3 className="text-2xl font-bold text-zinc-900">{conversionRate}%</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-semibold text-zinc-900 mb-6">Leads por Etapa (Funil)</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stageData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f4f4f5" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12, fill: '#52525b' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
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

          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-semibold text-zinc-900 mb-6">Distribuição de Status</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {timeData.length > 0 && (
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-semibold text-zinc-900 mb-6">Leads Gerados ao Longo do Tempo</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#52525b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#52525b' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                  />
                  <Line type="monotone" dataKey="Leads" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
