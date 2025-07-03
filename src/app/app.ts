import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { WishlistService } from './services/wishlist.service';
import { count, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, NgbDropdownModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  protected title = 'MovieAppNgB';

  wishlistCount: number = 0;
  selectedLanguage: string = 'en';
  searchQuery: string = '';

  languages = [
    { code: 'en', name: 'En' },
    { code: 'ar', name: 'Ar' },
    { code: 'fr', name: 'Fr' },
    { code: 'zh', name: 'Zh' },
  ];

  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private wishlistService: WishlistService, private router: Router) { }

  ngOnInit(): void {
    this.wishlistService.wishlistCount$.pipe(takeUntil(this.unsubscribe$)).subscribe((count: number) => {
      this.wishlistCount = count;
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onLanguageChange(langCode: string) {
    this.selectedLanguage = langCode;
    console.log('Language changed to:', this.selectedLanguage);
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      console.log('Searching for:', this.searchQuery);
      // this.router.navigate(['/search-results', this.searchQuery]);
      this.router.navigate(['/search'], { queryParams: { query: this.searchQuery, page: 1 } });
    }
  }
}
