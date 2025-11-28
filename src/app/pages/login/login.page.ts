import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });
  showPassword = false;
  loading = false;
  error = '';
  success = '';

  ngOnInit() {
    const r = this.route.snapshot.queryParamMap.get('registered');
    if (r === '1') this.success = 'Registro exitoso, inicia sesión';
  }

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
