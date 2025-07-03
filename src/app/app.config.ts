import { ApplicationConfig, importProvidersFrom, InjectionToken, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

export const API_KEY = new InjectionToken<string>('api.key');
export const IMAGE_BASE_URL = new InjectionToken<string>('image.base.url');


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimationsAsync(),
    importProvidersFrom(NgbModule),
    { provide: API_KEY, useValue: '549a69428aa692f2dbd010eb9666fe5d' },
    { provide: IMAGE_BASE_URL, useValue: 'https://image.tmdb.org/t/p/w500' },
  ]
};
