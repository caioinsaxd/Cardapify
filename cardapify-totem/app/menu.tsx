'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { useAuth } from '@/hooks/use-auth';
import { useCart } from '@/hooks/use-cart';
import { api, MenuData, Product, Category } from '@/lib/api';

const formatCurrency = (value: number) => {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
};

export default function MenuScreen() {
  const router = useRouter();
  const { restaurantId, logout } = useAuth();
  const { items, addItem, totalItems } = useCart();
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const fetchMenu = async () => {
    if (!restaurantId) {
      setError('Restaurante não encontrado');
      setIsLoading(false);
      return;
    }

    try {
      const data = await api.get<MenuData>(`/public/${restaurantId}/menu`);
      setMenuData(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar cardápio');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, [restaurantId]);

  const isRestaurantOpen = useMemo(() => {
    if (!menuData?.businessHours) return true;
    const now = new Date();
    const dayMap: Record<number, string> = {
      0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday',
      4: 'thursday', 5: 'friday', 6: 'saturday',
    };
    const today = dayMap[now.getDay()];
    const todayHours = menuData.businessHours.find(h => h.day === today);
    
    if (!todayHours || !todayHours.isOpen) return false;
    
    const currentTime = now.toTimeString().slice(0, 5);
    return currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime;
  }, [menuData?.businessHours]);

  const filteredCategories = useMemo(() => {
    if (!menuData?.categories) return [];
    if (!selectedCategory) return menuData.categories;
    return menuData.categories.filter(c => c.id === selectedCategory);
  }, [menuData?.categories, selectedCategory]);

  const handleAddToCart = (product: Product) => {
    if (!isRestaurantOpen) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: parseFloat(product.price),
      quantity: 1,
    });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchMenu();
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0f172a" />
        <Text style={styles.loadingText}>Carregando cardápio...</Text>
      </View>
    );
  }

  if (error || !menuData) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || 'Cardápio não encontrado'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchMenu}>
          <Text style={styles.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerInfo}>
            <Text style={styles.restaurantName}>{menuData.restaurant.name}</Text>
            {menuData.restaurant.address && (
              <Text style={styles.restaurantAddress}>{menuData.restaurant.address}</Text>
            )}
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>
        {!isRestaurantOpen && (
          <View style={styles.closedBanner}>
            <Text style={styles.closedText}>No momento não estamos aceitando pedidos</Text>
          </View>
        )}
      </View>

      <View style={styles.categoriesBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={[styles.categoryText, !selectedCategory && styles.categoryTextActive]}>
              Todos
            </Text>
          </TouchableOpacity>
          {menuData.categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[styles.categoryChip, selectedCategory === category.id && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={[styles.categoryText, selectedCategory === category.id && styles.categoryTextActive]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.menu}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {filteredCategories.map((category) => (
          <View key={category.id} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{category.name}</Text>
            <View style={styles.productsGrid}>
              {category.products.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={[styles.productCard, !isRestaurantOpen && styles.productCardDisabled]}
                  onPress={() => handleAddToCart(product)}
                  disabled={!isRestaurantOpen}
                >
                  {product.imageUrl && (
                    <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
                  )}
                  <View style={styles.productInfo}>
                    <Text style={[styles.productName, !isRestaurantOpen && styles.textDisabled]}>
                      {product.name}
                    </Text>
                    {product.description && (
                      <Text style={[styles.productDescription, !isRestaurantOpen && styles.textDisabled]} numberOfLines={2}>
                        {product.description}
                      </Text>
                    )}
                    <Text style={[styles.productPrice, !isRestaurantOpen && styles.textDisabled]}>
                      {formatCurrency(parseFloat(product.price))}
                    </Text>
                  </View>
                  <View style={styles.addButton}>
                    <Text style={styles.addButtonText}>+</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
        <View style={styles.bottomPadding} />
      </ScrollView>

      <TouchableOpacity
        style={[styles.cartButton, totalItems === 0 && styles.cartButtonDisabled]}
        onPress={() => router.push('/cart')}
        disabled={totalItems === 0}
      >
        <Text style={styles.cartButtonText}>
          Ver Carrinho ({totalItems})
        </Text>
        <Text style={styles.cartButtonTotal}>
          {formatCurrency(items.reduce((sum, item) => sum + item.price * item.quantity, 0))}
        </Text>
      </TouchableOpacity>
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
    backgroundColor: '#f8fafc',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  restaurantAddress: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  logoutText: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '600',
  },
  closedBanner: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
  },
  closedText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
  },
  categoriesBar: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#0f172a',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  categoryTextActive: {
    color: '#fff',
  },
  menu: {
    flex: 1,
  },
  categorySection: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 12,
  },
  productsGrid: {
    gap: 12,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  productCardDisabled: {
    opacity: 0.6,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  productDescription: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 8,
  },
  textDisabled: {
    color: '#94a3b8',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '300',
  },
  bottomPadding: {
    height: 100,
  },
  cartButton: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: '#22c55e',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  cartButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  cartButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  cartButtonTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});
