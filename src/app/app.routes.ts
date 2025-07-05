import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'movies', pathMatch: 'full'},
  { path: 'movies', loadComponent: () => import('./components/movie-list/movie-list').then(m => m.MovieList), data: { mediaType: 'movie', title: 'Now Playing Movies' }},
  { path: 'tvshows', loadComponent: () => import('./components/movie-list/movie-list').then(m => m.MovieList), data: { mediaType: 'tv', title: 'Popular TV Shows' } },
  { path: 'details/:id/:type', loadComponent: () => import('./components/movie-details/movie-details').then(m => m.MovieDetails)},
  { path: 'search', loadComponent: () => import('./components/search-results/search-results').then(m => m.SearchResults)},
  { path: 'wishlist', loadComponent: () => import('./components/wishlist/wishlist').then(m => m.Wishlist)},

  { path: '**', redirectTo: '' }
];
