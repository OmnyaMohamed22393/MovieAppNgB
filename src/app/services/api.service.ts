import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { API_KEY, IMAGE_BASE_URL } from '../app.config';
import { Observable } from 'rxjs';
import { Movie } from '../models/movie';
import { map } from 'rxjs/operators';
import { ReviewsResponse } from '../models/review';
import { LanguageService } from './language.service';

interface TmdbSearchResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private BASE_URL = 'https://api.themoviedb.org/3';

  constructor( private http: HttpClient, @Inject(API_KEY) private apiKey: string, @Inject(IMAGE_BASE_URL) public imageBaseUrl: string, private languageService: LanguageService) { }

  private getHttpParams(language?: string, page?: number, query?: string): HttpParams {
    const currentLanguage = language || this.languageService.getLanguage();
    let params = new HttpParams().set('api_key', this.apiKey).set('language', currentLanguage);
    if (page) {
      params = params.set('page', page.toString());
    }
    if (query) {
      params = params.set('query', query);
    }
    return params;
  }

  getNowPlayingMovies(page: number = 1): Observable<any> {
    const params = this.getHttpParams(undefined, page);
    return this.http.get(`${this.BASE_URL}/movie/now_playing`, { params });
  }

  getMovieDetails(movieId: number): Observable<any> {
    const params = this.getHttpParams();
    return this.http.get(`${this.BASE_URL}/movie/${movieId}`, { params });
  }

  getMovieRecommendations(movieId: number, page: number = 1): Observable<any> {
    const params = this.getHttpParams(undefined, page);
    return this.http.get(`${this.BASE_URL}/movie/${movieId}/recommendations`, { params });
  }

  getMovieReviews(movieId: number, page: number = 1): Observable<ReviewsResponse> {
    const params = this.getHttpParams(undefined, page);
    return this.http.get<ReviewsResponse>(`${this.BASE_URL}/movie/${movieId}/reviews`, { params });
  }

  // searchMovies(query: string, page: number = 1, language: string = 'en'): Observable<any> {
  //   const params = this.getHttpParams(language, page, query);
  //   return this.http.get(`${this.BASE_URL}/search/movie`, { params });
  // }

  searchMovies(query: string, page: number = 1): Observable<{ movies: Movie[], totalPages: number }> {
    const params = this.getHttpParams(undefined, page, query);
    return this.http.get<TmdbSearchResponse>(`${this.BASE_URL}/search/multi`, { params }).pipe(
      map(response => {
        return {
          movies: response.results.filter(
            (item: Movie) => item.media_type === 'movie' || item.media_type === 'tv'
          ),
          totalPages: response.total_pages
        };
      })
    );
  }

  getPopularTvShows(page: number = 1): Observable<any> {
    const params = this.getHttpParams(undefined, page);
    return this.http.get(`${this.BASE_URL}/tv/popular`, { params });
  }

  getTvShowDetails(seriesId: number): Observable<any> {
    const params = this.getHttpParams();
    return this.http.get(`${this.BASE_URL}/tv/${seriesId}`, { params });
  }

  getTvShowReviews(seriesId: number): Observable<ReviewsResponse> {
    const params = this.getHttpParams();
    return this.http.get<ReviewsResponse>(`${this.BASE_URL}/tv/${seriesId}/reviews`, { params });
  }

  getTvShowRecommendations(seriesId: number): Observable<any> {
    const params = this.getHttpParams();
    return this.http.get(`${this.BASE_URL}/tv/${seriesId}/recommendations`, { params });
  }

  // getFullImageUrl(posterPath: string | null) {
  //   if (!posterPath) {
  //     // return 'assets/placeholder.png';
  //     return '../../../public/imgs/placeholder.png';
  //   }
  //   return `${this.imageBaseUrl}${posterPath}`;
  // }

  getFullImageUrl(posterPath: string | null | undefined): string {
    if (!posterPath) {
      return 'imgs/placeholder.png';
    }
    return `${this.imageBaseUrl}${posterPath}`;
  }

}
