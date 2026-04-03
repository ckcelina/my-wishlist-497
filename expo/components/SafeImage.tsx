import React, { useState } from "react";
import { Image, ImageProps, ImageStyle } from "expo-image";
import { StyleProp } from "react-native";

const FALLBACK_URI = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop";

interface SafeImageProps extends Omit<ImageProps, "source" | "style"> {
  uri: string | undefined | null;
  style?: StyleProp<ImageStyle>;
  fallbackUri?: string;
}

export default function SafeImage({ uri, style, fallbackUri, ...rest }: SafeImageProps) {
  const [errored, setErrored] = useState(false);

  const resolvedUri = !uri || errored ? (fallbackUri ?? FALLBACK_URI) : uri;

  return (
    <Image
      source={{ uri: resolvedUri }}
      style={style}
      onError={() => {
        if (!errored) {
          console.log("[SafeImage] Failed to load:", uri, "— using fallback");
          setErrored(true);
        }
      }}
      {...rest}
    />
  );
}
