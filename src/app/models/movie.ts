// export interface Movie {
//   id: number;
//   title?: string;
//   name?: string;
//   overview: string;
//   poster_path: string | null;
//   backdrop_path?: string | null;
//   release_date?: string;
//   first_air_date?: string;
//   vote_average: number;
//   media_type: 'movie' | 'tv';
//   genre_ids?: number[];
//   original_language?: string;
//   original_title?: string;
//   popularity?: number;
//   video?: boolean;
//   vote_count?: number;
//   isInWishlist?: boolean;
// }


export interface Movie {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  // poster_path: string | null;
  poster_path: string | undefined;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  media_type: 'movie' | 'tv';
  genre_ids?: number[];
  original_language?: string;
  original_title?: string;
  popularity?: number;
  video?: boolean;
  vote_count?: number;
  isInWishlist?: boolean;
}
