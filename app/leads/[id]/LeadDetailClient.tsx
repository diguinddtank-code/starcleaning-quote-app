'use client';

import { useLead } from '@/context/LeadContext';
import { useQuote } from '@/context/QuoteContext';
import { useSettings } from '@/context/SettingsContext';
import { useLanguage } from '@/context/LanguageContext';
import { notFound, useRouter } from 'next/navigation';
import { 
  User, Mail, Phone, MapPin, Calendar, Edit3, MessageCircle, FileText, 
  ArrowLeft, Loader2, Save, X, DollarSign, Printer, ChevronRight, Send, 
  CheckCircle2, Sparkles, AlertTriangle, Shield, Check, Copy, Flame, Users, Heart 
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Lead, SavedQuote } from '@/lib/types';
import { motion, AnimatePresence } from 'motion/react';
import { QuoteDocument } from '@/components/QuoteDocument';
import { generateQuoteEmailHtml } from '@/lib/emailTemplate';

export function LeadDetailClient({ id }: { id: string }) {
  const { leads, updateLead } = useLead();
  const { savedQuotes } = useQuote();
  const { settings } = useSettings();
  const { language, translateStage } = useLanguage();
  const router = useRouter();
  
  const lead = leads.find(l => l.id === id);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Lead>>({});
  const [isSaving, setIsSaving] = useState(false);

  const [selectedQuote, setSelectedQuote] = useState<SavedQuote | null>(null);
  const [activePlaybookTab, setActivePlaybookTab] = useState<'scarcity' | 'social' | 'desire' | 'conversational'>('scarcity');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const [sendingQuoteId, setSendingQuoteId] = useState<string | null>(null);
  const [sentQuoteId, setSentQuoteId] = useState<string | null>(null);

  // Consultative Sales Live Script States
  const [salesTab, setSalesTab] = useState<'script' | 'triggers'>('script');
  const [currentScriptStep, setCurrentScriptStep] = useState(1);
  const [selectedObjection, setSelectedObjection] = useState<string | null>(null);
  const [loggedPains, setLoggedPains] = useState<string[]>([]);
  const [loggedGoals, setLoggedGoals] = useState<string[]>([]);

  // Initialize form state once lead is available
  useEffect(() => {
    if (lead) {
      setEditForm(lead);
      
      // Parse logged pains and goals from observations if already saved
      const obs = lead.OBSERVACOES || '';
      if (obs.includes('=== INTELIGÊNCIA COMERCIAL DE VENDAS ===')) {
        const parts = obs.split('=== INTELIGÊNCIA COMERCIAL DE VENDAS ===');
        if (parts.length > 1) {
          const intelligenceBlock = parts[1];
          // Extrapolate pains
          const painMatch = intelligenceBlock.match(/• Dores identificadas:\s*(.*)/);
          if (painMatch && painMatch[1]) {
            const parsedPains = painMatch[1].split(',').map(s => s.trim()).filter(Boolean);
            setLoggedPains(parsedPains);
          } else {
            setLoggedPains([]);
          }
          // Extrapolate goals
          const goalMatch = intelligenceBlock.match(/• Desejos do cliente:\s*(.*)/);
          if (goalMatch && goalMatch[1]) {
            const parsedGoals = goalMatch[1].split(',').map(s => s.trim()).filter(Boolean);
            setLoggedGoals(parsedGoals);
          } else {
            setLoggedGoals([]);
          }
        }
      } else {
        setLoggedPains([]);
        setLoggedGoals([]);
      }
    }
  }, [lead, language]);

  // Save to recent leads logs for easy dashboard traversal
  useEffect(() => {
    if (lead && lead.id) {
      try {
        const stored = localStorage.getItem('commercial_recent_leads');
        let currentRecents: string[] = stored ? JSON.parse(stored) : [];
        if (!Array.isArray(currentRecents)) {
          currentRecents = [];
        }
        const filtered = currentRecents.filter(leadId => leadId !== lead.id);
        const updated = [lead.id, ...filtered].slice(0, 8);
        localStorage.setItem('commercial_recent_leads', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to update recent leads logs', err);
      }
    }
  }, [lead]);

  if (!leads.length) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50 text-zinc-500">
        <div className="text-center space-y-3">
          <Loader2 className="animate-spin w-10 h-10 text-sky-500 mx-auto" />
          <p className="text-sm font-semibold tracking-wide">Iniciando Painel CRM Star...</p>
        </div>
      </div>
    );
  }

  if (!lead) {
    return notFound();
  }

  const leadQuotes = savedQuotes.filter(q => q.leadId === id);

  const leadInitials = lead.Nome
    ? lead.Nome.split(' ')
        .filter(Boolean)
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'LD';

  // Copy-writing and consumer psychology playbooks
  const getPlaybookMessages = () => {
    const firstName = lead.Nome?.split(' ')[0] || '';
    const city = lead.Cidade || 'sua região';
    const q = leadQuotes[0];
    let moneyVal = 'um valor personalizado';
    if (q && q.total) {
      moneyVal = `$${q.total}`;
    } else if (lead.Inicial) {
      if (String(lead.Inicial).toLowerCase().includes('sem preço') || String(lead.Inicial).toLowerCase().includes('sem preco')) {
        moneyVal = 'um valor personalizado';
      } else {
        moneyVal = String(lead.Inicial).startsWith('$') ? String(lead.Inicial) : `$${lead.Inicial}`;
      }
    }
    const freqName = lead.Frequencia === 'weekly' ? 'semanal' : lead.Frequencia === 'bi-weekly' ? 'quinzenal' : lead.Frequencia === 'monthly' ? 'mensal' : 'única';
    const serviceName = lead.Service === 'deep' ? 'Limpeza Pesada (Deep Clean)' : lead.Service === 'move' ? 'Limpeza de Mudança (Move-In/Out)' : 'Limpeza Residencial';

    if (language === 'en') {
      return {
        scarcity: {
          title: '🔥 Scarcity Trigger',
          description: 'Uses immediate scheduling scarcity and localized urgency to close bookings fast.',
          body: `Hi ${firstName}, here is the Director of Star Cleaning! I was reviewing your quote request for your ${lead.Quartos || '2'}-bed house in ${city}.\n\nWe only have 2 premium cleaning slots left for this upcoming Friday in your neighborhood. Because we want to deliver perfection, we limit our daily bookings. Would you like me to lock-in the professional estimate of ${moneyVal} for you before these slots are taken?`,
          badge: 'High Conversion'
        },
        social: {
          title: '⚡ Social Proof Trigger',
          description: 'Leverages trust, validation, and satisfaction guarantees to overcome pricing friction.',
          body: `Hi ${firstName}! Did you know Star Cleaning already handles over 150 luxury and family homes in your exact area in ${city}?\n\nOur client satisfaction is currently rated 4.9/5 stars. We prepared a professional estimate of ${moneyVal} for your ${freqName} service. Our elite cleaning teams are fully insured, background-checked, and backed by our 24h Satisfaction Guarantee. Shall we get your home scheduled and join the community of immaculate properties?`,
          badge: 'Authority Boost'
        },
        desire: {
          title: '💎 Premium Comfort & Desire',
          description: 'Focuses on the luxury of returning to a spotless home, saving precious weekend hours.',
          body: `Hi ${firstName}, imagine coming home to the incredible aroma of organic fresh oils, perfectly sanitized spaces, and daily fresh-bed linens—without moving a single finger.\n\nAt Star Cleaning, we believe your time is worth millions. Let our master housekeepers handle the dirt for just ${moneyVal} on your ${serviceName}. You deserve to relax. Let's schedule your elite experience?`,
          badge: 'Emotional Connection'
        },
        conversational: {
          title: '💬 Elegant Follow-up',
          description: 'A polite, low-friction conversational anchor to reignite cold or pending prospects.',
          body: `Hi ${firstName}, hope you are having an amazing week! Just checking in regarding the professional cleaning estimate we prepared for you.\n\nDo you have any questions about the ${serviceName} checklist or our customized ${freqName} discount pricing? Let me know how I can best assist you!`,
          badge: 'Low Friction'
        }
      };
    } else {
      return {
        scarcity: {
          title: '🔥 Gatilho de Escassez',
          description: 'Utiliza escassez imediata de agenda e senso de exclusividade regional para fechar rápido.',
          body: `Olá ${firstName}, aqui é a Coordenação da Star Cleaning! Estava revisando seu pedido de orçamento para sua residência com ${lead.Quartos || '2'} quartos em ${city}.\n\nTemos apenas *2 vagas premium de atendimento* restantes para esta sexta-feira na sua região. Como prezamos pela perfeição absoluta, limitamos os agendamentos diários das nossas equipes de elite. Gostaria que eu garantisse sua reserva na cotação especial de ${moneyVal} antes que as vagas esgotem?`,
          badge: 'Alta Conversão'
        },
        social: {
          title: '⚡ Prova Social & Autoridade',
          description: 'Usa validação social de vizinho, garantias de segurança e satisfação do consumidor.',
          body: `Oi ${firstName}! Tudo bem? Sabia que a Star Cleaning já cuida com excelência de mais de 150 lares e residências premium exatamente na sua região em ${city}?\n\nNossa nota de satisfação oficial é de 4.9/5 estrelas. Preparamos uma proposta personalizada de apenas ${moneyVal} para seu atendimento ${freqName}. Nossos profissionais têm seguro completo de responsabilidade civil e passam por rígidas checagens de antecedentes. Vamos garantir esse cuidado exclusivo para a sua casa?`,
          badge: 'Gera Confiança'
        },
        desire: {
          title: '💎 Puro Desejo & Liberdade',
          description: 'Foca no prazer de retornar a uma casa impecavelmente limpa, recuperando tempo de vida.',
          body: `Olá ${firstName}, imagine abrir a porta da sua casa e ser envolvido por um aroma de frescor requintado, tapetes e estofados meticulosamente aspirados e camas montadas em padrão de hotelaria—sem que você precise mover um único dedo.\n\nO seu tempo livre vale ouro. Deixe que nossos especialistas em higienização resolvam toda a rotina por apenas ${moneyVal} no serviço de ${serviceName}. Você merece essa paz de espírito. Vamos reservar essa experiência de hotel no seu lar?`,
          badge: 'Foco no Luxo'
        },
        conversational: {
          title: '💬 Contato Casual Elegante',
          description: 'Contatos polidos e de baixo atrito para reacender o interesse de leads frios ou indecisos.',
          body: `Oi ${firstName}, espero que esteja tendo uma semana maravilhosa! Só passando para confirmar se você conseguiu analisar a nossa cotação especial para o seu lar.\n\nFicou alguma dúvida sobre o checklist premium de ${serviceName} ou sobre o nosso desconto exclusivo para a frequência ${freqName}? Estou à disposição para facilitar tudo para você!`,
          badge: 'Super Amigável'
        }
      };
    }
  };

  const playbooks = getPlaybookMessages();

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText('Copiado!');
    setTimeout(() => setCopiedText(null), 2500);
  };

  const handleDownloadSelectedQuoteHtml = () => {
    if (!selectedQuote) return;
    const estimateUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/estimate/view?id=${selectedQuote.id}` 
        : `/estimate/view?id=${selectedQuote.id}`;

    const htmlContent = generateQuoteEmailHtml(selectedQuote, settings, estimateUrl);
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Estimate_${(selectedQuote.customerName || 'Client').replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSendWebhook = async (q: SavedQuote) => {
    setSendingQuoteId(q.id);
    try {
      const WEBHOOK_URL = 'https://webhook.infra-remakingautomacoes.cloud/webhook/estimatesc';
      const estimateUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/estimate/view?id=${q.id}` 
        : '';
      
      const htmlContent = generateQuoteEmailHtml(q, settings, estimateUrl);
      
      const payload = {
        event: 'estimate_sent',
        leadId: lead?.id,
        customerName: lead?.Nome,
        customerEmail: lead?.Email,
        customerPhone: lead?.Telefone,
        total: q.total,
        frequency: q.frequency,
        serviceType: q.serviceType,
        sqFt: q.sqFt,
        beds: q.beds,
        baths: q.baths,
        extras: q.selectedExtras || [],
        estimateUrl: estimateUrl,
        htmlContent: htmlContent
      };

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Server returned ' + response.status);
      }

      setSentQuoteId(q.id);
      setTimeout(() => setSentQuoteId(null), 4000);
    } catch (error) {
      console.error('Failed to send webhook:', error);
      alert('Falha ao enviar estimate via webhook. Verifique sua conexão.');
    } finally {
      setSendingQuoteId(null);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    await updateLead(lead.id, editForm);
    setIsSaving(false);
    setIsEditing(false);
  };

  const updateStatus = async (newStatus: string) => {
    await updateLead(lead.id, { ETAPA: newStatus });
  };

  const getStatusBadgeStyles = (status?: string) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('hot leads') || s.includes('hot') || s.includes('solution design')) return 'bg-rose-500 text-white font-bold border-rose-600 shadow-sm animate-pulse';
    if (s.includes('agendado') || s.includes('closing')) return 'bg-purple-100/50 text-purple-700 border-purple-200';
    if (s.includes('novo') || s.includes('new lead')) return 'bg-emerald-500 text-white border-emerald-600 shadow-sm';
    if (s.includes('interesse') || s.includes('not interest') || s.includes('perdido')) return 'bg-zinc-100 text-zinc-600 border-zinc-200';
    if (s.includes('contato') || s.includes('contact') || s.includes('initial')) return 'bg-sky-50 text-sky-700 border-sky-200';
    if (s.includes('descoberta') || s.includes('discovery') || s.includes('nego') || s.includes('stand')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (s.includes('pricing') || s.includes('presentation') || s.includes('estimate') || s.includes('quote')) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (s.includes('responde') || s.includes('no response')) return 'bg-zinc-800 text-zinc-100 border-zinc-900';
    return 'bg-zinc-100 text-zinc-650 border-zinc-200';
  };

  const cleanPhone = lead.Telefone ? lead.Telefone.replace(/\D/g, '') : '';
  const activePlaybookText = playbooks[activePlaybookTab].body;

  // Dynamic script variables
  const firstName = lead.Nome?.split(' ')[0] || '';
  const city = lead.Cidade || (language === 'en' ? 'your area' : 'sua região');
  const q = leadQuotes[0];
  let moneyVal = (language === 'en' ? 'a professional estimate' : 'um valor personalizado');
  if (q && q.total) {
    moneyVal = `$${q.total}`;
  } else if (lead.Inicial) {
    if (String(lead.Inicial).toLowerCase().includes('sem preço') || String(lead.Inicial).toLowerCase().includes('sem preco')) {
      moneyVal = (language === 'en' ? 'a professional estimate' : 'um valor personalizado');
    } else {
      moneyVal = String(lead.Inicial).startsWith('$') ? String(lead.Inicial) : `$${lead.Inicial}`;
    }
  }
  const freqName = lead.Frequencia === 'weekly' ? (language === 'en' ? 'weekly' : 'semanal') : lead.Frequencia === 'bi-weekly' ? (language === 'en' ? 'bi-weekly' : 'quinzenal') : lead.Frequencia === 'monthly' ? (language === 'en' ? 'monthly' : 'mensal') : (language === 'en' ? 'one-time' : 'única');
  const serviceNameName = lead.Service === 'deep' ? (language === 'en' ? 'Deep Cleaning (Deep Clean)' : 'Limpeza Pesada (Deep Clean)') : lead.Service === 'move' ? (language === 'en' ? 'Move-In/Out Cleaning' : 'Limpeza de Mudança (Move-In/Out)') : (language === 'en' ? 'Premium Residential Cleaning' : 'Limpeza Residencial');

  // Interactive Persuasion scripts data
  const scriptStepsData = [
    {
      step: 1,
      title: language === 'en' ? '1. Connected Rapport' : '1. Introdução de Sintonia',
      badge: language === 'en' ? 'Rapport & Control' : 'Rapport & Controle',
      hint: language === 'en' ? 'Always ask permission first. This transfers the sense of control, lowering their guard.' : 'Sempre peça permissão primeiro. Isso devolve o senso de controle ao cliente e baixa sua guarda.',
      speech: language === 'en' 
        ? `“Hi ${firstName}, thank you so much for taking the time to speak with me today and for considering Star Cleaning. I’d love to learn a little more about your home, your routine, and what you’re looking for so we can see what would be the best fit for you. Is that okay?”`
        : `“Olá, ${firstName}! Muito obrigado por dedicar seu tempo para falar comigo hoje e por considerar a Star Cleaning. Eu gostaria de entender um pouquinho mais sobre a sua casa, sua rotina e o que você realmente busca de melhorias, para que possamos ver qual o plano ideal para você. Tudo bem?”`,
      checkboxes: []
    },
    {
      step: 2,
      title: language === 'en' ? '2. Discovery Questions (Build Emotion)' : '2. Perguntas de Descoberta',
      badge: language === 'en' ? 'Friction Locator' : 'Foco: Localizar Dores',
      hint: language === 'en' ? 'PAUSE. Let them talk. Active listening is your ultimate sales weapon.' : 'FAÇA SILÊNCIO E ESCUTE. Deixe o cliente falar e desabafar. Ouvir ativamente é o seu maior superpoder comercial.',
      speech: language === 'en'
        ? `“Tell me, ${firstName} — what made you start looking for cleaning help right now? Are you mostly looking for help because of time, stress, work schedule, kids, pets… or a combination of things? What’s the hardest part about keeping up with the house right now?”`
        : `“Me conta, ${firstName} — o que te motivou a começar a buscar ajuda com limpeza exatamente agora? Você busca suporte principalmente devido ao tempo, estresse, rotina de trabalho, crianças, pets... ou um pouquinho de cada? E qual tem sido a parte mais difícil de dar conta da casa atualmente?”`,
      checkboxes: [
        { id: '🕒 Falta de tempo', label: language === 'en' ? '🕒 Lack of Time / High Overload' : '🕒 Falta de tempo / Sobrecarga' },
        { id: '😩 Cansaço físico / Estresse', label: language === 'en' ? '😩 Burnout / Physical Exhaustion' : '😩 Cansaço físico / Estresse' },
        { id: '👶 Rotina com crianças', label: language === 'en' ? '👶 Demanding Kids / Family Routine' : '👶 Rotina puxada com crianças' },
        { id: '🐾 Pelos e sujeiras de Pets', label: language === 'en' ? '🐾 Pet Hair & Daily Dirt' : '🐾 Pelos de Pet e poeira residual' },
        { id: '📦 Mudança Residencial', label: language === 'en' ? '📦 Move-In/Out Reset Needed' : '📦 Mudança Residencial' },
        { id: '🧹 Acúmulo de poeira profunda', label: language === 'en' ? '🧹 General Grime Accumulation' : '🧹 Acúmulo de poeira / Rejuntes' }
      ]
    },
    {
      step: 3,
      title: language === 'en' ? '3. Awakening Questions (The Magic)' : '3. Perguntas de Despertar',
      badge: language === 'en' ? 'Awakening Desire' : 'Foco: Despertar Desejo',
      hint: language === 'en' ? 'PAUSE. Make them visualize the feeling of relief. Sell the relief, not the bucket & cloth.' : 'PAUSA. Faça o cliente visualizar o sentimento de alívio completo. Venda paz de espírito, não rodo e pano.',
      speech: language === 'en'
        ? `“If cleaning and keeping up with the house wasn’t constantly hanging over your head anymore… what would that change for you, ${firstName}? What would you do with that extra time or mental energy?”`
        : `“Se hoje a limpeza e a manutenção da casa não fossem mais uma preocupação constante pendente na sua cabeça... o que isso de fato mudaria na sua vida, ${firstName}? O que você faria com esse tempo extra ou com essa energia mental e tranquilidade recuperada?”`,
      checkboxes: [
        { id: '🌸 Finais de semana livres', label: language === 'en' ? '🌸 Free weekends with family' : '🌸 Curtir finais de semana livres' },
        { id: '🍷 Receber visitas com orgulho', label: language === 'en' ? '🍷 Pride hosting guest events' : '🍷 Receber visitas com orgulho' },
        { id: '💆 Relaxar no retorno do trabalho', label: language === 'en' ? '💆 Returning to a peaceful home' : '💆 Retornar do trabalho e relaxar' },
        { id: '✨ Sem sobrecarga mental', label: language === 'en' ? '✨ Eliminating mental load' : '✨ Eliminar sobrecarga mental' }
      ]
    },
    {
      step: 4,
      title: language === 'en' ? '4. Emotional Connection' : '4. Conexão Emocional',
      badge: language === 'en' ? 'Rapport Alignment' : 'Foco: Rapport Absoluto',
      hint: language === 'en' ? 'Validate their emotion completely and mirror their descriptive phrases.' : 'Valide totalmente o desabafo e as emoções do cliente. Espelhe suas próprias expressões.',
      speech: language === 'en'
        ? `“How do you want your home to feel on a normal day?... So really what you’re looking for is a home that feels more peaceful and manageable without you carrying all the pressure yourself. I completely understand that.”`
        : `“Como você gostaria que a sua casa parecesse e fizesse você se sentir em um dia normal?... Então, realmente o que você está buscando é um lar que passe muito mais paz de espírito e seja prático, sem que você precise carregar toda essa cobrança e cansaço sozinha. Eu entendo perfeitamente.”`,
      checkboxes: []
    },
    {
      step: 5,
      title: language === 'en' ? '5. Position Star Cleaning as the Solution' : '5. Posicionamento de Elite',
      badge: language === 'en' ? 'Brand Authority' : 'Foco: Autoridade de Marca',
      hint: language === 'en' ? 'Leverage our brand validation, history (18 years experience) and background checks.' : 'Mencione nossa marca consolidada, histórico incomparável (18 anos) e profissional dedicada.',
      speech: language === 'en'
        ? `“That’s exactly what we help families with every day in ${city}. We’ve been serving homes in the area for over 18 years, and our focus is creating consistency and peace of mind for our clients — not just cleaning surfaces. We also assign one dedicated cleaner per home whenever possible, which creates better consistency, accountability, and attention to detail.”`
        : `“Garantir essa harmonia é exatamente o que ajudamos as famílias a conquistar todos os dias em ${city}. Estamos atendendo lares na região há mais de 18 anos, e nosso foco principal é gerar consistência e bem-estar absoluto para nossos clientes — não apenas limpar superfícies. Também escalamos sempre a mesma profissional dedicada para o seu lar sempre que possível, garantindo segurança, intimidade técnica e constância incrível.”`,
      checkboxes: []
    },
    {
      step: 6,
      title: language === 'en' ? '6. Transition Into Practical Questions' : '6. Transição de Estrutura Prática',
      badge: language === 'en' ? 'Fact Finding' : 'Foco: Estrutura Técnica',
      hint: language === 'en' ? 'Confirm or refine the room layouts with high efficiency.' : 'Confirme ou ajuste a estrutura do imóvel de maneira fluida.',
      speech: language === 'en'
        ? `“Let me ask you a couple quick questions about the home so I can give you the most accurate recommendation. I see we have ${lead.Quartos || '2'} bedrooms and ${lead.Banheiros || '2'} bathrooms, scheduled on a ${freqName} frequency. Does that sound perfect?”`
        : `“Deixe-me fazer algumas perguntas rápidas sobre o seu lar para que eu possa passar a melhor recomendação econômica personalizada. Aqui consta que sua residência possui ${lead.Quartos || '2'} quartos e ${lead.Banheiros || '2'} banheiros na frequência ${freqName}. Está certinho?”`,
      checkboxes: []
    },
    {
      step: 7,
      title: language === 'en' ? '7. Present the Service (Confidently)' : '7. Apresentar o Reset de Serviço',
      badge: language === 'en' ? 'The Deep Reset' : 'Foco: Vender o Reset',
      hint: language === 'en' ? 'Always push initial Deep Clean first. Explain it as a detailed, comprehensive reset of the property.' : 'Sempre posicione a primeira faxina como uma Limpeza Pesada detalhada para remover toda sujeira acumulada.',
      speech: language === 'en'
        ? `“Based on what you shared with me, I’d strongly recommend starting with our Initial Deep Cleaning. This allows us to fully reset the home and get everything to a maintenance-ready condition so future visits are easier, faster, and more consistent.”`
        : `“Com grande certeza, com base no que você compartilhou comigo, eu recomendo fortemente iniciarmos com a nossa Limpeza Pesada de Reset Inicial (Deep Clean). Ela funciona literalmente como um 'Reset Geral' detalhado no imóvel para remover poeiras profundas, rejuntes, gorduras de cozinha e rodapés, deixando-o perfeitamente limpo e preparando sua casa para visitas futuras serem muito mais fáceis, rápidas e baratas.”`,
      checkboxes: []
    },
    {
      step: 8,
      title: language === 'en' ? '8. Pricing Confidence' : '8. Confiança no Preço',
      badge: language === 'en' ? 'Leadership Closing' : 'Foco: Ancoragem Superior',
      hint: language === 'en' ? 'CRITICAL: Say the investment number clearly, and DO NOT speak. First to speak loses negotiation control.' : 'MUITO IMPORTANTE: Diga o valor de investimento de forma firme e FAÇA UMA PAUSA ABSOLUTA. Quem falar primeiro entrega o controle comercial.',
      speech: language === 'en'
        ? `“For a home of your size, this elite personalized deep Reset Clean with our 24h Satisfaction Guarantee represents an investment of approximately ${moneyVal}.”`
        : `“Para realizarmos esse Reset Premium completo com nosso time de especialistas, mais nossa garantia total de satisfação de 24 horas, o seu orçamento personalizado de investimento será de aproximadamente **${moneyVal}**.”`,
      checkboxes: []
    },
    {
      step: 9,
      title: language === 'en' ? '9. Close with Leadership' : '9. Fechamento de Liderança',
      badge: language === 'en' ? 'Calendar Booking' : 'Foco: Direcionar Agenda',
      hint: language === 'en' ? 'Always suggest two options. Focus on "when", not "if".' : 'Ofereça sempre duas datas selecionadas em formato fechado de escolha (Double Option). Nunca pergunte se querem fechar, pergunte "quando".',
      speech: language === 'en'
        ? `“Most of our clients tell us the biggest difference isn’t just having a cleaner home — it’s getting their time and peace of mind back. Let’s go ahead and find a good day for your first cleaning. Would Tuesday or Thursday work better for you?”`
        : `“A maioria dos nossos clientes de elite nos diz que a maior diferença não é só ver a casa limpa — mas sim ter as suas horas de vida e tranquilidade de volta. Vamos agendar sua primeira visita para esta semana. Funcionaria melhor para você na terça-feira ou na quinta-feira?”`,
      checkboxes: []
    }
  ];

  // Objections reframes data
  const objectionsData = [
    {
      id: 'price',
      title: language === 'en' ? '❌ Pricing Objection / "Too Expensive"' : '❌ Objeção de Preço: "Achei Caro"',
      reframe: language === 'en'
        ? {
            disarm: `“I completely understand, ${firstName}. We are definitely not the cheapest in ${city}, because we do not hire raw unvetted workers or cut corners on security. We stand for premium service.”`,
            pivot: `“But tell me: are you comparing this strictly on price, or are you looking for the absolute security, insurance cover, 24-hour backup guarantee, and having the exact same elite professional taking beautiful care of your home without you worrying about missing items?”`,
            close: `“In the long run, investing an extra $20 represents cents per day to guarantee total tranquility and high luxury standards. Shall we secure that premium slot for you?”`
          }
        : {
            disarm: `“Compreendo perfeitamente seu ponto de vista, ${firstName}. Nós realmente não buscamos competir pelo preço mais barato do mercado de ${city}, porque nossa prioridade absoluta é com a segurança jurídica do seu lar, a checagem rigorosa de antecedentes de quem entra na sua casa e a consistência impecável do capricho.”`,
            pivot: `“Mas deixa eu te perguntar: você está comparando apenas o valor bruto, ou prioriza a garantia de receber profissionais treinadas em hotelaria, com seguro de responsabilidade civil completo, que realmente respeitam seu lar e vêm comprometidas com a sua paz de espírito?”`,
            close: `“Se diluirmos essa diferença em relação ao preço comum, estamos falando de apenas alguns centavos por dia para você ter noites de sono tranquilas sabendo que sua casa está protegida e bem-cuidada de verdade. Faz sentido para você iniciarmos?”`
          }
    },
    {
      id: 'competitor',
      title: language === 'en' ? '💸 "I have a cheaper quote"' : '💸 "Tenho outro bem mais barato"',
      reframe: language === 'en'
        ? {
            disarm: `“That makes total sense, ${firstName}. You can always find someone charging less in this industry. House cleaning is widely low-entry, but highly complex to run securely.”`,
            pivot: `“General cleaners usually fail on consistent visits, don't carry full commercial liability insurances, and rarely run legal background reports. When issues arise, they vanish. Star Cleaning provides years of brand validation, complete safety files, and consistent standard delivery.”`,
            close: `“Our clients stay with us for years because of that safety and professional composure. Do you want to risk your home to save a few dollars, or is it worth investing in a validated pristine luxury team?”`
          }
        : {
            disarm: `“Faz todo sentido buscar o melhor custo-benefício, ${firstName}. E sendo honesta(o), você sempre vai encontrar alguém disposto a cobrar menos neste mercado.”`,
            pivot: `“A questão é que, na maioria das vezes, pessoas que cobram muito abaixo não possuem seguro contra quebras, faltam em visitas importantes por qualquer imprevisto pessoal, não dão garantia se algo ficar mal feito, e você não tem respaldo jurídico em caso de acidentes dentro do seu lar.”`,
            close: `“A Star Cleaning possui anos de história e uma retaguarda impecável para te proteger. Vale a pena arriscar a segurança do seu lar sabendo que sua casa está resguardada?”`
          }
    },
    {
      id: 'products',
      title: language === 'en' ? '🧼 "Who provides supplies?"' : '🧼 "Como funciona produtos e equipamentos?"',
      reframe: language === 'en'
        ? {
            disarm: `“We bring EVERYTHING with us, ${firstName}! Our teams arrive fully equipped with premium professional-grade products, heavy vacuums, organic fresh oils, and sanitized microfibers.”`,
            pivot: `“You do not have to buy a single detergent, carry bucket loads, or worry about choosing products. This is design-level convenience. We only request a functioning toilet, running water, and electricity.”`,
            close: `“Let us take care of everything for you, including the chemical selection. Would Tuesday morning work best?”`
          }
        : {
            disarm: `“Fique com total tranquilidade, ${firstName}! Nós trazemos absolutamente TUDO o que é necessário.”`,
            pivot: `“Nossas especialistas chegam ao seu lar equipadas com extratoras e aspiradores industriais, panos de microfibra esterilizados por cores para evitar contaminação cruzada, e produtos profissionais premium que limpam sem danificar seus móveis.”`,
            close: `“Você não precisa comprar um único frasco de detergente ou se preocupar com sacolas. O alívio é 100% nosso. Vamos fechar a nossa higienização para você esquecer que faxina existe?”`
          }
    },
    {
      id: 'frequency',
      title: language === 'en' ? '📅 "Test drive / One-time clean"' : '📅 "Quero fazer só uma vez e ver depois"',
      reframe: language === 'en'
        ? {
            disarm: `“Absolutely—and that’s a perfect way to start, ${firstName}. Our Deep Clean functions exactly as a standalone test run.”`,
            pivot: `“We reset your property thoroughly first. There is zero mandatory commitment. But because we know you will fall in love with our consistency, we guarantee a priority slot with customized discounts locked-in if you decide to routine schedule later.”`,
            close: `“Most clients who do a test run instantly fall in love with the peace of mind and request weekly or biweekly schedules. Let’s get you that Initial Deep Reset so you can feel the magic?”`
          }
        : {
            disarm: `“Sem problemas, ${firstName}! É justamente assim que a maioria dos nossos clientes de longo prazo começa conosco.”`,
            pivot: `“A gente realiza esse primeiro 'Reset Geral' sem nenhum contrato ou fidelidade obrigatória. Você avalia de perto o nosso padrão de excelência. Se você amar a experiência – o que acontece em 95% dos atendimentos – nós facilitamos e travamos o seu desconto recorrente, reservando a mesma profissional na frequência ideal.”`,
            close: `“Vamos fazer esse teste sem burocracia para você experimentar o padrão Star Cleaning? Qual desses dias fica melhor?”`
          }
    },
    {
      id: 'security',
      title: language === 'en' ? '🛡️ "Security concerns"' : '🛡️ "Preocupação com chaves e segurança"',
      reframe: language === 'en'
        ? {
            disarm: `“I completely appreciate your caution, ${firstName}. Trust is the most expensive currency, and we guard it strictly.”`,
            pivot: `“At Star Cleaning, every housekeeper goes through local background reviews. They are fully insured, bonded, and we run secure smart locks or lockbox custody. If there is ever an accident, you are fully covered by our comprehensive insurance policy.”`,
            close: `“We currently handle master keys for families who have been with us for years. You are in safe, professional, and institutional hands. Shall we confirm your service date?”`
          }
        : {
            disarm: `“Eu entendo e respeito muito a sua cautela, ${firstName}. Abrir a porta do lar para alguém é uma decisão de extrema confiança.”`,
            pivot: `“Por isso mesmo, todas as nossas profissionais de elite passam por triagem social e criminal profunda antes de qualquer atendimento. Além disso, seguramos todas as chaves em custódia lacrada de alta segurança, e possuímos uma apólice de seguro abrangente contra qualquer imprevisto ou avaria.”`,
            close: `“Atendemos famílias tradicionais e imóveis premium exatamente por conta desse rigor supremo com a privacidade. Você estará em mãos profissionais sólidas. Podemos fechar para esta semana?”`
          }
    }
  ];

  // Core customer intelligence appender
  const applyDiscoveryToObservations = async (customPains?: string[], customGoals?: string[]) => {
    if (!lead) return;
    setIsSaving(true);
    
    const targetPains = customPains !== undefined ? customPains : loggedPains;
    const targetGoals = customGoals !== undefined ? customGoals : loggedGoals;
    
    const painText = targetPains.length > 0 ? `• Dores identificadas: ${targetPains.join(', ')}` : '';
    const goalText = targetGoals.length > 0 ? `• Desejos do cliente: ${targetGoals.join(', ')}` : '';
    
    const separator = "\n=== INTELIGÊNCIA COMERCIAL DE VENDAS ===\n";
    let currentObs = editForm.OBSERVACOES || lead.OBSERVACOES || '';
    if (currentObs.includes("=== INTELIGÊNCIA COMERCIAL DE VENDAS ===")) {
      currentObs = currentObs.split("=== INTELIGÊNCIA COMERCIAL DE VENDAS ===")[0];
    }
    
    let updatedObs = '';
    if (painText || goalText) {
      const compiledIntell = `${painText}${painText && goalText ? '\n' : ''}${goalText}`;
      updatedObs = `${currentObs.trim()}${currentObs ? '\n\n' : ''}${separator}${compiledIntell}`.trim();
    } else {
      updatedObs = currentObs.trim();
    }
    
    await updateLead(lead.id, { OBSERVACOES: updatedObs });
    setEditForm(prev => ({ ...prev, OBSERVACOES: updatedObs }));
    setIsSaving(false);
    
    // Smooth copy-feedback alert
    setCopiedText(language === 'en' ? 'Profile Custom Intelligence Saved & Synced!' : 'Inteligência comercial atualizada e sincronizada!');
    setTimeout(() => setCopiedText(null), 3000);
  };

  const PIPELINE_STAGES = [
    'New Lead', 
    'Initial Contact & Qualification', 
    'Discovery', 
    'HOT LEADS', 
    'Pricing & Estimate Presentation', 
    'No Response',
    'Not Interested',
    'Too Pricey',
    'Closing'
  ];

  const currentStageIndex = PIPELINE_STAGES.findIndex(s => s.toLowerCase() === (lead.ETAPA || 'new lead').toLowerCase());
  const displayStageIndex = currentStageIndex >= 0 ? currentStageIndex : 0;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-zinc-50 min-h-screen text-zinc-900 font-sans selection:bg-sky-200 selection:text-sky-900"
    >
      <div className="max-w-7xl mx-auto p-4 md:p-8 pb-32 space-y-8">
        
        {/* Breadcrumbs Navigation with Elegant Light Vibe */}
        <nav className="flex items-center text-xs font-semibold uppercase tracking-widest text-zinc-500">
          <Link href="/leads" className="hover:text-sky-600 hover:border-zinc-400 transition-all flex items-center gap-1.5 py-1.5 px-3.5 bg-white rounded-full border border-zinc-200 shadow-2xs">
            <ArrowLeft size={12} className="text-zinc-500 transition-colors group-hover:text-sky-600" /> 
            {language === 'en' ? 'Back to CRM' : 'Voltar ao CRM'}
          </Link>
          <ChevronRight size={12} className="mx-3 text-zinc-300" />
          <span className="text-zinc-700 font-medium truncate bg-white px-3.5 py-1.5 rounded-full border border-zinc-200 shadow-2xs">
            {lead.Nome || 'Unnamed'}
          </span>
        </nav>

        {/* Executive Header Box (Premium Light Card with Soft Shadows) */}
        <header className="relative bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 overflow-hidden shadow-sm">
          <div className="absolute top-0 left-0 w-[4px] h-full bg-gradient-to-b from-sky-500 to-indigo-600"></div>
          
          <div className="absolute -right-24 -top-24 w-80 h-80 bg-sky-500/5 rounded-full blur-[80px] pointer-events-none"></div>

          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 via-sky-600 to-indigo-600 text-white flex items-center justify-center text-2.5xl font-black shadow-md shrink-0 border border-sky-400/20 tracking-tighter">
              {leadInitials}
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-xl md:text-2.5xl font-black text-zinc-900 tracking-tight leading-none flex items-center gap-2">
                  {lead.Nome || (language === 'en' ? 'Unnamed Lead' : 'Lead Sem Nome')}
                  {lead.is_promo && (
                    <span className="shrink-0 inline-flex items-center gap-1 bg-rose-100 text-rose-700 text-xs font-black uppercase tracking-widest px-2 py-1 rounded-full border border-rose-200 shadow-sm">
                      <Sparkles size={12} className="text-rose-500" />
                      Promo
                    </span>
                  )}
                  {lead.is_referral && (
                    <span className="shrink-0 inline-flex items-center gap-1 bg-violet-100 text-violet-700 text-xs font-black uppercase tracking-widest px-2 py-1 rounded-full border border-violet-200 shadow-sm">
                      Indicação
                    </span>
                  )}
                </h1>
                <select
                  value={lead.ETAPA || 'New Lead'}
                  onChange={(e) => updateStatus(e.target.value)}
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusBadgeStyles(lead.ETAPA)} transition-all focus:outline-none cursor-pointer`}
                >
                  {PIPELINE_STAGES.map(stage => (
                    <option key={stage} value={stage} className="text-zinc-700 bg-white normal-case font-medium">{translateStage(stage)}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex flex-wrap items-center gap-y-1.5 gap-x-3 text-xs font-semibold text-zinc-500">
                {lead.Telefone && (
                  <a href={`tel:${lead.Telefone}`} className="flex items-center gap-1 hover:text-sky-600 transition-all py-0.5 px-2 bg-zinc-50 rounded-xl border border-zinc-200">
                    <Phone size={11} className="text-zinc-400" /> {lead.Telefone}
                  </a>
                )}
                {lead.Email && (
                  <a href={`mailto:${lead.Email}`} className="flex items-center gap-1 hover:text-sky-600 transition-all py-0.5 px-2 bg-zinc-50 rounded-xl border border-zinc-200">
                    <Mail size={11} className="text-zinc-400" /> {lead.Email}
                  </a>
                )}
                {lead.Cidade && (
                  <span className="flex items-center gap-1 py-0.5 px-2 bg-zinc-50 rounded-xl border border-zinc-200 text-zinc-700">
                    <MapPin size={11} className="text-zinc-400" /> {lead.Cidade}, SC {lead.ZIP && `(${lead.ZIP})`}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Header Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 z-10 w-full lg:w-auto shrink-0">
            <button 
              onClick={() => {
                if (isEditing) handleSave();
                else { setEditForm(lead); setIsEditing(true); }
              }}
              disabled={isSaving}
              className="w-full sm:w-auto flex justify-center items-center gap-2 px-5 py-3 bg-white hover:bg-zinc-100 text-zinc-700 hover:text-sky-600 text-xs font-bold uppercase tracking-wider rounded-xl border border-zinc-200 shadow-2xs transition-all active:scale-95 cursor-pointer"
            >
              {isEditing ? (
                isSaving ? <Loader2 size={13} className="animate-spin" /> : <><Save size={13} /> {language === 'en' ? 'Save Profile' : 'Salvar Perfil'}</>
              ) : (
                <><Edit3 size={13} /> {language === 'en' ? 'Edit Profile' : 'Editar Info'}</>
              )}
            </button>
            
            <Link 
              href={`/estimate?leadId=${lead.id}`}
              className="w-full sm:w-auto flex justify-center items-center gap-2 px-5 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md shadow-sky-500/5 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <FileText size={13} /> {language === 'en' ? 'Configure Design Estimate' : 'Configurar Orçamento'}
            </Link>
          </div>
        </header>

        {/* Bento Board Layout - Beautiful 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* PROFILE CARD & SETUP (Left Side - Col-span 5) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white rounded-3xl border border-zinc-200 p-6 md:p-8 relative shadow-sm overflow-hidden animate-fadeIn">
              <div className="absolute top-0 right-0 p-6 opacity-[0.01] pointer-events-none">
                <Shield size={160} />
              </div>

              <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-200">
                <h2 className="text-xs font-bold tracking-widest text-zinc-400 uppercase flex items-center gap-2">
                  <User size={13} className="text-sky-500" /> {language === 'en' ? 'Property Profile Details' : 'Perfil Técnico Detalhado'}
                </h2>
                {isEditing && (
                  <button type="button" onClick={() => setIsEditing(false)} className="text-zinc-400 hover:text-zinc-800 transition-colors">
                    <X size={16} />
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Client Name</label>
                    <input 
                      type="text" 
                      value={editForm.Nome || ''} 
                      onChange={e => setEditForm({...editForm, Nome: e.target.value})} 
                      className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-sky-500 focus:bg-white transition-all" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Phone Number</label>
                      <input 
                        type="text" 
                        value={editForm.Telefone || ''} 
                        onChange={e => setEditForm({...editForm, Telefone: e.target.value})} 
                        className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-sky-500 focus:bg-white transition-all" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Email Address</label>
                      <input 
                        type="email" 
                        value={editForm.Email || ''} 
                        onChange={e => setEditForm({...editForm, Email: e.target.value})} 
                        className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-sky-500 focus:bg-white transition-all" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">City</label>
                      <input 
                        type="text" 
                        value={editForm.Cidade || ''} 
                        onChange={e => setEditForm({...editForm, Cidade: e.target.value})} 
                        className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-sky-500 focus:bg-white transition-all" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">ZIP / Postal Code</label>
                      <input 
                        type="text" 
                        value={editForm.ZIP || ''} 
                        onChange={e => setEditForm({...editForm, ZIP: e.target.value})} 
                        className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Bedrooms</label>
                      <input 
                        type="number" 
                        value={editForm.Quartos || ''} 
                        onChange={e => setEditForm({...editForm, Quartos: e.target.value})} 
                        className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Bathrooms</label>
                      <input 
                        type="number" 
                        step="0.5" 
                        value={editForm.Banheiros || ''} 
                        onChange={e => setEditForm({...editForm, Banheiros: e.target.value})} 
                        className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Classification</label>
                      <select 
                        value={editForm.Service || 'residential'} 
                        onChange={e => setEditForm({...editForm, Service: e.target.value})} 
                        className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none appearance-none"
                      >
                        <option value="residential">Residential</option>
                        <option value="deep">Deep Clean</option>
                        <option value="move">Move In/Out</option>
                        <option value="vacation">Vacation/Airbnb</option>
                        <option value="commercial">Commercial</option>
                        <option value="construction">Post-Construction</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Frequency Plan</label>
                      <select 
                        value={editForm.Frequencia || 'one-time'} 
                        onChange={e => setEditForm({...editForm, Frequencia: e.target.value})} 
                        className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none"
                      >
                        <option value="one-time">One-time</option>
                        <option value="weekly">Weekly</option>
                        <option value="bi-weekly">Bi-weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Min Price ($)</label>
                      <input 
                        type="text" 
                        value={editForm.Inicial || ''} 
                        onChange={e => setEditForm({...editForm, Inicial: e.target.value})} 
                        className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-emerald-600 font-extrabold focus:outline-none" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Max Price ($)</label>
                      <input 
                        type="text" 
                        value={editForm.Final || ''} 
                        onChange={e => setEditForm({...editForm, Final: e.target.value})} 
                        className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-emerald-600 font-extrabold focus:outline-none" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Scheduled Service Date (Agendado)</label>
                    <input 
                      type="date" 
                      value={editForm.Agendado || ''} 
                      onChange={e => setEditForm({...editForm, Agendado: e.target.value})} 
                      className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Special Notes / Observations</label>
                    <textarea 
                      rows={4} 
                      value={editForm.OBSERVACOES || ''} 
                      onChange={e => setEditForm({...editForm, OBSERVACOES: e.target.value})} 
                      placeholder="Special instructions..."
                      className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none resize-none" 
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  
                  {/* Values Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-zinc-50/80 rounded-2xl border border-zinc-200 shadow-3xs">
                      <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 font-sans">Data de Criação</h4>
                      <p className="text-sm font-semibold text-zinc-800 font-sans">
                        {lead.Data || lead.created_at 
                          ? new Date(lead.Data || lead.created_at!).toLocaleDateString(language === 'en' ? 'en-US' : 'pt-BR', { dateStyle: 'medium' }) 
                          : '--'}
                      </p>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 shadow-3xs">
                      <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1.5 font-sans">Valor Estimado</h4>
                      <div className="text-lg font-black text-emerald-700 tracking-tight font-sans">
                        {lead.Inicial ? (
                          String(lead.Inicial).toLowerCase().includes('sem preço') || String(lead.Inicial).toLowerCase().includes('sem preco')
                            ? (language === 'en' ? 'No Price' : 'Sem Preço')
                            : (String(lead.Inicial).startsWith('$') ? lead.Inicial : `$${lead.Inicial}`)
                        ) : '$0'}
                      </div>
                    </div>
                  </div>

                  {/* Scheduled Cleaner Card (Agendado) */}
                  <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 flex items-center justify-between">
                    <div>
                      <h4 className="text-[9px] font-black text-purple-700 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <Calendar size={10} /> Data do Atendimento
                      </h4>
                      <p className="text-sm font-bold text-purple-900">
                        {lead.Agendado ? new Date(lead.Agendado + 'T00:00:00').toLocaleDateString(language === 'en' ? 'en-US' : 'pt-BR', { dateStyle: 'long' }) : (language === 'en' ? 'Not Scheduled Yet' : 'Sem agendamento ativo')}
                      </p>
                    </div>
                    <button 
                      onClick={() => setIsEditing(true)} 
                      className="text-[10px] font-black uppercase tracking-wider text-purple-800 hover:text-purple-900 transition-colors bg-purple-100 hover:bg-purple-250 px-3 py-1.5 rounded-lg border border-purple-200"
                    >
                      {language === 'en' ? 'Assign Date' : 'Definir'}
                    </button>
                  </div>

                  {/* Tech Specs */}
                  <div className="space-y-4 pt-4 border-t border-zinc-200">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                      <div>
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Classificação do Serviço</span>
                        <span className="text-xs font-bold text-zinc-800 capitalize">{lead.Service?.replace('-', ' ') || 'Any'}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Frequência Solicitada</span>
                        <span className="inline-block bg-sky-50 text-sky-850 text-[9px] font-black px-2.5 py-1 rounded border border-sky-100 uppercase mt-0.5">{lead.Frequencia || 'One-Time'}</span>
                      </div>
                      <div className="pt-2">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Quartos (Beds)</span>
                        <span className="text-xs font-bold text-zinc-800">{lead.Quartos || '-'}</span>
                      </div>
                      <div className="pt-2">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Banheiros (Baths)</span>
                        <span className="text-xs font-bold text-zinc-800">{lead.Banheiros || '-'}</span>
                      </div>
                    </div>
                  </div>

                  {lead.OBSERVACOES && (
                    <div className="pt-4 border-t border-zinc-200">
                      <h4 className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <Flame size={11} className="text-amber-500" /> Inteligência Comercial & Observações
                      </h4>
                      <div className="bg-amber-50/40 border border-amber-100 p-4 rounded-2xl text-xs text-amber-900 font-medium whitespace-pre-wrap leading-relaxed shadow-sm">
                        {lead.OBSERVACOES}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>

            {/* Estimates List card */}
            <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm animate-fadeIn">
              <div className="p-5 border-b border-zinc-200 bg-zinc-50/50 flex justify-between items-center">
                <h3 className="text-xs font-bold tracking-widest text-zinc-400 uppercase flex items-center gap-2">
                  <FileText size={14} className="text-sky-500" /> {language === 'en' ? 'Generated Estimates' : 'Cotações Feitas'}
                </h3>
                <Link 
                  href={`/estimate?leadId=${lead.id}`} 
                  className="bg-sky-50 text-sky-600 hover:bg-sky-100 text-xs font-bold px-3 py-1.5 rounded-lg border border-sky-100 transition-all shadow-2xs hover:scale-[1.01] active:scale-[0.99]"
                >
                  + Nova Proposta
                </Link>
              </div>
              
              {leadQuotes.length > 0 ? (
                <div className="divide-y divide-zinc-250/50 overflow-x-auto">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-400 uppercase text-[9px] font-black tracking-widest">
                      <tr>
                        <th className="px-5 py-3">Especificações</th>
                        <th className="px-5 py-3">Frequência</th>
                        <th className="px-5 py-3 text-right">Total</th>
                        <th className="px-5 py-3 text-right w-24">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {leadQuotes.map(q => (
                        <tr 
                          key={q.id} 
                          onClick={() => setSelectedQuote(q)}
                          className="hover:bg-zinc-50/50 transition-colors cursor-pointer group"
                        >
                          <td className="px-5 py-3.5">
                            <div className="font-bold text-zinc-800 group-hover:text-sky-600 transition-colors uppercase tracking-wide text-[11px]">
                              {q.serviceType}
                            </div>
                            <div className="text-[9px] font-medium text-zinc-400">
                              {new Date(q.date).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-[9px] font-extrabold text-sky-700 uppercase bg-sky-50 border border-sky-100 px-1.5 py-0.5 rounded">
                              {q.frequency}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right font-black text-sky-650">
                            ${q.total}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex justify-end gap-2 items-center">
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleSendWebhook(q); }}
                                disabled={sendingQuoteId !== null}
                                className={`px-2 px-1 py-1 text-[9px] uppercase tracking-wider font-black rounded flex items-center gap-1 cursor-pointer border shadow-2xs transition-all ${
                                  sentQuoteId === q.id 
                                    ? 'bg-emerald-50 text-emerald-705 border-emerald-200' 
                                    : 'bg-white hover:bg-zinc-50 text-zinc-550 hover:text-zinc-800 border-zinc-200'
                                }`}
                              >
                                {sendingQuoteId === q.id ? <Loader2 className="w-2.5 h-2.5 animate-spin text-sky-600" /> : 
                                 sentQuoteId === q.id ? <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> : 
                                 <Send className="w-2.5 h-2.5 text-sky-600" />}
                                {sendingQuoteId === q.id ? '...' : sentQuoteId === q.id ? 'Enviado' : 'Enviar'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-center mb-2.5">
                    <FileText size={18} className="text-zinc-400" />
                  </div>
                  <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Nenhum orçamento ainda</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5 max-w-[245px] leading-relaxed">Crie uma proposta profissional clicando no botão acima para iniciar o fechamento comercial.</p>
                </div>
              )}
            </div>
          </div>

          {/* CRM DESK & PLAYBOOK (Right Side - Col-span 7) */}
          <div className="lg:col-span-7 space-y-8">

            {/* Interactive Consultative Sales & Persuasion Suite */}
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-sm animate-fadeIn">
              <div className="absolute top-0 right-0 p-6 opacity-[0.015] pointer-events-none">
                <Flame size={120} className="text-sky-500" />
              </div>

              {/* Console Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-zinc-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center border border-sky-100 shadow-xs">
                    <Phone size={18} className="text-sky-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-zinc-900 tracking-tight flex items-center gap-2 leading-none">
                      Console de Vendas <span className="bg-sky-50 text-sky-700 border border-sky-100 text-[10px] font-extrabold px-2 py-0.5 rounded tracking-wide uppercase">Script Ativo</span>
                    </h3>
                    <p className="text-xs text-zinc-500 font-normal mt-1.5">Roteiro persuasivo e quebra de objeções estruturada para fechamento</p>
                  </div>
                </div>

                {/* Sub Tab selector */}
                <div className="flex border border-zinc-200 bg-zinc-50 p-1 rounded-xl self-start md:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => setSalesTab('script')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      salesTab === 'script' 
                        ? 'bg-sky-600 text-white shadow-sm' 
                        : 'text-zinc-650 hover:text-zinc-900'
                    }`}
                  >
                    <Phone size={12} /> Script de Chamada
                  </button>
                  <button
                    type="button"
                    onClick={() => setSalesTab('triggers')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      salesTab === 'triggers' 
                        ? 'bg-emerald-600 text-white shadow-sm' 
                        : 'text-zinc-650 hover:text-zinc-900'
                    }`}
                  >
                    <MessageCircle size={12} /> {language === 'en' ? 'Text Message Triggers' : 'Gatilhos de Mensagem'}
                  </button>
                </div>
              </div>

              {/* TAB 1: INTERACTIVE LIVE SCRIPT STEPPER */}
              {salesTab === 'script' && (
                <div className="space-y-6">
                  
                  {/* Step Stepper Indicator dots */}
                  <div className="flex items-center justify-between bg-zinc-50 border border-zinc-200 p-2 rounded-2xl overflow-x-auto gap-2">
                    {scriptStepsData.map((stepItem) => {
                      const isActive = currentScriptStep === stepItem.step;
                      const isCompleted = currentScriptStep > stepItem.step;
                      return (
                        <button
                          key={stepItem.step}
                          type="button"
                          onClick={() => setCurrentScriptStep(stepItem.step)}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all shrink-0 cursor-pointer ${
                            isActive 
                              ? 'bg-sky-500 text-white border border-sky-400 shadow-sm scale-110' 
                              : isCompleted 
                              ? 'bg-sky-50 text-sky-600 border border-sky-100' 
                              : 'bg-white text-zinc-400 border border-zinc-200 hover:border-zinc-400 hover:text-zinc-800'
                          }`}
                        >
                          {isCompleted ? <Check size={12} strokeWidth={3} /> : stepItem.step}
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Step Panel */}
                  <div className="bg-zinc-50 p-5 rounded-3xl border border-zinc-200 space-y-4 shadow-2xs relative">
                    
                    {/* Active Step Info header */}
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-[10px] font-bold text-sky-750 uppercase tracking-wider bg-sky-50 border border-sky-100 px-2.5 py-0.5 rounded">
                          {scriptStepsData[currentScriptStep - 1].badge}
                        </span>
                        <h4 className="text-sm font-extrabold text-zinc-900 mt-2 tracking-tight font-sans">
                          {scriptStepsData[currentScriptStep - 1].title}
                        </h4>
                      </div>
                      <p className="text-xs font-medium text-zinc-400 font-sans">
                        Passo {currentScriptStep} de 9
                      </p>
                    </div>

                    {/* Speech script formula box */}
                    <div className="relative group/speech">
                      <div className="absolute top-2.5 right-2 opacity-60 group-hover/speech:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleCopyText(scriptStepsData[currentScriptStep - 1].speech)}
                          className="bg-white hover:bg-zinc-50 p-1.5 rounded-lg border border-zinc-200 text-zinc-400 hover:text-sky-600 transition-colors shadow-xs cursor-pointer"
                          title="Copiar Roteiro"
                        >
                          <Copy size={12} />
                        </button>
                      </div>
                      <blockquote className="p-4 bg-white border-l-4 border-sky-500 text-zinc-800 text-[13px] md:text-sm italic font-medium leading-relaxed rounded-r-2xl pr-10 shadow-xs border-y border-r border-zinc-200 pr-8">
                        &quot;{scriptStepsData[currentScriptStep - 1].speech}&quot;
                      </blockquote>
                      
                      {copiedText && (
                        <div className="absolute top-2 right-10 bg-emerald-500 text-white text-[9px] font-extrabold px-2 py-1 rounded shadow-md animate-bounce">
                          {copiedText}
                        </div>
                      )}
                    </div>

                    {/* Real-time Sales Pro Golden Advice */}
                    <div className="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-100 flex items-start gap-3">
                      <div className="text-amber-600 mt-0.5 shrink-0">
                        <AlertTriangle size={14} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-amber-750 tracking-wider block font-sans">Instrução ao Operador</span>
                        <p className="text-xs text-amber-955 font-medium leading-relaxed mt-1">
                          {scriptStepsData[currentScriptStep - 1].hint}
                        </p>
                      </div>
                    </div>

                    {/* Step specific interactive actions (e.g. Discovery checks on Steps 2 & 3) */}
                    {scriptStepsData[currentScriptStep - 1].checkboxes && scriptStepsData[currentScriptStep - 1].checkboxes.length > 0 && (
                      <div className="pt-3 border-t border-zinc-200 space-y-3">
                        <span className="text-[10px] font-bold uppercase text-sky-600 tracking-wider block">
                          {currentScriptStep === 2 ? '🔍 Mapear Dores Mencionadas' : '🎯 Mapear Desejos Demonstrados'}
                        </span>
                        
                        <div className="grid grid-cols-2 gap-2">
                          {scriptStepsData[currentScriptStep - 1].checkboxes.map((check) => {
                            const isPain = currentScriptStep === 2;
                            const isChecked = isPain 
                              ? loggedPains.includes(check.id) 
                              : loggedGoals.includes(check.id);
                            
                            return (
                              <button
                                key={check.id}
                                type="button"
                                onClick={() => {
                                  if (isPain) {
                                    const nextPains = loggedPains.includes(check.id)
                                      ? loggedPains.filter(x => x !== check.id)
                                      : [...loggedPains, check.id];
                                    setLoggedPains(nextPains);
                                    applyDiscoveryToObservations(nextPains, loggedGoals);
                                  } else {
                                    const nextGoals = loggedGoals.includes(check.id)
                                      ? loggedGoals.filter(x => x !== check.id)
                                      : [...loggedGoals, check.id];
                                    setLoggedGoals(nextGoals);
                                    applyDiscoveryToObservations(loggedPains, nextGoals);
                                  }
                                }}
                                className={`flex items-center gap-2 py-2.5 px-3.5 rounded-xl border text-left text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                                  isChecked 
                                    ? 'bg-sky-50 text-sky-700 border-sky-305 shadow-[0_2px_8px_rgba(14,165,233,0.08)]' 
                                    : 'bg-white text-zinc-650 border border-zinc-200 hover:border-zinc-300'
                                }`}
                              >
                                <span className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center text-[8px] font-extrabold shrink-0 ${
                                  isChecked 
                                    ? 'bg-sky-500 text-white border-sky-400' 
                                    : 'border-zinc-300 bg-white'
                                }`}>
                                  {isChecked && <Check size={8} strokeWidth={4} />}
                                </span>
                                {check.label}
                              </button>
                            );
                          })}
                        </div>

                        {/* Save discoveries tool */}
                        <div className="flex justify-between items-center pt-2">
                          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            {language === 'en' ? 'Auto-synced with Cloud' : 'Sincronizado em tempo real'}
                          </span>
                          <button
                            type="button"
                            onClick={() => applyDiscoveryToObservations()}
                            disabled={isSaving}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-zinc-50 text-zinc-750 text-xs font-semibold rounded-xl border border-zinc-200 hover:border-zinc-300 shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Save size={11} className="text-zinc-500" /> {language === 'en' ? 'Force Sync' : 'Re-Sincronizar'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Stepper controls */}
                  <div className="flex justify-between gap-4">
                    <button
                      type="button"
                      disabled={currentScriptStep === 1}
                      onClick={() => setCurrentScriptStep(prev => prev - 1)}
                      className="px-4 py-2 bg-white border border-zinc-200 hover:border-zinc-350 hover:bg-zinc-50 text-zinc-700 hover:text-zinc-900 text-xs font-semibold rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-3xs cursor-pointer"
                    >
                      Voltar Passo
                    </button>
                    <button
                      type="button"
                      disabled={currentScriptStep === 9}
                      onClick={() => setCurrentScriptStep(prev => prev + 1)}
                      className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
                    >
                      Avançar Script <ChevronRight size={12} strokeWidth={2.5} />
                    </button>
                  </div>

                  {/* SUB SECTOR: INTERACTIVE OBJECTIONS HARVESTER */}
                  <div className="border-t border-zinc-200 pt-5 space-y-3">
                    <h4 className="text-xs font-bold text-zinc-500 flex items-center gap-1.5 pb-1 uppercase tracking-wider">
                      <Shield size={13} className="text-sky-600 animate-pulse" /> Refratário de Objeções (Como quebrar na chamada)
                    </h4>
                    
                    <div className="flex flex-wrap gap-2">
                      {objectionsData.map((obj) => {
                        const isSelected = selectedObjection === obj.id;
                        return (
                          <button
                            key={obj.id}
                            type="button"
                            onClick={() => setSelectedObjection(isSelected ? null : obj.id)}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold tracking-tight transition-all cursor-pointer shadow-3xs ${
                              isSelected 
                                ? 'bg-sky-600 text-white border-sky-600 shadow-xs' 
                                : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-900'
                            }`}
                          >
                            {obj.title.split(': ')[1] || obj.title}
                          </button>
                        );
                      })}
                    </div>

                    {/* Expanded Objection Reframe card */}
                    {selectedObjection && (() => {
                      const objItem = objectionsData.find(o => o.id === selectedObjection);
                      if (!objItem) return null;
                      return (
                        <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl space-y-4 shadow-2xs relative animate-fadeIn">
                          
                          <div className="flex justify-between items-center pb-2 border-b border-zinc-200">
                            <span className="text-xs font-bold text-sky-700">
                              Quebra: {objItem.title}
                            </span>
                            <button
                              type="button"
                              onClick={() => setSelectedObjection(null)}
                              className="text-zinc-400 hover:text-zinc-650 text-xs font-semibold uppercase cursor-pointer"
                            >
                              Fechar
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                            {/* Disarm part */}
                            <div className="bg-white p-3.5 rounded-xl border border-zinc-200 relative group/dis shadow-3xs">
                              <span className="text-[10px] font-bold uppercase text-orange-600 tracking-wider block flex items-center justify-between">
                                <span>1. Desarmar Objeção</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyText(objItem.reframe.disarm)}
                                  className="opacity-0 group-hover/dis:opacity-100 transition-opacity p-0.5 hover:text-sky-600 cursor-pointer"
                                >
                                  <Copy size={10} />
                                </button>
                              </span>
                              <p className="text-xs text-zinc-650 italic leading-relaxed whitespace-pre-wrap mt-1.5">
                                &quot;{objItem.reframe.disarm}&quot;
                              </p>
                            </div>

                            {/* Pivot part */}
                            <div className="bg-white p-3.5 rounded-xl border border-zinc-200 relative group/piv shadow-3xs">
                              <span className="text-[10px] font-bold uppercase text-sky-600 tracking-wider block flex items-center justify-between">
                                <span>2. Pivotar à Autoridade</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyText(objItem.reframe.pivot)}
                                  className="opacity-0 group-hover/piv:opacity-100 transition-opacity p-0.5 hover:text-sky-600 cursor-pointer"
                                >
                                  <Copy size={10} />
                                </button>
                              </span>
                              <p className="text-xs text-zinc-650 italic leading-relaxed whitespace-pre-wrap mt-1.5">
                                &quot;{objItem.reframe.pivot}&quot;
                              </p>
                            </div>

                            {/* Close part */}
                            <div className="bg-sky-50/30 p-3.5 rounded-xl border border-sky-100 relative group/clo shadow-3xs">
                              <span className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider block flex items-center justify-between">
                                <span>3. Chamar Fechamento</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyText(objItem.reframe.close)}
                                  className="opacity-0 group-hover/clo:opacity-100 transition-opacity p-0.5 hover:text-emerald-600 cursor-pointer"
                                >
                                  <Copy size={10} />
                                </button>
                              </span>
                              <p className="text-xs text-zinc-900 font-semibold italic leading-relaxed whitespace-pre-wrap mt-1.5">
                                &quot;{objItem.reframe.close}&quot;
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                </div>
              )}

              {/* TAB 2: TEXT MESSAGE COPY TRIGGERS */}
              {salesTab === 'triggers' && (
                <div className="space-y-4">
                  {/* Playbook Mode Tabs */}
                  <div className="flex border border-zinc-200 bg-zinc-50 p-1 rounded-xl gap-1 overflow-x-auto">
                    {(['scarcity', 'social', 'desire', 'conversational'] as const).map(tab => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActivePlaybookTab(tab)}
                        className={`flex-1 text-center py-2 px-3 rounded-lg text-xs font-bold cursor-pointer transition-all whitespace-nowrap ${
                          activePlaybookTab === tab 
                            ? 'bg-orange-550 text-white shadow-xs' 
                            : 'text-zinc-650 hover:text-zinc-900 hover:bg-zinc-100'
                        }`}
                      >
                        {tab === 'scarcity' && '🔥 Escassez'}
                        {tab === 'social' && '⚡ Prova Social'}
                        {tab === 'desire' && '💎 Puro Desejo'}
                        {tab === 'conversational' && '💬 Casual'}
                      </button>
                    ))}
                  </div>

                  {/* Playbook Description box */}
                  <div className="mt-5 space-y-4">
                    <div className="flex justify-between items-center bg-zinc-50 p-4 rounded-xl border border-zinc-200 shadow-3xs">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-orange-700 tracking-wider block">{playbooks[activePlaybookTab].badge}</span>
                        <h4 className="text-sm font-bold text-zinc-900 tracking-tight mt-1">{playbooks[activePlaybookTab].title}</h4>
                      </div>
                      <p className="text-xs text-zinc-500 font-medium max-w-[280px] text-right">{playbooks[activePlaybookTab].description}</p>
                    </div>

                    {/* Persuasive copy content area */}
                    <div className="relative">
                      <pre className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs text-zinc-700 font-mono leading-relaxed whitespace-pre-wrap select-text h-44 overflow-y-auto w-full custom-scrollbar shadow-inner">
                        {activePlaybookText}
                      </pre>
                      
                      {copiedText && (
                        <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-lg animate-bounce">
                          {copiedText}
                        </div>
                      )}
                    </div>

                    {/* Copymart buttons */}
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleCopyText(activePlaybookText)}
                        className="w-full flex justify-center items-center gap-2 px-4 py-3 bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-semibold rounded-xl border border-zinc-250 shadow-3xs transition-all active:scale-[0.98] cursor-pointer"
                      >
                        <Copy size={13} className="text-zinc-500" /> {language === 'en' ? 'Copy Text to Clipboard' : 'Copiar Texto para Área de Transferência'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
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
            className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-50 overflow-y-auto print:bg-white print:p-0"
          >
            <div className="flex min-h-full items-start justify-center p-4 sm:p-6 md:py-12">
              <motion.div 
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.98 }}
                transition={{ type: "spring", duration: 0.45 }}
                className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-zinc-200 overflow-hidden print:border-none print:shadow-none print:m-0 relative"
              >
                <div className="bg-zinc-50 border-b border-zinc-200 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
                  <div className="flex items-center gap-2 text-zinc-900 font-extrabold uppercase tracking-wider text-xs">
                    <FileText size={15} className="text-sky-600" /> Pré-visualizar Proposta Criada
                  </div>
                  <div className="flex w-full sm:w-auto gap-2">
                    <button type="button" onClick={handleDownloadSelectedQuoteHtml} className="flex-1 sm:flex-none justify-center px-4 py-2 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 shadow-2xs cursor-pointer">
                      <Printer size={14} /> Exportar HTML (PDF)
                    </button>
                    <button 
                      type="button"
                      onClick={() => setSelectedQuote(null)} 
                      className="flex-1 sm:flex-none justify-center px-6 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-sm cursor-pointer"
                    >
                      Fechar
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
    </motion.div>
  );
}
