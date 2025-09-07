import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BookingRequest {
  consultant_id: string;
  scheduled_at: string;
  notes?: string;
  duration_minutes?: number;
  payment_amount: number;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-BOOKING] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Create Supabase client with service role key for RLS bypass
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Parse request body
    const body: BookingRequest = await req.json();
    const { consultant_id, scheduled_at, notes, duration_minutes = 60, payment_amount } = body;

    if (!consultant_id || !scheduled_at || !payment_amount) {
      throw new Error("Missing required fields: consultant_id, scheduled_at, or payment_amount");
    }

    logStep("Request validated", { consultant_id, scheduled_at, duration_minutes });

    // Check if consultant exists and is available
    const { data: consultant, error: consultantError } = await supabaseClient
      .from('consultants')
      .select('id, name, is_available')
      .eq('id', consultant_id)
      .eq('is_available', true)
      .single();

    if (consultantError || !consultant) {
      throw new Error("Consultant not found or not available");
    }

    logStep("Consultant verified", { consultantName: consultant.name });

    // Check for existing booking at the same time
    const { data: existingBooking, error: existingError } = await supabaseClient
      .from('bookings')
      .select('id')
      .eq('consultant_id', consultant_id)
      .eq('scheduled_at', scheduled_at)
      .in('status', ['pending', 'confirmed'])
      .maybeSingle();

    if (existingError) {
      logStep("Error checking existing bookings", { error: existingError });
      throw new Error("Error checking booking availability");
    }

    if (existingBooking) {
      throw new Error("This time slot is already booked");
    }

    logStep("Time slot available");

    // Create the booking
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .insert({
        user_id: user.id,
        consultant_id,
        scheduled_at,
        duration_minutes,
        notes: notes || null,
        payment_amount,
        status: 'pending',
        payment_status: 'unpaid'
      })
      .select()
      .single();

    if (bookingError) {
      logStep("Error creating booking", { error: bookingError });
      throw new Error(`Failed to create booking: ${bookingError.message}`);
    }

    logStep("Booking created successfully", { bookingId: booking.id });

    // Send confirmation email (invoke send-booking-confirmation function)
    try {
      const { error: emailError } = await supabaseClient.functions.invoke('send-booking-confirmation', {
        body: {
          booking_id: booking.id,
          user_email: user.email,
          consultant_name: consultant.name,
          scheduled_at,
          duration_minutes
        }
      });

      if (emailError) {
        logStep("Email sending failed", { error: emailError });
        // Don't fail the booking if email fails
      } else {
        logStep("Confirmation email sent");
      }
    } catch (emailError) {
      logStep("Email function error", { error: emailError });
      // Continue - don't fail booking if email fails
    }

    return new Response(JSON.stringify({
      success: true,
      booking_id: booking.id,
      message: "Booking created successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-booking", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});