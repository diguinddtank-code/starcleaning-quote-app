/* eslint-disable react/no-unescaped-entities */
'use client';

import { BookOpen, Phone, Handshake, Brain, Heart, FileText, CheckCircle2 } from 'lucide-react';

export default function PlaybookPage() {
  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 pb-24 md:pb-8">
      <header className="mb-8 border-b border-zinc-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight flex items-center gap-3">
            <BookOpen className="text-sky-500" size={32} />
            Star Cleaning – Client Discovery & Sales
          </h1>
          <p className="text-sm text-zinc-500 mt-2 max-w-2xl">
            A Consultative Coaching Framework adapted for residential cleaning sales. Build trust, guide the client, and sell peace of mind.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Methodology */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-zinc-900 rounded-2xl p-6 text-white shadow-md">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Brain size={20} className="text-sky-400" /> Mindset Before the Call
            </h3>
            
            <div className="space-y-4">
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <p className="font-medium text-sky-300 mb-2 text-sm uppercase tracking-wider">This is not an intake form.</p>
                <p className="text-zinc-300 text-sm">This is a conversation. You are not "selling cleaning".</p>
              </div>

              <div>
                <p className="text-sm text-zinc-400 mb-2 uppercase tracking-wider font-semibold">You are Selling:</p>
                <ul className="space-y-2">
                  {['Relief', 'Peace of mind', 'Consistency', 'Time back', 'Less stress', 'A cleaner, calmer home'].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-zinc-200">
                      <CheckCircle2 size={16} className="text-emerald-400" /> {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-white/10 mt-4 text-sm text-zinc-300 space-y-3">
                <p>The client is already looking for help. That’s why they contacted us.</p>
                <p>Speak with confidence:</p>
                <ul className="list-disc pl-5 space-y-1 text-zinc-400">
                  <li>We’ve been in business for 18 years</li>
                  <li>We know how to take care of homes</li>
                  <li>We know how to simplify people’s lives</li>
                  <li>Our service genuinely helps families</li>
                </ul>
                <p className="font-medium text-white italic">"You are not convincing. You are guiding."</p>
              </div>
            </div>
          </div>

          <div className="bg-sky-50 rounded-2xl p-6 border border-sky-100 shadow-sm">
            <h3 className="font-bold text-lg text-sky-950 mb-3 flex items-center gap-2">
              <Heart size={20} className="text-sky-600" /> The Secret Sauce
            </h3>
            <p className="text-sm text-sky-800 leading-relaxed mb-4">
              This approach creates emotion BEFORE price, focuses on lifestyle improvement, and naturally makes the client emotionally sell themselves. 
            </p>
            <p className="text-sm font-bold text-sky-900 bg-white p-3 rounded-lg border border-sky-200">
              This is how luxury and high-retention service companies sell.
            </p>
          </div>
        </div>

        {/* Script Protocol */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
            <div className="bg-sky-600 p-5 flex items-center gap-3">
              <Phone className="text-white" size={24} />
              <h2 className="text-lg font-bold text-white">Consultative Sales Script</h2>
            </div>
            
            <div className="p-0">
              {/* Introduction */}
              <ScriptStep number="1" title="Introduction">
                <SpeechBubble text="Thank you so much for taking the time to speak with me today and for considering Star Cleaning LLC. I’d love to learn a little more about your home, your routine, and what you’re looking for so we can see what would be the best fit for you. Is that okay?" />
                <ContextHint text="Always ask permission first."/>
              </ScriptStep>

              {/* Discovery */}
              <ScriptStep number="2" title="Discovery Questions (Build Emotion)">
                <SpeechBubble text="Tell me — what made you start looking for cleaning help right now?" />
                <ContextHint text="Pause. Let them talk."/>
                <SpeechBubble text="Are you mostly looking for help because of time, stress, work schedule, kids, pets… or a combination of things?" secondary />
                <SpeechBubble text="What’s the hardest part about keeping up with the house right now?" secondary />
              </ScriptStep>

              {/* Awakening */}
              <ScriptStep number="3" title="Awakening Questions (The Magic)">
                <SpeechBubble text="If cleaning and keeping up with the house wasn’t constantly hanging over your head anymore… what would that change for you?" />
                <ContextHint text="Pause."/>
                <SpeechBubble text="What would you do with that extra time or mental energy?" secondary />
                <div className="mt-4 bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                  <p className="text-xs font-bold text-zinc-500 uppercase mb-2">Follow-up Prompts if needed:</p>
                  <ul className="text-sm text-zinc-700 space-y-1 list-disc pl-4">
                    <li>"Would weekends feel different?"</li>
                    <li>"Would you feel more comfortable having guests over?"</li>
                    <li>"Would it reduce stress at home?"</li>
                    <li>"Would you feel more relaxed after work?"</li>
                    <li>"Would it help your family routine?"</li>
                  </ul>
                </div>
              </ScriptStep>

              {/* Connection */}
              <ScriptStep number="4" title="Emotional Connection">
                <SpeechBubble text="How do you want your home to feel on a normal day?" />
                <div className="mt-3 flex gap-2 flex-wrap">
                  {['calm', 'peaceful', 'organized', 'fresh', 'less chaotic', 'manageable'].map(w => 
                    <span key={w} className="bg-sky-50 text-sky-700 px-2.5 py-1 rounded text-xs font-medium border border-sky-100">{w}</span>
                  )}
                </div>
                <div className="mt-4 border-t border-zinc-100 pt-4">
                  <ContextHint text="Repeat it back to them:"/>
                  <SpeechBubble text="So really what you’re looking for is a home that feels more peaceful and manageable without you carrying all the pressure yourself. I completely understand that." secondary />
                </div>
              </ScriptStep>

              {/* Solution */}
              <ScriptStep number="5" title="Position Star Cleaning as the Solution">
                <SpeechBubble text="That’s exactly what we help families with every day. We’ve been serving homes in the area for over 18 years, and our focus is creating consistency and peace of mind for our clients — not just cleaning surfaces." />
                <SpeechBubble text="We also assign one dedicated cleaner per home whenever possible, which creates better consistency, accountability, and attention to detail." secondary />
              </ScriptStep>

              {/* Transition */}
              <ScriptStep number="6" title="Transition Into Practical Questions">
                <SpeechBubble text="Let me ask you a couple quick questions about the home so I can give you the most accurate recommendation." />
                <ContextHint text="Then move naturally into: Address, Sq footage, Beds/Baths, Pets, Frequency preference, etc."/>
              </ScriptStep>

              {/* Present Service */}
              <ScriptStep number="7" title="Present the Service (Confidently)">
                <SpeechBubble text="Based on what you shared with me, I’d strongly recommend starting with our Initial Deep Cleaning." />
                <SpeechBubble text="This allows us to fully reset the home and get everything to a maintenance-ready condition so future visits are easier, faster, and more consistent." secondary />
                <ContextHint text="Then explain briefly: kitchens/bathrooms, dusting/detail work, floors, high-touch areas, overall reset."/>
              </ScriptStep>

              {/* Pricing */}
              <ScriptStep number="8" title="Pricing Confidence">
                <SpeechBubble text="For a home your size, that would typically run approximately $___ to $___." type="price" />
                <div className="mt-4 bg-red-50 p-4 rounded-xl border border-red-100 flex items-start gap-3">
                  <Handshake className="text-red-500 shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="text-sm font-bold text-red-900">THEN STOP TALKING.</p>
                    <p className="text-sm text-red-700 mt-1">Never apologize for pricing. Never sound unsure.</p>
                  </div>
                </div>
              </ScriptStep>

              {/* Close */}
              <ScriptStep number="9" title="Close with Leadership" isLast>
                <SpeechBubble text="Most of our clients tell us the biggest difference isn’t just having a cleaner home — it’s getting their time and peace of mind back." />
                <SpeechBubble text="Let’s go ahead and find a good day for your first cleaning. Would Tuesday or Thursday work better for you?" secondary />
                <ContextHint text="Always give two scheduling options."/>
              </ScriptStep>
            </div>
          </section>

          {/* Objections */}
          <section className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
            <div className="bg-stone-100 p-5 flex items-center gap-3 border-b border-zinc-200">
              <FileText className="text-stone-600" size={24} />
              <h2 className="text-lg font-bold text-stone-900">What if they say: "I'm just shopping around"?</h2>
            </div>
            <div className="p-6">
              <SpeechBubble text="Absolutely — and honestly, that’s smart. What I’d love to do is send you everything in writing along with our first-time client offer so you have it handy while comparing options. What’s the best email for you?" />
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}

// Helpers
function ScriptStep({ number, title, children, isLast }: { number: string, title: string, children: React.ReactNode, isLast?: boolean }) {
  return (
    <div className={`p-6 border-zinc-100 ${!isLast ? 'border-b' : ''}`}>
      <div className="flex items-center gap-3 mb-4">
        <span className="bg-sky-100 text-sky-700 w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm shrink-0">{number}</span>
        <h3 className="font-bold text-zinc-900 text-lg">{title}</h3>
      </div>
      <div>{children}</div>
    </div>
  );
}

function SpeechBubble({ text, secondary, type }: { text: string, secondary?: boolean, type?: 'price' }) {
  let bgClass = secondary ? 'bg-zinc-50 border-zinc-200 text-zinc-700' : 'bg-sky-50 border-sky-200 text-sky-900';
  if (type === 'price') bgClass = 'bg-emerald-50 border-emerald-200 text-emerald-900 font-medium text-base';
  
  return (
    <div className={`p-4 rounded-xl border ${bgClass} mb-3 italic`}>
      "{text}"
    </div>
  );
}

function ContextHint({ text }: { text: string }) {
  return (
    <div className="text-sm font-medium text-zinc-500 mb-3 flex items-center gap-2">
      <span className="w-1.5 h-1.5 rounded-full bg-zinc-300"></span>
      {text}
    </div>
  );
}

