import re

with open('./app/leads/page.tsx', 'r') as f:
    content = f.read()

content = content.replace(
"""                  {/* Notes / Obs */}
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Observações & Notas</label>""",
"""                  {/* Referral Checkbox */}
                  <div className="col-span-2 flex items-center gap-2 bg-zinc-50 p-3 rounded-lg border border-zinc-200">
                    <input
                      type="checkbox"
                      id="isReferral"
                      checked={!!newLeadForm.is_referral}
                      onChange={e => setNewLeadForm({...newLeadForm, is_referral: e.target.checked})}
                      className="w-4 h-4 text-emerald-600 rounded border-zinc-300 focus:ring-emerald-500"
                    />
                    <label htmlFor="isReferral" className="text-sm font-semibold text-zinc-700 cursor-pointer">
                      {language === 'en' ? 'Is this lead a referral?' : 'Este lead é de indicação?'}
                    </label>
                  </div>

                  {/* Notes / Obs */}
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Observações & Notas</label>"""
)

with open('./app/leads/page.tsx', 'w') as f:
    f.write(content)
