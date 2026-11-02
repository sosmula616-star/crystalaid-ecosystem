import React, { useState, useEffect } from 'react';
import { api } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Tabs } from '../components/ui/Tabs';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ShopCatalogItem, ShopCategory } from '@crystalaid/types';

export const ShopPage: React.FC = () => {
  const { user, updateUserBalance, updateUserCosmetics, refreshProfile } = useAuth();
  const { success, error } = useToast();

  const [items, setItems] = useState<ShopCatalogItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  // Live Simulator Modal state
  const [previewItem, setPreviewItem] = useState<ShopCatalogItem | null>(null);

  const fetchShopCatalog = async () => {
    setIsLoading(true);
    try {
      const data = await api.get<ShopCatalogItem[]>('/api/shop/items');
      setItems(data);
    } catch (err: any) {
      error(err.message || 'Failed to load shop catalog');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShopCatalog();
  }, []);

  const handlePurchase = async (item: ShopCatalogItem) => {
    if (!user) return;
    if (user.coins < item.price) {
      error(`Insufficient crystals! You need ${item.price} 💎, but have ${user.coins} 💎.`, 'Purchase Failed');
      return;
    }

    setPurchasingId(item.id);
    try {
      const result = await api.post<{
        success: boolean;
        remainingCoins: number;
        purchasedItem: { id: string; name: string; code: string };
      }>(`/api/shop/purchase/${item.id}`);

      success(`Successfully acquired ${item.name}!`, 'Purchase Complete');
      updateUserBalance(-item.price);

      // Auto-equip if it's a frame or badge
      if (item.category === 'FRAMES') {
        await updateUserCosmetics(item.code, undefined);
      } else if (item.category === 'BADGES') {
        await updateUserCosmetics(undefined, item.code);
      }

      await fetchShopCatalog();
      refreshProfile();
      setPreviewItem(null);
    } catch (err: any) {
      error(err.message || 'Purchase transaction failed');
    } finally {
      setPurchasingId(null);
    }
  };

  const handleEquip = async (item: ShopCatalogItem) => {
    try {
      if (item.category === 'FRAMES') {
        const nextFrame = user?.equippedFrame === item.code ? null : item.code;
        await updateUserCosmetics(nextFrame, undefined);
      } else if (item.category === 'BADGES') {
        const nextBadge = user?.equippedBadge === item.code ? null : item.code;
        await updateUserCosmetics(undefined, nextBadge);
      }
      await fetchShopCatalog();
    } catch (err: any) {
      error(err.message || 'Failed to update equipped item');
    }
  };

  const categoryTabs = [
    { id: 'ALL', label: 'All Items' },
    { id: 'FRAMES', label: 'Avatar Frames' },
    { id: 'BADGES', label: 'Badges' },
    { id: 'THEMES', label: 'Themes' },
    { id: 'EFFECTS', label: 'Effects' },
  ];

  const filteredItems = items.filter((item) => {
    if (activeCategory === 'ALL') return true;
    return item.category === activeCategory;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Shop Header Banner */}
      <Card
        surface={2}
        glow="cyan"
        style={{
          border: '1px solid var(--border-cyan)',
          background: 'linear-gradient(135deg, rgba(13, 17, 26, 0.95), rgba(2, 132, 199, 0.2))',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{ fontSize: '28px' }}>🛍️</span>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF' }}>
                Crystal Cosmetics Catalog
              </h1>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '520px' }}>
              Customize your Discord presence with glowing crystalline avatar frames, animated name badges, and exclusive themes.
            </p>
          </div>

          <div
            style={{
              background: 'var(--surface-3)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              padding: '12px 20px',
              borderRadius: 'var(--r-lg)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: 'var(--glow-cyan)',
            }}
          >
            <span style={{ fontSize: '28px' }}>💎</span>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
                Your Balance
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#38BDF8', fontFamily: 'var(--font-mono)' }}>
                {user?.coins.toLocaleString() || 0} Crystals
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Category Tabs */}
      <div style={{ overflowX: 'auto', paddingBottom: '4px' }}>
        <Tabs tabs={categoryTabs} activeTab={activeCategory} onChange={(cat) => setActiveCategory(cat)} />
      </div>

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} height={260} />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon="🛍️"
          title="No items found"
          description="Check another category or come back during the next shop refresh."
          actionLabel="Show All Items"
          onAction={() => setActiveCategory('ALL')}
        />
      ) : (
        /* Items Grid */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
            gap: '20px',
          }}
        >
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              surface={2}
              style={{
                border: item.isEquipped
                  ? '1px solid var(--crystal-cyan)'
                  : '1px solid var(--border-subtle)',
                boxShadow: item.isEquipped ? 'var(--glow-cyan)' : 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                {/* Item Preview Showcase */}
                <div
                  style={{
                    height: '130px',
                    borderRadius: 'var(--r-md)',
                    background: 'var(--surface-3)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {item.category === 'FRAMES' ? (
                    <Avatar
                      src={user?.avatar}
                      alt={item.name}
                      size="lg"
                      equippedFrame={item.code}
                    />
                  ) : item.category === 'BADGES' ? (
                    <div style={{ fontSize: '42px' }}>💎</div>
                  ) : item.category === 'THEMES' ? (
                    <div style={{ fontSize: '42px' }}>🎨</div>
                  ) : (
                    <div style={{ fontSize: '42px' }}>✨</div>
                  )}

                  <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                    <Badge rarity={item.rarity} size="sm">
                      {item.rarity}
                    </Badge>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {item.name}
                  </h3>
                </div>

                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '16px' }}>
                  {item.description}
                </p>
              </div>

              {/* Action and Price Area */}
              <div
                style={{
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--crystal-gold)', fontFamily: 'var(--font-mono)' }}>
                  {item.price.toLocaleString()} 💎
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {item.category === 'FRAMES' && (
                    <Button variant="ghost" size="sm" onClick={() => setPreviewItem(item)}>
                      Preview
                    </Button>
                  )}

                  {item.isOwned ? (
                    <Button
                      variant={item.isEquipped ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={() => handleEquip(item)}
                    >
                      {item.isEquipped ? 'Unequip' : 'Equip'}
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      isLoading={purchasingId === item.id}
                      onClick={() => handlePurchase(item)}
                    >
                      Purchase
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Live Avatar Frame Simulator Modal */}
      <Modal
        isOpen={!!previewItem}
        onClose={() => setPreviewItem(null)}
        title="Live Frame Preview"
        footer={
          previewItem && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button variant="ghost" onClick={() => setPreviewItem(null)}>
                Close
              </Button>
              {previewItem.isOwned ? (
                <Button variant="primary" onClick={() => handleEquip(previewItem)}>
                  {previewItem.isEquipped ? 'Unequip Frame' : 'Equip Frame'}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  isLoading={purchasingId === previewItem.id}
                  onClick={() => handlePurchase(previewItem)}
                >
                  Purchase for {previewItem.price.toLocaleString()} 💎
                </Button>
              )}
            </div>
          )
        }
      >
        {previewItem && (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <div style={{ padding: '24px', background: 'var(--surface-3)', borderRadius: 'var(--r-xl)', width: '100%' }}>
              <Avatar
                src={user?.avatar}
                alt="Simulated Avatar"
                size="xl"
                equippedFrame={previewItem.code}
                levelBadge={user?.level}
              />
              <div style={{ marginTop: '16px', fontSize: '18px', fontWeight: 800, color: '#FFFFFF' }}>
                {user?.username}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Frame: <strong style={{ color: 'var(--crystal-cyan)' }}>{previewItem.name}</strong>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              This is how your avatar will render in voice channels, profile cards, and leaderboard podiums across CrystalAid.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};
