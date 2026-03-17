import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { useAppColors } from "@/hooks/useColorScheme";

interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
}

export default React.memo(function SectionHeader({ title, onSeeAll }: SectionHeaderProps) {
  const colors = useAppColors();
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {onSeeAll && (
        <Pressable onPress={onSeeAll} style={styles.seeAll}>
          <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
          <ChevronRight size={16} color={colors.primary} />
        </Pressable>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 14,
    marginTop: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "700" as const,
  },
  seeAll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "500" as const,
  },
});
