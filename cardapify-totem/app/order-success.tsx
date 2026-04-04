'use client';

import { useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';

const formatCurrency = (value: string) => {
  const num = parseFloat(value);
  return `R$ ${num.toFixed(2).replace('.', ',')}`;
};

export default function OrderSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    orderId: string;
    total: string;
    status: string;
  }>();
  const [scaleAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleNewOrder = () => {
    router.replace('/menu');
  };

  const statusLabel = params.status === 'PAID' ? 'Confirmado' : 'Aguardando';
  const statusColor = params.status === 'PAID' ? '#22c55e' : '#f59e0b';

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.successIcon,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Text style={styles.checkmark}>✓</Text>
      </Animated.View>

      <Text style={styles.title}>Pedido Enviado!</Text>
      <Text style={styles.subtitle}>Seu pedido foi recebido com sucesso</Text>

      <View style={styles.orderInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Pedido</Text>
          <Text style={styles.infoValue}>#{params.orderId?.slice(0, 8).toUpperCase()}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Status</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{statusLabel}</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatCurrency(params.total || '0')}</Text>
        </View>
      </View>

      <View style={styles.message}>
        <Text style={styles.messageText}>
          Aguarde a confirmação do estabelecimento
        </Text>
      </View>

      <TouchableOpacity style={styles.newOrderButton} onPress={handleNewOrder}>
        <Text style={styles.newOrderText}>Fazer Novo Pedido</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  checkmark: {
    fontSize: 60,
    color: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 32,
  },
  orderInfo: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoLabel: {
    fontSize: 16,
    color: '#64748b',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  message: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 32,
  },
  messageText: {
    fontSize: 16,
    color: '#0369a1',
    textAlign: 'center',
  },
  newOrderButton: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 48,
  },
  newOrderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});
