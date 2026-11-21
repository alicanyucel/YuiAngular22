import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class ErrorService {
  private readonly notifications = inject(NotificationService);

  errorHandler(error: HttpErrorResponse): void {
    this.notifications.error(this.titleFor(error), this.messageFor(error));
  }

  private titleFor(error: HttpErrorResponse): string {
    if (error.status === 0) return 'Sunucuya ulaşılamıyor';
    if (error.status === 401) return 'Oturum doğrulanamadı';
    if (error.status === 403) return 'Erişim reddedildi';
    if (error.status === 404) return 'Kayıt bulunamadı';
    if (error.status >= 500) return 'Sunucu hatası';
    return 'İşlem başarısız';
  }

  private messageFor(error: HttpErrorResponse): string {
    if (error.status === 0) return 'API şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.';
    const payload: unknown = error.error;
    if (typeof payload === 'string' && payload.trim()) return payload;
    if (typeof payload === 'object' && payload !== null) {
      const body = payload as { errorMessages?: unknown; message?: unknown; title?: unknown };
      if (Array.isArray(body.errorMessages)) {
        const messages = body.errorMessages.filter((message): message is string => typeof message === 'string');
        if (messages.length) return messages.join('\n');
      }
      if (typeof body.message === 'string' && body.message.trim()) return body.message;
      if (typeof body.title === 'string' && body.title.trim()) return body.title;
    }
    if (error.status === 404) return 'İstenen API veya kayıt bulunamadı.';
    if (error.status >= 500) return 'Sunucu isteği işlerken bir hata oluştu.';
    return error.message || 'İstek tamamlanamadı.';
  }
}
