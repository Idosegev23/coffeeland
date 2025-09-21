import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const layout = searchParams.get('layout') || 'marquee';
    const limit = parseInt(searchParams.get('limit') || '4');

    // Get active banner
    const { data: banners, error: bannerError } = await supabaseAdmin
      .from('banners')
      .select('*')
      .eq('is_active', true)
      .eq('layout_mode', layout)
      .or(`active_from.is.null,active_from.lte.${new Date().toISOString()}`)
      .or(`active_to.is.null,active_to.gte.${new Date().toISOString()}`)
      .order('priority', { ascending: false })
      .limit(1)
      .single();

    if (bannerError || !banners) {
      return NextResponse.json({ 
        success: false, 
        error: 'No active banner found' 
      });
    }

    // Get banner products
    const { data: bannerProducts, error: productsError } = await supabaseAdmin
      .from('banner_products')
      .select(`
        sort_order,
        products!inner (
          id,
          slug,
          title,
          description_md,
          price_cents,
          compare_at_price_cents,
          stock,
          is_active,
          product_images (
            image_url,
            sort_order
          )
        )
      `)
      .eq('banner_id', banners.id)
      .eq('products.is_active', true)
      .order('sort_order', { ascending: true })
      .limit(limit);

    if (productsError) {
      console.error('Error fetching banner products:', productsError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch banner products'
      });
    }

    // Format products with images
    const products = (bannerProducts || []).map(bp => {
      const product = (bp as any).products;
      const firstImage = product.product_images?.[0];
      
      return {
        id: product.id,
        slug: product.slug,
        title: product.title,
        description_md: product.description_md,
        price_cents: product.price_cents,
        compare_at_price_cents: product.compare_at_price_cents,
        stock: product.stock,
        image_url: firstImage?.image_url || null,
      };
    });

    const bannerWithProducts = {
      ...banners,
      products,
    };

    return NextResponse.json({
      success: true,
      banner: bannerWithProducts,
    });

  } catch (error) {
    console.error('Error in hot-banner API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Track banner interaction
    const body = await request.json();
    const { bannerId, productId, action, userId, deviceId } = body;

    if (!bannerId || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Log interaction (simplified - you might want to create a separate interactions table)
    const interactionData = {
      banner_id: bannerId,
      product_id: productId || null,
      action, // 'impression', 'click', 'add_to_cart'
      user_id: userId || null,
      device_id: deviceId || null,
      occurred_at: new Date().toISOString(),
    };

    // You would insert this into an analytics/interactions table
    console.log('Banner interaction:', interactionData);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error tracking banner interaction:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track interaction' },
      { status: 500 }
    );
  }
}
