import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useWallet } from "../hooks/useWallet";

interface EpisodesBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  seriesId: string;
  seriesTitle?: string;
  priceCents?: number; // default 4999 (R49.99)
  onPurchased?: (newBalanceCents: number) => void;
  seriesDescription?: string;
}

const PRICE_DEFAULT = 4999;

export const EpisodesBottomSheet: React.FC<EpisodesBottomSheetProps> = ({
  visible,
  onClose,
  seriesId,
  seriesTitle,
  priceCents = PRICE_DEFAULT,
  onPurchased,
  seriesDescription,
}) => {
  const translateY = useRef(
    new Animated.Value(Dimensions.get("window").height),
  ).current;
  const { getWallet, isSeriesUnlocked, purchaseSeriesUnlock } = useWallet();
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

  useEffect(() => {
    if (!visible) return;
    Animated.timing(translateY, {
      toValue: 0,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    (async () => {
      const w = await getWallet();
      setWalletBalance(w?.balance_cents ?? null);
      const u = await isSeriesUnlocked(seriesId);
      setUnlocked(u);
    })();
  }, [visible, translateY, getWallet, isSeriesUnlocked, seriesId]);

  const close = () => {
    Animated.timing(translateY, {
      toValue: Dimensions.get("window").height,
      duration: 220,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const priceLabel = useMemo(
    () => `Unlock All (R${(priceCents / 100).toFixed(2)})`,
    [priceCents],
  );
  const canAfford = walletBalance !== null && walletBalance >= priceCents;

  const grid = useMemo(() => {
    return Array.from({ length: 12 }).map((_, idx) => {
      const ep = idx + 1;
      const defaultUnlocked = ep <= 2;
      const isUnlocked = unlocked || defaultUnlocked;
      return { ep, isUnlocked };
    });
  }, [unlocked]);

  const rows = useMemo(() => {
    const r: { ep: number; isUnlocked: boolean }[][] = [];
    for (let i = 0; i < grid.length; i += 4) {
      r.push(grid.slice(i, i + 4));
    }
    return r;
  }, [grid]);

  const handlePurchase = async () => {
    if (unlocked || isBuying) return;
    
    // Show confirmation dialog
    Alert.alert(
      "Unlock All Episodes",
      `This will deduct R${(priceCents / 100).toFixed(2)} from your wallet.\n\nCurrent Balance: R${((walletBalance || 0) / 100).toFixed(2)}\nAfter Purchase: R${(((walletBalance || 0) - priceCents) / 100).toFixed(2)}\n\nDo you want to continue?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Unlock",
          style: "default",
          onPress: async () => {
            setIsBuying(true);
            try {
              const res = await purchaseSeriesUnlock(seriesId, priceCents);
              const newBal = res?.new_balance_cents ?? null;
              if (newBal !== null) setWalletBalance(newBal);
              setUnlocked(true);
              onPurchased?.(newBal ?? 0);
            } catch (e) {
              console.error("[Purchase] Failed:", e);
              Alert.alert("Purchase Failed", "Unable to unlock series. Please try again.");
            } finally {
              setIsBuying(false);
            }
          },
        },
      ]
    );
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={close}
    >
      <Pressable style={styles.backdrop} onPress={close} />
      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
        <View style={styles.handle} />
        {!!seriesTitle && <Text style={styles.title}>{seriesTitle}</Text>}
        <Text style={styles.description}>
          {seriesDescription ||
            "A young man attempts to learn the culture and tradition of a clan he is trying to marry into."}
        </Text>

        {rows.map((row, rowIdx) => (
          <View key={`row-${rowIdx}`} style={styles.episodeRow}>
            {row.map(({ ep, isUnlocked }) => (
              <View
                key={ep}
                style={[
                  styles.episodeTile,
                  isUnlocked
                    ? styles.episodeTileUnlocked
                    : styles.episodeTileLocked,
                ]}
              >
                {ep === 1 && (
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color="#4CAF50"
                    style={styles.checkIcon}
                  />
                )}
                {ep === 2 && (
                  <Ionicons
                    name="play"
                    size={16}
                    color="#EB588C"
                    style={styles.playIcon}
                  />
                )}
                {ep >= 3 && !isUnlocked && (
                  <Ionicons
                    name="lock-closed"
                    size={16}
                    color="#F5F5F5"
                    style={styles.lockIcon}
                  />
                )}
                {ep >= 3 && isUnlocked && (
                  <Ionicons
                    name="lock-open"
                    size={16}
                    color="#4CAF50"
                    style={styles.unlockedIcon}
                  />
                )}
                <Text style={styles.episodeText}>{`Episode ${ep}`}</Text>
              </View>
            ))}
          </View>
        ))}

        <View style={styles.footer}>
          <TouchableOpacity
            disabled={unlocked || !canAfford || isBuying}
            onPress={handlePurchase}
            style={[
              styles.button,
              unlocked ? styles.buttonDisabled : undefined,
              !canAfford && !unlocked ? styles.buttonInsufficient : undefined,
            ]}
          >
            <Ionicons
              name="lock-open"
              size={18}
              color="white"
              style={styles.unlockIcon}
            />
            <Text style={styles.buttonText}>
              {unlocked
                ? "Unlocked"
                : canAfford
                  ? priceLabel
                  : "Insufficient funds"}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Backdrop behind the sheet
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  // Main container: Episode-List
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: 504,
    marginTop: 270,
    paddingTop: 23,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: "#160418",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderWidth: 1,
    borderColor: "rgba(22, 4, 24, 0.1)",
  },
  handle: {
    alignSelf: "center",
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginBottom: 10,
  },
  // Title
  title: {
    height: 24,
    alignSelf: "stretch",
    fontFamily: "LeagueSpartan",
    fontSize: 24,
    fontWeight: "400",
    lineHeight: 24,
    textAlign: "left",
    color: "#f5f5f5",
  },
  // Description
  description: {
    height: 34,
    alignSelf: "stretch",
    fontFamily: "LeagueSpartan",
    fontSize: 17,
    fontWeight: "200",
    lineHeight: 17,
    textAlign: "left",
    color: "#f5f5f5",
    marginTop: 6,
  },
  // Row container (Episode-Container)
  episodeRow: {
    height: 85,
    alignSelf: "stretch",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 0,
    marginTop: 12,
  },
  // Episode grid tile styles
  episodeTile: {
    width: 65,
    height: 85,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: "#000",
  },
  episodeTileUnlocked: { backgroundColor: "#2a1b2f" },
  episodeTileLocked: { backgroundColor: "#000" },
  // Episode label inside tile (Episode-Title)
  episodeText: {
    width: 38,
    height: 10,
    fontFamily: "LeagueSpartan",
    fontSize: 10,
    fontWeight: "400",
    lineHeight: 10,
    textAlign: "center",
    color: "#dccfec",
  },
  checkIcon: {
    color: "#4CAF50",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  playIcon: { color: "white", fontSize: 16, marginBottom: 8 },
  lockIcon: { color: "#e6c274", fontSize: 18, marginBottom: 8 },
  unlockedIcon: { color: "#4CAF50", fontSize: 18, marginBottom: 8 },
  // Footer with Unlock button
  footer: { marginTop: 16, alignItems: "center", alignSelf: "stretch" },
  // Button
  button: {
    height: 40,
    alignSelf: "stretch",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#eb588c",
  },
  buttonDisabled: { backgroundColor: "rgba(255,255,255,0.2)" },
  buttonInsufficient: { backgroundColor: "#5c3a42" },
  // Button text (Button-Text)
  buttonText: {
    fontFamily: "LeagueSpartan",
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 20,
    color: "#f5f5f5",
    textAlign: "center",
  },
  // Unlock icon in button
  unlockIcon: { color: "white", fontSize: 18, marginRight: 8 },
});

export default EpisodesBottomSheet;
