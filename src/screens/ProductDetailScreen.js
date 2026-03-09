import { useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import db from "../database/database";
import Toast from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";
import useToast from "../hooks/useToast";

export default function ProductDetailScreen({ route, navigation }) {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const { toast, showToast, hideToast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const result = db.getFirstSync("SELECT * FROM products WHERE id = ?", [
        productId,
      ]);
      setProduct(result);
    }, [productId]),
  );

  const addToCart = () => {
    if (!product) return;
    const existing = db.getFirstSync(
      "SELECT * FROM cart_items WHERE productId = ?",
      [product.id],
    );
    if (existing) {
      db.runSync(
        "UPDATE cart_items SET quantity = quantity + 1 WHERE productId = ?",
        [product.id],
      );
    } else {
      db.runSync("INSERT INTO cart_items (productId, quantity) VALUES (?, 1)", [
        product.id,
      ]);
    }
    showToast(`${product.name} added to cart \ud83d\uded2`, "success");
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    db.runSync("DELETE FROM products WHERE id = ?", [product.id]);
    db.runSync("DELETE FROM cart_items WHERE productId = ?", [product.id]);
    setShowDeleteConfirm(false);
    navigation.goBack();
  };

  if (!product) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color="#6B7280" />
        <Text style={styles.notFound}>Product not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={hideToast}
      />
      <ConfirmDialog
        visible={showDeleteConfirm}
        title="Delete Product"
        message={`Are you sure you want to delete "${product?.name}"? This cannot be undone.`}
        type="danger"
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Image */}
        {product.image ? (
          <Image source={{ uri: product.image }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="cube-outline" size={64} color="#374151" />
            <Text style={styles.placeholderText}>No Image Available</Text>
          </View>
        )}

        {/* Content */}
        <View style={styles.content}>
          {/* Name & Price */}
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={2}>
              {product.name}
            </Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.price}>${product.price.toFixed(2)}</Text>
            <View style={styles.inStockBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#10B981" />
              <Text style={styles.inStockText}>In Stock</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons
                name="document-text-outline"
                size={18}
                color="#A78BFA"
              />
              <Text style={styles.sectionTitle}>Description</Text>
            </View>
            <Text style={styles.description}>
              {product.description ||
                "No description available for this product."}
            </Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Actions */}
          <TouchableOpacity
            style={styles.cartBtn}
            onPress={addToCart}
            activeOpacity={0.85}
          >
            <Ionicons name="cart-outline" size={22} color="#fff" />
            <Text style={styles.cartBtnText}>Add to Cart</Text>
          </TouchableOpacity>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate("AddEditProduct", { product })}
              activeOpacity={0.85}
            >
              <Ionicons name="create-outline" size={18} color="#fff" />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={handleDelete}
              activeOpacity={0.85}
            >
              <Ionicons name="trash-outline" size={18} color="#fff" />
              <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: "#0F0F1A" },
  container: { flex: 1, backgroundColor: "#0F0F1A" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0F0F1A",
  },
  notFound: { fontSize: 16, color: "#6B7280", marginTop: 12 },
  image: { width: "100%", height: 300, resizeMode: "cover" },
  imagePlaceholder: {
    width: "100%",
    height: 260,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  placeholderText: { color: "#4B5563", fontSize: 15 },
  content: { padding: 20 },
  nameRow: { marginBottom: 8 },
  name: { fontSize: 24, fontWeight: "800", color: "#F9FAFB", lineHeight: 32 },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  price: { fontSize: 30, fontWeight: "800", color: "#A78BFA" },
  inStockBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#052e16",
    borderWidth: 1,
    borderColor: "#10B981",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  inStockText: { color: "#10B981", fontSize: 12, fontWeight: "600" },
  section: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#D1D5DB" },
  description: { fontSize: 15, color: "#9CA3AF", lineHeight: 24 },
  divider: { height: 1, backgroundColor: "#1E1E30", marginVertical: 4 },
  cartBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#F59E0B",
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 16,
    marginBottom: 12,
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  cartBtnText: { color: "#FFF", fontSize: 17, fontWeight: "700" },
  buttonRow: { flexDirection: "row", gap: 12 },
  editBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#3B82F6",
    paddingVertical: 14,
    borderRadius: 14,
  },
  editBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  deleteBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#EF4444",
    paddingVertical: 14,
    borderRadius: 14,
  },
  deleteBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});
