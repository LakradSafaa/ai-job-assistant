import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const jobId = body?.job_id;

    if (!jobId) {
      return NextResponse.json(
        {
          success: false,
          error: "job_id est obligatoire.",
        },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },

          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(
                ({ name, value, options }) => {
                  cookieStore.set(
                    name,
                    value,
                    options
                  );
                }
              );
            } catch {
              // Ignore cookie errors from Server Components.
            }
          },
        },
      }
    );

    const {
      data: {
        user,
      },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Utilisateur non authentifié.",
        },
        { status: 401 }
      );
    }

    /*
     * ---------------------------------------------------------
     * JOB
     * ---------------------------------------------------------
     */

    const {
      data: job,
      error: jobError,
    } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        {
          success: false,
          error: "Offre introuvable.",
          details: jobError?.message,
        },
        { status: 404 }
      );
    }

    /*
     * ---------------------------------------------------------
     * PROFILE
     * ---------------------------------------------------------
     */

    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        {
          success: false,
          error: "Profil utilisateur introuvable.",
        },
        { status: 404 }
      );
    }

    /*
     * ---------------------------------------------------------
     * N8N
     * ---------------------------------------------------------
     */

    const webhookUrl =
      process.env.N8N_APPLICATION_WEBHOOK_URL;

    if (!webhookUrl) {
      return NextResponse.json(
        {
          success: false,
          error:
            "N8N_APPLICATION_WEBHOOK_URL n'est pas configurée.",
        },
        { status: 500 }
      );
    }

    const n8nResponse = await fetch(
      webhookUrl,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          event: "prepare_application",

          profile_id: user.id,

          job_id: job.id,

          user: {
            id: user.id,
            email: user.email,
          },

          profile,

          job,
        }),

        cache: "no-store",
      }
    );

    const rawResponse =
      await n8nResponse.text();

    let n8nData: any = null;

    try {
      n8nData = rawResponse
        ? JSON.parse(rawResponse)
        : null;
    } catch {
      n8nData = {
        raw: rawResponse,
      };
    }

    if (!n8nResponse.ok) {
      return NextResponse.json(
        {
          success: false,

          error:
            n8nData?.error ||
            n8nData?.message ||
            `Erreur n8n HTTP ${n8nResponse.status}`,

          details: n8nData,
        },
        {
          status: 502,
        }
      );
    }

    return NextResponse.json({
      success: true,

      message:
        "La préparation de votre candidature a été lancée.",

      job_id: job.id,

      application:
        n8nData?.application ||
        n8nData ||
        null,
    });
  } catch (error) {
    console.error(
      "APPLICATION PREPARE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Erreur interne.",
      },
      {
        status: 500,
      }
    );
  }
}