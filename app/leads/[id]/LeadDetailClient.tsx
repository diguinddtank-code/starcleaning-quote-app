'use client';

import { useLead } from '@/context/LeadContext';
import { useQuote } from '@/context/QuoteContext';
import { useSettings } from '@/context/SettingsContext';
import { useLanguage } from '@/context/LanguageContext';
import { notFound, useRouter } from 'next/navigation';
import { User, Mail, Phone, MapPin, Calendar, Edit3, MessageCircle, FileText, ArrowLeft, Loader2, Save, X, DollarSign, Printer, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Lead, SavedQuote } from '@/lib/types';
import { motion, AnimatePresence } from 'motion/react';
import { QuoteDocument } from '@/components/QuoteDocument';

export function LeadDetailClient({ id }: { id: string }) {
  const { leads, updateLead } = useLead();
  const { savedQuotes } = useQuote();
  const { settings } = useSettings();
  const { language, t, translateStage } = useLanguage();
  const router = useRouter();
  const lead = leads.find(l => l.id === id);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Lead>>(lead || {});
  const [isSaving, setIsSaving] = useState(false);

  const [isEditingComms, setIsEditingComms] = useState(false);
  const [commsForm, setCommsForm] = useState({ 
    FOLLOWUP: lead?.FOLLOWUP || '', 
    UMSG: lead?.UMSG || '',
    REMINDER_DATE: lead?.REMINDER_DATE || ''
  });

  const [selectedQuote, setSelectedQuote] = useState<SavedQuote | null>(null);

  if (!leads.length) {
    return <div className="flex h-screen items-center justify-center text-zinc-500"><Loader2 className="animate-spin w-8 h-8" /></div>;
  }

  if (!lead) {
    return notFound();
  }

  const leadQuotes = savedQuotes.filter(q => q.leadId === id);

  // Quick Messages Logic
  const getMessages = () => {
    const firstName = lead.Nome?.split(' ')[0] || '';
    const q = leadQuotes[0];
    
    if (language === 'en') {
      let quoteText = '';
      if (q) {
        quoteText = ` based on the details of your home, it would be around $${q.total} for a ${q.serviceType} cleaning. `;
      } else if (lead.Inicial) {
        quoteText = ` your initial estimate is around $${lead.Inicial}${lead.Final ? ' to $' + lead.Final : ''}. `;
      } else {
        quoteText = ` I've prepared a special quote for you. `;
      }

      return {
        contact: `Hi ${firstName}, this is Star Cleaning! We received your quote request. Do you have a quick minute to chat?`,
        quote: `Hi ${firstName}, this is Star Cleaning again.${quoteText}What do you think? Can we get you scheduled?`,
        followup: `Hi ${firstName}, just checking in to see if you had a chance to look over our proposal. Let me know if you have any questions!`
      };
    } else {
      let quoteText = '';
      if (q) {
        const type = q.serviceType.toLowerCase().includes('deep') ? 'pesada (deep clean)' : 
                     q.serviceType.toLowerCase().includes('move') ? 'de mudança (move-in/out)' : 'padrão';
        quoteText = ` baseado nos detalhes da sua casa, ficaria em torno de $${q.total} para uma limpeza ${type}. `;
      } else if (lead.Inicial) {
        quoteText = ` seu orçamento inicial aproximado é de $${lead.Inicial}${lead.Final ? ' a $' + lead.Final : ''}. `;
      } else {
        quoteText = ` preparei um orçamento especial para você. `;
      }

      return {
        contact: `Oi ${firstName}, aqui é da Star Cleaning! Recebemos seu pedido de orçamento. Você tem um minutinho para conversarmos?`,
        quote: `Oi ${firstName}, aqui é da Star Cleaning de novo.${quoteText}O que você achou? Podemos agendar para você?`,
        followup: `Oi ${firstName}, só passando para ver se você conseguiu dar uma olhada na nossa proposta. Qualquer dúvida, estou por aqui!`
      };
    }
  };

  const messages = getMessages();

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
              <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">{lead.Nome || (t('language') === 'en' ? 'Unnamed Lead' : 'Lead sem nome')}</h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(lead.ETAPA)}`}>
                {translateStage(lead.ETAPA || 'NOVA')}
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
                  <button 
                    key={q.id} 
                    onClick={() => setSelectedQuote(q)}
                    className="w-full p-4 hover:bg-sky-50 flex items-center justify-between transition-colors text-left group"
                  >
                    <div>
                      <h4 className="font-semibold text-zinc-900 group-hover:text-sky-700 transition-colors">{q.serviceType} <span className="text-zinc-500 font-normal uppercase text-xs">({q.frequency})</span></h4>
                      <p className="text-xs text-zinc-500 mt-1">{new Date(q.date).toLocaleDateString()} &middot; {q.sqFt} sqft</p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <div className="font-bold text-zinc-900 group-hover:text-sky-700 transition-colors">${q.total}</div>
                        <div className="text-xs text-zinc-500 font-semibold uppercase">{q.status}</div>
                      </div>
                      <ChevronRight size={16} className="text-zinc-300 group-hover:text-sky-500 transition-colors" />
                    </div>
                  </button>
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
              <div className="flex gap-2">
                <button 
                  onClick={async () => {
                    await updateLead(lead.id, { UMSG: new Date().toISOString() });
                  }}
                  className="px-3 py-1.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-xs font-semibold rounded-lg transition-colors border border-sky-400/30"
                  title="Marca que você enviou mensagem hoje"
                >
                  Registrar Contato Hoje
                </button>
                <button 
                  onClick={() => isEditingComms ? handleSaveComms() : setIsEditingComms(true)}
                  disabled={isSaving}
                  className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/10"
                >
                  {isEditingComms ? (isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />) : <Edit3 size={16} />}
                </button>
              </div>
            </div>
            
            <div className="p-6 pt-4 space-y-4 relative z-10">
              {isEditingComms ? (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400 block">Detalhes do Followup ou Anotações</label>
                    <input 
                      type="text" 
                      value={commsForm.FOLLOWUP || ''} 
                      onChange={e => setCommsForm({...commsForm, FOLLOWUP: e.target.value})} 
                      placeholder="e.g. Ligar de volta na sexta"
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400 block">Data do Último Contato (UMSG)</label>
                    <input 
                      type="datetime-local"
                      value={(() => {
                        try {
                          if (!commsForm.UMSG) return '';
                          const d = new Date(commsForm.UMSG);
                          if (isNaN(d.getTime())) return '';
                          return d.toISOString().slice(0, 16);
                        } catch(e) { return ''; }
                      })()} 
                      onChange={e => {
                        try {
                          const d = new Date(e.target.value);
                          if (!isNaN(d.getTime())) {
                            setCommsForm({...commsForm, UMSG: d.toISOString()});
                          }
                        } catch(e) {}
                      }} 
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50" 
                    />
                    {commsForm.UMSG && isNaN(new Date(commsForm.UMSG).getTime()) && (
                      <p className="text-xs text-rose-400 mt-1">O formato anterior não é uma data válida. Atualize.</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400 block">Agendar Lembrete (REMINDER_DATE)</label>
                    <input 
                      type="datetime-local"
                      value={(() => {
                        try {
                          if (!commsForm.REMINDER_DATE) return '';
                          const d = new Date(commsForm.REMINDER_DATE);
                          if (isNaN(d.getTime())) return '';
                          return d.toISOString().slice(0, 16);
                        } catch(e) { return ''; }
                      })()} 
                      onChange={e => {
                        try {
                          const d = new Date(e.target.value);
                          if (!isNaN(d.getTime())) {
                            setCommsForm({...commsForm, REMINDER_DATE: d.toISOString()});
                          }
                        } catch(e) {}
                      }} 
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50" 
                    />
                    {commsForm.REMINDER_DATE && isNaN(new Date(commsForm.REMINDER_DATE).getTime()) && (
                      <p className="text-xs text-rose-400 mt-1">O formato anterior não é uma data válida. Atualize.</p>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/10">
                    <span className="text-xs text-zinc-400 block mb-1">Próximo Lembrete / Tarefa</span>
                    <p className="text-sm font-medium text-emerald-400">
                      {lead.REMINDER_DATE && !isNaN(new Date(lead.REMINDER_DATE).getTime()) 
                        ? new Date(lead.REMINDER_DATE).toLocaleString('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }) 
                        : 'Sem lembrete agendado.'}
                    </p>
                  </div>
                  <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/10">
                    <span className="text-xs text-zinc-400 block mb-1">Último Contato Realizado (UMSG)</span>
                    <p className="text-sm font-medium">
                      {lead.UMSG && !isNaN(new Date(lead.UMSG).getTime()) 
                        ? new Date(lead.UMSG).toLocaleString('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }) 
                        : (lead.UMSG || 'Nenhum contato registrado.')}
                    </p>
                  </div>
                  <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/10">
                    <span className="text-xs text-zinc-400 block mb-1">Followup / Notas</span>
                    <p className="text-sm font-medium whitespace-normal break-words">{lead.FOLLOWUP || 'Nenhuma anotação.'}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick Copy Feature for RingCentral */}
          <div className="bg-emerald-900/10 border border-emerald-900/20 text-zinc-900 rounded-2xl shadow-sm overflow-hidden mt-6">
            <div className="p-6 border-b border-emerald-900/10 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold mb-1 text-emerald-800">{t('ld.quick_msg')}</h2>
                <p className="text-sm text-emerald-700/80">{t('ld.copy_paste')}</p>
              </div>
            </div>
            <div className="p-6 pt-4 space-y-3">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(messages.contact);
                  alert(t('ld.copied'));
                }}
                className="w-full text-left p-3 rounded-xl bg-white border border-emerald-100 hover:border-emerald-300 hover:shadow-sm transition-all group"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">{t('ld.contact')}</span>
                  <span className="text-[10px] text-zinc-400 group-hover:text-emerald-500 font-medium">{language === 'en' ? 'Click to copy' : 'Clique para copiar'}</span>
                </div>
                <p className="text-sm text-zinc-600 line-clamp-2">{messages.contact}</p>
              </button>

              <button 
                onClick={() => {
                  navigator.clipboard.writeText(messages.quote);
                  alert(t('ld.copied'));
                }}
                className="w-full text-left p-3 rounded-xl bg-white border border-emerald-100 hover:border-emerald-300 hover:shadow-sm transition-all group"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">{t('ld.send_quote')}</span>
                  <span className="text-[10px] text-zinc-400 group-hover:text-emerald-500 font-medium">{language === 'en' ? 'Click to copy' : 'Clique para copiar'}</span>
                </div>
                <p className="text-sm text-zinc-600 line-clamp-2">{messages.quote}</p>
              </button>

              <button 
                onClick={() => {
                  navigator.clipboard.writeText(messages.followup);
                  alert(t('ld.copied'));
                }}
                className="w-full text-left p-3 rounded-xl bg-white border border-emerald-100 hover:border-emerald-300 hover:shadow-sm transition-all group"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">{t('ld.followup')}</span>
                  <span className="text-[10px] text-zinc-400 group-hover:text-emerald-500 font-medium">{language === 'en' ? 'Click to copy' : 'Clique para copiar'}</span>
                </div>
                <p className="text-sm text-zinc-600 line-clamp-2">{messages.followup}</p>
              </button>
            </div>
          </div>

        </div>
      </div>

      <AnimatePresence>
        {selectedQuote && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm z-50 overflow-y-auto print:bg-white print:p-0"
          >
            <div className="flex min-h-full items-start justify-center p-4 sm:p-6 md:py-12">
              <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-zinc-200 overflow-hidden print:border-none print:shadow-none print:m-0 relative"
              >
                <div className="bg-zinc-50 border-b border-zinc-200 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
                  <div className="flex items-center gap-2 text-zinc-900 font-bold">
                    <FileText size={20} className="text-sky-600" /> Estimate Details
                  </div>
                  <div className="flex w-full sm:w-auto gap-2">
                    <button onClick={() => window.print()} className="flex-1 sm:flex-none justify-center px-4 py-2 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-sm">
                      <Printer size={16} /> Print / PDF
                    </button>
                    <button 
                      onClick={() => setSelectedQuote(null)} 
                      className="flex-1 sm:flex-none justify-center px-6 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-bold rounded-lg transition-colors shadow-sm"
                    >
                      Close
                    </button>
                  </div>
                </div>
                <div className="p-0 sm:p-8 print:p-0">
                  <QuoteDocument quote={selectedQuote} settings={settings} />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
