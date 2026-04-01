import { supabase } from "@/lib/supabase";
import { Product, Wishlist, ChatMessage, ItemAssignment } from "@/types";

export interface DbWishlist {
  id: string;
  user_id: string;
  title: string;
  description: string;
  emoji: string;
  color: string;
  is_shared: boolean;
  chat_type?: string;
  subject_user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface DbWishlistItem {
  id: string;
  wishlist_id: string;
  product_id: string;
  title: string;
  image: string;
  price: number;
  currency: string;
  store: string;
  store_url: string;
  description: string;
  category: string;
  is_purchased: boolean;
  added_at: string;
  country: string;
  rating: number | null;
  alternatives: string | null;
}

export interface DbCollaborator {
  id: string;
  wishlist_id: string;
  user_id: string;
  name: string;
  avatar: string;
  role: "owner" | "editor" | "viewer";
  created_at: string;
}

export interface DbChatMessage {
  id: string;
  wishlist_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar: string;
  text: string;
  type: "message" | "assignment" | "system";
  assigned_item_id: string | null;
  assigned_to: string | null;
  created_at: string;
}

export interface DbItemAssignment {
  id: string;
  wishlist_id: string;
  product_id: string;
  assigned_to: string;
  assigned_to_name: string;
  assigned_by: string;
  created_at: string;
}

export async function fetchUserWishlists(userId: string): Promise<Wishlist[]> {
  try {
    console.log("[DB] Fetching wishlists for user:", userId);

    const { data: collabData, error: collabError } = await supabase
      .from("collaborators")
      .select("wishlist_id")
      .eq("user_id", userId);

    if (collabError) {
      console.log("[DB] Error fetching collaborator wishlists:", collabError.message);
    }

    const collabWishlistIds = (collabData || []).map((c: { wishlist_id: string }) => c.wishlist_id);

    const { data: ownedData, error: ownedError } = await supabase
      .from("wishlists")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (ownedError) {
      console.log("[DB] Error fetching owned wishlists:", ownedError.message);
      return [];
    }

    let sharedData: DbWishlist[] = [];
    if (collabWishlistIds.length > 0) {
      const { data, error } = await supabase
        .from("wishlists")
        .select("*")
        .in("id", collabWishlistIds)
        .neq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (!error && data) {
        sharedData = data as DbWishlist[];
      }
    }

    const allDbWishlists = [...(ownedData as DbWishlist[] || []), ...sharedData];
    const wishlistIds = allDbWishlists.map((w) => w.id);

    if (wishlistIds.length === 0) {
      console.log("[DB] No wishlists found");
      return [];
    }

    const [itemsResult, collabsResult] = await Promise.all([
      supabase.from("wishlist_items").select("*").in("wishlist_id", wishlistIds),
      supabase.from("collaborators").select("*").in("wishlist_id", wishlistIds),
    ]);

    const items = (itemsResult.data as DbWishlistItem[] || []);
    const collabs = (collabsResult.data as DbCollaborator[] || []);

    const wishlists: Wishlist[] = allDbWishlists.map((dbW) => {
      const wItems = items.filter((i) => i.wishlist_id === dbW.id);
      const wCollabs = collabs.filter((c) => c.wishlist_id === dbW.id);

      return {
        id: dbW.id,
        title: dbW.title,
        description: dbW.description,
        emoji: dbW.emoji,
        color: dbW.color,
        itemCount: wItems.length,
        isShared: dbW.is_shared,
        chatType: (dbW.chat_type as "open" | "surprise" | undefined) ?? undefined,
        subjectUserId: dbW.subject_user_id ?? undefined,
        createdAt: dbW.created_at,
        updatedAt: dbW.updated_at,
        items: wItems.map((item) => ({
          id: item.product_id,
          title: item.title,
          image: item.image,
          price: item.price,
          currency: item.currency,
          store: item.store,
          storeUrl: item.store_url,
          description: item.description,
          category: item.category,
          isPurchased: item.is_purchased,
          addedAt: item.added_at,
          country: item.country,
          rating: item.rating ?? undefined,
          alternatives: item.alternatives ? JSON.parse(item.alternatives) : undefined,
        })),
        collaborators: wCollabs.map((c) => ({
          id: c.user_id,
          name: c.name,
          avatar: c.avatar,
          role: c.role,
        })),
      };
    });

    console.log(`[DB] Fetched ${wishlists.length} wishlists`);
    return wishlists;
  } catch (err) {
    console.error("[DB] fetchUserWishlists error:", err);
    return [];
  }
}

export async function createWishlist(
  userId: string,
  wishlist: Omit<Wishlist, "items" | "itemCount" | "collaborators">
): Promise<Wishlist | null> {
  try {
    console.log("[DB] Creating wishlist:", wishlist.title);

    const { data, error } = await supabase
      .from("wishlists")
      .insert({
        id: wishlist.id,
        user_id: userId,
        title: wishlist.title,
        description: wishlist.description,
        emoji: wishlist.emoji,
        color: wishlist.color,
        is_shared: wishlist.isShared,
        created_at: wishlist.createdAt,
        updated_at: wishlist.updatedAt,
      })
      .select()
      .single();

    if (error) {
      console.log("[DB] Error creating wishlist:", error.message);
      return null;
    }

    const dbW = data as DbWishlist;

    const { error: collabError } = await supabase
      .from("collaborators")
      .insert({
        wishlist_id: dbW.id,
        user_id: userId,
        name: "",
        avatar: "",
        role: "owner",
      });

    if (collabError) {
      console.log("[DB] Error adding owner collaborator:", collabError.message);
    }

    return {
      id: dbW.id,
      title: dbW.title,
      description: dbW.description,
      emoji: dbW.emoji,
      color: dbW.color,
      itemCount: 0,
      isShared: dbW.is_shared,
      createdAt: dbW.created_at,
      updatedAt: dbW.updated_at,
      items: [],
      collaborators: [{ id: userId, name: "", avatar: "", role: "owner" }],
    };
  } catch (err) {
    console.error("[DB] createWishlist error:", err);
    return null;
  }
}

export async function createWishlistWithIdentity(
  userId: string,
  wishlist: Omit<Wishlist, "items" | "itemCount" | "collaborators">,
  ownerName: string,
  ownerAvatar: string
): Promise<Wishlist | null> {
  try {
    console.log("[DB] Creating wishlist with identity:", wishlist.title);

    const { data, error } = await supabase
      .from("wishlists")
      .insert({
        id: wishlist.id,
        user_id: userId,
        title: wishlist.title,
        description: wishlist.description,
        emoji: wishlist.emoji,
        color: wishlist.color,
        is_shared: wishlist.isShared,
        created_at: wishlist.createdAt,
        updated_at: wishlist.updatedAt,
      })
      .select()
      .single();

    if (error) {
      console.log("[DB] Error creating wishlist:", error.message);
      return null;
    }

    const dbW = data as DbWishlist;

    const { error: collabError } = await supabase
      .from("collaborators")
      .insert({
        wishlist_id: dbW.id,
        user_id: userId,
        name: ownerName,
        avatar: ownerAvatar,
        role: "owner",
      });

    if (collabError) {
      console.log("[DB] Error adding owner collaborator:", collabError.message);
    }

    return {
      id: dbW.id,
      title: dbW.title,
      description: dbW.description,
      emoji: dbW.emoji,
      color: dbW.color,
      itemCount: 0,
      isShared: dbW.is_shared,
      createdAt: dbW.created_at,
      updatedAt: dbW.updated_at,
      items: [],
      collaborators: [{ id: userId, name: ownerName, avatar: ownerAvatar, role: "owner" }],
    };
  } catch (err) {
    console.error("[DB] createWishlistWithIdentity error:", err);
    return null;
  }
}

export async function addItemToWishlist(wishlistId: string, product: Product): Promise<boolean> {
  try {
    console.log("[DB] Adding item to wishlist:", wishlistId, product.title);

    const { error } = await supabase.from("wishlist_items").insert({
      wishlist_id: wishlistId,
      product_id: product.id,
      title: product.title,
      image: product.image,
      price: product.price,
      currency: product.currency,
      store: product.store,
      store_url: product.storeUrl,
      description: product.description,
      category: product.category,
      is_purchased: product.isPurchased,
      added_at: product.addedAt,
      country: product.country,
      rating: product.rating ?? null,
      alternatives: product.alternatives ? JSON.stringify(product.alternatives) : null,
    });

    if (error) {
      console.log("[DB] Error adding item:", error.message);
      return false;
    }

    await supabase
      .from("wishlists")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", wishlistId);

    return true;
  } catch (err) {
    console.error("[DB] addItemToWishlist error:", err);
    return false;
  }
}

export async function removeItemFromWishlist(wishlistId: string, productId: string): Promise<boolean> {
  try {
    console.log("[DB] Removing item from wishlist:", wishlistId, productId);

    const { error } = await supabase
      .from("wishlist_items")
      .delete()
      .eq("wishlist_id", wishlistId)
      .eq("product_id", productId);

    if (error) {
      console.log("[DB] Error removing item:", error.message);
      return false;
    }

    await supabase
      .from("wishlists")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", wishlistId);

    return true;
  } catch (err) {
    console.error("[DB] removeItemFromWishlist error:", err);
    return false;
  }
}

export async function toggleItemPurchased(wishlistId: string, productId: string, isPurchased: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("wishlist_items")
      .update({ is_purchased: isPurchased })
      .eq("wishlist_id", wishlistId)
      .eq("product_id", productId);

    if (error) {
      console.log("[DB] Error toggling purchased:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[DB] toggleItemPurchased error:", err);
    return false;
  }
}

export async function toggleWishlistShared(wishlistId: string, isShared: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("wishlists")
      .update({ is_shared: isShared })
      .eq("id", wishlistId);

    if (error) {
      console.log("[DB] Error toggling shared:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[DB] toggleWishlistShared error:", err);
    return false;
  }
}

export async function deleteWishlist(wishlistId: string): Promise<boolean> {
  try {
    console.log("[DB] Deleting wishlist:", wishlistId);

    await Promise.all([
      supabase.from("wishlist_items").delete().eq("wishlist_id", wishlistId),
      supabase.from("collaborators").delete().eq("wishlist_id", wishlistId),
      supabase.from("chat_messages").delete().eq("wishlist_id", wishlistId),
      supabase.from("item_assignments").delete().eq("wishlist_id", wishlistId),
    ]);

    const { error } = await supabase.from("wishlists").delete().eq("id", wishlistId);

    if (error) {
      console.log("[DB] Error deleting wishlist:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[DB] deleteWishlist error:", err);
    return false;
  }
}

export async function fetchChatMessages(wishlistIds: string[]): Promise<ChatMessage[]> {
  try {
    if (wishlistIds.length === 0) return [];

    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .in("wishlist_id", wishlistIds)
      .order("created_at", { ascending: true });

    if (error) {
      console.log("[DB] Error fetching chat messages:", error.message);
      return [];
    }

    return (data as DbChatMessage[]).map((m) => ({
      id: m.id,
      wishlistId: m.wishlist_id,
      senderId: m.sender_id,
      senderName: m.sender_name,
      senderAvatar: m.sender_avatar,
      text: m.text,
      timestamp: m.created_at,
      type: m.type,
      assignedItemId: m.assigned_item_id ?? undefined,
      assignedTo: m.assigned_to ?? undefined,
    }));
  } catch (err) {
    console.error("[DB] fetchChatMessages error:", err);
    return [];
  }
}

export async function sendChatMessage(msg: Omit<ChatMessage, "id">): Promise<ChatMessage | null> {
  try {
    const { data, error } = await supabase
      .from("chat_messages")
      .insert({
        wishlist_id: msg.wishlistId,
        sender_id: msg.senderId,
        sender_name: msg.senderName,
        sender_avatar: msg.senderAvatar,
        text: msg.text,
        type: msg.type,
        assigned_item_id: msg.assignedItemId ?? null,
        assigned_to: msg.assignedTo ?? null,
      })
      .select()
      .single();

    if (error) {
      console.log("[DB] Error sending message:", error.message);
      return null;
    }

    const m = data as DbChatMessage;
    return {
      id: m.id,
      wishlistId: m.wishlist_id,
      senderId: m.sender_id,
      senderName: m.sender_name,
      senderAvatar: m.sender_avatar,
      text: m.text,
      timestamp: m.created_at,
      type: m.type,
      assignedItemId: m.assigned_item_id ?? undefined,
      assignedTo: m.assigned_to ?? undefined,
    };
  } catch (err) {
    console.error("[DB] sendChatMessage error:", err);
    return null;
  }
}

export async function fetchItemAssignments(wishlistIds: string[]): Promise<ItemAssignment[]> {
  try {
    if (wishlistIds.length === 0) return [];

    const { data, error } = await supabase
      .from("item_assignments")
      .select("*")
      .in("wishlist_id", wishlistIds);

    if (error) {
      console.log("[DB] Error fetching assignments:", error.message);
      return [];
    }

    return (data as DbItemAssignment[]).map((a) => ({
      productId: a.product_id,
      assignedTo: a.assigned_to,
      assignedToName: a.assigned_to_name,
      assignedBy: a.assigned_by,
      wishlistId: a.wishlist_id,
      timestamp: a.created_at,
    }));
  } catch (err) {
    console.error("[DB] fetchItemAssignments error:", err);
    return [];
  }
}

export async function createItemAssignment(assignment: ItemAssignment): Promise<boolean> {
  try {
    const { error } = await supabase.from("item_assignments").insert({
      wishlist_id: assignment.wishlistId,
      product_id: assignment.productId,
      assigned_to: assignment.assignedTo,
      assigned_to_name: assignment.assignedToName,
      assigned_by: assignment.assignedBy,
    });

    if (error) {
      console.log("[DB] Error creating assignment:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[DB] createItemAssignment error:", err);
    return false;
  }
}

export async function removeItemAssignment(wishlistId: string, productId: string, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("item_assignments")
      .delete()
      .eq("wishlist_id", wishlistId)
      .eq("product_id", productId)
      .eq("assigned_to", userId);

    if (error) {
      console.log("[DB] Error removing assignment:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[DB] removeItemAssignment error:", err);
    return false;
  }
}

export async function addCollaborator(
  wishlistId: string,
  userId: string,
  name: string,
  avatar: string,
  role: "editor" | "viewer" = "editor"
): Promise<boolean> {
  try {
    console.log("[DB] Adding collaborator:", userId, "to wishlist:", wishlistId);
    const { error } = await supabase.from("collaborators").insert({
      wishlist_id: wishlistId,
      user_id: userId,
      name,
      avatar,
      role,
    });

    if (error) {
      console.log("[DB] Error adding collaborator:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[DB] addCollaborator error:", err);
    return false;
  }
}

export async function removeCollaborator(wishlistId: string, userId: string): Promise<boolean> {
  try {
    console.log("[DB] Removing collaborator:", userId, "from wishlist:", wishlistId);
    const { error } = await supabase
      .from("collaborators")
      .delete()
      .eq("wishlist_id", wishlistId)
      .eq("user_id", userId);

    if (error) {
      console.log("[DB] Error removing collaborator:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[DB] removeCollaborator error:", err);
    return false;
  }
}

export async function findUserByEmail(email: string): Promise<{ id: string; full_name: string; avatar_url: string | null } | null> {
  try {
    console.log("[DB] Finding user by email:", email);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .eq("email", email)
      .single();

    if (error) {
      console.log("[DB] User not found:", error.message);
      return null;
    }
    return data as { id: string; full_name: string; avatar_url: string | null };
  } catch (err) {
    console.error("[DB] findUserByEmail error:", err);
    return null;
  }
}
