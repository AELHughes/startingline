"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabaseAdmin = exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const supabaseUrl = 'https://kjeoqaoinkcrbukoqjfn.supabase.co';
const supabaseAnonKey = 'sb_publishable_F1XuyCaFXBxc_ZM2iPXB2w_FALDVqIO';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqZW9xYW9pbmtjcmJ1a29xamZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzA4NzIzMywiZXhwIjoyMDcyNjYzMjMzfQ.s5J6hqsj2rASYiPyK6Ml7PGOEsqgbxOdxnhUPmadolg';
console.log('🔧 Supabase Config:', {
    url: supabaseUrl,
    anonKey: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'MISSING',
    serviceKey: supabaseServiceKey ? `${supabaseServiceKey.substring(0, 20)}...` : 'MISSING'
});
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseAnonKey);
exports.supabaseAdmin = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
//# sourceMappingURL=supabase.js.map