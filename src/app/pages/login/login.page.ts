import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
  standalone: false,
})
export class LoginPage {
  private auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });
  showPassword = false;
  loading = false;
  error = '';

  async onSubmit() {
    if (this.form.invalid || this.loading) return;
    this.error = '';
    this.loading = true;
    const { email, password } = this.form.value;
    try {
      await this.auth.login(email!, password!);
      this.router.navigate(['/home']);
    } catch (e: any) {
      const code = e?.code;
      this.error = code === 'auth/invalid-email' ? 'Email inválido'
        : code === 'auth/user-not-found' ? 'Usuario no encontrado'
        : code === 'auth/wrong-password' ? 'Contraseña incorrecta'
        : e?.message || 'Error al iniciar sesión';
    } finally {
      this.loading = false;
    }
  }

  goRegister() {
    (document.activeElement as HTMLElement)?.blur?.();
    this.router.navigate(['/register']);
  }
}
