import { Injectable, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import type { SweetAlertIcon } from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly toastr = inject(ToastrService);

  success(title: string, message: string): void {
    this.toastr.success(message, title);
  }

  error(title: string, message: string): void {
    this.toastr.error(message, title);
  }

  info(title: string, message: string): void {
    this.toastr.info(message, title);
  }

  warning(title: string, message: string): void {
    this.toastr.warning(message, title);
  }

  async alert(title: string, text: string, icon: SweetAlertIcon = 'info'): Promise<void> {
    const { default: Swal } = await import('sweetalert2');
    await Swal.fire({ title, text, icon });
  }

  async confirm(
    title: string,
    text: string,
    confirmButtonText = 'Evet',
  ): Promise<boolean> {
    const { default: Swal } = await import('sweetalert2');
    const result = await Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText: 'Vazgeç',
      reverseButtons: true,
    });

    return result.isConfirmed;
  }
}
