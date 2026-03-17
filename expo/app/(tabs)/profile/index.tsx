import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Settings,
  Globe,
  DollarSign,
  Shield,
  ChevronRight,
  LogOut,
  Heart,
  Share2,
  Gift,
} from "lucide-react-native";
import { useAppColors } from "@/hooks/useColorScheme";
import { useWishlistContext } from "@/providers/WishlistProvider";

export default function ProfileScreen() {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const { user, wishlists, sharedLists, allProducts } = useWishlistContext();

  const settingsSections = [
    {
      title: "PREFERENCES",
      items: [
        { icon: Globe, label: "Country", value: user.country },
        { icon: DollarSign, label: "Currency", value: user.currency },
      ],
    },
    {
      title: "ACCOUNT",
      items: [
        { icon: Shield, label: "Privacy" },
        { icon: Settings, label: "Settings" },
        { icon: LogOut, label: "Sign Out", isDestructive: true },
      ],
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={[styles.profileHeader, { paddingTop: insets.top + 20, backgroundColor: colors.surface }]}>
          <Image source={{ uri: user.avatar }} style={[styles.avatar, { borderColor: colors.primary }]} />
          <Text style={[styles.name, { color: colors.text }]}>{user.name}</Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>{user.email}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.statIconBg, { backgroundColor: colors.primaryFaded }]}>
                <Gift size={18} color={colors.primary} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{wishlists.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Lists</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <View style={[styles.statIconBg, { backgroundColor: colors.primaryFaded }]}>
                <Heart size={18} color={colors.primary} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{allProducts.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Saved</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <View style={[styles.statIconBg, { backgroundColor: colors.primaryFaded }]}>
                <Share2 size={18} color={colors.primary} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{sharedLists.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Shared</Text>
            </View>
          </View>
        </View>

        {settingsSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
              {section.title}
            </Text>
            <View style={[styles.sectionCards, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
              {section.items.map((item, index) => {
                const Icon = item.icon;
                const isDestructive = "isDestructive" in item && item.isDestructive;
                return (
                  <Pressable
                    key={item.label}
                    style={[
                      styles.settingRow,
                      index < section.items.length - 1 && {
                        borderBottomWidth: 1,
                        borderBottomColor: colors.borderLight,
                      },
                    ]}
                  >
                    <View style={styles.settingLeft}>
                      <Icon size={20} color={isDestructive ? colors.error : colors.primary} />
                      <Text
                        style={[
                          styles.settingLabel,
                          { color: isDestructive ? colors.error : colors.text },
                        ]}
                      >
                        {item.label}
                      </Text>
                    </View>
                    <View style={styles.settingRight}>
                      {"value" in item && item.value && (
                        <Text style={[styles.settingValue, { color: colors.textTertiary }]}>
                          {item.value}
                        </Text>
                      )}
                      <ChevronRight size={18} color={colors.textTertiary} />
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    alignItems: "center",
    paddingBottom: 28,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    marginBottom: 14,
  },
  name: {
    fontSize: 24,
    fontWeight: "800" as const,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  statItem: {
    alignItems: "center",
    gap: 6,
  },
  statIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800" as const,
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 50,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600" as const,
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  sectionCards: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "500" as const,
  },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  settingValue: {
    fontSize: 14,
  },
});
