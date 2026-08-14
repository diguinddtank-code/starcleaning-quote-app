'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLead } from '@/context/LeadContext';
import { useQuote } from '@/context/QuoteContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useSettings } from '@/context/SettingsContext';
import { Megaphone, Users, PlusCircle, History, ArrowRight, 
  BarChart2, Calculator, BookOpen, 
  CheckCircle, FileText, Activity, 
  DollarSign, TrendingUp, Inbox, Calendar, Bell, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function DashboardPage() {
  const { leads: rawLeads } = useLead();
  const { savedQuotes } = useQuote();
  const { user } = useAuth();
  const { language, t, translateStage } = useLanguage();
  const { settings } = useSettings();

  const isCampaignActive = (() => {
    if (!settings?.campaign?.name) return false;
    if (!settings.campaign.startDate || !settings.campaign.endDate) return false;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    return todayStr >= settings.campaign.startDate && todayStr <= settings.campaign.endDate;
  })();

  const uniqueEmails = new Set();
  const leads = rawLeads.filter(lead => {
    if (!lead.Email) return true;
    const email = lead.Email.toLowerCase().trim();
    if (uniqueEmails.has(email)) return false;
    uniqueEmails.add(email);
    return true;
  });

  // Metrics
  const totalLeads = leads.length;
  const newLeadsCount = leads.filter(l => translateStage(l.ETAPA || '').toLowerCase() === translateStage('New Lead').toLowerCase()).length;
  const closingCount = leads.filter(l => translateStage(l.ETAPA || '').toLowerCase() === translateStage('Closing').toLowerCase()).length;
  const referralCount = leads.filter(l => l.is_referral).length;
  const tooPriceyCount = leads.filter(l => translateStage(l.ETAPA || '').toLowerCase() === translateStage('Too Pricey').toLowerCase()).length;
  
  const recentLeads = [...leads]
    .sort((a, b) => {
      if (a.UMSG && !b.UMSG) return -1;
      if (!a.UMSG && b.UMSG) return 1;
      if (a.UMSG && b.UMSG) {
        if (!isNaN(Number(a.UMSG)) && !isNaN(Number(b.UMSG))) {
          return Number(b.UMSG) - Number(a.UMSG);
        }
        return new Date(b.UMSG).getTime() - new Date(a.UMSG).getTime();
      }
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    })
    .slice(0, 5);

  const recentQuotes = [...savedQuotes]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Sales Assistant Logic
  const today = new Date();
  const getDaysDifference = (dateString: string | undefined | null) => {
    if (!dateString) return Infinity;
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return Infinity;
    const diffTime = today.getTime() - d.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const opportunities = leads.filter(l => {
    const stage = translateStage(l.ETAPA || '').toLowerCase();
    
    if (stage.includes('closing') || stage.includes('no response') || stage.includes('not interested')) return false;

    const daysSinceLastMessage = Math.abs(getDaysDifference(l.UMSG));
    
    if (stage.includes('new lead')) return true;
    if (stage.includes('initial contact') && daysSinceLastMessage >= 1) return true;
    if (stage.includes('discovery') && daysSinceLastMessage >= 2) return true;
    if (stage.includes('hot leads') && daysSinceLastMessage >= 2) return true;
    if (stage.includes('pricing') && daysSinceLastMessage >= 2) return true;
    return false;
  }).sort((a, b) => Math.abs(getDaysDifference(a.UMSG)) - Math.abs(getDaysDifference(b.UMSG))).slice(0, 4);

  const reminders = leads.filter(l => {
    if (!l.REMINDER_DATE) return false;
    const reminderDate = new Date(l.REMINDER_DATE);
    if (isNaN(reminderDate.getTime())) return false;
    const diff = getDaysDifference(l.REMINDER_DATE);
    return diff >= -1;
  }).sort((a, b) => new Date(a.REMINDER_DATE!).getTime() - new Date(b.REMINDER_DATE!).getTime());

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  };

  return (
    <>
      <AnimatePresence>
        {isCampaignActive && settings.campaign && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="w-full bg-gradient-to-r from-rose-500 via-orange-500 to-rose-500 text-white overflow-hidden relative z-40 border-b border-rose-600/30 shadow-sm"
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <Link href="/campanhas" className="block w-full py-2.5 px-4">
              <div className="max-w-7xl mx-auto flex items-center justify-center sm:justify-between gap-4">
                <div className="hidden sm:flex items-center gap-2">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  <span className="text-xs font-black uppercase tracking-widest text-white/90">
                    {language === 'en' ? 'Active Campaign' : 'Campanha Ativa'}
                  </span>
                </div>
                
                <div className="flex items-center justify-center gap-3 w-full sm:w-auto">
                  <Megaphone size={16} className="shrink-0 hidden sm:block animate-pulse" />
                  <p className="text-sm font-bold text-center flex-wrap flex justify-center items-center gap-x-2 gap-y-1">
                    <span>{settings.campaign.name}</span>
                    <span className="bg-white text-rose-600 px-2 py-0.5 rounded-full text-xs font-black">
                      {settings.campaign.discountPercent}% OFF
                    </span>
                  </p>
                </div>
                
                <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-white/90 group hover:text-white transition-colors">
                  {language === 'en' ? 'View Details' : 'Ver Detalhes'}
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="max-w-7xl mx-auto p-4 md:p-8 pb-24 md:pb-8 space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
            {t('db.morning')}{user?.email ? `, ${user.email.split('@')[0]}` : ''}.
          </h1>
          <p className="text-zinc-500 mt-1">{t('db.summary')}</p>
        </div>
        <Link 
          href="/estimate" 
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg transition-all shadow-sm hover:shadow"
        >
          <PlusCircle size={18} /> {t('nav.estimate')}
        </Link>
      </header>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4"
      >
        <motion.div 
          variants={itemVariants} 
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="bg-white p-5 rounded-2xl border border-zinc-350 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Users size={18} />
            </div>
            <span className="text-xs font-black text-zinc-800 uppercase tracking-wider">{t('db.total_leads')}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-zinc-950 tracking-tight">{totalLeads}</h3>
            <span className="text-xs font-extrabold text-emerald-850 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-300 flex items-center shrink-0">
              <TrendingUp size={12} className="mr-1 shadow-xs"/> {t('db.active')}
            </span>
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants} 
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="bg-white p-5 rounded-2xl border border-zinc-350 shadow-sm relative overflow-hidden transition-shadow hover:shadow-md"
        >
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
            <Inbox size={80} />
          </div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <Activity size={18} />
            </div>
            <span className="text-xs font-black text-zinc-800 uppercase tracking-wider">New Leads</span>
          </div>
          <div className="flex items-baseline gap-2 relative z-10">
            <h3 className="text-3xl font-black text-zinc-950 tracking-tight">{newLeadsCount}</h3>
            <span className="text-xs font-extrabold text-zinc-800 bg-zinc-100 px-2.5 py-1 rounded-full border border-zinc-300 uppercase tracking-wide">
              {t('db.inbox')}
            </span>
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants} 
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="bg-white p-5 rounded-2xl border border-zinc-350 shadow-sm relative overflow-hidden transition-shadow hover:shadow-md"
        >
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
            <CheckCircle size={80} />
          </div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <CheckCircle size={18} />
            </div>
            <span className="text-xs font-black text-zinc-800 uppercase tracking-wider">Closing Deals</span>
          </div>
          <div className="flex items-baseline gap-2 relative z-10">
            <h3 className="text-3xl font-black text-zinc-950 tracking-tight">{closingCount}</h3>
            <span className="text-xs font-extrabold text-zinc-800 bg-zinc-100 px-2.5 py-1 rounded-full border border-zinc-300 uppercase tracking-wide">
              {t('db.converted')}
            </span>
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants} 
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="bg-white p-5 rounded-2xl border border-zinc-350 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-md shadow-violet-500/20">
              <Award size={18} />
            </div>
            <span className="text-xs font-black text-zinc-800 uppercase tracking-wider">Indicações</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-zinc-950 tracking-tight">{referralCount}</h3>
            <span className="text-xs font-extrabold text-violet-800 bg-violet-100 px-2.5 py-1 rounded-full border border-violet-200 uppercase tracking-wide">
              Referrals
            </span>
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants} 
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="bg-white p-5 rounded-2xl border border-zinc-350 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-md shadow-sky-500/20">
              <FileText size={18} />
            </div>
            <span className="text-xs font-black text-zinc-800 uppercase tracking-wider">{t('nav.quotes')}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-zinc-950 tracking-tight">{savedQuotes.length}</h3>
            <span className="text-xs font-extrabold text-zinc-800 bg-zinc-100 px-2.5 py-1 rounded-full border border-zinc-300 uppercase tracking-wide">
              {t('db.generated')}
            </span>
          </div>
        </motion.div>
      </motion.div>



      {/* Reminders Widget */}
      {reminders.length > 0 && (
        <motion.div variants={itemVariants} className="bg-emerald-50 border border-emerald-100 rounded-2xl shadow-sm p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Bell size={120} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="text-emerald-600" size={20} />
              <h2 className="text-lg font-bold text-emerald-900">{t('db.reminders')}</h2>
              <span className="ml-2 bg-emerald-200 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">{reminders.length} Pending</span>
            </div>
            <p className="text-sm text-emerald-700 mb-6">Scheduled contacts and follow-ups based on your reminders.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {reminders.map(lead => {
                const diff = getDaysDifference(lead.REMINDER_DATE);
                const isOverdue = diff > 0;
                const isToday = diff === 0;
                const timeString = new Date(lead.REMINDER_DATE!).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                
                return (
                  <Link href={`/leads/${lead.id}`} key={lead.id} className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-emerald-100 group flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${isOverdue ? 'bg-rose-100 text-rose-700' : isToday ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {isOverdue ? (language === 'en' ? 'Overdue' : 'Atrasado') : isToday ? (language === 'en' ? 'Today' : 'Hoje') : (language === 'en' ? 'Tomorrow' : 'Amanhã')}
                        </span>
                        <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                          <Calendar size={12} /> {timeString}
                        </span>
                      </div>
                      <p className="font-bold text-zinc-900 group-hover:text-emerald-700 truncate flex items-center gap-1.5">
                        <span className="truncate">{lead.Nome || 'Cliente sem nome'}</span>
                        {lead.is_referral && (
                          <span className="shrink-0 inline-flex items-center gap-0.5 bg-violet-100 text-violet-700 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full border border-violet-200">
                            Indicação
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-zinc-500 line-clamp-2 mt-1 mb-3">{lead.FOLLOWUP || 'Sem detalhes'}</p>
                    </div>
                    <div className="text-emerald-600 font-semibold text-xs flex items-center group-hover:underline mt-auto">
                      {language === 'en' ? 'Open Lead' : 'Abrir Lead'} <ArrowRight size={12} className="ml-1" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Sales Assistant Widget */}
      {opportunities.length > 0 && (
        <motion.div variants={itemVariants} className="bg-sky-50 border border-sky-100 rounded-2xl shadow-sm p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Activity size={120} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="text-sky-600" size={20} />
              <h2 className="text-lg font-bold text-sky-900">{t('db.assistant')}</h2>
              <span className="ml-2 bg-sky-200 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Opportunities</span>
            </div>
            <p className="text-sm text-sky-700 mb-6">These leads need your attention today before they go cold.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {opportunities.map(lead => {
                const days = getDaysDifference(lead.UMSG);
                const isNew = lead.ETAPA?.toLowerCase() === 'novo' || lead.ETAPA?.toLowerCase() === 'new' || !lead.ETAPA;
                return (
                  <Link href={`/leads/${lead.id}`} key={lead.id} className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-sky-100 group">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${isNew ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {isNew ? (language === 'en' ? 'New Lead' : 'Lead Novo') : (language === 'en' ? 'Follow up' : 'Acompanhar')}
                      </span>
                      {days !== Infinity && !isNew && (
                        <span className="text-xs font-semibold text-rose-500">
                          {days === 0 ? (language === 'en' ? 'Today' : 'Hoje') : (language === 'en' ? `${days} days quiet` : `${days} dias quieto`)}
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-zinc-900 group-hover:text-sky-700 truncate flex items-center gap-1.5">
                      <span className="truncate">{lead.Nome || 'Cliente sem nome'}</span>
                      {lead.is_referral && (
                        <span className="shrink-0 inline-flex items-center gap-0.5 bg-violet-100 text-violet-700 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full border border-violet-200">
                          Indicação
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-zinc-500 truncate mb-3">{lead.Telefone || lead.Email || 'Sem contato'}</p>
                    <div className="text-sky-600 font-semibold text-xs flex items-center group-hover:underline">
                      {language === 'en' ? 'View details' : 'Ver detalhes'} <ArrowRight size={12} className="ml-1" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          className="bg-white border text-left border-zinc-200 rounded-2xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <History className="text-zinc-400" size={20} /> {t('db.recent_leads')}
            </h2>
            <Link href="/leads" className="text-sm font-medium text-sky-600 hover:text-sky-700 flex items-center gap-1 group">
              {t('db.funnel')} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          {recentLeads.length > 0 ? (
            <div className="space-y-3">
              {recentLeads.map((lead) => (
                <Link
                  href={`/leads/${lead.id}`}
                  key={lead.id} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-zinc-100 bg-zinc-50 hover:bg-sky-50 hover:border-sky-100 cursor-pointer transition-colors group gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-500 font-bold shadow-sm">
                      {(lead.Nome?.[0] || 'U').toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <p className="text-sm font-bold text-zinc-900 group-hover:text-sky-900 transition-colors flex items-center gap-1.5">
                        <span className="truncate">{lead.Nome || 'Sem Nome'}</span>
                        {lead.is_referral && (
                          <span className="shrink-0 inline-flex items-center gap-0.5 bg-violet-100 text-violet-700 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full border border-violet-200">
                            Indicação
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-zinc-500">{lead.Telefone || lead.Email || 'Sem contato'}</p>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                    <span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      lead.ETAPA?.toLowerCase().includes('agendado') || lead.ETAPA?.toLowerCase().includes('closing') ? 'bg-sky-100 text-sky-700' :
                      lead.ETAPA?.toLowerCase().includes('negociando') || lead.ETAPA?.toLowerCase().includes('presentation') ? 'bg-amber-100 text-amber-700' :
                      lead.ETAPA?.toLowerCase().includes('hot') ? 'bg-rose-100 text-rose-700' :
                      lead.ETAPA?.toLowerCase().includes('descoberta') || lead.ETAPA?.toLowerCase().includes('discovery') ? 'bg-indigo-100 text-indigo-750' :
                      lead.ETAPA?.toLowerCase().includes('caro') || lead.ETAPA?.toLowerCase().includes('pricey') ? 'bg-fuchsia-100 text-fuchsia-700' :
                      lead.ETAPA?.toLowerCase().includes('sem interesse') || lead.ETAPA?.toLowerCase().includes('not interested') ? 'bg-rose-100 text-rose-700' :
                      // Defaults to green/emerald since the text defaults to New Lead / Novo
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {translateStage(lead.ETAPA || 'Novo')}
                    </span>
                    <span className="text-[11px] text-zinc-400 mt-1 hidden sm:block">
                      {lead.Cidade ? lead.Cidade : (lead.Data ? new Date(lead.Data).toLocaleDateString() : '')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 py-10 border-2 border-dashed border-zinc-100 rounded-xl">
              <Users className="text-zinc-300" size={32} />
              <p className="text-sm text-zinc-500">{language === 'en' ? 'No leads available yet.' : 'Nenhum lead disponível ainda.'}</p>
            </div>
          )}
        </motion.div>

        <motion.div 
          className="bg-white border text-left border-zinc-200 rounded-2xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <Calculator className="text-zinc-400" size={20} /> {t('db.recent_quotes')}
            </h2>
            <Link href="/history" className="text-sm font-medium text-sky-600 hover:text-sky-700 flex items-center gap-1 group">
              {language === 'en' ? 'View History' : 'Ver Histórico'} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          {recentQuotes.length > 0 ? (
            <div className="space-y-3">
              {recentQuotes.map((quote) => (
                <Link
                  href={`/history`}
                  key={quote.id} 
                  className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 bg-zinc-50 hover:bg-sky-50 hover:border-sky-100 cursor-pointer transition-colors group gap-3"
                >
                  <div className="flex flex-col flex-1">
                    <p className="text-sm font-bold text-zinc-900 group-hover:text-sky-900 transition-colors">
                      {quote.customerName || 'Cliente sem nome'}
                    </p>
                    <p className="text-xs text-zinc-500 flex items-center gap-1.5 mt-0.5">
                      <span className="capitalize">{quote.serviceType}</span>
                      <span>•</span>
                      <span className="capitalize">{quote.frequency}</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="text-sm font-bold text-zinc-900 flex items-center">
                      <DollarSign size={14} className="text-zinc-400" />
                      {quote.total.toLocaleString()}
                    </p>
                    <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase mt-1 ${
                      quote.status === 'scheduled' ? 'bg-sky-100 text-sky-700' :
                      quote.status === 'contacted' ? 'bg-amber-100 text-amber-700' :
                      quote.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-zinc-200 text-zinc-700'
                    }`}>
                      {quote.status || 'new'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 py-10 border-2 border-dashed border-zinc-100 rounded-xl">
              <FileText className="text-zinc-300" size={32} />
              <p className="text-sm text-zinc-500">{language === 'en' ? 'No quotes generated yet.' : 'Nenhum orçamento gerado ainda.'}</p>
              <Link href="/estimate" className="mt-2 text-sm text-sky-600 hover:underline">
                {language === 'en' ? 'Create first' : 'Criar o primeiro'}
              </Link>
            </div>
          )}
        </motion.div>
      </div>
      
      {/* Quick Action Grid */}
      <h2 className="text-xl font-bold text-zinc-900 pt-4">{t('db.access')}</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Link href="/estimate" className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm hover:shadow hover:border-sky-300 transition-all flex flex-col items-center justify-center text-center gap-2 group">
          <div className="w-12 h-12 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Calculator size={24} />
          </div>
          <span className="text-sm font-semibold text-zinc-900">{t('nav.estimate')}</span>
        </Link>
        <Link href="/leads" className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm hover:shadow hover:border-amber-300 transition-all flex flex-col items-center justify-center text-center gap-2 group">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Inbox size={24} />
          </div>
          <span className="text-sm font-semibold text-zinc-900">{t('db.funnel')}</span>
        </Link>
        <Link href="/kpi" className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm hover:shadow hover:border-emerald-300 transition-all flex flex-col items-center justify-center text-center gap-2 group">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <BarChart2 size={24} />
          </div>
          <span className="text-sm font-semibold text-zinc-900">{t('db.kpis')}</span>
        </Link>
        <Link href="/playbook" className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm hover:shadow hover:border-purple-300 transition-all flex flex-col items-center justify-center text-center gap-2 group">
          <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <BookOpen size={24} />
          </div>
          <span className="text-sm font-semibold text-zinc-900">{t('db.playbook')}</span>
        </Link>
        <Link href="/campanhas" className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm hover:shadow hover:border-rose-300 transition-all flex flex-col items-center justify-center text-center gap-2 group">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Megaphone size={24} />
          </div>
          <span className="text-sm font-semibold text-zinc-900">{language === 'en' ? 'Campaigns' : 'Campanhas'}</span>
        </Link>
      </div>

    </div>
    </>
  );
}

