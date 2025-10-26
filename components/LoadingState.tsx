import React from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading...",
}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#E50059" />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#F5F5F5",
    fontFamily: "LeagueSpartan",
  },
});
