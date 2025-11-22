import { Injectable } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut, User } from 'firebase/auth';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private app: FirebaseApp | null = null;
  private auth: Auth | null = null;

  private ensureInit() {
    if (!this.app) {
      this.app = initializeApp(environment.firebase);
      this.auth = getAuth(this.app);
    }
  }

  async login(email: string, password: string): Promise<User> {
    this.ensureInit();
    const res = await signInWithEmailAndPassword(this.auth!, email, password);
    return res.user;
  }

  async register(displayName: string, email: string, password: string): Promise<User> {
    this.ensureInit();
    const res = await createUserWithEmailAndPassword(this.auth!, email, password);
    await updateProfile(res.user, { displayName });
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
}
