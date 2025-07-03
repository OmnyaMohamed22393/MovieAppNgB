import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { API_KEY, IMAGE_BASE_URL } from '../app.config';
import { Observable } from 'rxjs';
import { Movie } from '../models/movie';
import { map } from 'rxjs/operators';
import { ReviewsResponse } from '../models/review';

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


  constructor( private http: HttpClient, @Inject(API_KEY) private apiKey: string, @Inject(IMAGE_BASE_URL) public imageBaseUrl: string) { }

  private getHttpParams(language: string = 'en', page?: number, query?: string): HttpParams {
    let params = new HttpParams().set('api_key', this.apiKey).set('language', language);
    if (page) {
      params = params.set('page', page.toString());
    }
    if (query) {
      params = params.set('query', query);
    }
    return params;
  }

  getNowPlayingMovies(page: number = 1, language: string = 'en'): Observable<any> {
    const params = this.getHttpParams(language, page);
    return this.http.get(`${this.BASE_URL}/movie/now_playing`, { params });
  }

  getMovieDetails(movieId: number, language: string = 'en'): Observable<any> {
    const params = this.getHttpParams(language);
    return this.http.get(`${this.BASE_URL}/movie/${movieId}`, { params });
  }

  getMovieRecommendations(movieId: number, language: string = 'en', page: number = 1): Observable<any> {
    const params = this.getHttpParams(language, page);
    return this.http.get(`${this.BASE_URL}/movie/${movieId}/recommendations`, { params });
  }

  getMovieReviews(movieId: number, language: string = 'en', page: number = 1): Observable<ReviewsResponse> {
    const params = this.getHttpParams(language, page);
    return this.http.get<ReviewsResponse>(`${this.BASE_URL}/movie/${movieId}/reviews`, { params });
  }

  // searchMovies(query: string, page: number = 1, language: string = 'en'): Observable<any> {
  //   const params = this.getHttpParams(language, page, query);
  //   return this.http.get(`${this.BASE_URL}/search/movie`, { params });
  // }

  searchMovies(query: string, page: number = 1, language: string = 'en'): Observable<{ movies: Movie[], totalPages: number }> {
    const params = this.getHttpParams(language, page, query);
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

  getPopularTvShows(page: number = 1, language: string = 'en'): Observable<any> {
    const params = this.getHttpParams(language, page);
    return this.http.get(`${this.BASE_URL}/tv/popular`, { params });
  }

  getTvShowDetails(seriesId: number, language: string = 'en'): Observable<any> {
    const params = this.getHttpParams(language);
    return this.http.get(`${this.BASE_URL}/tv/${seriesId}`, { params });
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
