import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config(); 

const supabaseUrl = "https://lpascrtwcrahykjkfqoo.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwYXNjcnR3Y3JhaHlramtmcW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5NzQ0NDIsImV4cCI6MjA1OTU1MDQ0Mn0.jyqV34f68CbCaHH5ngmdF_PCFtT1VTEOsRimcXYbbk4"
const supabase = createClient(supabaseUrl, supabaseKey);

const { data, error } = await supabase.from('exercise_library').select();
console.log(data);
