export interface OnboardingLanguage {
  language: string;
  level:
    | "native"
    | "fluent"
    | "advanced"
    | "intermediate"
    | "beginner"
    | "";
}

export interface OnboardingData {
  // Informations personnelles
  fullName: string;
  dateOfBirth: string;
  phoneCode: string;
  phone: string;
  city: string;
  country: string;
  address: string;

  // Formation
  degree: string;
  school: string;
  educationStart: string;
  educationEnd: string;

  // Expérience facultative
  company: string;
  position: string;
  experienceStart: string;
  experienceEnd: string;
  description: string;

  // Compétences
  skills: string;

  // Langues
  languages: OnboardingLanguage[];

  // Préférences
  desiredJob: string;
  desiredSalary: string;
  desiredCountry: string;
  desiredCity: string;
}