import type { OnboardingSchema } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";

export async function saveOnboarding(
  data: OnboardingSchema
) {
  const supabase = createClient();

  // =====================================================
  // 1. UTILISATEUR CONNECTÉ
  // =====================================================

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(
      `Erreur utilisateur : ${userError.message}`
    );
  }

  if (!user) {
    throw new Error("Aucun utilisateur connecté.");
  }

  const profileId = user.id;

  // =====================================================
  // 2. PROFILE
  // =====================================================

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert(
      {
        id: profileId,

        name: data.fullName.trim(),

        email: user.email ?? null,

        phone: data.phone.trim(),

        phone_code: data.phoneCode,

        date_of_birth:
          data.dateOfBirth || null,

        country: data.country.trim(),

        city: data.city.trim(),

        address: data.address.trim(),

        skills: data.skills.trim(),
      },
      {
        onConflict: "id",
      }
    );

  if (profileError) {
    throw new Error(
      `Erreur profile : ${profileError.message}`
    );
  }

  // =====================================================
  // 3. FORMATION
  // TABLE : education
  // =====================================================

  const { error: deleteEducationError } =
    await supabase
      .from("education")
      .delete()
      .eq("profile_id", profileId);

  if (deleteEducationError) {
    throw new Error(
      `Erreur suppression formation : ${deleteEducationError.message}`
    );
  }

  const { error: educationError } =
    await supabase
      .from("education")
      .insert({
        profile_id: profileId,

        degree: data.degree.trim(),

        school: data.school.trim(),

        start_date:
          data.educationStart || null,

        end_date:
          data.educationEnd || null,
      });

  if (educationError) {
    throw new Error(
      `Erreur formation : ${educationError.message}`
    );
  }

  // =====================================================
  // 4. EXPÉRIENCE PROFESSIONNELLE
  // FACULTATIVE
  // TABLE : experiences
  // =====================================================

  const { error: deleteExperienceError } =
    await supabase
      .from("experiences")
      .delete()
      .eq("profile_id", profileId);

  if (deleteExperienceError) {
    throw new Error(
      `Erreur suppression expérience : ${deleteExperienceError.message}`
    );
  }

  const hasExperience =
    data.company.trim() !== "" ||
    data.position.trim() !== "" ||
    data.experienceStart !== "" ||
    data.experienceEnd !== "" ||
    data.description.trim() !== "";

  if (hasExperience) {
    const { error: experienceError } =
      await supabase
        .from("experiences")
        .insert({
          profile_id: profileId,

          company:
            data.company.trim(),

          position:
            data.position.trim(),

          start_date:
            data.experienceStart || null,

          end_date:
            data.experienceEnd || null,

          description:
            data.description.trim(),
        });

    if (experienceError) {
      throw new Error(
        `Erreur expérience : ${experienceError.message}`
      );
    }
  }

  // =====================================================
  // 5. LANGUES
  // MAXIMUM 3
  // TABLE : languages
  // =====================================================

  const { error: deleteLanguagesError } =
    await supabase
      .from("languages")
      .delete()
      .eq("profile_id", profileId);

  if (deleteLanguagesError) {
    throw new Error(
      `Erreur suppression langues : ${deleteLanguagesError.message}`
    );
  }

  const validLanguages =
    data.languages
      .filter(
        (item) =>
          item.language.trim() !== "" &&
          item.level.trim() !== ""
      )
      .slice(0, 3);

  if (validLanguages.length > 0) {
    const { error: languagesError } =
      await supabase
        .from("languages")
        .insert(
          validLanguages.map((item) => ({
            profile_id: profileId,

            language:
              item.language.trim(),

            level:
              item.level.trim(),
          }))
        );

    if (languagesError) {
      throw new Error(
        `Erreur langues : ${languagesError.message}`
      );
    }
  }

  // =====================================================
  // 6. PRÉFÉRENCES D'EMPLOI
  // TABLE : job_preferences
  // =====================================================

  const validLocations =
    data.jobLocations
      .filter(
        (location) =>
          location.country.trim() !== "" &&
          location.city.trim() !== ""
      )
      .slice(0, 3);

  const firstLocation =
    validLocations[0];

  const { data: preference, error: preferenceError } =
    await supabase
      .from("job_preferences")
      .upsert(
        {
          profile_id: profileId,

          desired_job:
            data.desiredJob.trim(),

          desired_salary:
            data.desiredSalary.trim(),

          /*
           * Ces deux colonnes existent encore
           * dans ta table job_preferences.
           *
           * On garde le premier lieu pour
           * assurer la compatibilité.
           */
          desired_country:
            firstLocation?.country?.trim() ??
            data.desiredCountry?.trim() ??
            "",

          desired_city:
            firstLocation?.city?.trim() ??
            data.desiredCity?.trim() ??
            "",
        },
        {
          onConflict: "profile_id",
        }
      )
      .select("id")
      .single();

  if (preferenceError) {
    throw new Error(
      `Erreur préférences : ${preferenceError.message}`
    );
  }

  if (!preference) {
    throw new Error(
      "La préférence d'emploi n'a pas été créée."
    );
  }

  // =====================================================
  // 7. LIEUX DE RECHERCHE
  // MAXIMUM 3
  // TABLE : job_locations
  // =====================================================

  const {
    error: deleteLocationsError,
  } = await supabase
    .from("job_locations")
    .delete()
    .eq(
      "job_preference_id",
      preference.id
    );

  if (deleteLocationsError) {
    throw new Error(
      `Erreur suppression lieux : ${deleteLocationsError.message}`
    );
  }

  if (validLocations.length > 0) {
    const { error: locationsError } =
      await supabase
        .from("job_locations")
        .insert(
          validLocations.map(
            (location, index) => ({
              job_preference_id:
                preference.id,

              country:
                location.country.trim(),

              city:
                location.city.trim(),

              position: index + 1,
            })
          )
        );

    if (locationsError) {
      throw new Error(
        `Erreur lieux de recherche : ${locationsError.message}`
      );
    }
  }

  // =====================================================
  // 8. SUCCÈS
  // =====================================================

  return {
    success: true,
    profileId,
  };
}