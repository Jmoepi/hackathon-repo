import { createClient } from '../client';
import type { Settings, SettingsInsert, SettingsUpdate } from '../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getSupabase = () => createClient() as any;

/**
 * Get user settings
 */
export async function getSettings(userId: string): Promise<Settings | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    // If no settings found, that's okay - we'll create them
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching settings:', error);
    return null;
  }

  return data;
}

/**
 * Create default settings for a new user
 */
export async function createDefaultSettings(userId: string): Promise<Settings | null> {
  const supabase = getSupabase();

  const defaultSettings: SettingsInsert = {
    user_id: userId,
    theme: 'system',
    currency: 'ZAR',
    language: 'en',
    notifications_push: true,
    notifications_email: true,
    notifications_sms: false,
    notifications_low_stock: true,
    notifications_sales: true,
    receipt_show_logo: true,
    receipt_show_address: true,
    receipt_show_phone: true,
    receipt_show_vat: true,
    payment_enable_qr: true,
    payment_enable_card: false,
    payment_default_method: 'cash',
  };

  try {
    const { data, error } = await supabase
      .from('settings')
      .insert(defaultSettings)
      .select()
      .single();

    if (error) {
      // Log the full error details
      console.error('Error creating default settings:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return null;
    }

    return data;
  } catch (err) {
    console.error('Exception creating default settings:', err);
    return null;
  }
}

/**
 * Update user settings
 */
export async function updateSettings(
  userId: string,
  updates: SettingsUpdate
): Promise<{ error: Error | null }> {
  const supabase = getSupabase();

  // First check if settings exist
  const existingSettings = await getSettings(userId);
  
  if (!existingSettings) {
    // Create settings first, then update
    const created = await createDefaultSettings(userId);
    if (!created) {
      return { error: new Error('Failed to create settings') };
    }
  }

  const { error } = await supabase
    .from('settings')
    .update(updates)
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating settings:', error);
    return { error: new Error(error.message) };
  }

  return { error: null };
}

/**
 * Get or create settings for a user
 */
export async function getOrCreateSettings(userId: string): Promise<Settings | null> {
  let settings = await getSettings(userId);
  
  if (!settings) {
    settings = await createDefaultSettings(userId);
  }
  
  return settings;
}

// Frontend settings type (transformed from database)
export interface FrontendSettings {
  // Notifications
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  soundAlerts: boolean;
  lowStockAlerts: boolean;
  salesAlerts: boolean;
  
  // Receipt Settings
  showLogo: boolean;
  showAddress: boolean;
  showPhone: boolean;
  showVAT: boolean;
  footerMessage: string;
  
  // Payment Settings
  defaultPaymentMethod: 'cash' | 'card' | 'mobile';
  enableQRPayments: boolean;
  enableCardPayments: boolean;
  autoGenerateReceipt: boolean;
  
  // Regional
  currency: string;
  language: string;
  dateFormat: string;
  
  // Theme
  theme: 'light' | 'dark' | 'system';
}

/**
 * Transform database settings to frontend format
 */
export function transformToFrontendSettings(dbSettings: Settings | null): FrontendSettings {
  if (!dbSettings) {
    return getDefaultFrontendSettings();
  }

  return {
    pushNotifications: dbSettings.notifications_push ?? true,
    emailNotifications: dbSettings.notifications_email ?? true,
    smsNotifications: dbSettings.notifications_sms ?? false,
    soundAlerts: true, // Not in DB yet
    lowStockAlerts: dbSettings.notifications_low_stock ?? true,
    salesAlerts: dbSettings.notifications_sales ?? true,
    showLogo: dbSettings.receipt_show_logo ?? true,
    showAddress: dbSettings.receipt_show_address ?? true,
    showPhone: dbSettings.receipt_show_phone ?? true,
    showVAT: dbSettings.receipt_show_vat ?? true,
    footerMessage: "Thank you for your business!", // Could add to DB
    defaultPaymentMethod: dbSettings.payment_default_method ?? 'cash',
    enableQRPayments: dbSettings.payment_enable_qr ?? true,
    enableCardPayments: dbSettings.payment_enable_card ?? false,
    autoGenerateReceipt: true, // Not in DB yet
    currency: dbSettings.currency ?? 'ZAR',
    language: dbSettings.language ?? 'en',
    dateFormat: 'DD/MM/YYYY', // Not in DB yet
    theme: dbSettings.theme ?? 'system',
  };
}

/**
 * Transform frontend settings to database format
 */
export function transformToDbSettings(frontendSettings: FrontendSettings): SettingsUpdate {
  return {
    theme: frontendSettings.theme,
    currency: frontendSettings.currency,
    language: frontendSettings.language,
    notifications_push: frontendSettings.pushNotifications,
    notifications_email: frontendSettings.emailNotifications,
    notifications_sms: frontendSettings.smsNotifications,
    notifications_low_stock: frontendSettings.lowStockAlerts,
    notifications_sales: frontendSettings.salesAlerts,
    receipt_show_logo: frontendSettings.showLogo,
    receipt_show_address: frontendSettings.showAddress,
    receipt_show_phone: frontendSettings.showPhone,
    receipt_show_vat: frontendSettings.showVAT,
    payment_enable_qr: frontendSettings.enableQRPayments,
    payment_enable_card: frontendSettings.enableCardPayments,
    payment_default_method: frontendSettings.defaultPaymentMethod,
  };
}

/**
 * Get default frontend settings
 */
export function getDefaultFrontendSettings(): FrontendSettings {
  return {
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    soundAlerts: true,
    lowStockAlerts: true,
    salesAlerts: true,
    showLogo: true,
    showAddress: true,
    showPhone: true,
    showVAT: true,
    footerMessage: "Thank you for your business!",
    defaultPaymentMethod: 'cash',
    enableQRPayments: true,
    enableCardPayments: false,
    autoGenerateReceipt: true,
    currency: 'ZAR',
    language: 'en',
    dateFormat: 'DD/MM/YYYY',
    theme: 'system',
  };
}
