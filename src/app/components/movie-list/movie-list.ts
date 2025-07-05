import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../services/api.service';
import { WishlistItem, WishlistService } from '../../services/wishlist.service';
import { Observable, Subject, takeUntil } from 'rxjs';
import { LanguageService } from '../../services/language.service';

interface Movie {
  id: number;
  title?: string;
  name?: string;
  // poster_path: string | null | undefined;
  poster_path: string | undefined;
  release_date: string;
  first_air_date?: string;
  vote_average: number;
  media_type: 'movie' | 'tv';
  isInWishlist?: boolean;
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
  mediaType: 'movie' | 'tv' = 'movie';
  sectionTitle: string = 'Now Playing Movies';
  currentLanguage: string = 'en'

  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private apiService: ApiService, private wishlistService: WishlistService, private languageService: LanguageService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.languageService.currentLanguage$.pipe(takeUntil(this.unsubscribe$)).subscribe((lang) => {
      this.currentLanguage = lang;
      this.loadMovies();
    });
    // this.loadMovies();
    this.route.data.pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
      this.mediaType = data['mediaType'];
      this.sectionTitle = data['title'];
      this.currentPage = 1;
      this.loadMovies()
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  loadMovies(): void {
    this.loading = true;
    this.error = null;

    let mediaObservable: Observable<any>;

    if (this.mediaType === 'movie') {
      mediaObservable = this.apiService.getNowPlayingMovies(this.currentPage); /// , this.currentLanguage
    } else { // mediaType === 'tv'
      mediaObservable = this.apiService.getPopularTvShows(this.currentPage);  /// , this.currentLanguage
    }

    mediaObservable.pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: (response) => {
        this.movies = response.results.map((item: any) => ({
          id: item.id,
          title: item.title,
          name: item.name,
          poster_path: item.poster_path,
          release_date: item.release_date,
          first_air_date: item.first_air_date,
          vote_average: item.vote_average,
          media_type: item.media_type || this.mediaType,
          isInWishlist: this.wishlistService.isInWishlist({ id: item.id, media_type: item.media_type || this.mediaType })
        }));
        this.totalPages = response.total_pages;
        this.loading = false;
      },
      error: (error) => {
        console.error(`Error fetching ${this.mediaType}s:`, error);
        this.error = `Failed to load ${this.mediaType === 'movie' ? 'movies' : 'TV shows'}. Please try again later.`;
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
      title: movie.title || movie.name,
      poster_path: movie.poster_path,
      media_type: 'movie'
    };

    if (this.wishlistService.isInWishlist(wishlistItem)) {
      this.wishlistService.removeFromWishlist(wishlistItem);
    }
    else {
      this.wishlistService.addToWishList(wishlistItem);
    }
    movie.isInWishlist = !movie.isInWishlist;
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
    return this.wishlistService.isInWishlist({ id: movie.id, media_type: movie.media_type });
  }

  getMovieImageUrl(path: string | undefined): string {
    return this.apiService.getFullImageUrl(path);
  }

}
