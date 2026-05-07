/* eslint-disable react/no-unescaped-entities */
'use client';

import { BookOpen, PhoneCall, Handshake, ShieldAlert, MessageCircle, AlertCircle, Heart, Clock, Sparkles } from 'lucide-react';

export default function PlaybookPage() {
  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 pb-24 md:pb-8">
      <header className="mb-8 border-b border-zinc-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight flex items-center gap-3">
            <BookOpen className="text-sky-500" size={32} />
            Sales Playbook
          </h1>
          <p className="text-sm text-zinc-500 mt-2 max-w-2xl">
            The American Market Funnel: Sell <strong>Free Time</strong>, not just cleaning. Be empathetic, energetic, and understand the client's pain points.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
          <Sparkles size={14} /> Bilingual Guide (EN / PT)
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Roteiro de Ligação */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
            <div className="bg-sky-50 border-b border-zinc-200 p-5 flex items-center gap-3">
              <PhoneCall className="text-sky-600" size={24} />
              <h2 className="text-lg font-bold text-zinc-900">The "Free Time" Sales Script</h2>
            </div>
            <div className="p-0">
              
              {/* Step 1 */}
              <div className="border-b border-zinc-100 p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="bg-sky-100 text-sky-700 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs">1</span>
                  <h3 className="font-bold text-zinc-900">The Hook & Greeting (Abordagem)</h3>
                </div>
                <p className="text-sm text-zinc-500 mb-2">Be professional, warm, and confident. Respect their time immediately.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <p className="text-xs font-bold text-slate-400 mb-2">🇺🇸 ENGLISH</p>
                    <p className="text-sm text-zinc-700 italic">
                      "Hi [Name], this is [Your Name] with Star Cleaning! I'm following up on the estimate you requested online. Did I catch you at a good time to quickly go over the details?"
                    </p>
                  </div>
                  <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                    <p className="text-xs font-bold text-zinc-400 mb-2">🇧🇷 PORTUGUÊS</p>
                    <p className="text-sm text-zinc-700 italic">
                      "Oi [Nome]! Aqui é a [Seu Nome] da Star Cleaning. Estou ligando sobre o orçamento que você pediu online. Você tem um minutinho pra gente ver os detalhes rapidinho?"
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="border-b border-zinc-100 p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="bg-sky-100 text-sky-700 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs">2</span>
                  <h3 className="font-bold text-zinc-900">Discovery & Priorities (Descobrindo a Dor)</h3>
                </div>
                <p className="text-sm text-zinc-500 mb-2">Identify their main goal naturally. Are they overwhelmed or just need a deep clean?</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <p className="text-xs font-bold text-slate-400 mb-2">🇺🇸 ENGLISH</p>
                    <p className="text-sm text-zinc-700 italic">
                      "Great! To make sure we customize this perfectly for you, what are your main priorities right now? Are you looking to take the cleaning off your plate so you can get your weekends back?"
                    </p>
                  </div>
                  <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                    <p className="text-xs font-bold text-zinc-400 mb-2">🇧🇷 PORTUGUÊS</p>
                    <p className="text-sm text-zinc-700 italic">
                      "Ótimo! Para personalizar o serviço pra você, quais são suas prioridades hoje? Você tá buscando tirar a limpeza da sua rotina para poder aproveitar melhor seus finais de semana?"
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="border-b border-zinc-100 p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="bg-sky-100 text-sky-700 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs">3</span>
                  <h3 className="font-bold text-zinc-900">Selling Value & Peace of Mind (Vendendo o Valor)</h3>
                </div>
                <p className="text-sm text-zinc-500 mb-2">Focus on peace of mind and convenience. We handle everything.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <p className="text-xs font-bold text-slate-400 mb-2">🇺🇸 ENGLISH</p>
                    <p className="text-sm text-zinc-700 italic">
                      "We'd love to help with that. Our goal is to take cleaning completely off your hands. We bring all our own supplies, and our crews are fully insured, so you don't have to worry about a thing. For a [Frequency] service, your total would be <strong>$[Price].</strong>"
                    </p>
                  </div>
                  <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                    <p className="text-xs font-bold text-zinc-400 mb-2">🇧🇷 PORTUGUÊS</p>
                    <p className="text-sm text-zinc-700 italic">
                      "Adoraríamos te ajudar com isso. Nosso objetivo é tirar a limpeza 100% das suas mãos. Levamos todos os produtos e nossa equipe é segurada, pra você não se preocupar com nada. Para uma limpeza [Frequência], o valor seria <strong>$[Preço].</strong>"
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Step 4 */}
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="bg-sky-100 text-sky-700 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs">4</span>
                  <h3 className="font-bold text-zinc-900">The Soft Close (O Fechamento)</h3>
                </div>
                <p className="text-sm text-zinc-500 mb-2">Consultative close. Assume the scheduling confidently.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <p className="text-xs font-bold text-slate-400 mb-2">🇺🇸 ENGLISH</p>
                    <p className="text-sm text-zinc-700 italic">
                      "Our schedule is filling up for next week, but we do have an opening on <strong>[Day]</strong> at <strong>[Time]</strong>. Would you like me to go ahead and reserve that spot for you?"
                    </p>
                  </div>
                  <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                    <p className="text-xs font-bold text-zinc-400 mb-2">🇧🇷 PORTUGUÊS</p>
                    <p className="text-sm text-zinc-700 italic">
                      "Nossa agenda está enchendo rápido para a próxima semana, mas temos uma vaga na <strong>[Dia]</strong> às <strong>[Hora]</strong>. Quer que eu já deixe esse horário reservado pra você?"
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* Contorno de Objeções */}
          <section className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
            <div className="bg-amber-50 border-b border-zinc-200 p-5 flex items-center gap-3">
              <ShieldAlert className="text-amber-600" size={24} />
              <h2 className="text-lg font-bold text-zinc-900">Objection Handling (Contorno de Objeções)</h2>
            </div>
            <div className="p-6 space-y-8">
              
              {/* Objeção 1 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="text-red-500 shrink-0" size={18} />
                  <h3 className="font-bold text-zinc-900 text-lg">"It's a bit pricey..." / "Achei meio caro..."</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 border-l-4 border-l-sky-500">
                    <p className="text-xs font-bold text-slate-400 mb-2">🇺🇸 ENGLISH RESPONSE</p>
                    <p className="text-sm text-zinc-700 italic">
                      "I completely understand, [Name]. There are definitely cheaper options out there. But with us, you're paying for verified, fully insured professionals, and the guarantee that if something isn't perfect, we come back and fix it. It's about giving you complete peace of mind and knowing it's done right."
                    </p>
                  </div>
                  <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 border-l-4 border-l-sky-500">
                    <p className="text-xs font-bold text-zinc-400 mb-2">🇧🇷 RESPOSTA EM PT</p>
                    <p className="text-sm text-zinc-700 italic">
                      "Eu entendo perfeitamente, [Nome]. Realmente existem opções mais baratas. Mas com a gente você está pagando por profissionais verificados e segurados, e pela garantia de que se algo não ficar perfeito, nós voltamos pra arrumar. É sobre ter paz de espírito e saber que o serviço foi bem feito."
                    </p>
                  </div>
                </div>
                <p className="text-sm text-amber-700 bg-amber-50 mt-2 p-3 rounded-lg border border-amber-200 flex items-center gap-2">
                  <Handshake size={16} />
                  <em>Tip: If they still resist, use your 10% Negotiation Margin to close the deal on the spot!</em>
                </p>
              </div>

              {/* Objeção 2 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="text-red-500 shrink-0" size={18} />
                  <h3 className="font-bold text-zinc-900 text-lg">"I need to ask my husband/wife..."</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 border-l-4 border-l-sky-500">
                    <p className="text-xs font-bold text-slate-400 mb-2">🇺🇸 ENGLISH RESPONSE</p>
                    <p className="text-sm text-zinc-700 italic">
                      "Of course, that makes total sense! Our schedule tends to fill up pretty quickly for next week, so I can pencil you in for [Day] just to secure the spot. If they decide against it, just let me know and I can cancel it, no pressure at all."
                    </p>
                  </div>
                  <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 border-l-4 border-l-sky-500">
                    <p className="text-xs font-bold text-zinc-400 mb-2">🇧🇷 RESPOSTA EM PT</p>
                    <p className="text-sm text-zinc-700 italic">
                      "Claro, faz todo sentido! A nossa agenda costuma encher bem rápido para semana que vem, então eu posso deixar o dia [Dia] pré-reservado para garantir sua vaga. Se a resposta for não, é só me avisar que eu cancelo, sem pressão nenhuma."
                    </p>
                  </div>
                </div>
              </div>

              {/* Objeção 3 */}
              <div className="space-y-3 mt-8 border-t border-zinc-100 pt-8">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="text-red-500 shrink-0" size={18} />
                  <h3 className="font-bold text-zinc-900 text-lg">"Why are other quotes so different/cheaper?"</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 border-l-4 border-l-sky-500">
                    <p className="text-xs font-bold text-slate-400 mb-2">🇺🇸 ENGLISH RESPONSE</p>
                    <p className="text-sm text-zinc-700 italic">
                      "That's a great question! Often, cheaper quotes cover only a basic surface wipe. Our quotes reflect a comprehensive service with trained teams, full insurance, and high-quality supplies. For example, our Deep Clean targets areas like baseboards and ceiling fans that others skip. It ensures you get true peace of mind without hidden fees."
                    </p>
                  </div>
                  <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 border-l-4 border-l-sky-500">
                    <p className="text-xs font-bold text-zinc-400 mb-2">🇧🇷 RESPOSTA EM PT</p>
                    <p className="text-sm text-zinc-700 italic">
                      "Ótima pergunta! Muitas vezes, orçamentos mais baratos cobrem apenas uma limpeza superficial básica. Nossos preços refletem um serviço completo com equipes treinadas, seguro total e produtos de alta qualidade. Por exemplo, nosso Deep Clean inclui rodapés e ventiladores de teto que muitos ignoram. Isso garante que você tenha verdadeira paz de espírito sem taxas escondidas."
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </section>
        </div>

        {/* Sidebar Tips */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
            <h3 className="font-bold text-zinc-900 mb-4 flex items-center gap-2 border-b border-zinc-100 pb-3">
              <MessageCircle size={20} className="text-sky-500" /> SMS / WhatsApp Copy
            </h3>
            <div className="space-y-5">
              
              <div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Clock size={14} /> The Follow-Up (Ghosted)
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-zinc-700 bg-sky-50 p-3 rounded-lg border border-sky-100 italic">
                    "Hi [Name], this is [Name] with Star Cleaning! I just sent your estimate over to your email. Let me know if you have any questions or if you'd like to secure a spot on our schedule for next week. Have a great day!"
                  </p>
                  <p className="text-sm text-zinc-700 bg-zinc-50 p-3 rounded-lg border border-zinc-200 italic">
                    "Oi [Nome]! Aqui é a [Seu Nome] da Star Cleaning. Acabei de enviar o orçamento pro seu email. Me avise se tiver alguma dúvida ou se quiser garantir uma vaga na nossa agenda para a próxima semana. Tenha um ótimo dia!"
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Heart size={14} className="text-red-500" /> The Booking Confirmation
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-zinc-700 bg-emerald-50 p-3 rounded-lg border border-emerald-100 italic">
                    "Great news, [Name]! Your cleaning is scheduled for [Date] at [Time]. We can't wait to make your home sparkle! 🌟"
                  </p>
                  <p className="text-sm text-zinc-700 bg-zinc-50 p-3 rounded-lg border border-zinc-200 italic">
                    "Ótima notícia, [Nome]! Sua limpeza está agendada para [Data] às [Hora]. Mal podemos esperar para deixar sua casa brilhando! 🌟"
                  </p>
                </div>
              </div>

            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-md">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              <ShieldAlert size={20} /> Using Negotiation Margins
            </h3>
            <p className="text-sm text-amber-50 mb-4 leading-relaxed">
              When using the Estimate Generator, check the yellow box on the right.
            </p>
            <ul className="text-sm space-y-3 text-amber-50 font-medium">
              <li className="flex items-start gap-2 bg-white/10 p-2 rounded-lg">
                <strong className="text-white shrink-0">Rule 1:</strong> 
                <span>Never offer a discount first. Sell the value (time, peace of mind).</span>
              </li>
              <li className="flex items-start gap-2 bg-white/10 p-2 rounded-lg">
                <strong className="text-white shrink-0">Rule 2:</strong> 
                <span>If price is the ONLY objection, use the <strong>10% margin</strong> to close on the phone.</span>
              </li>
              <li className="flex items-start gap-2 bg-red-500/30 p-2 rounded-lg border border-red-500/50">
                <strong className="text-white shrink-0 text-red-100">Rule 3:</strong> 
                <span>The <strong>15% margin</strong> is your absolute bottom limit. Only use it to save a lost deal.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}

