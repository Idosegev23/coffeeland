import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * POST /api/coupons/validate
 * בדיקת תקפות קוד קופון והחזרת פרטי ההנחה
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { code, itemType, amount } = await req.json();

    if (!code) {
      return NextResponse.json(
        { error: 'נדרש קוד קופון' },
        { status: 400 }
      );
    }

    // חיפוש הקופון (case insensitive)
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .ilike('code', code.trim())
      .single();

    if (error || !coupon) {
      return NextResponse.json(
        { valid: false, error: 'קוד קופון לא תקף' },
        { status: 404 }
      );
    }

    // בדיקות תקפות
    const now = new Date();

    // האם פעיל?
    if (!coupon.is_active) {
      return NextResponse.json(
        { valid: false, error: 'קוד קופון לא פעיל' },
        { status: 400 }
      );
    }

    // האם בתוקף? (תאריך)
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return NextResponse.json(
        { valid: false, error: 'קוד קופון עדיין לא בתוקף' },
        { status: 400 }
      );
    }

    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      return NextResponse.json(
        { valid: false, error: 'קוד קופון פג תוקף' },
        { status: 400 }
      );
    }

    // האם יש שימושים נותרים?
    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
      return NextResponse.json(
        { valid: false, error: 'קוד קופון נוצל במלואו' },
        { status: 400 }
      );
    }

    // בדיקת סכום מינימלי
    if (amount && coupon.min_purchase_amount && amount < coupon.min_purchase_amount) {
      return NextResponse.json(
        { 
          valid: false, 
          error: `נדרש סכום מינימלי של ₪${coupon.min_purchase_amount}` 
        },
        { status: 400 }
      );
    }

    // בדיקת סוג פריט
    if (itemType && coupon.applicable_to && !coupon.applicable_to.includes('all')) {
      if (!coupon.applicable_to.includes(itemType)) {
        return NextResponse.json(
          { 
            valid: false, 
            error: 'קוד קופון לא תקף עבור סוג פריט זה' 
          },
          { status: 400 }
        );
      }
    }

    // חישוב הנחה
    let discountAmount = 0;
    let finalAmount = amount || 0;

    if (coupon.discount_type === 'free') {
      discountAmount = finalAmount;
      finalAmount = 0;
    } else if (coupon.discount_type === 'percentage') {
      discountAmount = (finalAmount * (coupon.discount_value || 0)) / 100;
      finalAmount = Math.max(0, finalAmount - discountAmount);
    } else if (coupon.discount_type === 'fixed') {
      discountAmount = Math.min(finalAmount, coupon.discount_value || 0);
      finalAmount = Math.max(0, finalAmount - discountAmount);
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value
      },
      discount_amount: Math.round(discountAmount * 100) / 100,
      final_amount: Math.round(finalAmount * 100) / 100,
      is_free: finalAmount === 0
    });

  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json(
      { error: 'שגיאה בבדיקת קוד קופון' },
      { status: 500 }
    );
  }
}
