import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

export const requireAuthentication: CanActivateFn = () => {
  const platformId = inject(PLATFORM_ID);
  return !isPlatformBrowser(platformId) || inject(AuthService).isAuthenticated();
};
