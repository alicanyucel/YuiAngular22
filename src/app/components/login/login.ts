import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class AppLogin {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  username = 'admin';
  password = '';
  readonly loading = signal(false);
  readonly errorMessage = signal('');

  login(): void {
    if (this.loading()) {
      return;
    }

    if (!this.username.trim() || !this.password) {
      this.errorMessage.set('Kullanıcı adı ve parola zorunludur.');
      return;
    }

    this.errorMessage.set('');
    this.loading.set(true);
    this.auth
      .login({ username: this.username.trim(), password: this.password })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => void this.router.navigateByUrl('/dashboard'),
        error: (error: unknown) => this.showError(error),
      });
  }

  private showError(error: unknown): void {
    if (error instanceof Error && error.message === 'Login response did not contain a valid token.') {
      this.errorMessage.set('Sunucu geçerli bir erişim anahtarı döndürmedi.');
      return;
    }

    if (error instanceof HttpErrorResponse && error.status === 401) {
      this.errorMessage.set('Kullanıcı adı veya parola hatalı.');
      return;
    }

    if (error instanceof HttpErrorResponse && error.status === 0) {
      this.errorMessage.set('Sunucuya bağlanılamadı. Bağlantınızı kontrol edip tekrar deneyin.');
      return;
    }

    this.errorMessage.set('Giriş yapılamadı. Lütfen tekrar deneyin.');
  }
}
