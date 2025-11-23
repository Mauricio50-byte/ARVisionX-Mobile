import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Target } from '../models/target.model';
import { SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class TargetsService {
  private subject = new BehaviorSubject<Target>({
    id: 1,
    name: 'Hiro',
    type: 'preset',
    pattern: 'hiro',
    modelUrl: '',
    scale: '1 1 1'
  });
  private targetsList = new BehaviorSubject<Target[]>([this.subject.value]);
  private supabase: SupabaseClient | null = null;
  private bucketName: string = (environment as any).supabase.storageBucket || 'assets';
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private ensureInit() {
    if (!this.supabase) {
      this.supabase = this.auth.getSupabaseClient();
    }
  }

  private async ensureBucket(): Promise<boolean> {
    this.ensureInit();
    try {
      const res = await this.supabase!.storage.from(this.bucketName).list('');
      return !res.error;
    } catch {
      return false;
    }
  }

  getActiveTarget(): Observable<Target> {
    return this.subject.asObservable();
  }

  setActiveTarget(target: Target) {
    this.subject.next(target);
  }

  getTargets(): Observable<Target[]> {
    return this.targetsList.asObservable();
  }

  async fetchTargets(): Promise<void> {
    try {
      this.ensureInit();
      const uid = this.auth.getFirebaseUid();
      if (!uid) {
        this.targetsList.next([this.subject.value]);
        return;
      }
      const { data, error, status } = await this.supabase!.from('targets').select('*').eq('user_id', uid);
      if (!error && data && data.length) {
        const list = (data as any[]).map(x => ({
          id: x.id,
          name: x.name,
          type: x.type,
          pattern: x.pattern,
          modelUrl: x.modelUrl,
          scale: x.scale,
          userId: x.user_id || uid
        })) as Target[];
        this.targetsList.next(list);
        this.subject.next(list[0]);
        return;
      }
      if (status === 404) {
        this.targetsList.next([this.subject.value]);
        return;
      }
    } catch {
      this.targetsList.next([this.subject.value]);
    }
  }

  async getTargetById(id: number): Promise<Target | null> {
    this.ensureInit();
    const uid = this.auth.getFirebaseUid();
    if (!uid || !id) return null;
    const { data, error } = await this.supabase!.from('targets').select('*').eq('user_id', uid).eq('id', id).maybeSingle();
    if (error || !data) return null;
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      pattern: data.pattern,
      modelUrl: data.modelUrl,
      scale: data.scale,
      userId: data.user_id || uid
    } as Target;
  }

  async createTarget(target: Target): Promise<boolean> {
    const t: Target = { ...target, id: undefined };
    return await this.upsertTarget(t);
  }

  async upsertTarget(target: Target): Promise<boolean> {
    this.ensureInit();
    const uid = this.auth.getFirebaseUid();
    if (!uid) return false;
    const payload: any = {
      ...(target.id ? { id: target.id } : {}),
      name: target.name,
      type: target.type,
      pattern: target.pattern,
      modelUrl: target.modelUrl,
      scale: target.scale,
      user_id: uid
    };
    const { error } = await this.supabase!.from('targets').upsert(payload);
    if (error) return false;
    await this.fetchTargets();
    this.setActiveTarget({ ...target, userId: uid });
    return true;
  }

  async deleteTarget(id: number): Promise<boolean> {
    this.ensureInit();
    const uid = this.auth.getFirebaseUid();
    if (!uid || !id) return false;
    const { error } = await this.supabase!.from('targets').delete().eq('id', id).eq('user_id', uid);
    if (error) return false;
    await this.fetchTargets();
    return true;
  }

  async fetchTargetsFromJson(url: string): Promise<void> {
    try {
      const data = await this.http.get<Target[]>(url).toPromise();
      if (data && data.length) {
        this.targetsList.next(data);
        this.subject.next(data[0]);
      }
    } catch {
      this.targetsList.next([this.subject.value]);
    }
  }

  async uploadFile(file: File, folder: string): Promise<{ url: string | null, error?: string }> {
    this.ensureInit();
    const uid = this.auth.getFirebaseUid();
    if (!uid) return { url: null, error: 'Usuario no autenticado' };
    const ok = await this.ensureBucket();
    if (!ok) return { url: null, error: `Bucket ${this.bucketName} no existe o no es accesible` };
    const safeName = file.name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9_.-]/g, '');
    const path = `users/${uid}/${folder}/${Date.now()}-${safeName}`;
    const up = await this.supabase!.storage.from(this.bucketName).upload(path, file, { upsert: true });
    if (up.error) return { url: null, error: up.error.message };
    const pub = this.supabase!.storage.from(this.bucketName).getPublicUrl(path);
    return { url: pub.data.publicUrl || null };
  }

  setTargetsFromList(list: Target[]) {
    if (list && list.length) {
      this.targetsList.next(list);
      this.subject.next(list[0]);
    }
  }
}
