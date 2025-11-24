import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TargetsService } from '../../core/services/targets.service';
import { Target } from '../../core/models/target.model';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private targetsService = inject(TargetsService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastController);
  targets: Target[] = [];
  form = this.fb.group({
    id: [null as number | null],
    name: ['', [Validators.required]],
    type: ['pattern', [Validators.required]],
    pattern: ['', [Validators.required]],
    modelUrl: ['', [Validators.required]],
    scale: ['1 1 1', [Validators.required]]
  });
  openTargetsModal = false;
  openImportModal = false;
  saving = false;
  uploadingPattern = false;
  uploadingModel = false;
  displayName = '';
  private maxSizeBytes = 10 * 1024 * 1024;
  presets: string[] = ['hiro', 'kanji'];
  selectedPreset = 'hiro';
  private lastPatternUrl = '';

  ngOnInit() {
    this.targetsService.getTargets().subscribe(list => { this.targets = list; });
    this.targetsService.fetchTargets();
    const u = this.auth.getCurrentUser();
    if (u) {
      this.auth.userProfile$(u.uid).subscribe(p => this.displayName = p?.displayName || '');
    }
    this.form.controls.type.valueChanges.subscribe(v => {
      if (v === 'preset') {
        this.lastPatternUrl = (this.form.value.pattern || this.lastPatternUrl) as string;
        this.form.patchValue({ pattern: this.selectedPreset });
      } else {
        const restore = this.lastPatternUrl || '';
        this.form.patchValue({ pattern: restore });
      }
    });
  }

  openProfileFromMenu() {
    window.dispatchEvent(new Event('open-profile'));
  }

  navigateArFromMenu() {
    this.router.navigate(['/ar']);
  }

  async logoutFromMenu() {
    await this.auth.logout();
    this.router.navigate(['/login']);
  }

  async logout() {
    await this.auth.logout();
    this.router.navigate(['/login']);
  }


  onTargetChange(ev: any) {
    const id = ev.detail?.value;
    const t = this.targets.find(x => x.id === id);
    if (t) {
      this.targetsService.setActiveTarget(t);
      this.form.patchValue({
        id: (t.id ?? null) as number | null,
        name: t.name,
        type: t.type,
        pattern: t.pattern,
        modelUrl: t.modelUrl,
        scale: t.scale
      });
      if (t.type === 'pattern') {
        this.lastPatternUrl = t.pattern || '';
      } else {
        this.lastPatternUrl = this.lastPatternUrl;
      }
    }
  }

  editTarget(t: Target) {
    this.targetsService.setActiveTarget(t);
    this.onTargetChange({ detail: { value: t.id } });
  }

  newTarget() {
    this.form.patchValue({ id: null, name: '', type: 'pattern', pattern: '', modelUrl: '', scale: '1 1 1' });
    this.lastPatternUrl = '';
  }

  openTargets() {
    this.openTargetsModal = true;
  }

  onTableEdit(t: Target) {
    this.editTarget(t);
    this.openTargetsModal = false;
  }

  onTableDelete(id: number) {
    this.form.patchValue({ id });
    this.deleteTarget();
  }

  onPresetChange(ev: any) {
    const val = (ev.detail?.value || '').toString();
    if (this.presets.includes(val)) {
      this.selectedPreset = val;
      this.form.patchValue({ pattern: val });
    }
  }

  openImportJson() {
    this.openImportModal = true;
  }


  async saveTarget() {
    if (this.form.invalid || this.saving) return;
    this.saving = true;
    const ok = await this.targetsService.upsertTarget(this.form.value as Target);
    await this.presentToast(ok ? 'Target guardado' : 'Error al guardar target (tabla/políticas)');
    this.saving = false;
  }

  async deleteTarget() {
    const id = this.form.value.id as number | null;
    if (!id) {
      await this.presentToast('Selecciona un target para eliminar');
      return;
    }
    const ok = await this.targetsService.deleteTarget(id);
    await this.presentToast(ok ? 'Target eliminado' : 'Error al eliminar target (tabla/políticas)');
    if (ok) {
      this.form.patchValue({ id: null, name: '', type: 'pattern', pattern: '', modelUrl: '', scale: '1 1 1' });
    }
  }

  async onPatternSelected(ev: any) {
    const file = ev.target.files?.[0];
    if (!file) return;
    const ext = file.name.toLowerCase().split('.').pop();
    if (!['patt','mind'].includes(ext || '')) {
      await this.presentToast('Solo se permiten .patt o .mind');
      return;
    }
    if (file.size > this.maxSizeBytes) {
      await this.presentToast('Archivo demasiado grande');
      return;
    }
    this.uploadingPattern = true;
    const res = await this.targetsService.uploadFile(file, 'patterns');
    if (res.url) {
      this.lastPatternUrl = res.url;
      this.form.patchValue({ pattern: res.url, type: 'pattern' });
    }
    await this.presentToast(res.url ? 'Pattern subido' : (res.error || 'Error al subir pattern'));
    this.uploadingPattern = false;
  }

  async onModelSelected(ev: any) {
    const file = ev.target.files?.[0];
    if (!file) return;
    const ext = file.name.toLowerCase().split('.').pop();
    if (!['glb','gltf','obj','dae','png','jpg','jpeg','webp','svg'].includes(ext || '')) {
      await this.presentToast('Formatos permitidos: .glb, .gltf, .obj, .dae, .png, .jpg/.jpeg, .webp, .svg');
      return;
    }
    if (file.size > this.maxSizeBytes) {
      await this.presentToast('Archivo demasiado grande');
      return;
    }
    this.uploadingModel = true;
    const res = await this.targetsService.uploadFile(file, 'models');
    if (res.url) this.form.patchValue({ modelUrl: res.url });
    await this.presentToast(res.url ? 'Modelo subido' : (res.error || 'Error al subir modelo'));
    this.uploadingModel = false;
  }

  

  async presentToast(message: string) {
    const t = await this.toast.create({ message, duration: 1500, position: 'bottom' });
    await t.present();
  }
}
