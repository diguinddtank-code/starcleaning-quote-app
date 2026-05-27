'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'pt';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translateStage: (stage: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    'nav.dashboard': 'Dashboard',
    'nav.leads': 'Leads',
    'nav.quotes': 'Quote History',
    'nav.settings': 'Settings',
    'nav.estimate': 'New Estimate',
    
    // Dashboard
    'db.welcome': 'Welcome back',
    'db.morning': 'Good morning',
    'db.summary': 'Here is your operation summary for today.',
    'db.total_leads': 'Total Leads',
    'db.new_quotes': 'New Quotes',
    'db.revenue_est': 'Estimated Revenue',
    'db.recent_leads': 'Recent Leads',
    'db.active': 'Active',
    'db.inbox': 'in info inbox',
    'db.converted': 'converted',
    'db.generated': 'generated',
    'db.reminders': 'Reminders & Tasks',
    'db.assistant': 'Sales Assistant',
    'db.recent_quotes': 'Recent Quotes',
    'db.access': 'Quick Access',
    'db.funnel': 'Sales Funnel',
    'db.kpis': 'KPIs & Metrics',
    'db.playbook': 'Sales Playbook',
    
    // Leads
    'leads.title': 'Leads Management',
    'leads.new_lead': 'New Lead',
    'leads.search': 'Search leads...',
    'leads.name': 'Name',
    'leads.status': 'Status',
    'leads.date': 'Date',
    'leads.manage_all': 'Manage all your contacts and quotes in one place.',
    'leads.empty': 'No leads found',
    'leads.empty_desc': 'Wait for new leads or adjust your search.',

    // History
    'history.title': 'Quote History',
    'history.subtitle': 'Review and filter all estimates generated for your clients.',
    'history.search': 'Search by customer or details...',
    'history.empty': 'No estimates found.',
    
    // Stages
    'stage.novo': 'New Lead',
    'stage.initial_contact': 'Initial Contact & Qualification',
    'stage.discovery': 'Discovery',
    'stage.solution_design': 'Solution Design',
    'stage.pricing_presentation': 'Pricing & Estimate Presentation',
    'stage.no_response': 'No Response',
    'stage.closing': 'Closing',
    
    // Lead Detail
    'ld.quick_msg': 'Quick Messages',
    'ld.copy_paste': 'Copy & paste to RingCentral/Text Message',
    'ld.contact': '1st Contact',
    'ld.send_quote': 'Send Quote',
    'ld.followup': 'Short Follow-up',
    'ld.copied': 'Message copied to clipboard!',
    
    // Quotes
    'quotes.title': 'Saved Quotes',
    'quotes.customer': 'Customer',
    'quotes.total': 'Total',
    'quotes.service': 'Service',
    
    // Settings
    'settings.title': 'Company Settings',
    'settings.pricing': 'Pricing Rules',
    'settings.base_price': 'Base Price',
    'settings.save': 'Save Settings',
  },
  pt: {
    // Nav
    'nav.dashboard': 'Painel',
    'nav.leads': 'Leads',
    'nav.quotes': 'Histórico',
    'nav.settings': 'Configurações',
    'nav.estimate': 'Novo Orçamento',
    
    // Dashboard
    'db.welcome': 'Bem-vindo de volta',
    'db.morning': 'Bom dia',
    'db.summary': 'Aqui está o resumo da sua operação hoje.',
    'db.total_leads': 'Total de Leads',
    'db.new_quotes': 'Novos Orçamentos',
    'db.revenue_est': 'Receita Estimada',
    'db.recent_leads': 'Leads Recentes',
    'db.active': 'Ativos',
    'db.inbox': 'na caixa de entrada',
    'db.converted': 'convertidos',
    'db.generated': 'gerados',
    'db.reminders': 'Lembretes & Tarefas',
    'db.assistant': 'Assistente de Vendas',
    'db.recent_quotes': 'Orçamentos Recentes',
    'db.access': 'Acesso Rápido',
    'db.funnel': 'Funil de Vendas',
    'db.kpis': 'KPIs e Métricas',
    'db.playbook': 'Sales Playbook',
    
    // Leads
    'leads.title': 'Gestão de Leads',
    'leads.new_lead': 'Novo Lead',
    'leads.search': 'Buscar leads...',
    'leads.name': 'Nome',
    'leads.status': 'Etapa',
    'leads.date': 'Data',
    'leads.manage_all': 'Gerencie todos os seus contatos e orçamentos em um lugar.',
    'leads.empty': 'Nenhum lead encontrado',
    'leads.empty_desc': 'Aguarde novos leads ou ajuste sua busca.',

    // History
    'history.title': 'Histórico de Orçamentos',
    'history.subtitle': 'Revise e filtre todos os orçamentos gerados para seus clientes.',
    'history.search': 'Buscar por cliente ou detalhes...',
    'history.empty': 'Nenhum orçamento encontrado.',
    
    // Stages
    'stage.novo': 'New Lead',
    'stage.initial_contact': 'Initial Contact & Qualification',
    'stage.discovery': 'Discovery',
    'stage.solution_design': 'Solution Design',
    'stage.pricing_presentation': 'Pricing & Estimate Presentation',
    'stage.no_response': 'No Response',
    'stage.closing': 'Closing',
    
    // Lead Detail
    'ld.quick_msg': 'Mensagens Rápidas',
    'ld.copy_paste': 'Copie e cole no RingCentral/Text Message',
    'ld.contact': '1º Contato',
    'ld.send_quote': 'Enviar Orçamento',
    'ld.followup': 'Follow-up Curto',
    'ld.copied': 'Mensagem copiada!',
    
    // Quotes
    'quotes.title': 'Orçamentos Salvos',
    'quotes.customer': 'Cliente',
    'quotes.total': 'Total',
    'quotes.service': 'Serviço',
    
    // Settings
    'settings.title': 'Configurações da Empresa',
    'settings.pricing': 'Regras de Preço',
    'settings.base_price': 'Preço Base',
    'settings.save': 'Salvar Configurações',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  // Load language preference ONLY ONCE on mount using a stable approach or state initializer.
  // Instead of setting state from effect, we initialize state lazyly if possible or silence the rule if really needed.
  useEffect(() => {
    const saved = localStorage.getItem('starCleaningLang') as Language;
    if (saved && saved !== language) {
       // eslint-disable-next-line react-hooks/set-state-in-effect
       setLanguage(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('starCleaningLang', lang);
  };

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  const translateStage = (stage: string) => {
    const s = stage.toLowerCase();
    
    if (s.includes('initial contact') || s.includes('qualification') || s.includes('initial') || s.includes('contato') || s.includes('contact')) return t('stage.initial_contact');
    if (s.includes('discovery')) return t('stage.discovery');
    if (s.includes('solution') || s.includes('design')) return t('stage.solution_design');
    if (s.includes('pricing') || s.includes('presentation') || s.includes('estimate') || s.includes('quote') || s.includes('cotado')) return t('stage.pricing_presentation');
    if (s.includes('não responde') || s.includes('nao responde') || s.includes('no response') || s.includes('no_response')) return t('stage.no_response');
    if (s.includes('closing') || s.includes('closed') || s.includes('agendado') || s.includes('scheduled') || s.includes('deposit') || s.includes('depósito') || s.includes('deposito')) return t('stage.closing');
    
    // Legacy mapping fallback
    if (s.includes('negociando') || s.includes('negotiating')) return t('stage.discovery');
    
    return t('stage.novo');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t, translateStage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
