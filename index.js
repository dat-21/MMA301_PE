/**
 * ENTRY POINT - Điểm khởi đầu của ứng dụng Expo
 *
 * registerRootComponent đăng ký component gốc (App) với Expo.
 * Expo sẽ tự động tìm App.tsx (hoặc App.js) trong thư mục gốc.
 */

import { registerRootComponent } from "expo";

import App from "./App"; // Import component gốc (App.tsx)

// registerRootComponent gọi AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
