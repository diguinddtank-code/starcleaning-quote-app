import re

with open('./app/kpi/page.tsx', 'r') as f:
    content = f.read()

content = content.replace(
"""            </div>

            {/* Charts Row */}""",
"""            </div>

            {/* Lead Sources Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest">
                    {language === 'en' ? 'Internet Leads' : 'Leads de Internet'}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                    <Users size={15} />
                  </div>
                </div>
                <div>
                  <div className="flex items-end gap-3">
                    <h3 className="text-2xl font-black text-zinc-900">{internetCount}</h3>
                    <span className="text-xs font-semibold text-zinc-500 mb-1">{language === 'en' ? 'Converted:' : 'Convertidos:'} {internetScheduled} ({internetConversion}%)</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1">{language === 'en' ? 'Total Internet' : 'Total Internet'}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest">
                    {language === 'en' ? 'Referral Leads' : 'Leads de Indicação'}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Users size={15} />
                  </div>
                </div>
                <div>
                  <div className="flex items-end gap-3">
                    <h3 className="text-2xl font-black text-zinc-900">{referralCount}</h3>
                    <span className="text-xs font-semibold text-zinc-500 mb-1">{language === 'en' ? 'Converted:' : 'Convertidos:'} {referralScheduled} ({referralConversion}%)</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1">{language === 'en' ? 'Total Referral' : 'Total Indicação'}</p>
                </div>
              </div>
            </div>

            {/* Charts Row */}"""
)

with open('./app/kpi/page.tsx', 'w') as f:
    f.write(content)
