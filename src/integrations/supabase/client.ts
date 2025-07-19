
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://dnduvbyjzggljuvbwwlt.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuZHV2YnlqemdnbGp1dmJ3d2x0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MjgxNjEsImV4cCI6MjA2ODMwNDE2MX0.IeSqRODDT3ZJCXZQZ-l3VLKk0dpSoWF59iYCiF6r_h4";



export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});