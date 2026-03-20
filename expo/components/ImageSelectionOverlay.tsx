import React, { useState, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  PanResponder,
  Text,
  Pressable,
} from "react-native";
import { Crop, Move, Maximize2 } from "lucide-react-native";

const HANDLE_SIZE = 24;
const MIN_BOX_SIZE = 60;

interface SelectionBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageSelectionOverlayProps {
  imageWidth: number;
  imageHeight: number;
  onSelectionConfirm: (selection: {
    x: number;
    y: number;
    width: number;
    height: number;
    imageWidth: number;
    imageHeight: number;
  }) => void;
  onSearchFull: () => void;
  primaryColor: string;
  textColor: string;
  surfaceColor: string;
}

type DragMode = "move" | "resize-tl" | "resize-tr" | "resize-bl" | "resize-br" | null;

export default function ImageSelectionOverlay({
  imageWidth,
  imageHeight,
  onSelectionConfirm,
  onSearchFull,
  primaryColor,
  textColor,
  surfaceColor,
}: ImageSelectionOverlayProps) {
  const padding = 30;
  const initialBox: SelectionBox = {
    x: padding,
    y: padding,
    width: imageWidth - padding * 2,
    height: imageHeight - padding * 2,
  };

  const [box, setBox] = useState<SelectionBox>(initialBox);
  const boxRef = useRef<SelectionBox>(initialBox);
  const dragModeRef = useRef<DragMode>(null);
  const startPosRef = useRef({ x: 0, y: 0 });
  const startBoxRef = useRef<SelectionBox>(initialBox);

  const clampBox = useCallback(
    (b: SelectionBox): SelectionBox => {
      let { x, y, width, height } = b;
      width = Math.max(MIN_BOX_SIZE, Math.min(width, imageWidth));
      height = Math.max(MIN_BOX_SIZE, Math.min(height, imageHeight));
      x = Math.max(0, Math.min(x, imageWidth - width));
      y = Math.max(0, Math.min(y, imageHeight - height));
      return { x, y, width, height };
    },
    [imageWidth, imageHeight]
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const b = boxRef.current;
        const hs = HANDLE_SIZE;

        if (
          locationX >= b.x - hs &&
          locationX <= b.x + hs &&
          locationY >= b.y - hs &&
          locationY <= b.y + hs
        ) {
          dragModeRef.current = "resize-tl";
        } else if (
          locationX >= b.x + b.width - hs &&
          locationX <= b.x + b.width + hs &&
          locationY >= b.y - hs &&
          locationY <= b.y + hs
        ) {
          dragModeRef.current = "resize-tr";
        } else if (
          locationX >= b.x - hs &&
          locationX <= b.x + hs &&
          locationY >= b.y + b.height - hs &&
          locationY <= b.y + b.height + hs
        ) {
          dragModeRef.current = "resize-bl";
        } else if (
          locationX >= b.x + b.width - hs &&
          locationX <= b.x + b.width + hs &&
          locationY >= b.y + b.height - hs &&
          locationY <= b.y + b.height + hs
        ) {
          dragModeRef.current = "resize-br";
        } else if (
          locationX >= b.x &&
          locationX <= b.x + b.width &&
          locationY >= b.y &&
          locationY <= b.y + b.height
        ) {
          dragModeRef.current = "move";
        } else {
          dragModeRef.current = null;
        }

        startPosRef.current = { x: locationX, y: locationY };
        startBoxRef.current = { ...b };
      },
      onPanResponderMove: (_, gestureState) => {
        const mode = dragModeRef.current;
        if (!mode) return;

        const dx = gestureState.dx;
        const dy = gestureState.dy;
        const sb = startBoxRef.current;
        let newBox: SelectionBox;

        switch (mode) {
          case "move":
            newBox = {
              x: sb.x + dx,
              y: sb.y + dy,
              width: sb.width,
              height: sb.height,
            };
            break;
          case "resize-tl":
            newBox = {
              x: sb.x + dx,
              y: sb.y + dy,
              width: sb.width - dx,
              height: sb.height - dy,
            };
            break;
          case "resize-tr":
            newBox = {
              x: sb.x,
              y: sb.y + dy,
              width: sb.width + dx,
              height: sb.height - dy,
            };
            break;
          case "resize-bl":
            newBox = {
              x: sb.x + dx,
              y: sb.y,
              width: sb.width - dx,
              height: sb.height + dy,
            };
            break;
          case "resize-br":
            newBox = {
              x: sb.x,
              y: sb.y,
              width: sb.width + dx,
              height: sb.height + dy,
            };
            break;
          default:
            return;
        }

        const clamped = clampBox(newBox);
        boxRef.current = clamped;
        setBox(clamped);
      },
      onPanResponderRelease: () => {
        dragModeRef.current = null;
      },
    })
  ).current;

  const handleConfirm = () => {
    onSelectionConfirm({
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
      imageWidth,
      imageHeight,
    });
  };

  const cornerStyle = (position: object) => [
    styles.cornerHandle,
    { backgroundColor: primaryColor },
    position,
  ];

  return (
    <View style={[styles.container, { width: imageWidth, height: imageHeight }]}>
      <View
        style={[styles.overlay]}
        {...panResponder.panHandlers}
      >
        <View style={[styles.dimTop, { height: box.y }]} />

        <View style={[styles.middleRow, { height: box.height }]}>
          <View style={[styles.dimLeft, { width: box.x }]} />

          <View
            style={[
              styles.selectionBox,
              {
                width: box.width,
                height: box.height,
                borderColor: primaryColor,
              },
            ]}
          >
            <View style={styles.cornerDotsContainer}>
              <View style={cornerStyle({ top: -6, left: -6 })} />
              <View style={cornerStyle({ top: -6, right: -6 })} />
              <View style={cornerStyle({ bottom: -6, left: -6 })} />
              <View style={cornerStyle({ bottom: -6, right: -6 })} />
            </View>

            <View style={styles.gridLines}>
              <View style={[styles.gridLineH, { top: "33%", backgroundColor: primaryColor + "30" }]} />
              <View style={[styles.gridLineH, { top: "66%", backgroundColor: primaryColor + "30" }]} />
              <View style={[styles.gridLineV, { left: "33%", backgroundColor: primaryColor + "30" }]} />
              <View style={[styles.gridLineV, { left: "66%", backgroundColor: primaryColor + "30" }]} />
            </View>
          </View>

          <View style={[styles.dimRight, { width: imageWidth - box.x - box.width }]} />
        </View>

        <View style={[styles.dimBottom, { height: imageHeight - box.y - box.height }]} />
      </View>

      <View style={[styles.buttonRow, { bottom: 8 }]}>
        <Pressable
          onPress={onSearchFull}
          style={[styles.actionBtn, { backgroundColor: surfaceColor + "E0" }]}
        >
          <Maximize2 size={14} color={textColor} />
          <Text style={[styles.actionBtnText, { color: textColor }]}>Full Image</Text>
        </Pressable>

        <Pressable
          onPress={handleConfirm}
          style={[styles.actionBtn, styles.confirmBtn, { backgroundColor: primaryColor }]}
        >
          <Crop size={14} color="#FFFFFF" />
          <Text style={[styles.actionBtnText, { color: "#FFFFFF" }]}>Search Selection</Text>
        </Pressable>
      </View>

      <View style={[styles.hintContainer, { top: 8 }]}>
        <View style={[styles.hintBadge, { backgroundColor: "rgba(0,0,0,0.55)" }]}>
          <Move size={12} color="#FFFFFF" />
          <Text style={styles.hintText}>Drag to select area</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative" as const,
    overflow: "hidden" as const,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  dimTop: {
    width: "100%" as const,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  middleRow: {
    flexDirection: "row" as const,
  },
  dimLeft: {
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  dimRight: {
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  dimBottom: {
    width: "100%" as const,
    backgroundColor: "rgba(0,0,0,0.45)",
    flex: 1,
  },
  selectionBox: {
    borderWidth: 2,
    borderStyle: "solid" as const,
    position: "relative" as const,
  },
  cornerDotsContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  cornerHandle: {
    position: "absolute" as const,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  gridLines: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLineH: {
    position: "absolute" as const,
    left: 0,
    right: 0,
    height: 1,
  },
  gridLineV: {
    position: "absolute" as const,
    top: 0,
    bottom: 0,
    width: 1,
  },
  buttonRow: {
    position: "absolute" as const,
    left: 8,
    right: 8,
    flexDirection: "row" as const,
    gap: 8,
    zIndex: 20,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  confirmBtn: {},
  actionBtnText: {
    fontSize: 13,
    fontWeight: "700" as const,
  },
  hintContainer: {
    position: "absolute" as const,
    left: 0,
    right: 0,
    alignItems: "center" as const,
    zIndex: 20,
  },
  hintBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  hintText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600" as const,
  },
});
