import { APP_INITIALIZER, Provider } from '@angular/core';

function applySavedThemePreference(): () => void {
  return () => {
    const v = localStorage.getItem('theme-dark');
    if (v === '1') document.body.classList.toggle('dark', true);
    else if (v === '0') document.body.classList.toggle('dark', false);
  };
}

export const APP_PROVIDERS: Provider[] = [
  { provide: APP_INITIALIZER, useFactory: applySavedThemePreference, multi: true }
];

