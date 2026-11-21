import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode, type JwtPayload } from 'jwt-decode';
import type { TokenModel } from '../models/token.model';

interface AuthTokenClaims extends JwtPayload {
  [claim: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  readonly tokenDecode: TokenModel = { id: '', name: '', email: '', UserName: '' };
  private readonly browser = isPlatformBrowser(this.platformId);

  isAuthenticated(): boolean {
    if (!this.browser) {
      return false;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      this.redirectToLogin();
      return false;
    }

    let claims: AuthTokenClaims;
    try {
      claims = jwtDecode<AuthTokenClaims>(token);
    } catch {
      this.clearToken();
      this.redirectToLogin();
      return false;
    }

    if (typeof claims.exp === 'number' && claims.exp <= Date.now() / 1000) {
      this.clearToken();
      this.redirectToLogin();
      return false;
    }

    this.tokenDecode.id = this.claimString(claims, 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier');
    this.tokenDecode.name = this.claimString(claims, 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name');
    this.tokenDecode.email = this.claimString(claims, 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress');
    this.tokenDecode.UserName = this.claimString(claims, 'UserName');
    return true;
  }

  private claimString(claims: AuthTokenClaims, claim: string): string {
    const value = claims[claim];
    return typeof value === 'string' ? value : '';
  }

  private clearToken(): void {
    localStorage.removeItem('token');
    this.tokenDecode.id = '';
    this.tokenDecode.name = '';
    this.tokenDecode.email = '';
    this.tokenDecode.UserName = '';
  }

  private redirectToLogin(): void {
    void this.router.navigateByUrl('/login');
  }
}
