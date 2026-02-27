import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// This function cleans up expired trains and their related records
// It should be called by a scheduler (GitHub Actions, external cron, etc.)
export const handler = async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
      },
    });
  }

  try {
    // Create Supabase client with service role key for full access
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
      },
    });

    console.log("Starting cleanup of expired trains...");

    // First, get expired train IDs (excluding demo trains)
    const { data: expiredTrains, error: fetchError } = await supabase
      .from('trains')
      .select('id')
      .lt('expires_at', new Date().toISOString())
      .not('id', 'ilike', 'DEMO%') // Exclude demo trains from cleanup
      .limit(100); // Limit to avoid long-running operations

    if (fetchError) {
      console.error("Error fetching expired trains:", fetchError);
      return new Response(JSON.stringify({ error: "Failed to fetch expired trains" }), {
        headers: { "Content-Type": "application/json" },
        status: 500,
      });
    }

    if (!expiredTrains || expiredTrains.length === 0) {
      console.log("No expired trains found.");
      return new Response(JSON.stringify({ message: "No expired trains to clean up", cleaned_count: 0 }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    const trainIds = expiredTrains.map(train => train.id);
    console.log(`Found ${trainIds.length} expired trains to clean up (demo trains excluded):`, trainIds);

    // Delete analytics records for expired trains
    const { error: analyticsError } = await supabase
      .from('analytics')
      .delete()
      .in('train_id', trainIds);

    if (analyticsError) {
      console.error("Error deleting analytics:", analyticsError);
      // Continue with other deletions even if this fails
    } else {
      console.log(`Deleted analytics for ${trainIds.length} expired trains`);
    }

    // Delete activity logs for expired trains
    const { error: activityError } = await supabase
      .from('activity_log')
      .delete()
      .in('train_id', trainIds);

    if (activityError) {
      console.error("Error deleting activity logs:", activityError);
      // Continue with other deletions even if this fails
    } else {
      console.log(`Deleted activity logs for ${trainIds.length} expired trains`);
    }

    // Delete participants for expired trains
    const { error: participantsError } = await supabase
      .from('participants')
      .delete()
      .in('train_id', trainIds);

    if (participantsError) {
      console.error("Error deleting participants:", participantsError);
      // Continue with train deletion even if this fails
    } else {
      console.log(`Deleted participants for ${trainIds.length} expired trains`);
    }

    // Finally, delete the expired trains themselves
    const { error: trainsError } = await supabase
      .from('trains')
      .delete()
      .in('id', trainIds);

    if (trainsError) {
      console.error("Error deleting trains:", trainsError);
      return new Response(JSON.stringify({ error: "Failed to delete some trains" }), {
        headers: { "Content-Type": "application/json" },
        status: 500,
      });
    }

    console.log(`Successfully cleaned up ${trainIds.length} expired trains`);

    return new Response(JSON.stringify({ 
      message: `Successfully cleaned up ${trainIds.length} expired trains`,
      cleaned_count: trainIds.length
    }), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      status: 200,
    });

  } catch (error) {
    console.error("Unexpected error during cleanup:", error);
    return new Response(JSON.stringify({ error: "Internal server error during cleanup" }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
};

serve(handler);