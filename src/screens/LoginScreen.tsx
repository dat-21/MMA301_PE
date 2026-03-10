/**
 * MÀN HÌNH ĐĂNG NHẬP (LoginScreen)
 * 
 * Giao diện:
 * - Logo và tên ứng dụng ở trên
 * - Form đăng nhập: email, mật khẩu (có nút ẩn/hiện password)
 * - Checkbox "Remember me" - lưu phiên đăng nhập vào AsyncStorage
 * - Nút đăng nhập với gradient tím
 * - Link chuyển sang màn hình đăng ký
 * 
 * Xử lý:
 * - Gọi userService.login() để xác thực email + password
 * - Nếu thành công: gọi AuthContext.login() -> tự chuyển sang Home
 * - Nếu thất bại: hiển toast lỗi
 * - Animation fade-in khi mở màn hình
 */

import React, { useState, useContext, useEffect, useRef } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, Switch, StyleSheet,
    KeyboardAvoidingView, ScrollView, Platform, Animated, StatusBar, Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';
import { userService } from '../services/userService';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/Navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
    const { login } = useContext(AuthContext);
    const { toast, showToast, hideToast } = useToast();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passFocused, setPassFocused] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(40)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]).start();

        const loadRemembered = async () => {
            const savedEmail = await AsyncStorage.getItem('rememberEmail');
            const savedPassword = await AsyncStorage.getItem('rememberPassword');
            if (savedEmail && savedPassword) {
                setEmail(savedEmail);
                setPassword(savedPassword);
                setRemember(true);
            }
        };
        loadRemembered();
    }, []);

    const handleLogin = async () => {
        Keyboard.dismiss();
        if (!email || !password) {
            showToast('Please enter email and password', 'warning');
            return;
        }

        const result = userService.login(email, password);
        if (result) {
            if (remember) {
                await AsyncStorage.setItem('rememberEmail', email);
                await AsyncStorage.setItem('rememberPassword', password);
            } else {
                await AsyncStorage.removeItem('rememberEmail');
                await AsyncStorage.removeItem('rememberPassword');
            }
            showToast(`Welcome back, ${result.fullName}! 👋`, 'success');
            setTimeout(() => login(result), 800);
        } else {
            showToast('Invalid email or password', 'error');
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <StatusBar barStyle="light-content" backgroundColor="#0F0F1A" />
            <Toast visible={toast.visible} message={toast.message} type={toast.type} onDismiss={hideToast} />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <View style={styles.logoCircle}>
                        <Ionicons name="storefront" size={40} color="#fff" />
                    </View>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Sign in to your account</Text>
                </Animated.View>

                <Animated.View style={[styles.form, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <Text style={styles.label}>Email</Text>
                    <View style={[styles.inputWrapper, emailFocused && styles.inputWrapperFocused]}>
                        <Ionicons name="mail-outline" size={20} color={emailFocused ? '#7C3AED' : '#9CA3AF'} style={styles.inputIcon} />
                        <TextInput style={styles.input} placeholder="Enter your email" placeholderTextColor="#9CA3AF"
                            value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false} keyboardType="email-address"
                            onFocus={() => setEmailFocused(true)} onBlur={() => setEmailFocused(false)} />
                    </View>

                    <Text style={styles.label}>Password</Text>
                    <View style={[styles.inputWrapper, passFocused && styles.inputWrapperFocused]}>
                        <Ionicons name="lock-closed-outline" size={20} color={passFocused ? '#7C3AED' : '#9CA3AF'} style={styles.inputIcon} />
                        <TextInput style={[styles.input, { flex: 1 }]} placeholder="Enter your password" placeholderTextColor="#9CA3AF"
                            secureTextEntry={!showPass} value={password} onChangeText={setPassword} autoCapitalize="none" autoCorrect={false}
                            onFocus={() => setPassFocused(true)} onBlur={() => setPassFocused(false)} />
                        <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                            <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.rememberRow}>
                        <View style={styles.switchRow}>
                            <Switch value={remember} onValueChange={setRemember} thumbColor={remember ? '#7C3AED' : '#f4f3f4'} trackColor={{ false: '#374151', true: '#C4B5FD' }} />
                            <Text style={styles.rememberText}>Remember Me</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} activeOpacity={0.85}>
                        <Ionicons name="log-in-outline" size={22} color="#fff" />
                        <Text style={styles.loginBtnText}>Sign In</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.registerLink} onPress={() => navigation.navigate('Register')} activeOpacity={0.7}>
                        <Text style={styles.registerLinkText}>Don't have an account? <Text style={styles.registerLinkBold}>Register</Text></Text>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F0F1A' },
    scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
    header: { alignItems: 'center', paddingTop: 80, paddingBottom: 40 },
    logoCircle: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: '#7C3AED',
        justifyContent: 'center', alignItems: 'center', marginBottom: 20,
        shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 12,
    },
    title: { fontSize: 30, fontWeight: '800', color: '#F9FAFB', marginBottom: 6 },
    subtitle: { fontSize: 15, color: '#9CA3AF' },
    form: {},
    label: { fontSize: 14, fontWeight: '600', color: '#D1D5DB', marginBottom: 8, marginTop: 16 },
    inputWrapper: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1E30', borderRadius: 14,
        borderWidth: 1.5, borderColor: '#2D2D45', paddingHorizontal: 14, height: 54,
    },
    inputWrapperFocused: { borderColor: '#7C3AED', backgroundColor: '#1A1A2E' },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, fontSize: 16, color: '#F9FAFB' },
    eyeBtn: { paddingLeft: 10 },
    rememberRow: { marginTop: 16, marginBottom: 8 },
    switchRow: { flexDirection: 'row', alignItems: 'center' },
    rememberText: { marginLeft: 10, fontSize: 14, color: '#9CA3AF' },
    loginBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
        backgroundColor: '#7C3AED', paddingVertical: 16, borderRadius: 14, marginTop: 24,
        shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.45, shadowRadius: 12, elevation: 8,
    },
    loginBtnText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
    registerLink: { alignItems: 'center', marginTop: 24 },
    registerLinkText: { fontSize: 14, color: '#6B7280' },
    registerLinkBold: { color: '#A78BFA', fontWeight: '700' },
});
