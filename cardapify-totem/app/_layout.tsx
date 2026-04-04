'use client';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

function RootNavigatorContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#0f172a" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      {!user ? (
        <Stack.Screen
          name="login"
          options={{
            animation: 'fade',
          }}
        />
      ) : (
        <>
          <Stack.Screen
            name="menu"
            options={{
              animation: 'fade',
            }}
          />
          <Stack.Screen
            name="cart"
            options={{
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="order-success"
            options={{
              animation: 'fade',
            }}
          />
        </>
      )}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <RootNavigatorContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
});
