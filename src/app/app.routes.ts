import { Routes } from '@angular/router';
import { MovieList } from './components/movie-list/movie-list';
import { MovieDetails } from './components/movie-details/movie-details';
import { SearchResults } from './components/search-results/search-results';
import { Wishlist } from './components/wishlist/wishlist';

export const routes: Routes = [
  { path: '', redirectTo: 'movies', pathMatch: 'full'},
  { path: 'movies', component: MovieList, data: { mediaType: 'movie', title: 'Now Playing Movies' }},
  { path: 'tvshows', component: MovieList, data: { mediaType: 'tv', title: 'Popular TV Shows' } },
  { path: 'details/:id/:type', component: MovieDetails},
  { path: 'search', component: SearchResults},
  { path: 'wishlist', component: Wishlist },

  { path: '**', redirectTo: '' }
];
