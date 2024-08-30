// src/supabaseClient.js
import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://umkaqxgnqgsvzngsgpeh.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVta2FxeGducWdzdnpuZ3NncGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjA3MjA5NDYsImV4cCI6MjAzNjI5Njk0Nn0.F2KBWbtCvdNNwfPG0PDetHymgh29_RQPpkASya_KVto";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
