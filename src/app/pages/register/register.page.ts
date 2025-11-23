import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: 'register.page.html',
  styleUrls: ['register.page.scss'],
  standalone: false,
})
export class RegisterPage {
  private fb = inject(FormBuilder);
  form = this.fb.group({
    displayName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });
  showPassword = false;
  loading = false;
  error = '';

  private auth = inject(AuthService);
  private router = inject(Router);

  async onSubmit() {
    if (this.form.invalid || this.loading) return;
    this.error = '';
    this.loading = true;
    const { displayName, email, password } = this.form.value;
    try {
      await this.auth.register(displayName!, email!, password!);
      this.router.navigate(['/home']);
    } catch (e: any) {
      const code = e?.code;
      this.error = code === 'auth/email-already-in-use' ? 'El email ya está registrado'
        : code === 'auth/invalid-email' ? 'Email inválido'
        : code === 'auth/weak-password' ? 'Contraseña muy débil'
        : e?.message || 'Error al registrarse';
    } finally {
      this.loading = false;
    }
  }

  goLogin() {
    (document.activeElement as HTMLElement)?.blur?.();
    this.router.navigate(['/login']);
  }
}
