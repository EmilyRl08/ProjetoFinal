import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://ojsgqeckcojbtkltthlo.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_IU0XKuXmX3bI16bSbRugFw_PCrKnD72";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);