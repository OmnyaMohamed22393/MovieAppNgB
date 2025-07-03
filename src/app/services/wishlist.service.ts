import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface WishlistItem {
  id: number;
  title?: string;
  name?: string;
  // poster_path?: string | null;
  poster_path?: string | undefined;
  media_type: 'movie' | 'tv';
  overview?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;

}

@Injectable({
  providedIn: 'root'
})
export class WishlistService {

  private WISHLIST_KEY = 'movie_app_wishlist';
  private _wishlist: BehaviorSubject<WishlistItem[]> = new BehaviorSubject<WishlistItem[]>([]);
  public readonly wishlist$: Observable<WishlistItem[]> = this._wishlist.asObservable();

  private _wishlistCount: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public readonly wishlistCount$: Observable<number> = this._wishlistCount.asObservable();

  constructor() {
    this.loadWishlistFromLocalStorage();
  }

  private loadWishlistFromLocalStorage(): void {
    try {
      const storedWishlist = localStorage.getItem(this.WISHLIST_KEY);
      if (storedWishlist) {
        const wishlistItems: WishlistItem[] = JSON.parse(storedWishlist);
        this._wishlist.next(wishlistItems);
        this._wishlistCount.next(wishlistItems.length);
      }
    } catch (e) {
        console.error("Error loading wishlist from local storage", e);
        this._wishlist.next([]);
        this._wishlistCount.next(0);
      }
    }

    private saveWishlistToLocalStorage(wishlist: WishlistItem[]): void {
      try {
        localStorage.setItem(this.WISHLIST_KEY, JSON.stringify(wishlist));
      } catch (e) {
        console.error("Error saving wishlist to local storage", e);
      }
    }

    addToWishList(item: WishlistItem): void {
      const currentWishlist = this._wishlist.value;
      if (!currentWishlist.some(wi => wi.id === item.id && wi.media_type === item.media_type)) {
        const updateWishlist = [...currentWishlist, item];
        this._wishlist.next(updateWishlist);
        this._wishlistCount.next(updateWishlist.length);
        this.saveWishlistToLocalStorage(updateWishlist);
        console.log(`Added to wishlist: ${item.title || item.name} (${item.media_type})`);
      }
    }

    removeFromWishlist(item: WishlistItem): void {
      const currentWishlist = this._wishlist.value;
      const updatedWishlist = currentWishlist.filter(wi => !(wi.id === item.id && wi.media_type === item.media_type));
      this._wishlist.next(updatedWishlist);
      this._wishlistCount.next(updatedWishlist.length);
      this.saveWishlistToLocalStorage(updatedWishlist);
      console.log(`Removed from wishlist: ${item.title || item.name} (${item.media_type})`);
    }

    isInWishlist(item: WishlistItem): boolean {
      return this._wishlist.value.some(wi => wi.id === item.id && wi.media_type === item.media_type);
    }

  }


