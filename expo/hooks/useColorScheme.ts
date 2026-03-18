import { useTheme } from "@/providers/ThemeProvider";

export function useAppColors() {
  const { colors } = useTheme();
  return colors;
}
