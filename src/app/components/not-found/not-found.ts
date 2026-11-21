import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="not-found-page" aria-labelledby="not-found-title">
      <p class="eyebrow">404 · SAYFA BULUNAMADI</p>
      <h1 id="not-found-title">Aradığınız sayfayı bulamadık</h1>
      <p class="subheading">Adres değişmiş veya sayfa kaldırılmış olabilir.</p>
      <a class="button button-primary" routerLink="/dashboard">Genel bakışa dön</a>
    </section>
  `,
})
export class AppNotFound {}
