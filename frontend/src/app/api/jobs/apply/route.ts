import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const profileId = body?.profile_id;
    const jobId = body?.job_id;

    console.log("=================================");
    console.log("🚀 POST /api/jobs/apply");
    console.log("profile_id:", profileId);
    console.log("job_id:", jobId);
    console.log("=================================");

    if (!profileId) {
      return NextResponse.json(
        {
          success: false,
          error: "profile_id est obligatoire.",
        },
        { status: 400 }
      );
    }

    if (!jobId) {
      return NextResponse.json(
        {
          success: false,
          error: "job_id est obligatoire.",
        },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "NEXT_PUBLIC_SUPABASE_URL manque dans .env.local",
        },
        { status: 500 }
      );
    }

    if (!serviceRoleKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            "SUPABASE_SERVICE_ROLE_KEY manque dans .env.local",
        },
        { status: 500 }
      );
    }

    const supabase = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // =====================================================
    // 1. Vérifier l'offre
    // =====================================================

    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select(`
        id,
        title,
        company_id,
        source,
        url,
        domaine,
        sous_domaine
      `)
      .eq("id", jobId)
      .maybeSingle();

    if (jobError) {
      console.error("❌ JOB ERROR:", jobError);

      return NextResponse.json(
        {
          success: false,
          error: "Erreur récupération de l'offre.",
          details: jobError.message,
          code: jobError.code,
          hint: jobError.hint,
        },
        { status: 500 }
      );
    }

    if (!job) {
      return NextResponse.json(
        {
          success: false,
          error: "Offre d'emploi introuvable.",
          job_id: jobId,
        },
        { status: 404 }
      );
    }

    console.log("✅ Job trouvé:", job.title);

    // =====================================================
    // 2. Vérifier le profil
    // =====================================================

    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("id")
        .eq("id", profileId)
        .maybeSingle();

    if (profileError) {
      console.error("❌ PROFILE ERROR:", profileError);

      return NextResponse.json(
        {
          success: false,
          error: "Erreur récupération du profil.",
          details: profileError.message,
          code: profileError.code,
          hint: profileError.hint,
        },
        { status: 500 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          error: "Profil utilisateur introuvable.",
          profile_id: profileId,
        },
        { status: 404 }
      );
    }

    console.log("✅ Profil trouvé:", profile.id);

    // =====================================================
    // 3. Vérifier si candidature existe déjà
    // =====================================================

    const {
      data: existingApplication,
      error: existingError,
    } = await supabase
      .from("applications")
      .select("*")
      .eq("profile_id", profileId)
      .eq("job_id", jobId)
      .maybeSingle();

    if (existingError) {
      console.error("❌ EXISTING APPLICATION ERROR:", existingError);

      return NextResponse.json(
        {
          success: false,
          error: "Erreur vérification candidature.",
          details: existingError.message,
          code: existingError.code,
          hint: existingError.hint,
        },
        { status: 500 }
      );
    }

    // =====================================================
    // 4. Candidature déjà existante
    // =====================================================

    if (existingApplication) {
      console.log(
        "ℹ️ Candidature déjà existante:",
        existingApplication.id
      );

      return NextResponse.json({
        success: true,
        existing: true,
        message: "Cette candidature existe déjà.",
        application_id: existingApplication.id,
        application: existingApplication,
        job,
      });
    }

    // =====================================================
    // 5. Créer la candidature
    // =====================================================

    const applicationPayload = {
      profile_id: profileId,
      job_id: jobId,
      status: "pending",
    };

    console.log(
      "📝 INSERT applications:",
      applicationPayload
    );

    const {
      data: application,
      error: applicationError,
    } = await supabase
      .from("applications")
      .insert(applicationPayload)
      .select("*")
      .single();

    if (applicationError) {
      console.error(
        "❌ APPLICATION INSERT ERROR:",
        applicationError
      );

      return NextResponse.json(
        {
          success: false,
          error: "Impossible de créer la candidature.",
          details: applicationError.message,
          code: applicationError.code,
          hint: applicationError.hint,
        },
        { status: 500 }
      );
    }

    if (!application) {
      return NextResponse.json(
        {
          success: false,
          error: "Aucune candidature retournée après insertion.",
        },
        { status: 500 }
      );
    }

    console.log(
      "✅ CANDIDATURE CRÉÉE:",
      application.id
    );

    // =====================================================
    // 6. IMPORTANT :
    // NE PAS appeler n8n ici.
    //
    // /api/applications/submit s'en chargera.
    // =====================================================

    return NextResponse.json({
      success: true,
      existing: false,
      message: "Candidature créée avec succès.",
      application_id: application.id,
      application,
      job,
    });
  } catch (error) {
    console.error(
      "❌ FATAL /api/jobs/apply:",
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