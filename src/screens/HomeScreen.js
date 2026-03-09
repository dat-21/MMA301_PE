import { useContext, useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import db from "../database/database";
import ConfirmDialog from "../components/ConfirmDialog";

export default function HomeScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const cartCount = () => {
    const result = db.getFirstSync(
      "SELECT COALESCE(SUM(quantity), 0) as total FROM cart_items",
    );
    return result?.total || 0;
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const menuItems = [
    {
      icon: <Ionicons name="cube-outline" size={36} color="#fff" />,
      title: "Products",
      desc: "Browse & manage products",
      gradient: ["#7C3AED", "#5B21B6"],
      screen: "ProductList",
    },
    {
      icon: <Ionicons name="cart-outline" size={36} color="#fff" />,
      title: `Cart (${cartCount()})`,
      desc: "View your shopping cart",
      gradient: ["#F59E0B", "#D97706"],
      screen: "Cart",
    },
    {
      icon: <Ionicons name="add-circle-outline" size={36} color="#fff" />,
      title: "Add Product",
      desc: "Create a new product",
      gradient: ["#10B981", "#059669"],
      screen: "AddEditProduct",
    },
    {
      icon: <MaterialCommunityIcons name="chart-bar" size={36} color="#fff" />,
      title: "Revenue",
      desc: "View sales statistics",
      gradient: ["#EC4899", "#BE185D"],
      screen: "Revenue",
    },
  ];

  const anims = menuItems.map(() => useRef(new Animated.Value(0)).current);

  useEffect(() => {
    const animations = anims.map((anim, i) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: i * 100,
        useNativeDriver: true,
      }),
    );
    Animated.stagger(100, animations).start();
  }, []);

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F1A" />
      <ConfirmDialog
        visible={showLogoutConfirm}
        title="Logout"
        message="Are you sure you want to logout?"
        type="warning"
        confirmText="Logout"
        onConfirm={() => {
          setShowLogoutConfirm(false);
          logout();
        }}
        onCancel={() => setShowLogoutConfirm(false)}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.userName}>{user?.fullName || "User"} 👋</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={22} color="#F87171" />
          </TouchableOpacity>
        </View>

        {/* Avatar + Stats */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={styles.profileName}>{user?.fullName || "User"}</Text>
            <Text style={styles.profileEmail}>{user?.email || ""}</Text>
          </View>
          <View style={styles.cartBadge}>
            <Ionicons name="cart" size={18} color="#7C3AED" />
            <Text style={styles.cartBadgeText}>{cartCount()}</Text>
          </View>
        </View>

        {/* Menu Grid */}
        <Text style={styles.sectionTitle}>Quick Access</Text>
        <View style={styles.grid}>
          {menuItems.map((item, i) => (
            <Animated.View
              key={i}
              style={{
                opacity: anims[i],
                transform: [
                  {
                    translateY: anims[i].interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                ],
                width: "47%",
              }}
            >
              <TouchableOpacity
                style={[styles.card, { backgroundColor: item.gradient[0] }]}
                onPress={() => navigation.navigate(item.screen)}
                activeOpacity={0.82}
              >
                <View style={styles.cardIconWrapper}>{item.icon}</View>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDesc}>{item.desc}</Text>
                <View style={styles.cardArrow}>
                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color="rgba(255,255,255,0.7)"
                  />
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0F0F1A" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  greeting: { fontSize: 15, color: "#9CA3AF" },
  userName: { fontSize: 22, fontWeight: "800", color: "#F9FAFB" },
  logoutBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1E1E30",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2D2D45",
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginVertical: 16,
    backgroundColor: "#1E1E30",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2D2D45",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#7C3AED",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "#fff", fontSize: 20, fontWeight: "700" },
  profileName: { fontSize: 16, fontWeight: "700", color: "#F9FAFB" },
  profileEmail: { fontSize: 13, color: "#9CA3AF", marginTop: 2 },
  cartBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2D2D45",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  cartBadgeText: { color: "#A78BFA", fontWeight: "700", fontSize: 14 },
  sectionTitle: {
    paddingHorizontal: 20,
    fontSize: 18,
    fontWeight: "700",
    color: "#F9FAFB",
    marginBottom: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 14,
  },
  card: {
    borderRadius: 20,
    padding: 18,
    minHeight: 160,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  cardIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFF",
    marginBottom: 4,
  },
  cardDesc: { fontSize: 11, color: "rgba(255,255,255,0.75)", lineHeight: 16 },
  cardArrow: { alignSelf: "flex-end", marginTop: 8 },
});
