import { useColorScheme as useRNColorScheme } from "react-native";
import Colors from "@/constants/colors";

export function useAppColors() {
  const scheme = useRNColorScheme();
  const isDark = scheme === "dark";
  return isDark ? Colors.dark : Colors.light;
}
