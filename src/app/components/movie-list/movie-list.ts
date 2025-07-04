import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../services/api.service';
import { WishlistItem, WishlistService } from '../../services/wishlist.service';
import { Subject, takeUntil } from 'rxjs';
import { LanguageService } from '../../services/language.service';

interface Movie {
  id: number;
  title: string;
  // poster_path: string | null | undefined;
  poster_path: string | undefined;
  release_date: string;
  vote_average: number;
}

@Component({
  selector: 'app-movie-list',
  imports: [CommonModule, RouterLink, NgbPaginationModule],
  templateUrl: './movie-list.html',
  styleUrl: './movie-list.scss'
})
export class MovieList implements OnInit, OnDestroy {

  movies: Movie[] = [];
  currentPage: number = 1;
  totalPages: number = 1;
  loading: boolean = false;
  error: string | null = null;

  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private apiService: ApiService, private wishlistService: WishlistService, private languageService: LanguageService) { }

  ngOnInit(): void {
    this.languageService.currentLanguage$.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
      this.currentPage = 1;
      this.loadMovies();
    });
    this.loadMovies();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  loadMovies(): void {
    this.loading = true;
    this.error = null;
    this.apiService.getNowPlayingMovies(this.currentPage).pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: (response) => {
        this.movies = response.results.map((movie: any) => ({
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
          release_date: movie.release_date,
          vote_average: movie.vote_average
        }));
        this.totalPages = response.total_pages;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching now playing movies:', error);
        this.error = 'Failed to load movies. Please try again later.';
        this.loading = false;
      }
    });
  }

  onPageChange(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.currentPage = newPage;
      this.loadMovies();
      window.scrollTo(0, 0);
    }
  }

  toggleWishlist(movie: Movie): void {
    const wishlistItem: WishlistItem = {
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      media_type: 'movie'
    };

    if (this.wishlistService.isInWishlist(wishlistItem)) {
      this.wishlistService.removeFromWishlist(wishlistItem);
    }
    else {
      this.wishlistService.addToWishList(wishlistItem);
    }
  }

  isMovieInWishlist(movie: Movie): boolean {
    ////
    const wishlistItem: WishlistItem = {
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      media_type: 'movie'
    };
    ////
    return this.wishlistService.isInWishlist({ id: movie.id, media_type: 'movie' });
  }

  getMovieImageUrl(path: string | undefined): string {
    return this.apiService.getFullImageUrl(path);
  }

}
