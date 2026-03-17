export interface Product {
  id: string;
  title: string;
  image: string;
  price: number;
  currency: string;
  store: string;
  storeUrl: string;
  description: string;
  category: string;
  isPurchased: boolean;
  addedAt: string;
  country: string;
  rating?: number;
  alternatives?: StoreAlternative[];
}

export interface StoreAlternative {
  store: string;
  price: number;
  currency: string;
  country: string;
  url: string;
  shippingAvailable: boolean;
}

export interface Wishlist {
  id: string;
  title: string;
  description: string;
  emoji: string;
  color: string;
  itemCount: number;
  collaborators: Collaborator[];
  isShared: boolean;
  createdAt: string;
  updatedAt: string;
  items: Product[];
}

export interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  role: "owner" | "editor" | "viewer";
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  productCount: number;
}

export interface Notification {
  id: string;
  type: "price_drop" | "shared_list" | "product_update" | "collaborator" | "system";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  image?: string;
  actionUrl?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  country: string;
  currency: string;
  wishlistCount: number;
  savedItems: number;
  sharedLists: number;
}
