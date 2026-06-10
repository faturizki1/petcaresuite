import { supabase } from '@/lib/supabase';

export interface AuthUserPayload {
  id: string;
  email: string;
  fullName: string;
  role: 'owner' | 'doctor' | 'staff' | 'customer';
  isActive: boolean;
}

export const authService = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error || !data.user) {
      throw new Error(error?.message ?? 'Unable to sign in');
    }

    const user = await this.fetchProfile(data.user.id, data.user.email ?? email);
    return { user, session: data.session };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  },

  async sendPasswordResetEmail(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) {
      throw new Error(error.message);
    }
  },

  async getCurrentUser() {
    const {
      data: { session },
      error
    } = await supabase.auth.getSession();

    if (error || !session?.user) {
      return null;
    }

    return this.fetchProfile(session.user.id, session.user.email ?? '');
  },

  async fetchProfile(userId: string, email: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, role, is_active')
      .eq('id', userId)
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? 'Unable to load user profile');
    }

    return {
      id: userId,
      email,
      fullName: data.full_name ?? 'Unknown User',
      role: data.role,
      isActive: data.is_active
    };
  }
,

  async createProfile(userId: string, email: string, fullName: string, role: AuthUserPayload['role'] = 'customer') {
    const { data, error } = await supabase
      .from('profiles')
      .insert({ id: userId, email, full_name: fullName, role, is_active: true })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: userId,
      email,
      fullName: data.full_name ?? fullName,
      role: data.role,
      isActive: data.is_active
    };
  },

  async updateProfile(userId: string, updates: { fullName?: string; role?: AuthUserPayload['role']; isActive?: boolean }) {
    const payload: Record<string, any> = {};
    if (updates.fullName !== undefined) payload.full_name = updates.fullName;
    if (updates.role !== undefined) payload.role = updates.role;
    if (updates.isActive !== undefined) payload.is_active = updates.isActive;

    if (Object.keys(payload).length === 0) {
      throw new Error('No updates provided');
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: userId,
      email: data.email ?? '',
      fullName: data.full_name ?? '',
      role: data.role,
      isActive: data.is_active
    };
  }
};
