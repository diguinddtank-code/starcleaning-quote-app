const fs = require('fs');

let content = fs.readFileSync('app/campanhas/page.tsx', 'utf8');

const startMarker = `{/* Premium Analytics / Health Section */}`;
const endMarker = `</>`; // Note: Need to be careful here to match the exact end of that block.

// Instead of regex, let's just find the exact block.
const blockToRemove = `{/* Premium Analytics / Health Section */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 text-emerald-500/10 transition-transform group-hover:scale-110">
                      <Flame size={80} />
                    </div>
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center mb-6 relative z-10 border border-emerald-100">
                      <Flame size={24} />
                    </div>
                    <h4 className="text-sm font-black text-zinc-500 uppercase tracking-widest mb-1 relative z-10">
                      {language === 'en' ? 'Campaign Status' : 'Status da Campanha'}
                    </h4>
                    <p className="text-2xl font-black text-zinc-900 relative z-10">
                      {language === 'en' ? 'Optimal & Live' : 'Otimizada & Ativa'}
                    </p>
                  </div>

                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 text-rose-500/5 transition-transform group-hover:scale-110">
                      <Users size={80} />
                    </div>
                    <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center mb-6 relative z-10 border border-rose-100">
                      <Users size={24} />
                    </div>
                    <h4 className="text-sm font-black text-zinc-500 uppercase tracking-widest mb-1 relative z-10">
                      {language === 'en' ? 'Engaged Clients' : 'Clientes Engajados'}
                    </h4>
                    <div className="flex items-baseline gap-2 relative z-10">
                      <p className="text-2xl font-black text-zinc-900">Tracking...</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 text-zinc-900/5 transition-transform group-hover:scale-110">
                      <Tag size={80} />
                    </div>
                    <div className="w-12 h-12 bg-zinc-100 text-zinc-900 rounded-xl flex items-center justify-center mb-6 relative z-10 border border-zinc-200">
                      <Tag size={24} />
                    </div>
                    <h4 className="text-sm font-black text-zinc-500 uppercase tracking-widest mb-1 relative z-10">
                      {language === 'en' ? 'Estimated ROI' : 'Estimativa de ROI'}
                    </h4>
                    <div className="flex items-baseline gap-2 relative z-10">
                      <p className="text-2xl font-black text-zinc-900">Analysis</p>
                    </div>
                  </div>
                </div>`;

if (content.includes(blockToRemove)) {
    content = content.replace(blockToRemove, "");
    fs.writeFileSync('app/campanhas/page.tsx', content);
    console.log("Successfully removed analytics block");
} else {
    console.log("Block not found. Falling back to regex...");
    const regex = /\{\/\* Premium Analytics \/ Health Section \*\/\}[\s\S]*?(?=<\/>)/;
    if (regex.test(content)) {
        content = content.replace(regex, "");
        fs.writeFileSync('app/campanhas/page.tsx', content);
        console.log("Successfully removed via regex");
    } else {
        console.log("Could not find block with regex either.");
    }
}
