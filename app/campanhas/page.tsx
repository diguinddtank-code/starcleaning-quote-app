'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { useLanguage } from '@/context/LanguageContext';
import { Megaphone, Calendar, Tag, Info, Save, Loader2, StopCircle, ArrowLeft, X, ImageIcon, Edit2, Users, Clock, CheckCircle2, Archive, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

export default function CampaignsPage() {
  const { settings, updateSettings } = useSettings();
  const { language } = useLanguage();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Local form state
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [discountPercent, setDiscountPercent] = useState<number | string>('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [targetAudience, setTargetAudience] = useState('All Clients');
  const [closedClients, setClosedClients] = useState<number | string>('');
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Timer State
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  // Sync from context on load
  useEffect(() => {
    if (settings?.campaign && isEditing) {
      setName(settings.campaign.name || '');
      setStartDate(settings.campaign.startDate || '');
      setEndDate(settings.campaign.endDate || '');
      setDiscountPercent(settings.campaign.discountPercent || '');
      setDescription(settings.campaign.description || '');
      setImageUrl(settings.campaign.imageUrl || '');
      setTargetAudience(settings.campaign.targetAudience || 'All Clients');
      setClosedClients(settings.campaign.closedClients || '');
    }
  }, [settings?.campaign, isEditing]);

  const isActive = useMemo(() => {
    if (!settings?.campaign?.name) return false;
    if (!settings.campaign.startDate || !settings.campaign.endDate) return false;
    
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    return todayStr >= settings.campaign.startDate && todayStr <= settings.campaign.endDate;
  }, [settings?.campaign]);

  useEffect(() => {
    if (!isActive || !settings?.campaign?.endDate) return;
    
    const calculateTimeLeft = () => {
      const end = new Date(settings.campaign!.endDate + 'T23:59:59').getTime();
      const now = new Date().getTime();
      const distance = end - now;
      
      if (distance < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
        return;
      }
      
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(timer);
  }, [isActive, settings?.campaign?.endDate]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!supabase) {
      setUploadError('Supabase connection not initialized');
      return;
    }
    
    setIsUploading(true);
    setUploadError('');
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('campaigns')
        .upload(fileName, file);
        
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('campaigns')
        .getPublicUrl(fileName);
        
      setImageUrl(publicUrl);
    } catch (error: any) {
      console.error('Error uploading image:', error);
      setUploadError(error.message || 'Failed to upload image.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedCampaign = {
        name,
        startDate,
        endDate,
        discountPercent: Number(discountPercent) || 0,
        description,
        imageUrl,
        targetAudience,
        closedClients: Number(closedClients) || 0,
        history: settings?.campaign?.history || []
      };
      
      updateSettings({
        ...settings,
        campaign: updatedCampaign
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save campaign:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEndAndArchive = async () => {
    if (!name) return;
    setIsSaving(true);
    try {
      const historyItem = {
        id: Math.random().toString(36).substring(2),
        name,
        startDate,
        endDate,
        discountPercent: Number(discountPercent) || 0,
        description,
        imageUrl,
        targetAudience,
        closedClients: Number(closedClients) || 0,
      };

      const currentHistory = settings?.campaign?.history || [];
      
      updateSettings({
        ...settings,
        campaign: {
          name: '',
          startDate: '',
          endDate: '',
          discountPercent: 0,
          description: '',
          imageUrl: '',
          targetAudience: 'All Clients',
          closedClients: 0,
          history: [historyItem, ...currentHistory]
        }
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to archive campaign:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setUploadError('');
  };

  const handleClear = () => {
    setName('');
    setStartDate('');
    setEndDate('');
    setDiscountPercent('');
    setDescription('');
    setImageUrl('');
    setTargetAudience('All Clients');
    setClosedClients('');
    setUploadError('');
  };

  const t = {
    title: language === 'en' ? 'Marketing Campaigns' : 'Campanhas de Marketing',
    activeCampaign: language === 'en' ? 'Active Campaign' : 'Campanha Ativa',
    noActive: language === 'en' ? 'No active campaign' : 'Nenhuma campanha ativa',
    edit: language === 'en' ? 'Edit Campaign' : 'Editar Campanha',
    create: language === 'en' ? 'Create Campaign' : 'Criar Campanha',
    save: language === 'en' ? 'Save Changes' : 'Salvar Alterações',
    archive: language === 'en' ? 'End & Save to History' : 'Encerrar & Salvar no Histórico',
    cancel: language === 'en' ? 'Cancel' : 'Cancelar',
    clear: language === 'en' ? 'Clear' : 'Limpar',
    uploadCover: language === 'en' ? 'Upload Image' : 'Imagem de Capa',
    uploading: language === 'en' ? 'Uploading...' : 'Enviando...',
    removeImage: language === 'en' ? 'Remove' : 'Remover',
    historyTitle: language === 'en' ? 'Campaign History' : 'Histórico de Campanhas',
    fields: {
      name: language === 'en' ? 'Campaign Name' : 'Nome da Campanha',
      startDate: language === 'en' ? 'Start Date' : 'Início',
      endDate: language === 'en' ? 'End Date' : 'Término',
      discount: language === 'en' ? 'Discount (%)' : 'Desconto (%)',
      desc: language === 'en' ? 'Description' : 'Descrição',
      audience: language === 'en' ? 'Target Audience' : 'Público Alvo',
      closedClients: language === 'en' ? 'Clients Closed' : 'Clientes Fechados (Resultado)'
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 pb-24">
      {/* Header Compacto */}
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-zinc-400 hover:text-zinc-900 transition-colors p-1.5 hover:bg-zinc-100 rounded-lg">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
            <Megaphone className="text-rose-500" size={24} />
            {t.title}
          </h1>
        </div>
        
        {!isEditing && (
          <button
            onClick={() => {
              if (!settings?.campaign?.name) handleClear();
              setIsEditing(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-sm font-bold transition-colors shadow-sm cursor-pointer"
          >
            <Edit2 size={14} />
            {settings?.campaign?.name ? t.edit : t.create}
          </button>
        )}
      </header>

      <AnimatePresence mode="wait">
        {!isEditing ? (
          <motion.div
            key="view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full space-y-6"
          >
            {settings?.campaign?.name ? (
              <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
                <div className="flex flex-col md:flex-row p-5 md:p-6 gap-6 md:gap-8">
                  
                  {/* Image Thumbnail (Compact) */}
                  {settings.campaign.imageUrl && (
                    <div className="w-full md:w-[30%] shrink-0">
                      <div className="relative w-full aspect-square md:aspect-[4/3] rounded-xl overflow-hidden border border-zinc-100 bg-zinc-50 flex items-center justify-center">
                        <Image 
                          src={settings.campaign.imageUrl} 
                          alt={settings.campaign.name}
                          fill
                          className="object-contain p-2"
                          referrerPolicy="no-referrer"
                          sizes="(max-width: 768px) 100vw, 30vw"
                        />
                      </div>
                    </div>
                  )}

                  {/* Core Data (Dense & Practical) */}
                  <div className="flex-1 flex flex-col justify-center">
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-md">
                        {isActive ? (
                          <>
                            <span className="flex h-2 w-2 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-rose-600">
                              {t.activeCampaign}
                            </span>
                          </>
                        ) : (
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                            {language === 'en' ? 'Inactive / Scheduled' : 'Inativa / Agendada'}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-zinc-500 flex items-center gap-1.5">
                        <Calendar size={14} />
                        {new Date(settings.campaign.startDate + 'T12:00:00').toLocaleDateString()} - {new Date(settings.campaign.endDate + 'T12:00:00').toLocaleDateString()}
                      </div>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tight leading-tight mb-6">
                      {settings.campaign.name}
                    </h2>
                    
                    {/* Data Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                      {/* Discount Block */}
                      <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-3 flex flex-col justify-between">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{t.fields.discount}</span>
                        <div className="flex items-center gap-1.5 text-zinc-900">
                          <Tag size={16} className="text-rose-500" />
                          <span className="text-lg font-black">{settings.campaign.discountPercent}%</span>
                        </div>
                      </div>

                      {/* Target Block */}
                      <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-3 flex flex-col justify-between">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{t.fields.audience}</span>
                        <div className="flex items-center gap-1.5 text-zinc-900 truncate">
                          <Users size={16} className="text-zinc-400 shrink-0" />
                          <span className="text-sm font-bold truncate">{settings.campaign.targetAudience}</span>
                        </div>
                      </div>

                      {/* Results Block (if any) */}
                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex flex-col justify-between">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">{t.fields.closedClients}</span>
                        <div className="flex items-center gap-1.5 text-zinc-900">
                          <BarChart3 size={16} className="text-emerald-500 shrink-0" />
                          <span className="text-lg font-black text-emerald-700">{settings.campaign.closedClients || 0}</span>
                        </div>
                      </div>

                      {/* Timer Block */}
                      <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-3 flex flex-col justify-between">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
                          {language === 'en' ? 'Ends In' : 'Encerra Em'}
                        </span>
                        <div className="flex items-center gap-1.5 text-zinc-900">
                          <Clock size={16} className="text-zinc-400 shrink-0" />
                          <span className="text-sm font-black tracking-tight">
                            {isActive ? `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m` : '---'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Compact Description */}
                    {settings.campaign.description && (
                      <div className="bg-zinc-50 rounded-lg border border-zinc-100 p-4 text-sm font-medium text-zinc-600 flex gap-3">
                        <Info size={18} className="text-zinc-400 shrink-0 mt-0.5" />
                        <p className="leading-relaxed">{settings.campaign.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-zinc-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-sm">
                <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4 border border-zinc-100">
                  <StopCircle className="text-zinc-300" size={32} />
                </div>
                <h3 className="text-lg font-black text-zinc-800 mb-1 tracking-tight">{t.noActive}</h3>
                <p className="text-zinc-500 text-sm max-w-sm mb-6">
                  {language === 'en' ? 'There is no promotion actively running right now.' : 'Nenhuma promoção rodando no momento.'}
                </p>
                <button
                  onClick={() => {
                    handleClear();
                    setIsEditing(true);
                  }}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-bold transition-colors cursor-pointer"
                >
                  {t.create}
                </button>
              </div>
            )}

            {/* Campaign History Section */}
            {settings?.campaign?.history && settings.campaign.history.length > 0 && (
              <div className="pt-8">
                <div className="flex items-center gap-2 mb-4">
                  <Archive className="text-zinc-400" size={20} />
                  <h3 className="text-lg font-black text-zinc-900">{t.historyTitle}</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {settings.campaign.history.map((hist) => (
                    <div key={hist.id} className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                      {hist.imageUrl ? (
                        <div className="w-16 h-16 rounded-lg bg-zinc-50 border border-zinc-100 overflow-hidden relative shrink-0">
                          <Image src={hist.imageUrl} alt={hist.name} fill className="object-cover" referrerPolicy="no-referrer" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0">
                          <Megaphone className="text-zinc-300" size={24} />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-black text-zinc-900 truncate">{hist.name}</h4>
                        <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 mt-1">
                          <span className="text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">{hist.discountPercent}% OFF</span>
                          <span>&bull;</span>
                          <span className="truncate">{new Date(hist.startDate + 'T12:00:00').toLocaleDateString()} - {new Date(hist.endDate + 'T12:00:00').toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-center justify-center bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 shrink-0">
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{t.fields.closedClients}</span>
                        <span className="text-lg font-black text-emerald-700">{hist.closedClients || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="edit"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-6 md:p-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-zinc-100 gap-4">
              <h2 className="text-lg font-black text-zinc-900">{settings?.campaign?.name ? t.edit : t.create}</h2>
              <div className="flex items-center gap-2">
                {settings?.campaign?.name && (
                  <button onClick={handleEndAndArchive} disabled={isSaving} className="text-xs font-bold bg-zinc-100 text-zinc-700 hover:bg-zinc-200 px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5">
                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Archive size={14} />}
                    {t.archive}
                  </button>
                )}
                <button onClick={handleClear} className="text-xs font-bold text-rose-500 hover:bg-rose-50 px-3 py-1.5 rounded-md transition-colors cursor-pointer">
                  {t.clear}
                </button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              
              {/* Left Column: Image (Compact) */}
              <div className="w-full md:w-1/3 space-y-3">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">{t.uploadCover}</label>
                
                {imageUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50 group aspect-[4/3] flex items-center justify-center p-2">
                    <div className="relative w-full h-full rounded-lg overflow-hidden">
                      <Image src={imageUrl} alt="Cover Preview" fill className="object-contain" referrerPolicy="no-referrer" />
                    </div>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <button 
                        onClick={() => setImageUrl('')}
                        className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <X size={14} /> {t.removeImage}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-zinc-200 hover:border-rose-400 bg-zinc-50 hover:bg-rose-50 rounded-xl aspect-[4/3] flex flex-col items-center justify-center text-center cursor-pointer transition-colors group"
                  >
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUpload} disabled={isUploading} />
                    {isUploading ? (
                      <Loader2 className="animate-spin text-zinc-400 mb-2" size={24} />
                    ) : (
                      <ImageIcon className="text-zinc-300 group-hover:text-rose-400 transition-colors mb-2" size={24} />
                    )}
                    <span className="text-xs font-bold text-zinc-600 group-hover:text-rose-600">
                      {isUploading ? t.uploading : t.uploadCover}
                    </span>
                  </div>
                )}
                {uploadError && <p className="text-xs text-rose-500 font-bold bg-rose-50 p-2 rounded-md">{uploadError}</p>}
              </div>

              {/* Right Column: Form Fields (Compact Grid) */}
              <div className="w-full md:w-2/3 space-y-5">
                
                {/* Row 1 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1.5">{t.fields.name}</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Spring Cleaning Promo"
                      className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-bold text-zinc-900 focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-1.5">{t.fields.closedClients}</label>
                    <div className="relative">
                      <BarChart3 className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" size={14} />
                      <input
                        type="number"
                        min="0"
                        value={closedClients}
                        onChange={(e) => setClosedClients(e.target.value)}
                        placeholder="Ex: 5"
                        className="w-full pl-9 pr-3 py-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-sm font-black text-emerald-800 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1.5">{t.fields.startDate}</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-bold text-zinc-900 focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1.5">{t.fields.endDate}</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-bold text-zinc-900 focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                    />
                  </div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1.5">{t.fields.discount}</label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                      <input
                        type="text"
                        inputMode="numeric"
                        value={discountPercent}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, '');
                          if (val === '') { setDiscountPercent(''); return; }
                          let num = parseInt(val, 10);
                          if (num > 100) num = 100;
                          setDiscountPercent(num);
                        }}
                        className="w-full pl-9 pr-6 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-bold text-zinc-900 focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-bold">%</span>
                    </div>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1.5">{t.fields.audience}</label>
                    <select
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-bold text-zinc-900 focus:bg-white focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 outline-none appearance-none"
                    >
                      <option value="All Clients">Todos os Clientes (Público)</option>
                      <option value="New Clients Only">Apenas Novos Clientes</option>
                      <option value="Recurring Clients">Apenas Clientes Recorrentes</option>
                      <option value="Win-back (Past 6 months)">Retenção (Inativos últimos 6 meses)</option>
                    </select>
                  </div>
                </div>

                {/* Row 4 */}
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1.5">{t.fields.desc}</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-medium text-zinc-900 focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none resize-none"
                  />
                </div>

              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-zinc-100 flex items-center justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-5 py-2 text-zinc-600 hover:bg-zinc-100 rounded-lg text-sm font-bold transition-colors cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-bold shadow-sm active:scale-95 transition-all disabled:opacity-70 cursor-pointer"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {t.save}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
