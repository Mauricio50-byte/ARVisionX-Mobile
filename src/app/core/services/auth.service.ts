import { Injectable } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut, User, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, Database, ref, set, update, serverTimestamp, onValue } from 'firebase/database';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private app: FirebaseApp | null = null;
  private auth: Auth | null = null;
  private db: Database | null = null;
  private supabase: SupabaseClient | null = null;

  private ensureInit() {
    if (!this.app) {
      this.app = initializeApp(environment.firebase);
      this.auth = getAuth(this.app);
      this.db = getDatabase(this.app);
    }
    if (!this.supabase) {
      this.supabase = createClient(environment.supabase.url, environment.supabase.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: false,
          detectSessionInUrl: false,
          storageKey: 'ar-vision-x-mobile-auth'
        },
        db: {
          schema: 'public'
        },
        global: {
          headers: {
            apikey: environment.supabase.anonKey,
            Authorization: `Bearer ${environment.supabase.anonKey}`
          }
        }
      });
    }
  }

  async login(email: string, password: string): Promise<User> {
    this.ensureInit();
    const res = await signInWithEmailAndPassword(this.auth!, email, password);
    try { await res.user.getIdToken(true); } catch {}
    try {
      await update(ref(this.db!, `users/${res.user.uid}`), {
        id: res.user.uid,
        email: res.user.email,
        displayName: res.user.displayName || '',
        lastLoginAt: serverTimestamp()
      });
    } catch {}
    return res.user;
  }

  async register(displayName: string, email: string, password: string): Promise<User> {
    this.ensureInit();
    const res = await createUserWithEmailAndPassword(this.auth!, email, password);
    try { await res.user.getIdToken(true); } catch {}
    await updateProfile(res.user, { displayName });
    try {
      await set(ref(this.db!, `users/${res.user.uid}`), {
        id: res.user.uid,
        email: res.user.email,
        displayName,
        createdAt: serverTimestamp()
      });
    } catch {}
    return res.user;
  }

  async logout(): Promise<void> {
    this.ensureInit();
    await signOut(this.auth!);
  }

  getCurrentUser(): User | null {
    this.ensureInit();
    return this.auth!.currentUser;
  }

  getFirebaseUid(): string | null {
    this.ensureInit();
    return this.auth!.currentUser?.uid || null;
  }

  async getSupabaseUserId(): Promise<string | null> {
    this.ensureInit();
    return null;
  }

  getSupabaseClient(): SupabaseClient {
    this.ensureInit();
    return this.supabase!;
  }

  async isAuthenticated(): Promise<boolean> {
    this.ensureInit();
    return new Promise<boolean>((resolve) => {
      onAuthStateChanged(this.auth!, (user) => resolve(!!user));
    });
  }

  userProfile$(uid: string): Observable<any> {
    this.ensureInit();
    return new Observable((subscriber) => {
      const r = ref(this.db!, `users/${uid}`);
      const unsubscribe = onValue(r, (snapshot) => subscriber.next(snapshot.val()));
      return () => unsubscribe();
    });
  }
}
