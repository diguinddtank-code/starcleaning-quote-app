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
                <p className="text-sm text-zinc-500 mb-2">Be super friendly and energetic. Put a smile on your face!</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <p className="text-xs font-bold text-slate-400 mb-2">🇺🇸 ENGLISH</p>
                    <p className="text-sm text-zinc-700 italic">
                      "Hi [Name]! This is [Your Name] from Star Cleaning. I saw you requested an estimate. How is your day going? I'm so excited to help you get your home sparkling!"
                    </p>
                  </div>
                  <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                    <p className="text-xs font-bold text-zinc-400 mb-2">🇧🇷 PORTUGUÊS</p>
                    <p className="text-sm text-zinc-700 italic">
                      "Oi [Nome]! Aqui é a [Seu Nome] da Star Cleaning. Vi que pediu um orçamento. Como está seu dia? Estou super animada para te ajudar a deixar sua casa brilhando!"
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="border-b border-zinc-100 p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="bg-sky-100 text-sky-700 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs">2</span>
                  <h3 className="font-bold text-zinc-900">Discovery & Pain Points (Descobrindo a Dor)</h3>
                </div>
                <p className="text-sm text-zinc-500 mb-2">Don't just ask what to clean. Ask <strong className="text-sky-600">WHY</strong> they need it. Are they working moms? Busy professionals?</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <p className="text-xs font-bold text-slate-400 mb-2">🇺🇸 ENGLISH</p>
                    <p className="text-sm text-zinc-700 italic">
                      "To make sure I give you exactly what you need, tell me a bit about your routine. Are you juggling work and kids? Just looking to reclaim your weekends? We know how exhausting it is, and we want to give you your free time back!"
                    </p>
                  </div>
                  <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                    <p className="text-xs font-bold text-zinc-400 mb-2">🇧🇷 PORTUGUÊS</p>
                    <p className="text-sm text-zinc-700 italic">
                      "Para te dar exatamente o que precisa, me conta sobre sua rotina. Correria com trabalho e crianças? Só querendo seus finais de semana de volta? Sabemos como é cansativo e queremos devolver seu tempo livre!"
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
                <p className="text-sm text-zinc-500 mb-2">Sell the feeling of a clean home. Mention safety (fully insured) and convenience (we bring supplies).</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <p className="text-xs font-bold text-slate-400 mb-2">🇺🇸 ENGLISH</p>
                    <p className="text-sm text-zinc-700 italic">
                      "Imagine coming home on Friday to a perfectly clean, fresh-smelling house. You don't have to lift a finger all weekend. Plus, we bring all supplies and are fully insured for your peace of mind. Your total investment to get your weekend back is <strong>$[Price]</strong>."
                    </p>
                  </div>
                  <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                    <p className="text-xs font-bold text-zinc-400 mb-2">🇧🇷 PORTUGUÊS</p>
                    <p className="text-sm text-zinc-700 italic">
                      "Imagina chegar sexta-feira numa casa cheirosa e limpinha. Você não vai mover um dedo no fim de semana. Levamos tudo e somos segurados para sua paz de espírito. O investimento para ter seu fds de volta é <strong>$[Preço]</strong>."
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
                <p className="text-sm text-zinc-500 mb-2">Assume the sale. Don't ask "do you want it?", ask "when do you want it?".</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <p className="text-xs font-bold text-slate-400 mb-2">🇺🇸 ENGLISH</p>
                    <p className="text-sm text-zinc-700 italic">
                      "I have my best team available this <strong>[Day]</strong> morning. Should I lock in that spot for you so you can just relax this weekend?"
                    </p>
                  </div>
                  <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                    <p className="text-xs font-bold text-zinc-400 mb-2">🇧🇷 PORTUGUÊS</p>
                    <p className="text-sm text-zinc-700 italic">
                      "Tenho minha melhor equipe livre na <strong>[Dia]</strong> de manhã. Posso reservar esse horário para você conseguir relaxar esse fim de semana?"
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
                      "I totally understand, [Name]. There are cheaper options out there, but with us, you're not just buying a quick wipe-down. You're buying your Saturday back, complete peace of mind with our fully insured pros, and hotel-quality cleaning. Isn't your free time worth that?"
                    </p>
                  </div>
                  <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 border-l-4 border-l-sky-500">
                    <p className="text-xs font-bold text-zinc-400 mb-2">🇧🇷 RESPOSTA EM PT</p>
                    <p className="text-sm text-zinc-700 italic">
                      "Eu entendo perfeitamente. Tem opções mais baratas, mas com a gente, você não paga só por uma faxina. Você está comprando o seu sábado de volta, paz de espírito com equipe segurada e limpeza nível hotel. Seu tempo livre não vale isso?"
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
                      "Of course! Husbands usually love the idea of not having to clean! Our schedule fills up super fast, though. How about I pencil you in for [Day] to hold the spot? If they say no, just text me and I'll cancel it, zero stress for you."
                    </p>
                  </div>
                  <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 border-l-4 border-l-sky-500">
                    <p className="text-xs font-bold text-zinc-400 mb-2">🇧🇷 RESPOSTA EM PT</p>
                    <p className="text-sm text-zinc-700 italic">
                      "Claro! Maridos geralmente amam a ideia de não ter que limpar nada! Mas nossa agenda enche rápido. Que tal eu pré-reservar a [Dia] só pra segurar a vaga? Se ele disser não, me manda um SMS e eu cancelo, sem estresse."
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
                  <Clock size={14} /> The "Ghosted" Follow-Up
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-zinc-700 bg-sky-50 p-3 rounded-lg border border-sky-100 italic">
                    "Hi [Name]! This is [Your Name] from Star Cleaning ✨ Just sent over your estimate. Imagine not having to clean this weekend! Have 2 mins to chat about it?"
                  </p>
                  <p className="text-sm text-zinc-700 bg-zinc-50 p-3 rounded-lg border border-zinc-200 italic">
                    "Oi [Nome]! Aqui é a [Seu Nome] da Star Cleaning ✨ Acabei de enviar seu orçamento. Imagina não ter que limpar a casa esse fds! Tem 2 minutinhos pra gente falar?"
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

