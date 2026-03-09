import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  StatusBar,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import db from "../database/database";
import Toast from "../components/Toast";
import useToast from "../hooks/useToast";

export default function AddEditProductScreen({ route, navigation }) {
  const editProduct = route.params?.product || null;
  const isEdit = !!editProduct;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");

  const [nameFocused, setNameFocused] = useState(false);
  const [descFocused, setDescFocused] = useState(false);
  const [priceFocused, setPriceFocused] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    if (editProduct) {
      setName(editProduct.name || "");
      setDescription(editProduct.description || "");
      setPrice(editProduct.price?.toString() || "");
      setImage(editProduct.image || "");
    }
  }, [editProduct]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    Keyboard.dismiss();
    if (!name.trim()) {
      showToast("Product name is required", "error");
      return;
    }
    if (!price.trim() || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      showToast("Please enter a valid price", "error");
      return;
    }

    try {
      if (isEdit) {
        db.runSync(
          "UPDATE products SET name = ?, description = ?, price = ?, image = ? WHERE id = ?",
          [
            name.trim(),
            description.trim(),
            parseFloat(price),
            image.trim(),
            editProduct.id,
          ],
        );
        showToast("Product updated successfully \u2705", "success");
      } else {
        db.runSync(
          "INSERT INTO products (name, description, price, image) VALUES (?, ?, ?, ?)",
          [name.trim(), description.trim(), parseFloat(price), image.trim()],
        );
        showToast("Product added successfully \u2705", "success");
      }
      setTimeout(() => navigation.goBack(), 1200);
    } catch (error) {
      showToast("Failed to save product: " + error.message, "error");
    }
  };

  const InputField = ({ label, icon, focused, setFocused, children }) => (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[styles.inputWrapper, focused && styles.inputWrapperFocused]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={focused ? "#7C3AED" : "#9CA3AF"}
          style={styles.inputIcon}
        />
        {children}
      </View>
    </View>
  );

  return (
    <View style={styles.outerContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F1A" />
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={hideToast}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Preview */}
        <View style={styles.imageSection}>
          <TouchableOpacity
            style={styles.imagePicker}
            onPress={pickImage}
            activeOpacity={0.8}
          >
            {image ? (
              <Image source={{ uri: image }} style={styles.previewImage} />
            ) : (
              <View style={styles.imagePickerEmpty}>
                <Ionicons name="camera-outline" size={40} color="#7C3AED" />
                <Text style={styles.imagePickerText}>Tap to add image</Text>
              </View>
            )}
            <View style={styles.imageCameraBtn}>
              <Ionicons name="camera" size={18} color="#fff" />
            </View>
          </TouchableOpacity>
          {image ? (
            <TouchableOpacity
              style={styles.removeImageBtn}
              onPress={() => setImage("")}
            >
              <Ionicons name="trash-outline" size={14} color="#F87171" />
              <Text style={styles.removeImageText}>Remove image</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Name */}
        <InputField
          label="Product Name *"
          icon="cube-outline"
          focused={nameFocused}
          setFocused={setNameFocused}
        >
          <TextInput
            style={styles.input}
            placeholder="Enter product name"
            placeholderTextColor="#6B7280"
            value={name}
            onChangeText={setName}
            onFocus={() => setNameFocused(true)}
            onBlur={() => setNameFocused(false)}
          />
        </InputField>

        {/* Description */}
        <Text style={styles.label}>Description</Text>
        <View
          style={[
            styles.inputWrapper,
            styles.textAreaWrapper,
            descFocused && styles.inputWrapperFocused,
          ]}
        >
          <Ionicons
            name="document-text-outline"
            size={20}
            color={descFocused ? "#7C3AED" : "#9CA3AF"}
            style={[
              styles.inputIcon,
              { alignSelf: "flex-start", marginTop: 2 },
            ]}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter product description"
            placeholderTextColor="#6B7280"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            onFocus={() => setDescFocused(true)}
            onBlur={() => setDescFocused(false)}
          />
        </View>

        {/* Price */}
        <InputField
          label="Price *"
          icon="pricetag-outline"
          focused={priceFocused}
          setFocused={setPriceFocused}
        >
          <Text style={styles.currencySign}>$</Text>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="0.00"
            placeholderTextColor="#6B7280"
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
            onFocus={() => setPriceFocused(true)}
            onBlur={() => setPriceFocused(false)}
          />
        </InputField>

        {/* Image URL */}
        <Text style={styles.label}>Image URL</Text>
        <View style={styles.imageUrlRow}>
          <View style={[styles.inputWrapper, { flex: 1 }]}>
            <Ionicons
              name="link-outline"
              size={20}
              color="#9CA3AF"
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Paste image URL..."
              placeholderTextColor="#6B7280"
              value={image}
              onChangeText={setImage}
              autoCapitalize="none"
            />
          </View>
          <TouchableOpacity style={styles.pickBtn} onPress={pickImage}>
            <Ionicons name="images-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <Ionicons
            name={isEdit ? "checkmark-circle-outline" : "add-circle-outline"}
            size={22}
            color="#fff"
          />
          <Text style={styles.saveBtnText}>
            {isEdit ? "Update Product" : "Add Product"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: "#0F0F1A" },
  container: { flex: 1, backgroundColor: "#0F0F1A" },
  content: { padding: 20, paddingBottom: 40 },
  imageSection: { alignItems: "center", marginBottom: 24 },
  imagePicker: {
    width: "100%",
    height: 200,
    borderRadius: 18,
    backgroundColor: "#1E1E30",
    borderWidth: 2,
    borderColor: "#2D2D45",
    borderStyle: "dashed",
    overflow: "hidden",
    position: "relative",
  },
  previewImage: { width: "100%", height: "100%", resizeMode: "cover" },
  imagePickerEmpty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  imagePickerText: { color: "#6B7280", fontSize: 14 },
  imageCameraBtn: {
    position: "absolute",
    bottom: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#7C3AED",
    justifyContent: "center",
    alignItems: "center",
  },
  removeImageBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: "#1A0A0A",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  removeImageText: { color: "#F87171", fontSize: 13, fontWeight: "600" },
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
    minHeight: 54,
  },
  textAreaWrapper: { alignItems: "flex-start", paddingVertical: 12 },
  inputWrapperFocused: { borderColor: "#7C3AED" },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: "#F9FAFB" },
  textArea: { minHeight: 90 },
  currencySign: { fontSize: 18, color: "#6B7280", marginRight: 4 },
  imageUrlRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  pickBtn: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: "#7C3AED",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#7C3AED",
    paddingVertical: 18,
    borderRadius: 16,
    marginTop: 32,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  saveBtnText: { color: "#FFF", fontSize: 18, fontWeight: "700" },
});
