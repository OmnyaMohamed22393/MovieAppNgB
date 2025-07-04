import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { WishlistItem, WishlistService } from '../../services/wishlist.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Review, ReviewsResponse } from '../../models/review';
import { LanguageService } from '../../services/language.service';

interface MovieDetail {
  id: number;
  title: string;
  // poster_path: string | null;
  poster_path: string | undefined;
  backdrop_path: string | null;
  overview: string;
  release_date: string;
  vote_average: number;
  genres: { id: number; name: string }[];
  runtime: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  tagline?: string;
  homepage?: string;
}

@Component({
  selector: 'app-movie-details',
  imports: [CommonModule, RouterLink],
  templateUrl: './movie-details.html',
  styleUrl: './movie-details.scss'
})
export class MovieDetails implements OnInit, OnDestroy {

  movieId: number | null = null;
  mediaType: 'movie' | 'tv' | null = null;
  details: MovieDetail | null = null;
  recommendations: any[] = [];
  reviews: Review[] = [];
  loading: boolean = true;
  error: string | null = null;
  isInWishlist: boolean = false;
  currentLanguage: string = 'en';

  private unsubscribe$: Subject<void> = new Subject<void>();
  constructor(private route: ActivatedRoute, private apiService: ApiService, private wishlistService: WishlistService, private sanitizer: DomSanitizer, private languageService: LanguageService) { }

