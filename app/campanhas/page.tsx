'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { useLanguage } from '@/context/LanguageContext';
import { Megaphone, Calendar, Tag, Info, Save, Loader2, StopCircle, ArrowLeft, Upload, X, ImageIcon } from 'lucide-react';
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
  const [discountPercent, setDiscountPercent] = useState(0);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync from context on load
  useEffect(() => {
    if (settings?.campaign) {
      setName(settings.campaign.name || '');
      setStartDate(settings.campaign.startDate || '');
      setEndDate(settings.campaign.endDate || '');
      setDiscountPercent(settings.campaign.discountPercent || 0);
      setDescription(settings.campaign.description || '');
      setImageUrl(settings.campaign.imageUrl || '');
    }
  }, [settings?.campaign]);

  const isActive = useMemo(() => {
    if (!settings?.campaign?.name) return false;
    if (!settings.campaign.startDate || !settings.campaign.endDate) return false;
    
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    return todayStr >= settings.campaign.startDate && todayStr <= settings.campaign.endDate;
  }, [settings?.campaign]);

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
      setUploadError(error.message || 'Failed to upload image. Please check bucket permissions.');
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
        discountPercent,
        description,
        imageUrl
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

  const handleCancel = () => {
    if (settings?.campaign) {
      setName(settings.campaign.name || '');
      setStartDate(settings.campaign.startDate || '');
      setEndDate(settings.campaign.endDate || '');
      setDiscountPercent(settings.campaign.discountPercent || 0);
      setDescription(settings.campaign.description || '');
      setImageUrl(settings.campaign.imageUrl || '');
    }
    setIsEditing(false);
    setUploadError('');
  };

  const handleClear = () => {
    setName('');
    setStartDate('');
    setEndDate('');
    setDiscountPercent(0);
    setDescription('');
    setImageUrl('');
    setUploadError('');
  };

  const t = {
    title: language === 'en' ? 'Marketing Campaigns' : 'Campanhas de Marketing',
    subtitle: language === 'en' ? 'Manage your active promotions and discounts.' : 'Gerencie promoções e descontos ativos.',
    activeCampaign: language === 'en' ? 'Active Campaign' : 'Campanha Ativa',
    noActive: language === 'en' ? 'No campaign currently active' : 'Nenhuma campanha rodando agora',
    noActiveDesc: language === 'en' ? 'There are no active promotions for today.' : 'Não há promoções ativas para o dia de hoje.',
    edit: language === 'en' ? 'Edit Campaign' : 'Editar Campanha',
    save: language === 'en' ? 'Save Changes' : 'Salvar Alterações',
    cancel: language === 'en' ? 'Cancel' : 'Cancelar',
    clear: language === 'en' ? 'Clear Form' : 'Limpar Formulário',
    back: language === 'en' ? 'Back to Dashboard' : 'Voltar ao Dashboard',
    uploadCover: language === 'en' ? 'Upload Cover Image' : 'Enviar Imagem de Capa',
    uploading: language === 'en' ? 'Uploading...' : 'Enviando...',
    removeImage: language === 'en' ? 'Remove Image' : 'Remover Imagem',
    fields: {
      name: language === 'en' ? 'Campaign Name' : 'Nome da Campanha',
      namePlaceholder: language === 'en' ? 'e.g., Black Friday' : 'Ex: Black Friday',
      startDate: language === 'en' ? 'Start Date' : 'Data de Início',
      endDate: language === 'en' ? 'End Date' : 'Data de Término',
      discount: language === 'en' ? 'Discount (%)' : 'Desconto (%)',
      desc: language === 'en' ? 'Description (Optional)' : 'Descrição (Opcional)',
      descPlaceholder: language === 'en' ? 'e.g., Use coupon BLACK30' : 'Ex: Cupom especial para mães',
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 pb-24 space-y-6">
      <header className="mb-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/" className="text-zinc-400 hover:text-zinc-600 transition-colors">
                <ArrowLeft size={20} />
              </Link>
              <h1 className="text-2xl md:text-3xl font-black text-zinc-950 tracking-tight leading-none flex items-center gap-3">
                <Megaphone className="text-rose-500" size={28} />
                {t.title}
              </h1>
            </div>
            <p className="text-sm text-zinc-500 font-medium ml-8">{t.subtitle}</p>
          </div>
          
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              {t.edit}
            </button>
          )}
        </div>
      </header>

      <AnimatePresence mode="wait">
        {!isEditing ? (
          <motion.div
            key="view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full"
          >
            {isActive && settings?.campaign ? (
              <div className="bg-white border border-zinc-200 rounded-[32px] p-2 shadow-sm overflow-hidden group">
                <div className="relative rounded-[24px] overflow-hidden bg-zinc-50 border border-zinc-100 min-h-[400px] flex flex-col md:flex-row">
                  {/* Image Area */}
                  {settings.campaign.imageUrl && (
                    <div className="w-full md:w-1/2 relative min-h-[250px] md:min-h-full">
                      <Image 
                        src={settings.campaign.imageUrl} 
                        alt={settings.campaign.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-zinc-900/80 via-zinc-900/20 to-transparent"></div>
                    </div>
                  )}

                  {/* Content Area */}
                  <div className={`p-8 md:p-12 flex flex-col justify-center flex-1 relative z-10 ${settings.campaign.imageUrl ? 'md:w-1/2 text-white md:bg-transparent bg-zinc-900/90 backdrop-blur-xl' : 'bg-gradient-to-br from-rose-500 to-orange-500 text-white'}`}>
                    <div className="flex items-center gap-2 mb-8">
                      <span className="flex h-3 w-3 relative">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${settings.campaign.imageUrl ? 'bg-rose-400' : 'bg-white'}`}></span>
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${settings.campaign.imageUrl ? 'bg-rose-500' : 'bg-white'}`}></span>
                      </span>
                      <span className={`text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${settings.campaign.imageUrl ? 'text-rose-400 border-rose-400/30 bg-rose-500/10' : 'text-white border-white/30 bg-white/10'}`}>
                        {t.activeCampaign}
                      </span>
                    </div>

                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none mb-6">
                      {settings.campaign.name}
                    </h2>
                    
                    <div className="flex flex-wrap items-center gap-4 mb-8">
                      <div className={`inline-flex items-center gap-2 border px-4 py-3 rounded-xl backdrop-blur-sm ${settings.campaign.imageUrl ? 'bg-white/10 border-white/20' : 'bg-black/10 border-black/10'}`}>
                        <Tag className="text-white" size={20} />
                        <span className="text-xl font-bold">{settings.campaign.discountPercent}% OFF</span>
                      </div>
                      
                      <div className={`inline-flex items-center gap-2 border px-4 py-3 rounded-xl backdrop-blur-sm ${settings.campaign.imageUrl ? 'bg-white/10 border-white/20' : 'bg-black/10 border-black/10'}`}>
                        <Calendar className="text-white/80" size={20} />
                        <span className="text-sm font-bold text-white/90">
                          {new Date(settings.campaign.startDate + 'T12:00:00').toLocaleDateString()} &mdash; {new Date(settings.campaign.endDate + 'T12:00:00').toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {settings.campaign.description && (
                      <div className={`pt-6 border-t flex items-start gap-3 ${settings.campaign.imageUrl ? 'border-white/10' : 'border-white/20'}`}>
                        <Info className="shrink-0 mt-1 opacity-60" size={20} />
                        <p className="leading-relaxed font-medium text-lg opacity-90">
                          {settings.campaign.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-zinc-200 rounded-3xl p-10 sm:p-16 flex flex-col items-center justify-center text-center shadow-sm">
                <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-6 border border-zinc-100">
                  <StopCircle className="text-zinc-300" size={40} />
                </div>
                <h3 className="text-xl font-bold text-zinc-800 mb-2">{t.noActive}</h3>
                <p className="text-zinc-500 max-w-sm mx-auto">{t.noActiveDesc}</p>
                {(!settings?.campaign?.name) && (
                   <p className="text-zinc-400 text-sm mt-6 italic">{language === 'en' ? 'Click "Edit Campaign" to set one up.' : 'Clique em "Editar Campanha" para configurar.'}</p>
                )}
                {settings?.campaign?.name && (
                   <div className="mt-8 p-4 bg-zinc-50 rounded-xl border border-zinc-200 flex items-center gap-4 text-left max-w-md w-full">
                     {settings.campaign.imageUrl && (
                       <div className="w-16 h-16 rounded-lg overflow-hidden relative shrink-0">
                         <Image src={settings.campaign.imageUrl} alt="" fill className="object-cover" referrerPolicy="no-referrer" />
                       </div>
                     )}
                     <div>
                       <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">{language === 'en' ? 'Saved (Inactive)' : 'Salva (Inativa)'}</p>
                       <p className="text-sm font-bold text-zinc-800">{settings.campaign.name} <span className="text-zinc-500 font-medium">({settings.campaign.discountPercent}%)</span></p>
                       <p className="text-xs text-zinc-500 mt-1">{new Date(settings.campaign.startDate + 'T12:00:00').toLocaleDateString()} &mdash; {new Date(settings.campaign.endDate + 'T12:00:00').toLocaleDateString()}</p>
                     </div>
                   </div>
                )}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="edit"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white border border-zinc-200 rounded-3xl shadow-lg p-6 sm:p-8"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-zinc-900">{t.edit}</h2>
              <button onClick={handleClear} className="text-xs font-bold uppercase tracking-wider text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
                {t.clear}
              </button>
            </div>

            <div className="space-y-6">
              
              {/* Image Upload Area */}
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-2">{t.uploadCover}</label>
                
                {imageUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-50 group">
                    <div className="relative h-48 w-full">
                      <Image src={imageUrl} alt="Cover Preview" fill className="object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={() => setImageUrl('')}
                        className="bg-white/10 hover:bg-rose-500 text-white backdrop-blur-md px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <X size={16} />
                        {t.removeImage}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-zinc-200 hover:border-rose-400 bg-zinc-50 hover:bg-rose-50 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group"
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleUpload}
                      disabled={isUploading}
                    />
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 text-zinc-400 group-hover:text-rose-500 transition-colors">
                      {isUploading ? <Loader2 className="animate-spin" size={24} /> : <ImageIcon size={24} />}
                    </div>
                    <p className="text-sm font-bold text-zinc-800 mb-1">
                      {isUploading ? t.uploading : (language === 'en' ? 'Click to upload image' : 'Clique para fazer upload da imagem')}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {language === 'en' ? 'JPG, PNG up to 5MB' : 'JPG, PNG até 5MB'}
                    </p>
                  </div>
                )}
                {uploadError && <p className="text-xs text-rose-500 mt-2 font-medium">{uploadError}</p>}
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-2">{t.fields.name}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.fields.namePlaceholder}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-2">{t.fields.startDate}</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-2">{t.fields.endDate}</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-2">{t.fields.discount}</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discountPercent || ''}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-2">{t.fields.desc}</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t.fields.descPlaceholder}
                  rows={3}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all outline-none resize-none"
                />
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-100 flex items-center justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-5 py-2.5 text-zinc-600 hover:bg-zinc-100 rounded-xl text-sm font-bold transition-colors cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold shadow-md shadow-rose-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-70"
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
