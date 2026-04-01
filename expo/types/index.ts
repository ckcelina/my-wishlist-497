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
  priority?: 'high' | 'medium' | 'low';
  notes?: string;
  tags?: string[];
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
  chatType?: "open" | "surprise";
  subjectUserId?: string;
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

export interface ChatMessage {
  id: string;
  wishlistId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  type: "message" | "assignment" | "system";
  assignedItemId?: string;
  assignedTo?: string;
}

export interface ItemAssignment {
  productId: string;
  assignedTo: string;
  assignedToName: string;
  assignedBy: string;
  wishlistId: string;
  timestamp: string;
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
