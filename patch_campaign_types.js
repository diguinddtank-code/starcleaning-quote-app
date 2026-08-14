const fs = require('fs');

// Patch types
let types = fs.readFileSync('lib/types.ts', 'utf8');
if (!types.includes('imageUrl?: string;')) {
    types = types.replace(/description: string;/g, "description: string;\n    imageUrl?: string;");
    fs.writeFileSync('lib/types.ts', types);
}

// Patch context
let ctx = fs.readFileSync('context/SettingsContext.tsx', 'utf8');
if (!ctx.includes('imageUrl: \'\'')) {
    ctx = ctx.replace(/description: ''\n\s*\}/g, "description: '',\n    imageUrl: ''\n  }");
    fs.writeFileSync('context/SettingsContext.tsx', ctx);
}
