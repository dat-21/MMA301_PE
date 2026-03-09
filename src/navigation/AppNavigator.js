import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import ProductListScreen from "../screens/ProductListScreen";
import ProductDetailScreen from "../screens/ProductDetailScreen";
import AddEditProductScreen from "../screens/AddEditProductScreen";
import CartScreen from "../screens/CartScreen";
import RevenueScreen from "../screens/RevenueScreen";

const Stack = createNativeStackNavigator();

const DarkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#0F0F1A",
    card: "#13131F",
    text: "#F9FAFB",
    border: "#2D2D45",
    primary: "#A78BFA",
    notification: "#7C3AED",
  },
};

const screenOptions = {
  headerStyle: { backgroundColor: "#13131F" },
  headerTintColor: "#F9FAFB",
  headerTitleStyle: { fontWeight: "700", fontSize: 17 },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: "#0F0F1A" },
};

export default function AppNavigator() {
  const { user } = useContext(AuthContext);

  return (
    <NavigationContainer theme={DarkTheme}>
      <Stack.Navigator screenOptions={screenOptions}>
        {user == null ? (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ProductList"
              component={ProductListScreen}
              options={{ title: "Products" }}
            />
            <Stack.Screen
              name="ProductDetail"
              component={ProductDetailScreen}
              options={{ title: "Product Detail" }}
            />
            <Stack.Screen
              name="AddEditProduct"
              component={AddEditProductScreen}
              options={({ route }) => ({
                title: route.params?.product ? "Edit Product" : "Add Product",
              })}
            />
            <Stack.Screen
              name="Cart"
              component={CartScreen}
              options={{ title: "Shopping Cart" }}
            />
            <Stack.Screen
              name="Revenue"
              component={RevenueScreen}
              options={{ title: "Revenue" }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
