import { Component } from '@angular/core';
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
export class HomePage {
  targets: Target[] = [];
  form = this.fb.group({
    id: [Date.now()],
    name: ['', [Validators.required]],
    type: ['pattern', [Validators.required]],
    pattern: ['', [Validators.required]],
    modelUrl: ['', [Validators.required]],
    scale: ['1 1 1', [Validators.required]]
  });
  jsonUrl = '';
  patternFile: File | null = null;
  modelFile: File | null = null;
  jsonFile: File | null = null;
  saving = false;
  uploadingPattern = false;
  uploadingModel = false;
  displayName = '';
  private maxSizeBytes = 10 * 1024 * 1024;

  constructor(private auth: AuthService, private router: Router, private targetsService: TargetsService, private fb: FormBuilder, private toast: ToastController) {}

  ngOnInit() {
    this.targetsService.getTargets().subscribe(list => this.targets = list);
    this.targetsService.fetchTargets();
    const u = this.auth.getCurrentUser();
    if (u) {
      this.auth.userProfile$(u.uid).subscribe(p => this.displayName = p?.displayName || '');
    }
    this.form.controls.type.valueChanges.subscribe(v => {
      if (v === 'preset') {
        this.form.patchValue({ pattern: 'hiro' });
      }
    });
  }

  async logout() {
    await this.auth.logout();
    this.router.navigate(['/login']);
  }

  onTargetChange(ev: any) {
    const id = ev.detail?.value;
    const t = this.targets.find(x => x.id === id);
    if (t) this.targetsService.setActiveTarget(t);
  }

  async saveTarget() {
    if (this.form.invalid || this.saving) return;
    this.saving = true;
    const ok = await this.targetsService.upsertTarget(this.form.value as Target);
    await this.presentToast(ok ? 'Target guardado' : 'Error al guardar target (tabla/políticas)');
    this.saving = false;
  }

  async loadFromJson() {
    if (!this.jsonUrl) return;
    await this.targetsService.fetchTargetsFromJson(this.jsonUrl);
    await this.presentToast('Targets cargados desde JSON');
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
    if (res.url) this.form.patchValue({ pattern: res.url, type: 'pattern' });
    await this.presentToast(res.url ? 'Pattern subido' : (res.error || 'Error al subir pattern'));
    this.uploadingPattern = false;
  }

  async onModelSelected(ev: any) {
    const file = ev.target.files?.[0];
    if (!file) return;
    const ext = file.name.toLowerCase().split('.').pop();
    if (!['glb','gltf'].includes(ext || '')) {
      await this.presentToast('Solo se permiten .glb o .gltf');
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

  async onJsonSelected(ev: any) {
    const file = ev.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const list = JSON.parse(reader.result as string) as Target[];
        this.targetsService.setTargetsFromList(list);
        this.presentToast('Targets cargados desde archivo');
      } catch {}
    };
    reader.readAsText(file);
  }

  async presentToast(message: string) {
    const t = await this.toast.create({ message, duration: 1500, position: 'bottom' });
    await t.present();
  }
}
