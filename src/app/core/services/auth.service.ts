import { Injectable } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut, User, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, Firestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private app: FirebaseApp | null = null;
  private auth: Auth | null = null;
  private firestore: Firestore | null = null;

  private ensureInit() {
    if (!this.app) {
      this.app = initializeApp(environment.firebase);
      this.auth = getAuth(this.app);
      this.firestore = getFirestore(this.app);
    }
  }

  async login(email: string, password: string): Promise<User> {
    this.ensureInit();
    const res = await signInWithEmailAndPassword(this.auth!, email, password);
    try {
      await setDoc(doc(this.firestore!, 'users', res.user.uid), {
        id: res.user.uid,
        email: res.user.email,
        displayName: res.user.displayName || '',
        lastLoginAt: serverTimestamp()
      }, { merge: true });
    } catch {}
    return res.user;
  }

  async register(displayName: string, email: string, password: string): Promise<User> {
    this.ensureInit();
    const res = await createUserWithEmailAndPassword(this.auth!, email, password);
    await updateProfile(res.user, { displayName });
    try {
      await setDoc(doc(this.firestore!, 'users', res.user.uid), {
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

  async isAuthenticated(): Promise<boolean> {
    this.ensureInit();
    return new Promise<boolean>((resolve) => {
      onAuthStateChanged(this.auth!, (user) => resolve(!!user));
    });
  }
}
