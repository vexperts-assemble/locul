import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ImageSourcePropType,
  Image,
} from "react-native";
import { shadows } from "../../theme/tokens";

export interface FeaturedItem {
  id: string;
  image?: ImageSourcePropType;
  uri?: string; // support remote images
}

interface FeaturedCarouselProps {
  items: FeaturedItem[];
}

export const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({
  items,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      scrollEventThrottle={16}
    >
      {items.map((item, index) => {
        const source = item.image
          ? item.image
          : item.uri
            ? { uri: item.uri }
            : undefined;
        return (
          <View
            key={item.id}
            style={[styles.card, index === 0 && { marginLeft: 0 }]}
          >
            {source ? <Image source={source} style={styles.image} /> : null}
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingLeft: 20,
    paddingRight: 60,
    gap: 16,
  },
  card: {
    width: 160, // Will scale on device; parent can replace
    aspectRatio: 3 / 4,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#b3b3b3",
    ...shadows.card,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
});

export default FeaturedCarousel;
