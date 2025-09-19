import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ynkjxqxzkktojebpxnnq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlua2p4cXh6a2t0b2plYnB4bm5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMTA1NjcsImV4cCI6MjA3Mzc4NjU2N30.4hRETL9jWTI5LKwTwXyOICHa2Mb_TBfiZ2swnCr_XsI';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database types
export interface Admin {
  id: string;
  username: string;
  email: string;
  password: string;
  profile_picture?: string;
  created_at: string;
}

export interface Review {
  id: string;
  client_name: string;
  review_text: string;
  rating: number;
  created_at: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  created_at: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  available: boolean;
  image_url?: string;
  created_at: string;
}

// Auth functions
export const signInAdmin = async (email: string, password: string) => {
  try {
    // Query admin table for credentials
    const { data: admin, error } = await supabase
      .from('admin')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !admin) {
      throw new Error('Invalid credentials');
    }

    // For production, implement proper password hashing (bcrypt)
    // For now, simple comparison (you should hash passwords!)
    if (admin.password !== password) {
      throw new Error('Invalid credentials');
    }

    // Store admin session in localStorage
    localStorage.setItem('admin_session', JSON.stringify({
      id: admin.id,
      username: admin.username,
      email: admin.email,
      profile_picture: admin.profile_picture
    }));

    return { data: admin, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

export const signOutAdmin = () => {
  localStorage.removeItem('admin_session');
};

export const getCurrentAdmin = () => {
  const session = localStorage.getItem('admin_session');
  return session ? JSON.parse(session) : null;
};