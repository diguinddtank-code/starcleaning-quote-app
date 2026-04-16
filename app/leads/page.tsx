'use client';

import { useQuote } from '@/context/QuoteContext';
import { useSettings } from '@/context/SettingsContext';
import { Trash2, User, Phone, Calendar, DollarSign, FileText, Printer, CheckCircle2, MoreHorizontal, Mail, MapPin, Edit3, X, Save } from 'lucide-react';
import { useState } from 'react';
import { SavedQuote } from '@/lib/types';
import { QuoteDocument } from '@/components/QuoteDocument';
import { motion, AnimatePresence } from 'motion/react';

export default function LeadsPage() {
  const { savedQuotes, deleteQuote, updateLead } = useQuote();
  const { settings } = useSettings();
  
  const [selectedQuote, setSelectedQuote] = useState<SavedQuote | null>(null);
  const [editingLead, setEditingLead] = useState<SavedQuote | null>(null);
  
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const [editForm, setEditForm] = useState<Partial<SavedQuote>>({});
  const [isSaving, setIsSaving] = useState(false);

  const filteredQuotes = savedQuotes.filter(q => {
    if (filterStatus === 'all') return true;
    return (q.status || 'new') === filterStatus;
  });

  const handleEditClick = (quote: SavedQuote) => {
    setEditingLead(quote);
    setEditForm({
      customerName: quote.customerName || '',
      customerPhone: quote.customerPhone || '',
      customerEmail: quote.customerEmail || '',
      customerAddress: quote.customerAddress || '',
      notes: quote.notes || '',
      status: quote.status || 'new',
    });
  };

  const handleSaveLead = async () => {
    if (!editingLead) return;
    setIsSaving(true);
    await updateLead(editingLead.id, editForm);
    setIsSaving(false);
    setEditingLead(null);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'contacted': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'scheduled': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'lost': return 'bg-zinc-100 text-zinc-600 border-zinc-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const statusLabels = {
    new: 'New Lead',
    contacted: 'Contacted',
    scheduled: 'Scheduled',
    completed: 'Completed',
    lost: 'Lost',
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
      <header className="mb-6 border-b border-zinc-200 pb-6 print:hidden flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">Lead Management</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage generated estimates and track customer communication.</p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          >
            <option value="all">All Leads</option>
            <option value="new">New Leads</option>
            <option value="contacted">Contacted</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="lost">Lost</option>
          </select>
        </div>
      </header>

      {filteredQuotes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center shadow-sm print:hidden">
          <div className="w-16 h-16 bg-zinc-100 text-zinc-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={32} />
          </div>
          <h2 className="text-lg font-bold text-zinc-900 mb-2">No leads found</h2>
          <p className="text-sm text-zinc-500">Estimates saved will appear here as leads.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 print:hidden">
          {filteredQuotes.map((quote) => (
            <div 
              key={quote.id} 
              className="bg-white rounded-xl border border-zinc-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-sky-500/30 hover:shadow-md transition-all group"
            >
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider border ${getStatusColor(quote.status)}`}>
                    {statusLabels[(quote.status as keyof typeof statusLabels) || 'new']}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-50 text-sky-700 rounded-md text-xs font-semibold uppercase tracking-wider">
                    {quote.serviceType}
                  </span>
                  <span className="text-zinc-400 text-xs font-medium flex items-center gap-1 ml-auto md:ml-0">
                    <Calendar size={14} /> {new Date(quote.date).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex flex-col">
                  <span className="font-bold text-lg text-zinc-900">{quote.customerName || 'Unnamed Lead'}</span>
                  <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-zinc-600">
                    {quote.customerPhone && <span className="flex items-center gap-1.5"><Phone size={14} className="text-zinc-400" /> {quote.customerPhone}</span>}
                    {quote.customerEmail && <span className="flex items-center gap-1.5"><Mail size={14} className="text-zinc-400" /> {quote.customerEmail}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:flex-col md:items-end gap-3 border-t md:border-t-0 md:border-l border-zinc-100 pt-4 md:pt-0 md:pl-6">
                <div className="text-2xl font-bold text-zinc-900 flex items-center tracking-tight">
                  <DollarSign size={20} className="text-zinc-400" />
                  {quote.total}
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleEditClick(quote)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
                  >
                    <Edit3 size={14} /> Manage
                  </button>
                  <button 
                    onClick={() => setSelectedQuote(quote)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-600 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors"
                  >
                    <FileText size={14} /> View PDF
                  </button>
                  <button 
                    onClick={() => deleteQuote(quote.id)}
                    className="p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
                    title="Delete Lead"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Lead Drawer/Modal */}
      <AnimatePresence>
        {editingLead && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-50 overflow-y-auto flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-4 border-b border-zinc-200">
                <h3 className="font-bold text-lg text-zinc-900">Manage Lead</h3>
                <button onClick={() => setEditingLead(null)} className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 uppercase">Customer Name</label>
                    <input 
                      type="text" 
                      value={editForm.customerName} 
                      onChange={e => setEditForm({...editForm, customerName: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 uppercase">Status</label>
                    <select 
                      value={editForm.status} 
                      onChange={e => setEditForm({...editForm, status: e.target.value as any})}
                      className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-2 focus:ring-sky-500/20 bg-white"
                    >
                      <option value="new">New Lead</option>
                      <option value="contacted">Contacted</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="lost">Lost</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 uppercase">Phone</label>
                    <input 
                      type="tel" 
                      value={editForm.customerPhone} 
                      onChange={e => setEditForm({...editForm, customerPhone: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 uppercase">Email</label>
                    <input 
                      type="email" 
                      value={editForm.customerEmail} 
                      onChange={e => setEditForm({...editForm, customerEmail: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>
                  <div className="col-span-1 md:col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 uppercase">Address</label>
                    <input 
                      type="text" 
                      value={editForm.customerAddress} 
                      onChange={e => setEditForm({...editForm, customerAddress: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>
                  <div className="col-span-1 md:col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 uppercase">Internal Notes</label>
                    <textarea 
                      value={editForm.notes} 
                      onChange={e => setEditForm({...editForm, notes: e.target.value})}
                      rows={4}
                      className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-2 focus:ring-sky-500/20 resize-none"
                      placeholder="Add notes about the client or estimate..."
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-zinc-200 bg-zinc-50 sm:rounded-b-2xl flex justify-end gap-3">
                <button 
                  onClick={() => setEditingLead(null)}
                  className="px-4 py-2 bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-sm font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveLead}
                  disabled={isSaving}
                  className="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Document Modal */}
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
                  <div className="flex items-center gap-2 text-zinc-700 font-medium">
                    <FileText size={20} /> Estimate Document
                  </div>
                  <div className="flex w-full sm:w-auto gap-2">
                    <button onClick={() => window.print()} className="flex-1 sm:flex-none justify-center px-4 py-2 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2">
                      <Printer size={16} /> Print / PDF
                    </button>
                    <button onClick={() => setSelectedQuote(null)} className="flex-1 sm:flex-none justify-center px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-lg transition-colors">
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
