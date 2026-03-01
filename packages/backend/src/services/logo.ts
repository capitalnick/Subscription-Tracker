import { getAdminClient } from '../lib/supabase.js';
import { config } from '../config.js';

/**
 * Fetch a merchant logo from Logo.dev and store it in Supabase Storage.
 * Fire-and-forget safe — all errors are caught and logged, never thrown.
 */
export async function fetchAndStoreLogo(
  merchantId: string,
  websiteUrl: string,
): Promise<string | null> {
  try {
    if (!config.logoDev.token) {
      console.warn('LOGO_DEV_TOKEN not configured, skipping logo fetch');
      return null;
    }

    // Extract domain from URL
    let domain: string;
    try {
      const url = new URL(websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`);
      domain = url.hostname.replace(/^www\./, '');
    } catch {
      console.warn(`Invalid websiteUrl for logo fetch: ${websiteUrl}`);
      return null;
    }

    // Fetch logo from Logo.dev
    const logoUrl = `https://img.logo.dev/${domain}?token=${config.logoDev.token}&size=128&format=png`;
    const response = await fetch(logoUrl);

    if (!response.ok) {
      console.warn(`Logo.dev returned ${response.status} for ${domain}`);
      return null;
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.startsWith('image/')) {
      console.warn(`Logo.dev returned non-image content-type: ${contentType} for ${domain}`);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const db = getAdminClient();
    const filePath = `${merchantId}.png`;

    const { error: uploadError } = await db.storage
      .from('merchant-logos')
      .upload(filePath, buffer, {
        contentType: 'image/png',
        upsert: true,
      });

    if (uploadError) {
      console.error(`Failed to upload logo for ${merchantId}:`, uploadError);
      return null;
    }

    // Get public URL
    const { data: publicUrlData } = db.storage
      .from('merchant-logos')
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    // Update merchant record
    await db
      .from('merchants')
      .update({ logo_url: publicUrl })
      .eq('id', merchantId);

    return publicUrl;
  } catch (error) {
    console.error(`fetchAndStoreLogo failed for merchant ${merchantId}:`, error);
    return null;
  }
}
