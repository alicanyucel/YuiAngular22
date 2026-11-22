import { Routes } from '@angular/router';
import { AppDashboard } from './components/dashboard/dashboard';
import { AppAccounts } from './components/accounts/accounts';
import { AppTransactions } from './components/transactions/transactions';
import { AppCustomers } from './components/customers/customers';
import { AppReports } from './components/reports/reports';
import { AppNotFound } from './components/not-found/not-found';
import { AppLogin } from './components/login/login';
import { requireAuthentication } from './services/auth.guard';

export const routes: Routes = [
  { path: 'login', component: AppLogin },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'dashboard', component: AppDashboard},
  { path: 'accounts', component: AppAccounts},
  { path: 'transactions', component: AppTransactions },
  { path: 'customers', component: AppCustomers },
  { path: 'reports', component: AppReports },
  { path: '**', component: AppNotFound },
];
