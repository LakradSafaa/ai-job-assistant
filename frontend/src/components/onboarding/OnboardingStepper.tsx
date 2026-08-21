"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormProvider } from "react-hook-form";

import { useOnboarding } from "@/hooks/useOnboarding";
import type { OnboardingSchema } from "@/lib/validations";
import { saveOnboarding } from "@/lib/supabase/saveOnboarding";

import PersonalInfoStep from "./PersonalInfoStep";
import EducationStep from "./EducationStep";
import ExperienceStep from "./ExperienceStep";
import SkillsStep from "./SkillsStep";
import LanguagesStep from "./LanguagesStep";
import PreferencesStep from "./PreferencesStep";

import StepIndicator from "./StepIndicator";
import NavigationButtons from "./NavigationButtons";

export default function OnboardingStepper() {
  const router = useRouter();

  const methods = useOnboarding();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 6;

  // ==========================================
  // CHAMPS À VALIDER POUR CHAQUE ÉTAPE
  // ==========================================

  const getFieldsForStep = (
    step: number
  ): (keyof OnboardingSchema)[] => {
    switch (step) {
      // ----------------------------------------
      // ÉTAPE 1 — INFORMATIONS PERSONNELLES
      // ----------------------------------------

      case 1:
        return [
          "fullName",
          "dateOfBirth",
          "phoneCode",
          "phone",
          "city",
          "country",
          "address",
        ];

      // ----------------------------------------
      // ÉTAPE 2 — FORMATION
      // ----------------------------------------

      case 2:
        return [
          "degree",
          "school",
          "educationStart",
          "educationEnd",
        ];

      // ----------------------------------------
      // ÉTAPE 3 — EXPÉRIENCE
      // FACULTATIVE
      // ----------------------------------------

      case 3:
        return [];

      // ----------------------------------------
      // ÉTAPE 4 — COMPÉTENCES
      // ----------------------------------------

      case 4:
        return ["skills"];

      // ----------------------------------------
      // ÉTAPE 5 — LANGUES
      // ----------------------------------------

      case 5:
        return ["languages"];

      // ----------------------------------------
      // ÉTAPE 6 — PRÉFÉRENCES
      // ----------------------------------------

      case 6:
        return [
          "desiredJob",
          "desiredSalary",
          "jobLocations",
        ];

      default:
        return [];
    }
  };

  // ==========================================
  // ÉTAPE SUIVANTE
  // ==========================================

  const nextStep = async () => {
    if (isSubmitting) {
      return;
    }

    // Récupérer les champs obligatoires
    // de l'étape actuelle.

    const fields = getFieldsForStep(currentStep);

    // ----------------------------------------
    // VALIDATION
    // ----------------------------------------

    if (fields.length > 0) {
      const isValid = await methods.trigger(fields);

      if (!isValid) {
        console.log(
          "Validation échouée pour l'étape :",
          currentStep
        );

        return;
      }
    }

    // ----------------------------------------
    // PASSER À L'ÉTAPE SUIVANTE
    // ----------------------------------------

    if (currentStep < totalSteps) {
      setCurrentStep((step) => step + 1);
      return;
    }

    // ========================================
    // FIN DU FORMULAIRE
    // ========================================

    setIsSubmitting(true);

    try {
      const data = methods.getValues();

      console.log(
        "================================="
      );

      console.log("ONBOARDING TERMINÉ");

      console.log("DONNÉES :", data);

      console.log(
        "================================="
      );

      // --------------------------------------
      // SAUVEGARDE SUPABASE
      // --------------------------------------

      await saveOnboarding(data);

      console.log(
        "Profil sauvegardé avec succès."
      );

      // --------------------------------------
      // REDIRECTION DASHBOARD
      // --------------------------------------

      router.push("/dashboard");
    } catch (error) {
      console.error(
        "Erreur lors de la sauvegarde du profil :",
        error
      );

      setIsSubmitting(false);
    }
  };

  // ==========================================
  // ÉTAPE PRÉCÉDENTE
  // ==========================================

  const previousStep = () => {
    if (isSubmitting) {
      return;
    }

    if (currentStep > 1) {
      setCurrentStep((step) => step - 1);
    }
  };

  // ==========================================
  // AFFICHER L'ÉTAPE ACTUELLE
  // ==========================================

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoStep />;

      case 2:
        return <EducationStep />;

      case 3:
        return <ExperienceStep />;

      case 4:
        return <SkillsStep />;

      case 5:
        return <LanguagesStep />;

      case 6:
        return <PreferencesStep />;

      default:
        return <PersonalInfoStep />;
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <FormProvider {...methods}>
      <div className="w-full">
        {/* ================================== */}
        {/* INDICATEUR DES ÉTAPES */}
        {/* ================================== */}

        <StepIndicator
          currentStep={currentStep}
          totalSteps={totalSteps}
        />

        {/* ================================== */}
        {/* CONTENU DE L'ÉTAPE */}
        {/* ================================== */}

        <div className="mt-10">
          {renderCurrentStep()}
        </div>

        {/* ================================== */}
        {/* BOUTONS DE NAVIGATION */}
        {/* ================================== */}

        <div className="mt-10">
          <NavigationButtons
            currentStep={currentStep}
            totalSteps={totalSteps}
            previous={previousStep}
            next={nextStep}
            disabled={isSubmitting}
          />
        </div>
      </div>
    </FormProvider>
  );
}