# FOOTRA

Cyberpunk görsel diline sahip finansal işlem ve para transferi arayüzü.

**FOOTRA Alican Yücel tarafından hazırlandı**

## Finansal işlem arayüzü

Uygulama; müşteri ve hesap yönetimi, demo bakiye yükleme/çekme/transfer işlemleri,
filtrelenebilir işlem geçmişi ve günlük/haftalık/aylık rapor ekranlarını içerir.

> Bu çalışma yalnızca tarayıcı içi bir arayüz prototipidir. Veriler oturum belleğinde
> tutulur ve sayfa yenilendiğinde sıfırlanır. Gerçek para hareketi, kalıcı kayıt,
> kullanıcı doğrulaması veya eşzamanlı işlem güvenliği sağlamaz. Üretim kullanımı için
> güvenli bir backend, veritabanı işlemleri ve kimlik doğrulama gerekir.

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.3.0.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Docker Compose

Build and start the production SSR container:

```bash
docker compose up --build
```

Open `http://localhost:4000/`. To stop the container, run `docker compose down`.
Set `PORT` in the environment to change the host port.
For a custom hostname, add it to `security.allowedHosts` in `angular.json` before building.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
