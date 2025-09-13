import { config } from "../config/dotenv";
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);