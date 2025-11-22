import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: 'register.page.html',
  styleUrls: ['register.page.scss'],
  standalone: false,
})
export class RegisterPage {
  displayName = '';
  email = '';
  password = '';

  constructor(private auth: AuthService, private router: Router) {}

  async onSubmit() {
    try {
      await this.auth.register(this.displayName, this.email, this.password);
      this.router.navigate(['/home']);
    } catch (e) {}
  }
}
