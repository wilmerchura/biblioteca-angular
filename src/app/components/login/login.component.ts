import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  username = '';
  password = '';
  error = signal('');
  loading = signal(false);
  showPassword = signal(false);

  constructor(private auth: AuthService, private router: Router) {}

  async onSubmit() {
    if (!this.username || !this.password) {
      this.error.set('Completa todos los campos.');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    const ok = await this.auth.login(this.username, this.password);
    this.loading.set(false);
    if (ok) {
      this.router.navigate(['/']);
    } else {
      this.error.set('Usuario o contraseña incorrectos.');
    }
  }
}
