import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
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
  faUsers,
  faWallet,
  faXmark,
  type IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { NotificationService } from './services/notification.service';

type View = 'dashboard' | 'accounts' | 'transactions' | 'customers' | 'reports';
type Operation = 'deposit' | 'withdrawal' | 'transfer';
type Modal = Operation | 'customer' | 'account' | null;
type TransactionType = Operation | 'transfer-in' | 'transfer-out';
type TransactionStatus = 'success' | 'failed' | 'pending';
type SortOrder = 'newest' | 'oldest' | 'largest';
type ReportPeriod = 'daily' | 'weekly' | 'monthly';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface Account {
  id: string;
  customerId: string;
  name: string;
  balance: number;
  active: boolean;
}

interface Transaction {
  id: string;
  reference: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  createdAt: string;
  status: TransactionStatus;
  description: string;
}

interface ChartPoint {
  label: string;
  count: number;
  percent: number;
}

@Component({
  imports: [DatePipe, FormsModule, FontAwesomeModule, RouterOutlet],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  private readonly notifications = inject(NotificationService);

  protected readonly faGauge = faGaugeHigh;
  protected readonly faWallet = faWallet;
  protected readonly faArrows = faArrowsRotate;
  protected readonly faUsers = faUsers;
  protected readonly faChart = faChartLine;
  protected readonly faPlus = faPlus;
  protected readonly faDown = faArrowDown;
  protected readonly faUp = faArrowUp;
  protected readonly faTransfer = faArrowRightArrowLeft;
  protected readonly faMore = faEllipsis;
  protected readonly faBell = faBell;
  protected readonly faCheck = faCircleCheck;
  protected readonly faCard = faCreditCard;
  protected readonly faBars = faBars;
  protected readonly faSearch = faMagnifyingGlass;
  protected readonly faClose = faXmark;
  protected readonly faInfo = faCircleInfo;
  protected readonly Math = Math;
  protected readonly pageSize = 8;

  protected readonly customers = signal<Customer[]>([
    { id: 'CUS-001', name: 'Alican Yücel', email: 'alican@example.com', phone: '+90 532 000 00 01' },
    { id: 'CUS-002', name: 'Deniz Kaya', email: 'deniz@example.com', phone: '+90 532 000 00 02' },
    { id: 'CUS-003', name: 'Ece Demir', email: 'ece@example.com', phone: '+90 532 000 00 03' },
  ]);
  protected readonly accounts = signal<Account[]>([
    { id: 'TR-001-0042', customerId: 'CUS-001', name: 'Günlük hesap', balance: 284750, active: true },
    { id: 'TR-001-0088', customerId: 'CUS-001', name: 'Birikim hesabı', balance: 1250000, active: true },
    { id: 'TR-002-0134', customerId: 'CUS-002', name: 'Vadesiz hesap', balance: 865420, active: true },
    { id: 'TR-003-0201', customerId: 'CUS-003', name: 'Günlük hesap', balance: 510080, active: true },
  ]);

  private readonly now = new Date();
  private sequence = 12;
  private accountSequence = 202;
  protected readonly transactions = signal<Transaction[]>([
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

  protected readonly view = signal<View>('dashboard');
  protected readonly modal = signal<Modal>(null);
  protected readonly menuOpen = signal(false);
  protected readonly page = signal(1);
  protected readonly filterType = signal<TransactionType | ''>('');
  protected readonly dateFrom = signal('');
  protected readonly dateTo = signal('');
  protected readonly minAmount = signal<number | null>(null);
  protected readonly maxAmount = signal<number | null>(null);
  protected readonly sortOrder = signal<SortOrder>('newest');
  protected readonly reportPeriod = signal<ReportPeriod>('daily');
  protected sourceAccountId = '';
  protected targetAccountId = '';
  protected amountInput: number | null = null;
  protected descriptionInput = '';
  protected customerSearch = '';
  protected customerNameInput = '';
  protected customerEmailInput = '';
  protected customerPhoneInput = '';
  protected newAccountCustomerId = '';
  protected newAccountName = '';
  protected customerEditId: string | null = null;

  protected readonly activeAccounts = computed(() => this.accounts().filter((account) => account.active));
  protected readonly totalBalance = computed(() =>
    this.accounts().reduce((sum, account) => sum + account.balance, 0),
  );
  protected readonly successfulTransactions = computed(
    () => this.transactions().filter((transaction) => transaction.status === 'success').length,
  );
  protected readonly failedTransactions = computed(
    () => this.transactions().filter((transaction) => transaction.status === 'failed').length,
  );
  protected readonly totalInflow = computed(() =>
    this.transactions()
      .filter((transaction) => transaction.status === 'success' && this.isInflow(transaction.type))
      .reduce((sum, transaction) => sum + transaction.amount, 0),
  );
  protected readonly totalOutflow = computed(() =>
    this.transactions()
      .filter((transaction) => transaction.status === 'success' && !this.isInflow(transaction.type))
      .reduce((sum, transaction) => sum + transaction.amount, 0),
  );
  protected readonly successRate = computed(() => {
    const finished = this.successfulTransactions() + this.failedTransactions();
    return finished ? Math.round((this.successfulTransactions() / finished) * 100) : 0;
  });
  protected readonly pageTitle = computed(() => ({
    dashboard: 'Genel Bakış',
    accounts: 'Hesaplar',
    transactions: 'İşlem Geçmişi',
    customers: 'Müşteriler',
    reports: 'Raporlar',
  })[this.view()]);
  protected readonly filteredTransactions = computed(() => {
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
  protected readonly pagedTransactions = computed(() =>
    this.filteredTransactions().slice((this.page() - 1) * this.pageSize, this.page() * this.pageSize),
  );
  protected readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.filteredTransactions().length / this.pageSize)),
  );
  protected readonly dailyReport = computed(() => this.makeChartPoints());
  protected readonly transactionBreakdown = computed(() => {
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

  protected setView(view: View): void {
    this.view.set(view);
    this.menuOpen.set(false);
  }

  protected recentTransactions(): Transaction[] {
    return [...this.transactions()]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 5);
  }

  protected filteredCustomers(): Customer[] {
    const term = this.customerSearch.trim().toLocaleLowerCase('tr-TR');
    return this.customers().filter(
      (customer) =>
        !term ||
        customer.name.toLocaleLowerCase('tr-TR').includes(term) ||
        customer.email.toLocaleLowerCase('tr-TR').includes(term),
    );
  }

  protected customerName(id: string): string {
    return this.customers().find((customer) => customer.id === id)?.name ?? 'Bilinmeyen müşteri';
  }

  protected accountName(id: string): string {
    return this.accounts().find((account) => account.id === id)?.name ?? id;
  }

  protected customerAccountCount(customerId: string): number {
    return this.accounts().filter((account) => account.customerId === customerId).length;
  }

  protected initials(name: string): string {
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toLocaleUpperCase('tr-TR');
  }

  protected formatMoney(amountInKurus: number): string {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amountInKurus / 100);
  }

  protected transactionLabel(type: TransactionType): string {
    return {
      deposit: 'Para yükleme',
      withdrawal: 'Para çekme',
      transfer: 'Para transferi',
      'transfer-in': 'Transfer girişi',
      'transfer-out': 'Transfer çıkışı',
    }[type];
  }

  protected statusLabel(status: TransactionStatus): string {
    return { success: 'Başarılı', failed: 'Başarısız', pending: 'Beklemede' }[status];
  }

  protected isInflow(type: TransactionType): boolean {
    return type === 'deposit' || type === 'transfer-in';
  }

  protected transactionIcon(type: TransactionType): IconDefinition {
    return type === 'deposit' || type === 'transfer-in' ? faArrowDown : faArrowUp;
  }

  protected clearFilters(): void {
    this.filterType.set('');
    this.dateFrom.set('');
    this.dateTo.set('');
    this.minAmount.set(null);
    this.maxAmount.set(null);
    this.sortOrder.set('newest');
    this.page.set(1);
  }

  protected openOperation(operation: Operation, accountId?: string): void {
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

  protected modalTitle(): string {
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

  protected closeModal(): void {
    this.modal.set(null);
  }

  protected submitOperation(): void {
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

  protected openCustomerModal(customer?: Customer): void {
    this.customerEditId = customer?.id ?? null;
    this.customerNameInput = customer?.name ?? '';
    this.customerEmailInput = customer?.email ?? '';
    this.customerPhoneInput = customer?.phone ?? '';
    this.modal.set('customer');
  }

  protected saveCustomer(): void {
    const name = this.customerNameInput.trim();
    const email = this.customerEmailInput.trim();
    const phone = this.customerPhoneInput.trim();
    if (!name || !email || !phone) {
      this.notify('error', 'Eksik bilgi', 'Müşteri bilgilerini kontrol edin.');
      return;
    }

    if (this.customerEditId) {
      this.customers.update((customers) =>
        customers.map((customer) =>
          customer.id === this.customerEditId ? { ...customer, name, email, phone } : customer,
        ),
      );
    } else {
      const id = `CUS-${String(this.customers().length + 1).padStart(3, '0')}`;
      this.customers.update((customers) => [...customers, { id, name, email, phone }]);
    }
    this.closeModal();
    this.notify('success', 'Müşteri kaydedildi', 'Müşteri listesi güncellendi.');
  }

  protected openAccountModal(): void {
    if (!this.customers().length) {
      this.notify('error', 'Müşteri bulunamadı', 'Hesap oluşturmak için önce müşteri ekleyin.');
      return;
    }
    this.newAccountCustomerId = this.customers()[0].id;
    this.newAccountName = '';
    this.modal.set('account');
  }

  protected saveAccount(): void {
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

  protected toggleAccount(id: string): void {
    const account = this.accounts().find((item) => item.id === id);
    if (!account) return;
    this.accounts.update((accounts) =>
      accounts.map((item) => (item.id === id ? { ...item, active: !item.active } : item)),
    );
    this.notify('success', 'Hesap durumu güncellendi', `${account.name} ${account.active ? 'pasife alındı' : 'aktifleştirildi'}.`);
  }

  protected makeChartPoints(): ChartPoint[] {
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
