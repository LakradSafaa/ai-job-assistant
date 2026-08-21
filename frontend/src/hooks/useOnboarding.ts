"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  onboardingSchema,
  type OnboardingSchema,
} from "@/lib/validations";

export function useOnboarding() {
  return useForm<OnboardingSchema>({
    resolver: zodResolver(onboardingSchema),
    mode: "onChange",

    defaultValues: {
      fullName: "",
      dateOfBirth: "",
      phoneCode: "",
      phone: "",
      city: "",
      country: "",
      address: "",

      degree: "",
      school: "",
      educationStart: "",
      educationEnd: "",

      company: "",
      position: "",
      experienceStart: "",
      experienceEnd: "",
      description: "",

      skills: "",

      languages: [
        {
          language: "",
          level: "",
        },
      ],

      desiredJob: "",
      desiredSalary: "",
      desiredCountry: "",
      desiredCity: "",

      jobLocations: [
        {
          country: "",
          city: "",
        },
      ],
    },
  });
}