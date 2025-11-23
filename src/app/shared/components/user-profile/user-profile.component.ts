import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  standalone: false
})
export class UserProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  @Output() close = new EventEmitter<void>();
  form = this.fb.group({
    displayName: ['', [Validators.required, Validators.minLength(2)]],
    email: [{ value: '', disabled: true }]
  });
  saving = false;

  async ngOnInit() {
    const p = await this.auth.getUserProfile();
    this.form.patchValue({
      displayName: p?.displayName || '',
      email: p?.email || ''
    });
  }

  async save() {
    if (this.form.invalid || this.saving) return;
    this.saving = true;
    const ok = await this.auth.updateUserProfile({ displayName: this.form.value.displayName });
    this.saving = false;
  }
}