  ngOnInit(): void {

    this.languageService.currentLanguage$.pipe(takeUntil(this.unsubscribe$)).subscribe(lang => {
      this.currentLanguage = lang;
      if (this.movieId && this.mediaType) {
        this.loadDetails();
        this.checkWishlistStatus();
      }
    });

    this.route.paramMap.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
      this.movieId = Number(params.get('id'));
      this.mediaType = params.get('type') as 'movie' | 'tv';

      if (this.movieId && this.mediaType) {
        this.loadDetails();
        this.checkWishlistStatus();
        // this.loadRecommendations();
      }
      else {
        this.error = 'Invalid movie or TV show ID/Type.';
        this.loading = false;
      }
    });
  }

  loadDetails(): void {
    this.loading = true;
    this.error = null;
    this.reviews = [];
    this.recommendations = [];

    let detailsObservable: Observable<any>;
    if (this.mediaType === 'movie') {
      detailsObservable = this.apiService.getMovieDetails(this.movieId!); /// !, this.currentLanguage
    }
    else if (this.mediaType == 'tv') {
      detailsObservable = this.apiService.getTvShowDetails(this.movieId!); /// !, this.currentLanguage
    }
    else {
      this.error = 'Unsupported media type.';
      this.loading = false;
      return;
    }

    detailsObservable.pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: (data) => {
        this.details = {
          id: data.id,
          title: data.title || data.name,
          poster_path: data.poster_path,
          backdrop_path: data.backdrop_path,
          overview: data.overview,
          release_date: data.release_date || data.first_air_date,
          vote_average: data.vote_average,
          genres: data.genres,
          runtime: data.runtime,
          number_of_seasons: data.number_of_seasons,
          number_of_episodes: data.number_of_episodes,
          tagline: data.tagline,
          homepage: data.homepage,
        };
        this.loading = false;

        let reviewsObservable: Observable<ReviewsResponse>;

        if (this.mediaType === 'movie') {
          reviewsObservable = this.apiService.getMovieReviews(this.movieId!); /// !, this.currentLanguage
        } else if (this.mediaType === 'tv') {
          reviewsObservable = this.apiService.getTvShowReviews(this.movieId!); //// !, this.currentLanguage
        } else {
          reviewsObservable = new Observable();
        }

        reviewsObservable.pipe(
          takeUntil(this.unsubscribe$)
        ).subscribe({
          next: (revData) => {
            if (revData && revData.results) {
              this.reviews = revData.results;
            }
          },
          error: (err) => console.error('Error fetching reviews:', err)
        });

        let recommendationsObservable: Observable<any>;
        if (this.mediaType === 'movie') {
          recommendationsObservable = this.apiService.getMovieRecommendations(this.movieId!);  /// !, this.currentLanguage
        } else if (this.mediaType === 'tv') {
          recommendationsObservable = this.apiService.getTvShowRecommendations(this.movieId!); /// !, this.currentLanguage
        } else {
          recommendationsObservable = new Observable();
        }

        recommendationsObservable.pipe(
          takeUntil(this.unsubscribe$)
        ).subscribe({
          next: (recData: any) => {
            if (recData && recData.results) {
              this.recommendations = recData.results.map((recItem: any) => ({ // map لعنصر عام
                ...recItem,
                media_type: recItem.media_type || this.mediaType, // استخدام media_type الموجودة في العنصر أو الحالية
                isInWishlist: this.wishlistService.isInWishlist({ id: recItem.id, media_type: recItem.media_type || this.mediaType })
              }));
            }
          },
          error: (err) => console.error('Error fetching recommendations:', err)
        });

      },
      error: (err) => {
        console.error('Error fetching details:', err);
        this.error = 'Failed to load details. Please try again later.';
        this.loading = false;
      }
    });

    //     if (this.mediaType === 'movie') {
    //       this.apiService.getMovieReviews(this.movieId!).pipe(
    //         takeUntil(this.unsubscribe$)
    //       ).subscribe({
    //         next: (revData) => {
    //           if (revData && revData.results) {
    //             this.reviews = revData.results;
    //           }
    //         },
    //         error: (err) => console.error('Error fetching reviews:', err)
    //       });
    //     }

    //     if (this.mediaType === 'movie') {
    //       this.apiService.getMovieRecommendations(this.movieId!).pipe(
    //         takeUntil(this.unsubscribe$)
    //       ).subscribe({
    //         next: (recData: any) => {
    //           if (recData && recData.results) {
    //             this.recommendations = recData.results.map((recMovie: any) => ({
    //               ...recMovie,
    //               media_type: recMovie.media_type || 'movie',
    //               isInWishlist: this.wishlistService.isInWishlist({ id: recMovie.id, media_type: recMovie.media_type || 'movie' })
    //             }));
    //           }
    //         },
    //         error: (err) => console.error('Error fetching recommendations:', err)
    //       });
    //     }

    //   },
    //   error: (err) => {
    //     console.error('Error fetching details:', err);
    //     this.error = 'Failed to load details. Please try again later.';
    //     this.loading = false;
    //   }
    // });
  }

  checkWishlistStatus(): void {
    if (this.movieId && this.mediaType) {
      this.isInWishlist = this.wishlistService.isInWishlist({
        id: this.movieId,
        media_type: this.mediaType,
      });
    }
  }

  toggleWishlist(): void {
    if (!this.details || !this.mediaType) return;

    const wishlistItem: WishlistItem = {
      id: this.details.id,
      title: this.details.title,
      poster_path: this.details.poster_path,
      media_type: this.mediaType,
    };

    if (this.isInWishlist) {
      this.wishlistService.removeFromWishlist(wishlistItem);
    }
    else {
      this.wishlistService.addToWishList(wishlistItem);
    }
    this.isInWishlist = !this.isInWishlist;
  }

  getFormattedRuntime(): string {
    if (!this.details?.runtime) return '';
    const hours = Math.floor(this.details.runtime / 60);
    const minutes = this.details.runtime % 60;
    return `${hours}h ${minutes}m`;
  }

  getPosterImageUrl(path: string | null): string {
    return this.apiService.getFullImageUrl(path);
  }

  getBackdropImageUrl(path: string | null): string {
    if (!path) {
      return 'imgs/placeholder-backdrop.png';
    }
    return `https://image.tmdb.org/t/p/w1280${path}`;
  }

  // Placeholder for loading recommendations (will be implemented later)
  // loadRecommendations(): void {
    // this.apiService.getMovieRecommendations(this.movieId!).pipe(takeUntil(this.unsubscribe$)).subscribe({
    //   next: (response) => {
    //     this.recommendations = response.results.slice(0, 5); // Take first 5 for display
    //   },
    //   error: (err) => console.error('Error fetching recommendations:', err)
    // });
  // }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
