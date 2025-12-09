import { createClient } from '../client';
import type {
  Booking,
  BookingInsert,
  BookingUpdate,
  BookingService,
  BookingServiceInsert,
  BookingServiceUpdate,
  StaffMember,
  StaffMemberInsert,
  StaffMemberUpdate,
} from '../types';

const supabase = createClient();

// ============================================================================
// Booking Services (services offered by the business)
// ============================================================================

export async function getBookingServices(userId: string): Promise<BookingService[]> {
  const { data, error } = await supabase
    .from('booking_services')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function createBookingService(service: BookingServiceInsert): Promise<BookingService> {
  const { data, error } = await supabase
    .from('booking_services')
    .insert(service)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBookingService(
  id: string,
  updates: BookingServiceUpdate
): Promise<BookingService> {
  const { data, error } = await supabase
    .from('booking_services')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteBookingService(id: string): Promise<void> {
  const { error } = await supabase
    .from('booking_services')
    .update({ is_active: false })
    .eq('id', id);

  if (error) throw error;
}

// ============================================================================
// Staff Members
// ============================================================================

export async function getStaffMembers(userId: string): Promise<StaffMember[]> {
  const { data, error } = await supabase
    .from('staff_members')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function createStaffMember(staff: StaffMemberInsert): Promise<StaffMember> {
  const { data, error } = await supabase
    .from('staff_members')
    .insert(staff)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateStaffMember(
  id: string,
  updates: StaffMemberUpdate
): Promise<StaffMember> {
  const { data, error } = await supabase
    .from('staff_members')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteStaffMember(id: string): Promise<void> {
  const { error } = await supabase
    .from('staff_members')
    .update({ is_active: false })
    .eq('id', id);

  if (error) throw error;
}

// ============================================================================
// Bookings
// ============================================================================

export async function getBookings(
  userId: string,
  options?: {
    status?: Booking['status'];
    startDate?: string;
    endDate?: string;
    staffId?: string;
    limit?: number;
  }
): Promise<Booking[]> {
  let query = supabase
    .from('bookings')
    .select('*')
    .eq('user_id', userId)
    .order('scheduled_at', { ascending: true });

  if (options?.status) {
    query = query.eq('status', options.status);
  }

  if (options?.startDate) {
    query = query.gte('scheduled_at', options.startDate);
  }

  if (options?.endDate) {
    query = query.lte('scheduled_at', options.endDate);
  }

  if (options?.staffId) {
    query = query.eq('staff_id', options.staffId);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

export async function getBookingById(id: string): Promise<Booking | null> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data;
}

export async function createBooking(booking: BookingInsert): Promise<Booking> {
  const { data, error } = await supabase
    .from('bookings')
    .insert(booking)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBooking(id: string, updates: BookingUpdate): Promise<Booking> {
  const { data, error } = await supabase
    .from('bookings')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBookingStatus(
  id: string,
  status: Booking['status']
): Promise<Booking> {
  return updateBooking(id, { status });
}

export async function cancelBooking(id: string): Promise<Booking> {
  return updateBookingStatus(id, 'cancelled');
}

export async function completeBooking(id: string): Promise<Booking> {
  return updateBookingStatus(id, 'completed');
}

export async function getTodaysBookings(userId: string): Promise<Booking[]> {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

  return getBookings(userId, {
    startDate: startOfDay,
    endDate: endOfDay,
  });
}

export async function getUpcomingBookings(userId: string, limit = 10): Promise<Booking[]> {
  const now = new Date().toISOString();

  return getBookings(userId, {
    startDate: now,
    limit,
  });
}

export async function getBookingStats(userId: string): Promise<{
  today: number;
  thisWeek: number;
  thisMonth: number;
  pendingCount: number;
}> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).toISOString();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [todayBookings, weekBookings, monthBookings, pendingBookings] = await Promise.all([
    supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('scheduled_at', startOfDay),
    supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('scheduled_at', startOfWeek),
    supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('scheduled_at', startOfMonth),
    supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'pending'),
  ]);

  return {
    today: todayBookings.count || 0,
    thisWeek: weekBookings.count || 0,
    thisMonth: monthBookings.count || 0,
    pendingCount: pendingBookings.count || 0,
  };
}
