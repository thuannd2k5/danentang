import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { loginAdmin, registerAdmin, validateAuthInput } from '../services/authService';

export default function AuthScreen({ onAuthSuccess }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleAuth = async () => {
    setErrorMessage('');
    const validation = validateAuthInput(email, password);
    if (!validation.isValid) {
      setErrorMessage(validation.error);
      showAlert('Thông báo', validation.error);
      return;
    }

    try {
      setLoading(true);
      let user;
      if (isRegisterMode) {
        user = await registerAdmin(email, password);
        showAlert('Thành công', 'Đăng ký tài khoản quản trị thành công!');
      } else {
        user = await loginAdmin(email, password);
      }
      if (onAuthSuccess) {
        onAuthSuccess(user);
      }
    } catch (error) {
      console.error('Lỗi xác thực:', error);
      let msg = error.message;
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        msg = 'Email hoặc mật khẩu không chính xác.';
      } else if (error.code === 'auth/user-not-found') {
        msg = 'Tài khoản không tồn tại. Vui lòng đăng ký mới.';
      } else if (error.code === 'auth/email-already-in-use') {
        msg = 'Email này đã được sử dụng. Vui lòng đăng nhập.';
      }
      setErrorMessage(msg);
      showAlert('Lỗi', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemoAdmin = () => {
    setEmail('admin@gmail.com');
    setPassword('admin123');
    setErrorMessage('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoBadgeText}>AD</Text>
            </View>
            <Text style={styles.title}>Quản Trị Sản Phẩm</Text>
            <Text style={styles.subtitle}>
              {isRegisterMode ? 'Đăng ký tài khoản Admin mới' : 'Đăng nhập vào hệ thống Admin'}
            </Text>
          </View>

          {/* Mode Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, !isRegisterMode && styles.activeTabButton]}
              onPress={() => {
                setIsRegisterMode(false);
                setErrorMessage('');
              }}
            >
              <Text style={[styles.tabText, !isRegisterMode && styles.activeTabText]}>
                Đăng nhập
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, isRegisterMode && styles.activeTabButton]}
              onPress={() => {
                setIsRegisterMode(true);
                setErrorMessage('');
              }}
            >
              <Text style={[styles.tabText, isRegisterMode && styles.activeTabText]}>
                Đăng ký mới
              </Text>
            </TouchableOpacity>
          </View>

          {/* Error message */}
          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Form Fields */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email quản trị</Text>
            <TextInput
              style={styles.input}
              placeholder="admin@gmail.com"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.buttonDisabled]}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isRegisterMode ? 'Đăng Ký Tài Khoản' : 'Đăng Nhập Quản Trị'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Demo Admin Auto Fill Button */}
          <TouchableOpacity
            style={styles.demoFillButton}
            onPress={handleFillDemoAdmin}
            disabled={loading}
          >
            <Text style={styles.demoFillText}>⚡ Điền nhanh tài khoản Admin mẫu (admin@gmail.com)</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // Slate 900
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#1e293b', // Slate 800
    borderRadius: 16,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoBadgeText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: '#2563eb',
  },
  tabText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#ffffff',
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    padding: 10,
    borderRadius: 6,
    marginBottom: 16,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 13,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#f8fafc',
  },
  submitButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  demoFillButton: {
    marginTop: 18,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  demoFillText: {
    color: '#60a5fa',
    fontSize: 12,
    fontWeight: '600',
  },
});
