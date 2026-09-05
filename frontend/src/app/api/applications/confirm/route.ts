import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
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
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch {
              // read-only context
            }
          },
        },
      }
    );

    // ==========================================
    // 1. UTILISATEUR
    // ==========================================

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("Erreur utilisateur:", userError);
    }

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Utilisateur non authentifié.",
        },
        { status: 401 }
      );
    }

    // ==========================================
    // 2. BODY
    // ==========================================

    const body = await req.json();

    const jobMatchId = String(body?.job_match_id || "").trim();

    const applicationId = body?.application_id
      ? String(body.application_id).trim()
      : null;

    if (!jobMatchId) {
      return NextResponse.json(
        {
          success: false,
          error: "job_match_id manquant.",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // 3. CHERCHER LA CANDIDATURE
    // ==========================================

    let query = supabase
      .from("applications")
      .select("*")
      .eq("job_match_id", jobMatchId)
      .eq("profile_id", user.id);

    if (applicationId) {
      query = query.eq("id", applicationId);
    }

    const { data: application, error: findError } =
      await query.maybeSingle();

    if (findError) {
      console.error(
        "Erreur recherche candidature:",
        findError
      );

      return NextResponse.json(
        {
          success: false,
          error: findError.message,
        },
        { status: 500 }
      );
    }

    if (!application) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Aucune candidature préparée trouvée pour ce matching.",
        },
        { status: 404 }
      );
    }

    // ==========================================
    // 4. ÉVITER DE RECONFIRMER
    // ==========================================

    if (application.status === "confirmed") {
      return NextResponse.json({
        success: true,
        message: "Cette candidature est déjà confirmée.",
        application,
      });
    }

    // ==========================================
    // 5. CONFIRMER
    // ==========================================

    const { data: updatedApplication, error: updateError } =
      await supabase
        .from("applications")
        .update({
          status: "confirmed",
        })
        .eq("id", application.id)
        .eq("profile_id", user.id)
        .select()
        .single();

    if (updateError) {
      console.error(
        "Erreur confirmation candidature:",
        updateError
      );

      return NextResponse.json(
        {
          success: false,
          error: updateError.message,
        },
        { status: 500 }
      );
    }

    // ==========================================
    // 6. RETOUR
    // ==========================================

    return NextResponse.json({
      success: true,
      message: "Candidature confirmée avec succès.",
      application: updatedApplication,
    });
  } catch (error: unknown) {
    console.error(
      "Erreur API /api/applications/confirm:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Erreur interne du serveur.",
      },
      { status: 500 }
    );
  }
}