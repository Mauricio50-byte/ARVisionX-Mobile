import { Injectable } from '@angular/core';
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

  private ensureInit() {
    if (!this.supabase) {
      this.supabase = createClient(environment.supabase.url, environment.supabase.anonKey);
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
      const { data, error } = await this.supabase!.from('targets').select('*');
      if (!error && data && data.length) {
        const list = data as Target[];
        this.targetsList.next(list);
        this.subject.next(list[0]);
      }
    } catch {}
  }
}
