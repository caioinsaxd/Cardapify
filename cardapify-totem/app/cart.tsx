'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '@/hooks/use-auth';
import { useCart } from '@/hooks/use-cart';
import { api, MenuData, OrderResponse } from '@/lib/api';

const formatCurrency = (value: number) => {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
};

export default function CartScreen() {
  const router = useRouter();
  const { restaurantId } = useAuth();
  const { items, total, updateQuantity, removeItem, clearCart } = useCart();
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [tableNumber, setTableNumber] = useState('');
  const [observations, setObservations] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchMenuData = async () => {
      if (!restaurantId) return;
      try {
        const data = await api.get<MenuData>(`/public/${restaurantId}/menu`);
        setMenuData(data);
      } catch (err) {
        // Silently fail, use defaults
      } finally {
        setIsLoading(false);
      }
    };
    fetchMenuData();
  }, [restaurantId]);

  const handlePlaceOrder = async () => {
    if (!restaurantId || items.length === 0) return;

    setIsSubmitting(true);
    try {
      const requestBody: any = {
        tableNumber: menuData?.orderSettings.requireTableNumber
          ? parseInt(tableNumber) || 0
          : parseInt(tableNumber) || undefined,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      if (menuData?.orderSettings.allowObservations && observations.trim()) {
        requestBody.observations = observations.trim().slice(0, 500);
      }

      const response = await api.postPublic<OrderResponse>(
        `/public/${restaurantId}/orders`,
        requestBody
      );

      clearCart();
      router.replace({
        pathname: '/order-success',
        params: {
          orderId: response.orderId,
          total: response.total,
          status: response.status,
        },
      });
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Erro ao fazer pedido');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canPlaceOrder = () => {
    if (items.length === 0) return false;
    if (menuData?.orderSettings.requireTableNumber && (!tableNumber || parseInt(tableNumber) <= 0)) {
      return false;
    }
    if (menuData?.orderSettings.minimumOrderAmount && total < menuData.orderSettings.minimumOrderAmount) {
      return false;
    }
    return true;
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0f172a" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Carrinho</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {items.length === 0 ? (
          <View style={styles.emptyCart}>
            <Text style={styles.emptyText}>Seu carrinho está vazio</Text>
            <TouchableOpacity style={styles.continueButton} onPress={() => router.back()}>
              <Text style={styles.continueText}>Continuar comprando</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.itemsList}>
              {items.map((item) => (
                <View key={item.id} style={styles.cartItem}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
                  </View>
                  <View style={styles.quantityControls}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Text style={styles.quantityButtonText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantity}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity onPress={() => removeItem(item.id)}>
                    <Text style={styles.removeText}>Remover</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {menuData?.orderSettings.requireTableNumber && (
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Mesa <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  value={tableNumber}
                  onChangeText={setTableNumber}
                  placeholder="Número da mesa"
                  keyboardType="number-pad"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            )}

            {menuData?.orderSettings.allowObservations && (
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Observações <Text style={styles.optional}>(opcional)</Text></Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={observations}
                  onChangeText={(text) => setObservations(text.slice(0, 500))}
                  placeholder="Ex: sem cebola, alérgico a lactose..."
                  placeholderTextColor="#9ca3af"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
                <Text style={styles.charCount}>{observations.length}/500</Text>
              </View>
            )}

            {menuData?.orderSettings.minimumOrderAmount && total < menuData.orderSettings.minimumOrderAmount && (
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>
                  Pedido mínimo: {formatCurrency(menuData.orderSettings.minimumOrderAmount)}
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {items.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
          </View>
          <TouchableOpacity
            style={[styles.orderButton, !canPlaceOrder() && styles.orderButtonDisabled]}
            onPress={handlePlaceOrder}
            disabled={!canPlaceOrder() || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.orderButtonText}>Fazer Pedido</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#64748b',
    marginBottom: 24,
  },
  continueButton: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  continueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  itemsList: {
    padding: 16,
    gap: 12,
  },
  cartItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  itemPrice: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 20,
    color: '#0f172a',
    fontWeight: '300',
  },
  quantity: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    minWidth: 24,
    textAlign: 'center',
  },
  removeText: {
    fontSize: 14,
    color: '#dc2626',
  },
  inputSection: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#dc2626',
  },
  optional: {
    color: '#9ca3af',
    fontWeight: '400',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#0f172a',
  },
  textArea: {
    height: 80,
    paddingTop: 14,
  },
  charCount: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
    marginTop: 4,
  },
  warningBox: {
    backgroundColor: '#fef3c7',
    marginHorizontal: 16,
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
  },
  warningText: {
    color: '#92400e',
    fontSize: 14,
  },
  footer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  orderButton: {
    backgroundColor: '#22c55e',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  orderButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  orderButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});
