import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getServiceClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('file') || '1769435166818-44u56.jpeg';
    
    const supabase = getServiceClient();
    
    // 1. Check if file exists
    const { data: listData, error: listError } = await supabase.storage
      .from('show-images')
      .list('', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });
      
    if (listError) {
      return NextResponse.json({ error: 'List error', details: listError }, { status: 500 });
    }
    
    const fileExists = listData.some(f => f.name === fileName);
    
    // 2. Try to get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('show-images')
      .getPublicUrl(fileName);
    
    // 3. Try to download file
    const { data: downloadData, error: downloadError } = await supabase.storage
      .from('show-images')
      .download(fileName);
    
    return NextResponse.json({
      fileName,
      fileExists,
      publicUrl,
      downloadSuccess: !downloadError,
      downloadError: downloadError?.message,
      downloadSize: downloadData?.size || 0,
      allFiles: listData.map(f => ({
        name: f.name,
        created: f.created_at,
        size: f.metadata?.size
      }))
    });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
