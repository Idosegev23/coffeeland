'use client';

/**
 * אדמין - ניהול סוגי כרטיסיות
 */

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { CreditCard, Plus, Edit, Trash2, ArrowRight, Tag } from 'lucide-react';
import Link from 'next/link';

interface CardType {
  id: string;
  name: string;
  description: string;
  type: string;
  entries_count: number;
  price: number;
  sale_price?: number;
  is_active: boolean;
  created_at: string;
}

export default function CardTypesPage() {
  const [cardTypes, setCardTypes] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCard, setEditingCard] = useState<CardType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'playroom',
    entries_count: '',
    price: '',
    sale_price: '',
    is_active: true
  });

  const supabase = createClientComponentClient();

  useEffect(() => {
    loadCardTypes();
  }, []);

  const loadCardTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('card_types')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCardTypes(data || []);
    } catch (error: any) {
      console.error('Error loading card types:', error);
      alert('שגיאה בטעינת כרטיסיות');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const { data, error } = await supabase
        .from('card_types')
        .insert({
          name: formData.name,
          description: formData.description,
          type: formData.type,
          entries_count: parseInt(formData.entries_count),
          price: parseFloat(formData.price),
          sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
          is_active: formData.is_active
        })
        .select()
        .single();

      if (error) throw error;

      alert('✅ סוג כרטיסייה נוצר בהצלחה!');
      setShowCreateDialog(false);
      resetForm();
      loadCardTypes();
    } catch (error: any) {
      console.error('Error creating card type:', error);
      alert('❌ שגיאה: ' + error.message);
    }
  };

  const handleUpdate = async () => {
    if (!editingCard) return;

    try {
      const { error } = await supabase
        .from('card_types')
        .update({
          name: formData.name,
          description: formData.description,
          type: formData.type,
          entries_count: parseInt(formData.entries_count),
          price: parseFloat(formData.price),
          sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
          is_active: formData.is_active
        })
        .eq('id', editingCard.id);

      if (error) throw error;

      alert('✅ סוג כרטיסייה עודכן!');
      setEditingCard(null);
      resetForm();
      loadCardTypes();
    } catch (error: any) {
      console.error('Error updating card type:', error);
      alert('❌ שגיאה: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('האם למחוק סוג כרטיסייה זה?')) return;

    try {
      const { error } = await supabase
        .from('card_types')
        .delete()
        .eq('id', id);

      if (error) throw error;

      alert('✅ סוג כרטיסייה נמחק');
      loadCardTypes();
    } catch (error: any) {
      console.error('Error deleting card type:', error);
      alert('❌ שגיאה: ' + error.message);
    }
  };

  const openEditDialog = (card: CardType) => {
    setEditingCard(card);
    setFormData({
      name: card.name,
      description: card.description || '',
      type: card.type,
      entries_count: card.entries_count.toString(),
      price: card.price.toString(),
      sale_price: card.sale_price?.toString() || '',
      is_active: card.is_active
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'playroom',
      entries_count: '',
      price: '',
      sale_price: '',
      is_active: true
    });
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      playroom: 'חדר משחקים',
      class: 'חוגים',
      workshop: 'סדנאות',
      combo: 'משולב'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>טוען כרטיסיות...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* כפתור חזרה */}
        <Link href="/admin">
          <Button variant="outline" className="mb-4 flex items-center gap-2">
            <ArrowRight size={18} />
            חזרה לפאנל ניהול
          </Button>
        </Link>

        {/* כותרת */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              <CreditCard className="inline-block mr-2 mb-1" />
              ניהול סוגי כרטיסיות
            </h1>
            <p className="text-gray-600">צור ונהל את סוגי הכרטיסיות השונות</p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setShowCreateDialog(true);
            }}
            className="bg-accent hover:bg-accent/90"
          >
            <Plus className="ml-2" size={20} />
            כרטיסייה חדשה
          </Button>
        </div>

        {/* רשימת כרטיסיות */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cardTypes.map((card) => (
            <div
              key={card.id}
              className={`bg-white rounded-lg shadow-md p-6 border-2 ${
                card.is_active ? 'border-green-200' : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{card.name}</h3>
                  <span className={`inline-block px-2 py-1 rounded text-xs mt-2 ${
                    card.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {card.is_active ? 'פעיל' : 'לא פעיל'}
                  </span>
                </div>
                <Tag className="text-accent" size={24} />
              </div>

              <p className="text-gray-600 text-sm mb-4">{card.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">סוג:</span>
                  <span className="font-medium">{getTypeLabel(card.type)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">כניסות:</span>
                  <span className="font-medium">{card.entries_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">מחיר:</span>
                  <span className="font-bold text-accent">₪{card.price}</span>
                </div>
                {card.sale_price && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">מחיר מבצע:</span>
                    <span className="font-bold text-green-600">₪{card.sale_price}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t">
                <Button
                  onClick={() => openEditDialog(card)}
                  variant="outline"
                  className="flex-1"
                  size="sm"
                >
                  <Edit size={16} className="ml-1" />
                  עריכה
                </Button>
                <Button
                  onClick={() => handleDelete(card.id)}
                  variant="outline"
                  className="text-red-600 hover:bg-red-50"
                  size="sm"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}

          {cardTypes.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              <CreditCard size={48} className="mx-auto mb-4 opacity-50" />
              <p>אין עדיין סוגי כרטיסיות</p>
              <p className="text-sm">לחץ על &quot;כרטיסייה חדשה&quot; כדי ליצור</p>
            </div>
          )}
        </div>

        {/* Dialog - יצירה/עריכה */}
        <Dialog open={showCreateDialog || editingCard !== null} onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false);
            setEditingCard(null);
            resetForm();
          }
        }}>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>
                {editingCard ? 'עריכת כרטיסייה' : 'כרטיסייה חדשה'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium mb-1">שם הכרטיסייה *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="למשל: כרטיסיית 10 כניסות"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">תיאור</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                  placeholder="תיאור הכרטיסייה..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">סוג *</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="playroom">חדר משחקים</option>
                  <option value="class">חוגים</option>
                  <option value="workshop">סדנאות</option>
                  <option value="combo">משולב</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">מספר כניסות *</label>
                  <input
                    type="number"
                    value={formData.entries_count}
                    onChange={e => setFormData({ ...formData, entries_count: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">מחיר (₪) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">מחיר מבצע (₪)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.sale_price}
                  onChange={e => setFormData({ ...formData, sale_price: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="80 (אופציונלי)"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="is_active" className="text-sm font-medium cursor-pointer">
                  כרטיסייה פעילה (זמינה למכירה)
                </label>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false);
                  setEditingCard(null);
                  resetForm();
                }}
              >
                ביטול
              </Button>
              <Button
                onClick={editingCard ? handleUpdate : handleCreate}
                className="bg-accent hover:bg-accent/90"
              >
                {editingCard ? 'עדכן' : 'צור'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

