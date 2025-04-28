// src/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = 'https://plwtrrnmwjgkyuhhwcxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsd3Rycm5td2pna3l1aGh3Y3huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NzQwNTAsImV4cCI6MjA1OTQ1MDA1MH0.79BAEowAb04foqX40tHm11sq5AfxWL0CLxLQ7QXlA8g';

export const supabase = createClient(supabaseUrl, supabaseKey);
