import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Component, computed, forwardRef, inject, PLATFORM_ID, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import {
  faArrowDown,
  faArrowRightArrowLeft,
  faArrowUp,
  faArrowsRotate,
  faBars,
  faBell,
  faChartLine,
  faCircleCheck,
  faCircleInfo,
  faCreditCard,
  faEllipsis,
  faGaugeHigh,
  faMagnifyingGlass,
  faPlus,
  faTrashCan,
  faUsers,
  faWallet,
  faXmark,
  type IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { NotificationService } from './services/notification.service';
import {AppSidebar} from './components/sidebar/sidebar';
import { AppOperationModal } from './components/operation-modal/operation-modal';
import type { Account } from './models/account.model';
import type { ChartPoint } from './models/chart-point.model';
import type { Customer } from './models/customer.model';
import type { Transaction } from './models/transaction.model';
import {AppTopbar} from  './components/topbar/topbar'
import type {
  Modal,
  Operation,
  ReportPeriod,
  SortOrder,
  TransactionStatus,
  TransactionType,
  View,
} from './models/app-types';
import { environment } from './environments/environment';

interface CustomerApiModel {
  id?: string | number;
  customerId?: string | number;
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  phone?: string | null;
}

interface CustomerCreatePayload {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phoneNumber: string | null;
}

interface CustomerUpdatePayload extends CustomerCreatePayload {
  id: string;
  isActive: boolean | null;
}

interface CustomerPagedResponse {
  items?: CustomerApiModel[];
  customers?: CustomerApiModel[];
  data?: CustomerApiModel[];
  totalCount?: number;
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
}

@Component({
  standalone: true,
  imports: [
    RouterOutlet,
    AppSidebar,
    AppOperationModal,
    AppTopbar
  ],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly browser = isPlatformBrowser(this.platformId);
  private readonly apiUrl = environment.apiUrl.replace(/\/+$/, '');

  public readonly faGauge = faGaugeHigh;
  public readonly faWallet = faWallet;
  public readonly faArrows = faArrowsRotate;
  public readonly faUsers = faUsers;
  public readonly faChart = faChartLine;
  public readonly faPlus = faPlus;
  public readonly faTrashCan = faTrashCan;
  public readonly faDown = faArrowDown;
  public readonly faUp = faArrowUp;
  public readonly faTransfer = faArrowRightArrowLeft;
  public readonly faMore = faEllipsis;
  public readonly faBell = faBell;
  public readonly faCheck = faCircleCheck;
  public readonly faCard = faCreditCard;
  public readonly faBars = faBars;
  public readonly faSearch = faMagnifyingGlass;
  public readonly faClose = faXmark;
  public readonly faInfo = faCircleInfo;
  public readonly Math = Math;
  public readonly pageSize = 8;
  private readonly currentUrl = signal(this.router.url);
  public readonly showLogin = computed(() => this.currentUrl().split(/[/?]/)[1] === 'login');

  public readonly customers = signal<Customer[]>([
    { id: 'CUS-001', name: 'Alican Yücel', email: 'alican@example.com', phone: '+90 532 000 00 01' },
    { id: 'CUS-002', name: 'Deniz Kaya', email: 'deniz@example.com', phone: '+90 532 000 00 02' },
    { id: 'CUS-003', name: 'Ece Demir', email: 'ece@example.com', phone: '+90 532 000 00 03' },
  ]);
  public readonly accounts = signal<Account[]>([
    { id: 'TR-001-0042', customerId: 'CUS-001', name: 'Günlük hesap', balance: 284750, active: true },
    { id: 'TR-001-0088', customerId: 'CUS-001', name: 'Birikim hesabı', balance: 1250000, active: true },
    { id: 'TR-002-0134', customerId: 'CUS-002', name: 'Vadesiz hesap', balance: 865420, active: true },
    { id: 'TR-003-0201', customerId: 'CUS-003', name: 'Günlük hesap', balance: 510080, active: true },
  ]);

  private readonly now = new Date();
  private sequence = 12;
  private accountSequence = 202;
  public readonly transactions = signal<Transaction[]>([
    this.seedTransaction(12, 0, 'TR-001-0042', 'deposit', 125000, 'Maaş yüklemesi'),
    this.seedTransaction(11, 0, 'TR-001-0088', 'transfer-in', 50000, 'Deniz Kaya · Gelen transfer', 'FT-2026-000010'),
    this.seedTransaction(10, 0, 'TR-002-0134', 'transfer-out', 50000, 'Alican Yücel · Para transferi', 'FT-2026-000010'),
    this.seedTransaction(9, 1, 'TR-001-0042', 'withdrawal', 15000, 'ATM para çekme'),
    this.seedTransaction(8, 1, 'TR-003-0201', 'deposit', 220000, 'Bakiye yükleme'),
    this.seedTransaction(7, 2, 'TR-002-0134', 'transfer-in', 32500, 'Ece Demir · Gelen transfer', 'FT-2026-000006'),
    this.seedTransaction(6, 2, 'TR-003-0201', 'transfer-out', 32500, 'Deniz Kaya · Para transferi', 'FT-2026-000006'),
    this.seedTransaction(5, 3, 'TR-001-0088', 'deposit', 300000, 'Birikim yüklemesi'),
    this.seedTransaction(4, 4, 'TR-002-0134', 'withdrawal', 5000, 'Hesaptan çekim'),
    this.seedTransaction(3, 5, 'TR-001-0042', 'deposit', 75000, 'Bakiye yükleme'),
    this.seedTransaction(2, 6, 'TR-003-0201', 'transfer-in', 18000, 'Alican Yücel · Gelen transfer', 'FT-2026-000001'),
    this.seedTransaction(1, 6, 'TR-001-0042', 'transfer-out', 18000, 'Ece Demir · Para transferi', 'FT-2026-000001'),
  ]);

  public readonly view = signal<View>('dashboard');
  public readonly modal = signal<Modal>(null);
  public readonly menuOpen = signal(false);
  public readonly page = signal(1);
  public readonly filterType = signal<TransactionType | ''>('');
  public readonly dateFrom = signal('');
  public readonly dateTo = signal('');
  public readonly minAmount = signal<number | null>(null);
  public readonly maxAmount = signal<number | null>(null);
  public readonly sortOrder = signal<SortOrder>('newest');
  public readonly reportPeriod = signal<ReportPeriod>('daily');
  public sourceAccountId = '';
  public targetAccountId = '';
  public amountInput: number | null = null;
  public descriptionInput = '';
  public customerSearch = '';
  public customerFirstNameInput = '';
  public customerLastNameInput = '';
  public customerEmailInput = '';
  public customerPhoneInput = '';
  public newAccountCustomerId = '';
  public newAccountName = '';
  public customerEditId: string | null = null;

  public readonly activeAccounts = computed(() => this.accounts().filter((account) => account.active));
  public readonly totalBalance = computed(() =>
    this.accounts().reduce((sum, account) => sum + account.balance, 0),
  );
  public readonly successfulTransactions = computed(
    () => this.transactions().filter((transaction) => transaction.status === 'success').length,
  );
  public readonly failedTransactions = computed(
    () => this.transactions().filter((transaction) => transaction.status === 'failed').length,
  );
  public readonly totalInflow = computed(() =>
    this.transactions()
      .filter((transaction) => transaction.status === 'success' && this.isInflow(transaction.type))
      .reduce((sum, transaction) => sum + transaction.amount, 0),
  );
  public readonly totalOutflow = computed(() =>
    this.transactions()
      .filter((transaction) => transaction.status === 'success' && !this.isInflow(transaction.type))
      .reduce((sum, transaction) => sum + transaction.amount, 0),
  );
  public readonly successRate = computed(() => {
    const finished = this.successfulTransactions() + this.failedTransactions();
    return finished ? Math.round((this.successfulTransactions() / finished) * 100) : 0;
  });
  public readonly pageTitle = computed(() => ({
    dashboard: 'Genel Bakış',
    accounts: 'Hesaplar',
    transactions: 'İşlem Geçmişi',
    customers: 'Müşteriler',
    reports: 'Raporlar',
  })[this.view()]);
  public readonly filteredTransactions = computed(() => {
    const from = this.dateFrom();
    const to = this.dateTo();
    const min = this.minAmount();
    const max = this.maxAmount();
    const rows = this.transactions().filter((transaction) => {
      const day = transaction.createdAt.slice(0, 10);
      return (
        (!this.filterType() || transaction.type === this.filterType()) &&
        (!from || day >= from) &&
        (!to || day <= to) &&
        (min === null || transaction.amount >= Math.round(min * 100)) &&
        (max === null || transaction.amount <= Math.round(max * 100))
      );
    });

    return rows.sort((a, b) => {
      if (this.sortOrder() === 'largest') return b.amount - a.amount;
      const direction = this.sortOrder() === 'newest' ? -1 : 1;
      return direction * a.createdAt.localeCompare(b.createdAt);
    });
  });
  public readonly pagedTransactions = computed(() =>
    this.filteredTransactions().slice((this.page() - 1) * this.pageSize, this.page() * this.pageSize),
  );
  public readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.filteredTransactions().length / this.pageSize)),
  );
  public readonly dailyReport = computed(() => this.makeChartPoints());
  public readonly transactionBreakdown = computed(() => {
    const types: TransactionType[] = ['deposit', 'withdrawal', 'transfer-in', 'transfer-out'];
    const labels = ['Para yükleme', 'Para çekme', 'Transfer girişi', 'Transfer çıkışı'];
    const counts = types.map(
      (type) => this.transactions().filter((transaction) => transaction.type === type).length,
    );
    const max = Math.max(1, ...counts);
    return types.map((type, index) => ({
      label: labels[index],
      count: counts[index],
      percent: Math.round((counts[index] / max) * 100),
      type,
    }));
  });

  constructor() {
    this.syncViewWithUrl(this.router.url);
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentUrl.set(event.urlAfterRedirects);
        this.syncViewWithUrl(event.urlAfterRedirects);
      }
    });
    this.loadCustomers();
  }

  private syncViewWithUrl(url: string): void {
    const segment = url.split(/[/?]/)[1] as View | undefined;
    if (
      segment === 'dashboard' ||
      segment === 'accounts' ||
      segment === 'transactions' ||
      segment === 'customers' ||
      segment === 'reports'
    ) {
      this.view.set(segment);
    }
  }

  public setView(view: View): void {
    this.view.set(view);
    this.menuOpen.set(false);
    void this.router.navigate(['/', view]);
  }

  public recentTransactions(): Transaction[] {
    return [...this.transactions()]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 5);
  }

  public filteredCustomers(): Customer[] {
    const term = this.customerSearch.trim().toLocaleLowerCase('tr-TR');
    return this.customers().filter(
      (customer) =>
        !term ||
        customer.name.toLocaleLowerCase('tr-TR').includes(term) ||
        customer.email.toLocaleLowerCase('tr-TR').includes(term),
    );
  }

  public customerName(id: string): string {
    return this.customers().find((customer) => customer.id === id)?.name ?? 'Bilinmeyen müşteri';
  }

  public accountName(id: string): string {
    return this.accounts().find((account) => account.id === id)?.name ?? id;
  }

  public customerAccountCount(customerId: string): number {
    return this.accounts().filter((account) => account.customerId === customerId).length;
  }

  public initials(name: string): string {
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toLocaleUpperCase('tr-TR');
  }

  public formatMoney(amountInKurus: number): string {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amountInKurus / 100);
  }

  public transactionLabel(type: TransactionType): string {
    return {
      deposit: 'Para yükleme',
      withdrawal: 'Para çekme',
      transfer: 'Para transferi',
      'transfer-in': 'Transfer girişi',
      'transfer-out': 'Transfer çıkışı',
    }[type];
  }

  public statusLabel(status: TransactionStatus): string {
    return { success: 'Başarılı', failed: 'Başarısız', pending: 'Beklemede' }[status];
  }

  public isInflow(type: TransactionType): boolean {
    return type === 'deposit' || type === 'transfer-in';
  }

  public transactionIcon(type: TransactionType): IconDefinition {
    return type === 'deposit' || type === 'transfer-in' ? faArrowDown : faArrowUp;
  }

  public clearFilters(): void {
    this.filterType.set('');
    this.dateFrom.set('');
    this.dateTo.set('');
    this.minAmount.set(null);
    this.maxAmount.set(null);
    this.sortOrder.set('newest');
    this.page.set(1);
  }

  public openOperation(operation: Operation, accountId?: string): void {
    const active = this.activeAccounts();
    if (!active.length) {
      this.notify('error', 'Aktif hesap bulunamadı', 'İşlem yapabilmek için önce aktif bir hesap oluşturun.');
      return;
    }
    this.sourceAccountId = accountId ?? active[0].id;
    this.targetAccountId = active.find((account) => account.id !== this.sourceAccountId)?.id ?? '';
    this.amountInput = null;
    this.descriptionInput = '';
    this.modal.set(operation);
  }

  public modalTitle(): string {
    const titles: Record<Exclude<Modal, null>, string> = {
      deposit: 'Hesaba para yükle',
      withdrawal: 'Hesaptan para çek',
      transfer: 'Hesaplar arası transfer',
      customer: this.customerEditId ? 'Müşteriyi düzenle' : 'Yeni müşteri',
      account: 'Yeni hesap oluştur',
    };
    const current = this.modal();
    return current ? titles[current] : '';
  }

  public closeModal(): void {
    this.modal.set(null);
  }

  public submitOperation(): void {
    const modal = this.modal();
    const amount = this.amountInput === null ? 0 : Math.round(this.amountInput * 100);
    if ((modal !== 'deposit' && modal !== 'withdrawal' && modal !== 'transfer') || amount <= 0) {
      this.notify('error', 'Geçersiz tutar', 'Lütfen sıfırdan büyük bir tutar girin.');
      return;
    }

    const source = this.accounts().find(
      (account) => account.id === this.sourceAccountId && account.active,
    );
    if (!source) {
      this.notify('error', 'Kaynak hesap kullanılamıyor', 'Aktif bir kaynak hesap seçin.');
      return;
    }

    if (modal === 'withdrawal' || modal === 'transfer') {
      if (source.balance < amount) {
        this.addTransaction(
          source.id,
          modal === 'transfer' ? 'transfer-out' : 'withdrawal',
          amount,
          'failed',
          this.descriptionInput || 'Yetersiz bakiye',
        );
        this.notify('error', 'Yetersiz bakiye', 'İşlem reddedildi; hesap bakiyesi değiştirilmedi.');
        return;
      }
    }

    if (modal === 'deposit') {
      this.updateBalance(source.id, amount);
      this.addTransaction(source.id, 'deposit', amount, 'success', this.descriptionInput || 'Demo para yükleme');
    } else if (modal === 'withdrawal') {
      this.updateBalance(source.id, -amount);
      this.addTransaction(source.id, 'withdrawal', amount, 'success', this.descriptionInput || 'Demo para çekme');
    } else {
      const target = this.accounts().find(
        (account) => account.id === this.targetAccountId && account.active,
      );
      if (!target || target.id === source.id) {
        this.notify('error', 'Alıcı hesap geçersiz', 'Farklı ve aktif bir alıcı hesap seçin.');
        return;
      }
      this.updateBalance(source.id, -amount);
      this.updateBalance(target.id, amount);
      const description = this.descriptionInput || 'Demo hesaplar arası transfer';
      const reference = this.nextReference();
      this.addTransaction(source.id, 'transfer-out', amount, 'success', description, reference);
      this.addTransaction(target.id, 'transfer-in', amount, 'success', description, reference);
    }

    this.closeModal();
    this.notify('success', 'İşlem tamamlandı', 'Demo hesabı ve işlem geçmişi güncellendi.');
  }

  public openCustomerModal(customer?: Customer): void {
    this.customerEditId = customer?.id ?? null;
    const nameParts = customer?.name.trim().split(/\s+/) ?? [];
    this.customerFirstNameInput = nameParts.shift() ?? '';
    this.customerLastNameInput = nameParts.join(' ');
    this.customerEmailInput = customer?.email ?? '';
    this.customerPhoneInput = customer?.phone ?? '';
    this.modal.set('customer');
  }

  public saveCustomer(): void {
    const firstName = this.customerFirstNameInput.trim();
    const lastName = this.customerLastNameInput.trim();
    const email = this.customerEmailInput.trim();
    const phone = this.customerPhoneInput.trim();
    if (!firstName) {
      this.notify('error', 'Eksik bilgi', 'Müşteri bilgilerini kontrol edin.');
      return;
    }

    const createPayload: CustomerCreatePayload = {
      firstName: firstName || null,
      lastName: lastName || null,
      email: email || null,
      phoneNumber: phone || null,
    };

    const customerId = this.customerEditId;
    if (customerId) {
      const payload: CustomerUpdatePayload = {
        id: customerId,
        ...createPayload,
        isActive: null,
      };
      this.http
        .put<void>(`${this.apiUrl}/api/Customers/${encodeURIComponent(customerId)}`, payload)
        .subscribe({
          next: () => {
            const updated: Customer = {
              id: customerId,
              name: `${firstName} ${lastName}`.trim(),
              email,
              phone,
            };
            this.customers.update((customers) =>
              customers.map((customer) => (customer.id === customerId ? updated : customer)),
            );
            this.closeModal();
            this.notify('success', 'Müşteri güncellendi', 'Müşteri bilgileri kaydedildi.');
          },
          error: (error: unknown) => this.showCustomerError(error),
        });
      return;
    }

    this.http.post<CustomerApiModel>(`${this.apiUrl}/api/Customers`, createPayload).subscribe({
      next: (response) => {
        const id = `CUS-${String(this.customers().length + 1).padStart(3, '0')}`;
        const created = this.mapCustomer(response, id);
        this.customers.update((customers) => [...customers, created]);
        this.closeModal();
        this.notify('success', 'Müşteri kaydedildi', 'Yeni müşteri listeye ve API’ye bağlandı.');
      },
      error: (error: unknown) => this.showCustomerError(error),
    });
  }

  public async deleteCustomer(customer: Customer): Promise<void> {
    const confirmed = await this.notifications.confirm(
      'Müşteri silinsin mi?',
      `${customer.name} kaydı kalıcı olarak silinecek.`,
      'Müşteriyi sil',
    );
    if (!confirmed) {
      return;
    }

    this.http
      .delete<void>(`${this.apiUrl}/api/Customers/${encodeURIComponent(customer.id)}`)
      .subscribe({
        next: () => {
          this.customers.update((customers) =>
            customers.filter((item) => item.id !== customer.id),
          );
          this.notify('success', 'Müşteri silindi', `${customer.name} müşteri listesinden kaldırıldı.`);
        },
        error: (error: unknown) => this.showCustomerError(error, 'silinemedi'),
      });
  }

  private loadCustomers(): void {
    if (!this.browser) {
      return;
    }

    const params = new HttpParams()
      .set('pageNumber', '1')
      .set('pageSize', '20');

    this.http.get<CustomerApiModel[] | CustomerPagedResponse>(`${this.apiUrl}/api/Customers`, { params }).subscribe({
      next: (response) => {
        const rows = Array.isArray(response)
          ? response
          : response.items ?? response.customers ?? response.data ?? [];
        this.customers.set(rows.map((customer, index) => this.mapCustomer(customer, `CUS-${String(index + 1).padStart(3, '0')}`)));
      },
      error: (error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status !== 401) {
          this.notify('error', 'Müşteriler yüklenemedi', 'API ile bağlantı kurulamadı.');
        }
      },
    });
  }

  private mapCustomer(customer: CustomerApiModel, fallbackId: string): Customer {
    const id = customer.id ?? customer.customerId;
    const firstName = customer.firstName?.trim() ?? '';
    const lastName = customer.lastName?.trim() ?? '';
    const apiName = `${firstName} ${lastName}`.trim();

    return {
      id: id === undefined || id === null ? fallbackId : String(id),
      name: customer.name?.trim() || apiName || 'İsimsiz müşteri',
      email: customer.email?.trim() ?? '',
      phone: customer.phoneNumber?.trim() ?? customer.phone?.trim() ?? '',
    };
  }

  private showCustomerError(error: unknown, action = 'kaydedilemedi'): void {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 400) {
        this.notify('error', `Müşteri ${action}`, 'Gönderilen müşteri bilgilerini kontrol edin.');
        return;
      }
      if (error.status === 401) {
        this.notify('error', 'Oturum süresi doldu', 'Lütfen tekrar giriş yapın.');
        return;
      }
    }
    this.notify('error', `Müşteri ${action}`, 'API ile bağlantı kurulamadı.');
  }

  public openAccountModal(): void {
    if (!this.customers().length) {
      this.notify('error', 'Müşteri bulunamadı', 'Hesap oluşturmak için önce müşteri ekleyin.');
      return;
    }
    this.newAccountCustomerId = this.customers()[0].id;
    this.newAccountName = '';
    this.modal.set('account');
  }

  public saveAccount(): void {
    const name = this.newAccountName.trim();
    if (!name || !this.customers().some((customer) => customer.id === this.newAccountCustomerId)) {
      this.notify('error', 'Hesap bilgileri geçersiz', 'Hesap sahibi ve hesap adını kontrol edin.');
      return;
    }
    this.accountSequence += 1;
    const id = `TR-${this.newAccountCustomerId.slice(-3)}-${String(this.accountSequence).padStart(4, '0')}`;
    this.accounts.update((accounts) => [
      ...accounts,
      { id, customerId: this.newAccountCustomerId, name, balance: 0, active: true },
    ]);
    this.closeModal();
    this.notify('success', 'Hesap oluşturuldu', `${name} aktif hesaplara eklendi.`);
  }

  public toggleAccount(id: string): void {
    const account = this.accounts().find((item) => item.id === id);
    if (!account) return;
    this.accounts.update((accounts) =>
      accounts.map((item) => (item.id === id ? { ...item, active: !item.active } : item)),
    );
    this.notify('success', 'Hesap durumu güncellendi', `${account.name} ${account.active ? 'pasife alındı' : 'aktifleştirildi'}.`);
  }

  public makeChartPoints(): ChartPoint[] {
    const now = this.now;
    const transactions = this.transactions().filter((transaction) => transaction.status === 'success');
    const points: { label: string; count: number }[] = [];

    if (this.reportPeriod() === 'daily') {
      for (let offset = 6; offset >= 0; offset -= 1) {
        const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
        const key = this.dateKey(day);
        points.push({
          label: new Intl.DateTimeFormat('tr-TR', { weekday: 'short' }).format(day),
          count: transactions.filter((transaction) => transaction.createdAt.slice(0, 10) === key).length,
        });
      }
    } else if (this.reportPeriod() === 'weekly') {
      for (let offset = 6; offset >= 0; offset -= 1) {
        const weekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset * 7 + 1);
        weekEnd.setHours(0, 0, 0, 0);
        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekStart.getDate() - 7);
        points.push({
          label: `${weekStart.getDate()}.${weekStart.getMonth() + 1}`,
          count: transactions.filter((transaction) => {
            const date = new Date(transaction.createdAt);
            return date >= weekStart && date < weekEnd;
          }).length,
        });
      }
    } else {
      for (let offset = 5; offset >= 0; offset -= 1) {
        const month = new Date(now.getFullYear(), now.getMonth() - offset, 1);
        points.push({
          label: new Intl.DateTimeFormat('tr-TR', { month: 'short' }).format(month),
          count: transactions.filter((transaction) => {
            const date = new Date(transaction.createdAt);
            return date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth();
          }).length,
        });
      }
    }

    const max = Math.max(1, ...points.map((point) => point.count));
    return points.map((point) => ({
      ...point,
      percent: Math.round((point.count / max) * 100),
    }));
  }

  private seedTransaction(
    sequence: number,
    daysAgo: number,
    accountId: string,
    type: TransactionType,
    amount: number,
    description: string,
    reference?: string,
  ): Transaction {
    const createdAt = new Date(this.now);
    createdAt.setDate(createdAt.getDate() - daysAgo);
    createdAt.setHours(10 + (sequence % 8), 12, 0, 0);
    return {
      id: `tx-${sequence}`,
      reference: reference ?? `FT-2026-${String(sequence).padStart(6, '0')}`,
      accountId,
      type,
      amount,
      createdAt: createdAt.toISOString(),
      status: 'success',
      description,
    };
  }

  private dateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private updateBalance(accountId: string, delta: number): void {
    this.accounts.update((accounts) =>
      accounts.map((account) =>
        account.id === accountId ? { ...account, balance: account.balance + delta } : account,
      ),
    );
  }

  private nextReference(): string {
    this.sequence += 1;
    return `FT-${new Date().getFullYear()}-${String(this.sequence).padStart(6, '0')}`;
  }

  private addTransaction(
    accountId: string,
    type: TransactionType,
    amount: number,
    status: TransactionStatus,
    description: string,
    reference?: string,
  ): void {
    this.sequence += 1;
    const transactionReference =
      reference ?? `FT-${new Date().getFullYear()}-${String(this.sequence).padStart(6, '0')}`;
    this.transactions.update((transactions) => [
      {
        id: `tx-${this.sequence}-${accountId}`,
        reference: transactionReference,
        accountId,
        type,
        amount,
        createdAt: new Date().toISOString(),
        status,
        description,
      },
      ...transactions,
    ]);
  }

  private notify(icon: 'success' | 'error', title: string, text: string): void {
    if (icon === 'success') {
      this.notifications.success(title, text);
      return;
    }

    this.notifications.error(title, text);
  }
}
