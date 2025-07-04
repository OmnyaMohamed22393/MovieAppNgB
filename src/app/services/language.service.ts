import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  private readonly LANGUAGE_KEY = 'app_language';
  private _currentLanguage: BehaviorSubject<string>;

  constructor() {
    const savedLanguage = localStorage.getItem(this.LANGUAGE_KEY) || 'en';
    this._currentLanguage = new BehaviorSubject<string>(savedLanguage);
  }

  get currentLanguage$(): Observable<string> {
    return this._currentLanguage.asObservable();
  }

  setLanguage(language: string): void {
    const supportedLanguages = ['en', 'ar', 'fr', 'zh'];
    if (!supportedLanguages.includes(language)) {
      console.warn(`Language '${language}' is not supported. Defaulting to 'en'.`);
      language = 'en';
    }

    localStorage.setItem(this.LANGUAGE_KEY, language);
    this._currentLanguage.next(language);

    this.updateDocumentDirection(language);
  }

  getLanguage(): string {
    return this._currentLanguage.getValue();
  }

  private updateDocumentDirection(language: string): void {
    const htmlTag = document.getElementsByTagName('html')[0];
    if (htmlTag) {
      if (language === 'ar') {
        htmlTag.setAttribute('dir', 'rtl');
      } else {
        htmlTag.setAttribute('dir', 'ltr');
      }
    }
  }

}
