import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Target } from '../models/target.model';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

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

  constructor(private http: HttpClient) {}

  private ensureInit() {
    if (!this.supabase) {
      this.supabase = createClient(environment.supabase.url, environment.supabase.anonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      });
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
      const { data, error, status } = await this.supabase!.from('targets').select('*');
      if (!error && data && data.length) {
        const list = data as Target[];
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

  async upsertTarget(target: Target): Promise<boolean> {
    this.ensureInit();
    const payload: any = {
      id: target.id || Date.now(),
      name: target.name,
      type: target.type,
      pattern: target.pattern,
      modelUrl: target.modelUrl,
      scale: target.scale
    };
    const { error } = await this.supabase!.from('targets').upsert(payload);
    if (error) return false;
    await this.fetchTargets();
    this.setActiveTarget(payload as Target);
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
    const ok = await this.ensureBucket();
    if (!ok) return { url: null, error: `Bucket ${this.bucketName} no existe o no es accesible` };
    const safeName = file.name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9_.-]/g, '');
    const path = `${folder}/${Date.now()}-${safeName}`;
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
