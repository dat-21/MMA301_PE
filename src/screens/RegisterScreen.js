import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Animated,
  StatusBar,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import db from "../database/database";
import Toast from "../components/Toast";
import useToast from "../hooks/useToast";

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { toast, showToast, hideToast } = useToast();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const validateEmail = (email) => {
    const regex = /^\S+@\S+\.\S+$/;
    return regex.test(email);
  };

  const handleRegister = () => {
    Keyboard.dismiss();
    if (!fullName.trim()) {
      showToast("Full name is required", "error");
      return;
    }
    if (!validateEmail(email)) {
      showToast("Invalid email format", "error");
      return;
    }
    if (password.length < 3) {
      showToast("Password must be at least 3 characters", "error");
      return;
    }
    if (password !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    try {
      db.runSync(
        `INSERT INTO users (fullName, email, password) VALUES (?, ?, ?)`,
        [fullName.trim(), email.trim(), password],
      );
      showToast("Account created successfully! 🎉", "success");
      setTimeout(() => navigation.navigate("Login"), 1500);
    } catch (error) {
      showToast("Email already exists", "error");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0F0F1A" />
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={hideToast}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#9CA3AF" />
          </TouchableOpacity>
          <View style={styles.logoCircle}>
            <Ionicons name="person-add" size={36} color="#fff" />
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>
        </Animated.View>

        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          <Field
            label="Full Name"
            icon="person-outline"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            autoCapitalize="words"
          />
          <Field
            label="Email"
            icon="mail-outline"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
          />
          <Field
            label="Password"
            icon="lock-closed-outline"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            secure
            showToggle
            show={showPass}
            setShow={setShowPass}
          />
          <Field
            label="Confirm Password"
            icon="shield-checkmark-outline"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter password"
            secure
            showToggle
            show={showConfirm}
            setShow={setShowConfirm}
          />

          <TouchableOpacity
            style={styles.registerBtn}
            onPress={handleRegister}
            activeOpacity={0.85}
          >
            <Ionicons name="checkmark-circle-outline" size={22} color="#fff" />
            <Text style={styles.registerBtnText}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate("Login")}
            activeOpacity={0.7}
          >
            <Text style={styles.loginLinkText}>
              Already have an account?{" "}
              <Text style={styles.loginLinkBold}>Login</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F0F1A" },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  header: { alignItems: "center", paddingTop: 60, paddingBottom: 32 },
  backBtn: { position: "absolute", left: 0, top: 60, padding: 4 },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  title: { fontSize: 28, fontWeight: "800", color: "#F9FAFB", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#9CA3AF" },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#D1D5DB",
    marginBottom: 8,
    marginTop: 16,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E30",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#2D2D45",
    paddingHorizontal: 14,
    height: 54,
  },
  inputWrapperFocused: { borderColor: "#10B981" },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: "#F9FAFB" },
  eyeBtn: { paddingLeft: 10 },
  registerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#10B981",
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 28,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  registerBtnText: { color: "#FFF", fontSize: 18, fontWeight: "700" },
  loginLink: { alignItems: "center", marginTop: 24 },
  loginLinkText: { fontSize: 14, color: "#6B7280" },
  loginLinkBold: { color: "#6EE7B7", fontWeight: "700" },
});

const Field = ({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  secure,
  showToggle,
  setShow,
  show,
  keyboardType,
  autoCapitalize,
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[styles.inputWrapper, focused && styles.inputWrapperFocused]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={focused ? "#10B981" : "#9CA3AF"}
          style={styles.inputIcon}
        />
        <TextInput
          style={[styles.input, showToggle && { flex: 1 }]}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secure && !show}
          autoCapitalize={autoCapitalize || "none"}
          autoCorrect={false}
          keyboardType={keyboardType || "default"}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {showToggle && (
          <TouchableOpacity
            onPress={() => setShow(!show)}
            style={styles.eyeBtn}
          >
            <Ionicons
              name={show ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
