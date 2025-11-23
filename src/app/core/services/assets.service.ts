import { Injectable, inject } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AssetsService {
  private auth = inject(AuthService);
  private supabase: SupabaseClient | null = null;
  private bucketName: string = (environment as any).supabase.storageBucket || 'assets';

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

  safeFileName(name: string): string {
    return name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9_.-]/g, '');
  }

  getPublicUrl(path: string): string | null {
    this.ensureInit();
    const r = this.supabase!.storage.from(this.bucketName).getPublicUrl(path);
    return r.data.publicUrl || null;
  }

  async list(folder: string): Promise<string[]> {
    this.ensureInit();
    try {
      const { data, error } = await this.supabase!.storage.from(this.bucketName).list(folder);
      if (error || !data) return [];
      return data.map(x => x.name);
    } catch {
      return [];
    }
  }

  async uploadAsset(file: File, folder: string): Promise<{ url: string | null, error?: string }> {
    this.ensureInit();
    const uid = this.auth.getFirebaseUid();
    if (!uid) return { url: null, error: 'Usuario no autenticado' };
    const ok = await this.ensureBucket();
    if (!ok) return { url: null, error: `Bucket ${this.bucketName} no existe o no es accesible` };
    const safeName = this.safeFileName(file.name);
    const path = `users/${uid}/${folder}/${Date.now()}-${safeName}`;
    const up = await this.supabase!.storage.from(this.bucketName).upload(path, file, { upsert: true });
    if (up.error) return { url: null, error: up.error.message };
    const pub = this.supabase!.storage.from(this.bucketName).getPublicUrl(path);
    return { url: pub.data.publicUrl || null };
  }
}
