import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Movie } from '../../models/movie';
import { WishlistService, WishlistItem } from '../../services/wishlist.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-wishlist',
  imports: [CommonModule, RouterLink],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.scss'
})

export class Wishlist implements OnInit, OnDestroy {

  // wishlistItems: Movie[] = [];
  wishlistItems: WishlistItem[] = [];
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor( private wishlistService: WishlistService, private apiService: ApiService) { }

  ngOnInit(): void {
    this.wishlistService.wishlist$.pipe(takeUntil(this.unsubscribe$)).subscribe(items => {
      this.wishlistItems = items;
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getMovieImageUrl(posterPath: string | null): string {
    return this.apiService.getFullImageUrl(posterPath);
  }

  removeFromWishlist(item: WishlistItem): void {
    this.wishlistService.removeFromWishlist(item);
  }

}
