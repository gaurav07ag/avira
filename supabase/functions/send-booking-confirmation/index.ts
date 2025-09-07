import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BookingConfirmationRequest {
  booking_id: string;
  user_email: string;
  consultant_name: string;
  scheduled_at: string;
  duration_minutes: number;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-BOOKING-CONFIRMATION] ${step}${detailsStr}`);
};

const generateCalendarLink = (
  title: string,
  startTime: string,
  duration: number,
  description: string
): string => {
  const start = new Date(startTime);
  const end = new Date(start.getTime() + duration * 60000);
  
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${formatDate(start)}/${formatDate(end)}`,
    details: description,
    location: 'Video Session (Link will be provided)'
  });
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Create Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Parse request body
    const body: BookingConfirmationRequest = await req.json();
    const { booking_id, user_email, consultant_name, scheduled_at, duration_minutes } = body;

    if (!booking_id || !user_email || !consultant_name || !scheduled_at) {
      throw new Error("Missing required fields");
    }

    logStep("Request validated", { booking_id, user_email, consultant_name });

    // Format the date and time
    const appointmentDate = new Date(scheduled_at);
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const formattedTime = appointmentDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    // Generate calendar link
    const calendarTitle = `Therapy Session with ${consultant_name}`;
    const calendarDescription = `Your scheduled therapy session with ${consultant_name}. Duration: ${duration_minutes} minutes. Meeting link will be provided separately.`;
    const calendarLink = generateCalendarLink(
      calendarTitle,
      scheduled_at,
      duration_minutes,
      calendarDescription
    );

    // Create HTML email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation - EmpathicPath</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .booking-details { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #6366f1; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
          .detail-label { font-weight: bold; color: #64748b; }
          .detail-value { color: #1e293b; }
          .cta-button { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; color: #64748b; font-size: 14px; }
          .emergency { background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 15px; margin: 20px 0; }
          .emergency-title { color: #dc2626; font-weight: bold; margin-bottom: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌟 Booking Confirmed!</h1>
            <p>Your therapy session has been successfully scheduled</p>
          </div>
          
          <div class="content">
            <p>Dear valued client,</p>
            <p>We're pleased to confirm your upcoming therapy session. Here are your booking details:</p>
            
            <div class="booking-details">
              <h3 style="margin-top: 0; color: #6366f1;">📅 Appointment Details</h3>
              <div class="detail-row">
                <span class="detail-label">Consultant:</span>
                <span class="detail-value">${consultant_name}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${formattedDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span class="detail-value">${formattedTime}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Duration:</span>
                <span class="detail-value">${duration_minutes} minutes</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Session Type:</span>
                <span class="detail-value">Video Session</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Booking ID:</span>
                <span class="detail-value">${booking_id}</span>
              </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${calendarLink}" class="cta-button">📅 Add to Google Calendar</a>
              <a href="mailto:support@empathicpath.com?subject=Booking ${booking_id}" class="cta-button">✉️ Contact Support</a>
            </div>
            
            <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #6366f1;">📋 What to Expect</h3>
              <ul style="padding-left: 20px;">
                <li>You'll receive a video meeting link 15 minutes before your session</li>
                <li>Please ensure you have a stable internet connection</li>
                <li>Find a quiet, private space for your session</li>
                <li>Have a notebook ready if you like to take notes</li>
              </ul>
            </div>
            
            <div class="emergency">
              <div class="emergency-title">🚨 Crisis Support</div>
              <p style="margin: 0;">If you're experiencing a mental health emergency, please contact:</p>
              <p style="margin: 5px 0;"><strong>National Suicide Prevention Lifeline:</strong> 988</p>
              <p style="margin: 5px 0;"><strong>Crisis Text Line:</strong> Text HOME to 741741</p>
              <p style="margin: 5px 0;"><strong>Emergency Services:</strong> 911</p>
            </div>
            
            <p>If you need to reschedule or cancel your appointment, please contact us at least 24 hours in advance.</p>
            <p>We're here to support you on your mental health journey. Looking forward to your session!</p>
            
            <p>Best regards,<br>
            <strong>The EmpathicPath Team</strong></p>
          </div>
          
          <div class="footer">
            <p>EmpathicPath - Your Mental Health Companion</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // For now, we'll just log the email content since we don't have Resend configured
    // In a real implementation, you would use Resend or another email service
    logStep("Email content prepared", { 
      to: user_email, 
      subject: `Booking Confirmation - Session with ${consultant_name}`,
      htmlLength: emailHtml.length 
    });

    // TODO: Integrate with Resend email service
    // const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    // const emailResponse = await resend.emails.send({
    //   from: "EmpathicPath <appointments@empathicpath.com>",
    //   to: [user_email],
    //   subject: `Booking Confirmation - Session with ${consultant_name}`,
    //   html: emailHtml,
    // });

    logStep("Confirmation processing completed");

    return new Response(JSON.stringify({
      success: true,
      message: "Booking confirmation prepared",
      calendar_link: calendarLink,
      appointment_details: {
        consultant_name,
        date: formattedDate,
        time: formattedTime,
        duration: `${duration_minutes} minutes`
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in send-booking-confirmation", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});