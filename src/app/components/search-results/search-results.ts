import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { Movie } from '../../models/movie';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { WishlistService } from '../../services/wishlist.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-results',
  imports: [CommonModule, RouterLink, NgbPaginationModule, FormsModule],
  templateUrl: './search-results.html',
  styleUrl: './search-results.scss'
})

export class SearchResults implements OnInit, OnDestroy {

  movies: Movie[] = [];
  loading: boolean = false;
  error: string | null = null;
  searchQuery: string = '';
  currentPage: number = 1;
  totalPages: number = 0;

  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private route: ActivatedRoute, private apiService: ApiService, private wishlistService: WishlistService) { }

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
      this.searchQuery = params['query'] || '';
      // this.currentPage = params['page'] ? +params['page'] : 1;
      this.currentPage = +params['page'] || 1;
      if (this.searchQuery) {
        this.search();
      }
      else {
        this.movies = [];
        this.totalPages = 0;
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  search(): void {
    if (!this.searchQuery.trim()) {
      this.movies = [];
      this.totalPages = 0;
      return;
    }

    this.loading = true;
    this.error = null;

    this.apiService.searchMovies(this.searchQuery, this.currentPage)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (data) => {
          if (data && Array.isArray(data.movies)) {
            this.movies = data.movies.map((movie: Movie) => {
              const mediaType = movie.media_type || 'movie';
              return {
                ...movie,
                media_type: mediaType,
                isInWishlist: this.wishlistService.isInWishlist({ id: movie.id, media_type: mediaType })
              };
            });
            this.totalPages = data.totalPages;
          } else {
            this.movies = [];
            this.totalPages = 0;
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Error fetching search results:', err);
          this.error = 'Failed to load search results. Please try again later.';
          this.loading = false;
          this.movies = [];
          this.totalPages = 0;
        }
      });
  }

  getMovieImageUrl(posterPath: string | null | undefined): string {
    return this.apiService.getFullImageUrl(posterPath);
  }

  // toggleWishlist(movie: Movie): void {
  //   const mediaType = movie.media_type || 'movie';
  //   if (this.wishlistService.isInWishlist(movie)) {
  //     this.wishlistService.removeFromWishlist(movie);
  //   } else {
  //     this.wishlistService.addToWishList(movie);
  //   }
  //   movie.isInWishlist = !movie.isInWishlist;
  // }


  toggleWishlist(movie: Movie): void {
    const itemForWishlist = {
      id: movie.id,
      title: movie.title || movie.name,
      poster_path: movie.poster_path,
      media_type: movie.media_type || 'movie',
      overview: movie.overview,
      release_date: movie.release_date,
      first_air_date: movie.first_air_date,
      vote_average: movie.vote_average
    };

    if (this.wishlistService.isInWishlist(itemForWishlist)) {
      this.wishlistService.removeFromWishlist(itemForWishlist);
    } else {
      this.wishlistService.addToWishList(itemForWishlist);
    }
    // Update isInWishlist status immediately in the UI
    this.movies = this.movies.map(m =>
      m.id === movie.id && m.media_type === movie.media_type
        ? { ...m, isInWishlist: !m.isInWishlist }
        : m
    );
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.search();
  }

}


