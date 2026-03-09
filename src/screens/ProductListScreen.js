import { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import db from "../database/database";
import Toast from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";
import useToast from "../hooks/useToast";

export default function ProductListScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState(null);
  const { toast, showToast, hideToast } = useToast();
  const [confirm, setConfirm] = useState({
    visible: false,
    id: null,
    name: "",
  });

  const loadProducts = () => {
    let query = "SELECT * FROM products";
    const params = [];

    if (search.trim()) {
      query += " WHERE LOWER(name) LIKE ?";
      params.push(`%${search.trim().toLowerCase()}%`);
    }

    if (sortOrder === "asc") {
      query += " ORDER BY price ASC";
    } else if (sortOrder === "desc") {
      query += " ORDER BY price DESC";
    }

    const result = db.getAllSync(query, params);
    setProducts(result);
  };

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [search, sortOrder]),
  );

  const handleDelete = (id, name) => {
    setConfirm({ visible: true, id, name });
  };

  const confirmDelete = () => {
    db.runSync("DELETE FROM products WHERE id = ?", [confirm.id]);
    db.runSync("DELETE FROM cart_items WHERE productId = ?", [confirm.id]);
    setConfirm({ visible: false, id: null, name: "" });
    loadProducts();
    showToast("Product deleted", "success");
  };

  const addToCart = (product) => {
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

  const SortBtn = ({ order, label, icon }) => (
    <TouchableOpacity
      style={[styles.sortBtn, sortOrder === order && styles.sortBtnActive]}
      onPress={() => setSortOrder(sortOrder === order ? null : order)}
    >
      <Ionicons
        name={icon}
        size={14}
        color={sortOrder === order ? "#fff" : "#9CA3AF"}
      />
      <Text
        style={[
          styles.sortBtnText,
          sortOrder === order && styles.sortBtnTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() =>
        navigation.navigate("ProductDetail", { productId: item.id })
      }
      activeOpacity={0.88}
    >
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.productImage} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons name="image-outline" size={32} color="#4B5563" />
        </View>
      )}
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.productDesc} numberOfLines={2}>
          {item.description || "No description"}
        </Text>
        <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.cartBtn}
            onPress={() => addToCart(item)}
          >
            <Ionicons name="cart-outline" size={14} color="#fff" />
            <Text style={styles.cartBtnText}>Add</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() =>
              navigation.navigate("AddEditProduct", { product: item })
            }
          >
            <Ionicons name="create-outline" size={14} color="#fff" />
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDelete(item.id, item.name)}
          >
            <Ionicons name="trash-outline" size={14} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F1A" />
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={hideToast}
      />
      <ConfirmDialog
        visible={confirm.visible}
        title="Delete Product"
        message={`Are you sure you want to delete "${confirm.name}"? This cannot be undone.`}
        type="danger"
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setConfirm({ visible: false, id: null, name: "" })}
      />

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons
          name="search-outline"
          size={20}
          color="#9CA3AF"
          style={{ marginRight: 10 }}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor="#6B7280"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Sort */}
      <View style={styles.sortRow}>
        <Ionicons name="funnel-outline" size={16} color="#9CA3AF" />
        <Text style={styles.sortLabel}>Sort:</Text>
        <SortBtn order="asc" label="Low–High" icon="trending-up-outline" />
        <SortBtn order="desc" label="High–Low" icon="trending-down-outline" />
      </View>

      {/* List */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProduct}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color="#374151" />
            <Text style={styles.emptyText}>No products found</Text>
            <TouchableOpacity
              style={styles.addFirstBtn}
              onPress={() => navigation.navigate("AddEditProduct")}
            >
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.addFirstBtnText}>Add your first product</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddEditProduct")}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F0F1A" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E30",
    margin: 16,
    marginBottom: 8,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
    borderWidth: 1,
    borderColor: "#2D2D45",
  },
  searchInput: { flex: 1, fontSize: 16, color: "#F9FAFB" },
  sortRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 10,
    gap: 8,
  },
  sortLabel: { fontSize: 13, color: "#9CA3AF" },
  sortBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#1E1E30",
    borderWidth: 1,
    borderColor: "#2D2D45",
  },
  sortBtnActive: { backgroundColor: "#7C3AED", borderColor: "#7C3AED" },
  sortBtnText: { fontSize: 12, color: "#9CA3AF" },
  sortBtnTextActive: { color: "#FFF", fontWeight: "600" },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  productCard: {
    flexDirection: "row",
    backgroundColor: "#1E1E30",
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2D2D45",
    overflow: "hidden",
  },
  productImage: { width: 110, height: 140, resizeMode: "cover" },
  imagePlaceholder: {
    width: 110,
    height: 140,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
  },
  productInfo: { flex: 1, padding: 12, justifyContent: "space-between" },
  productName: { fontSize: 16, fontWeight: "700", color: "#F9FAFB" },
  productDesc: { fontSize: 12, color: "#6B7280", marginTop: 4, lineHeight: 17 },
  productPrice: {
    fontSize: 20,
    fontWeight: "800",
    color: "#A78BFA",
    marginTop: 6,
  },
  actionRow: { flexDirection: "row", marginTop: 8, gap: 6 },
  cartBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F59E0B",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  cartBtnText: { color: "#FFF", fontSize: 12, fontWeight: "600" },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#3B82F6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editBtnText: { color: "#FFF", fontSize: 12, fontWeight: "600" },
  deleteBtn: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: { alignItems: "center", marginTop: 80 },
  emptyText: { fontSize: 16, color: "#6B7280", marginVertical: 16 },
  addFirstBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#7C3AED",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addFirstBtnText: { color: "#FFF", fontSize: 15, fontWeight: "600" },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#7C3AED",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
});
