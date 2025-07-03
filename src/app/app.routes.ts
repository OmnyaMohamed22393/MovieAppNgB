import { Routes } from '@angular/router';
import { MovieList } from './components/movie-list/movie-list';
import { MovieDetails } from './components/movie-details/movie-details';
import { SearchResults } from './components/search-results/search-results';
import { Wishlist } from './components/wishlist/wishlist';

export const routes: Routes = [
  { path: '', component: MovieList},
  { path: 'movies', component: MovieList},
  { path: 'details/:id/:type', component: MovieDetails},
  { path: 'search', component: SearchResults},
  { path: 'wishlist', component: Wishlist },

  { path: '**', redirectTo: '' }
];
