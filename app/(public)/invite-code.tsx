import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSupabase } from "@/hooks/useSupabase";
import Logo from "@/components/Logo";

const { width, height } = Dimensions.get("window");

const CORRECT_INVITE_CODE = "AFVH9";

export default function InviteCodePage() {
  const [code, setCode] = useState(["", "", "", "", ""]);
  const [error, setError] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const { session, supabase } = useSupabase();

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text.toUpperCase();
    setCode(newCode);
    setError(false);

    // Auto-focus next input
    if (text && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleConfirm = async () => {
    const enteredCode = code.join("");
    
    if (enteredCode === CORRECT_INVITE_CODE) {
      // Check if user is already logged in
      if (session) {
        // User is authenticated, go to home
        router.replace("/(protected)/(tabs)");
      } else {
        // Auto-authenticate as demo user for seamless demo experience
        try {
          const { error } = await supabase.auth.signInWithPassword({
            email: 'demo@locul.com',
            password: 'LoculDemo2024!' // Demo password - change for production
          });
          
          if (error) {
            console.error('Demo login error:', error);
            // If demo login fails, redirect to sign-up as fallback
            router.replace("/sign-up");
          }
          // Session will be set automatically via auth state listener
          // which will redirect to protected routes
        } catch (err) {
          console.error('Demo login failed:', err);
          // Fallback to sign-up if there's an error
          router.replace("/sign-up");
        }
      }
    } else {
      setError(true);
      // Shake animation or error feedback could be added here
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Background Image */}
      <Image
        source={require("../../assets/1406529985357887ab439ff481ca9b95224bb93f.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Logo width={152} height={56} color="#EB588C" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        {/* Ticket Card */}
        <View style={styles.ticketCard}>
          {/* Ticket Background */}
          <Image
            source={require("../../assets/ticket.png")}
            style={styles.ticketImage}
            resizeMode="contain"
          />

          {/* Content Container */}
          <View style={styles.contentContainer}>
            {/* Perforated Line */}
            <View style={styles.perforatedLine}>
              {Array.from({ length: 28 }).map((_, i) => (
                <View key={i} style={styles.perforation} />
              ))}
            </View>

            {/* Invitation Code Section */}
            <View style={styles.codeSection}>
              <Text style={styles.codeLabel}>INVITATION CODE</Text>
              
              <View style={styles.codeInputsContainer}>
                {code.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    style={[
                      styles.codeInput,
                      error && styles.codeInputError,
                    ]}
                    value={digit}
                    onChangeText={(text) => handleCodeChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    maxLength={1}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    keyboardType="default"
                    selectTextOnFocus
                  />
                ))}
              </View>
            </View>

            {/* Welcome Message */}
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeTitle}>Welcome to locul</Text>
              <Text style={styles.welcomeText}>
                We are cooking up something exciting. While we do, access is by
                invite only, enter invite code above to continue
              </Text>
            </View>

            {/* Decorative Dots */}
            <View style={styles.dotsContainer}>
              {Array.from({ length: 17 }).map((_, i) => (
                <View key={i} style={styles.dot} />
              ))}
            </View>

            {/* Confirm Button */}
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  backgroundImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  logoContainer: {
    position: "absolute",
    top: 60,
    width: "100%",
    alignItems: "center",
    zIndex: 10,
  },
  logoText: {
    fontSize: 80,
    fontFamily: "LeagueSpartan",
    fontWeight: "700",
    color: "#EB588C",
    textAlign: "center",
  },
  keyboardView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  ticketCard: {
    width: 347,
    height: 559,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  ticketImage: {
    position: "absolute",
    width: 347,
    height: 559,
  },
  contentContainer: {
    width: "100%",
    paddingHorizontal: 47,
    paddingTop: 66,
    alignItems: "center",
  },
  perforatedLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 232,
    height: 40,
    opacity: 0.5,
    marginBottom: 24,
  },
  perforation: {
    width: 2,
    height: "100%",
    backgroundColor: "#FFF",
  },
  codeSection: {
    alignItems: "center",
    marginBottom: 36,
  },
  codeLabel: {
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: "400",
    color: "#F5F5F5",
    letterSpacing: 1.4,
    marginBottom: 8,
    textAlign: "center",
  },
  codeInputsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  codeInput: {
    width: 40,
    height: 48,
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    fontFamily: "Inter",
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
  },
  codeInputError: {
    borderColor: "#EF4444",
  },
  welcomeSection: {
    alignItems: "center",
    marginBottom: 40,
    paddingHorizontal: 22,
  },
  welcomeTitle: {
    fontFamily: "LeagueSpartan",
    fontSize: 14,
    fontWeight: "600",
    color: "#E5E7EB",
    marginBottom: 8,
    textAlign: "center",
  },
  welcomeText: {
    fontFamily: "Inter",
    fontSize: 12,
    fontWeight: "400",
    color: "#E5E7EB",
    textAlign: "center",
    lineHeight: 16,
  },
  dotsContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#1F2937",
  },
  confirmButton: {
    width: 200,
    height: 42,
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmButtonText: {
    fontFamily: "LeagueSpartan",
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    letterSpacing: 0.9,
  },
});

