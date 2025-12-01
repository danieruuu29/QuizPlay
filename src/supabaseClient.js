// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// GANTI DENGAN DATA DARI SUPABASE-MU!
const supabaseUrl = 'https://bvelvqjfnwqnascpjxaj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2ZWx2cWpmbndxbmFzY3BqeGFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3OTcxMjIsImV4cCI6MjA3OTM3MzEyMn0.HW31isQGBrlOGG_KQlo6JoN72qqr4jHTGdl6cguYjpQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;