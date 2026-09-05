'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { createClient } from '@/lib/supabase/client';

const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Le nom doit contenir au moins 2 caractères'),

    email: z
      .string()
      .email('Adresse e-mail invalide'),

    password: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères'),

    confirmPassword: z.string(),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: 'Les mots de passe ne correspondent pas',
      path: ['confirmPassword'],
    }
  );

type RegisterSchema = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),

    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: RegisterSchema) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { data, error } =
        await supabase.auth.signUp({
          email: values.email,
          password: values.password,

          options: {
            data: {
              full_name: values.fullName,
            },
          },
        });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      /*
       * Si Supabase demande une confirmation
       * par email, l'utilisateur ne sera pas
       * immédiatement connecté.
       */
      if (data.session) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setErrorMessage(
          'Compte créé. Vérifiez votre adresse e-mail pour confirmer votre compte.'
        );
      }
    } catch (error) {
      console.error(error);

      setErrorMessage(
        "Une erreur est survenue lors de l'inscription."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-border/60 shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">
          Créer un compte
        </CardTitle>

        <CardDescription>
          Remplissez les informations ci-dessous pour commencer
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            {errorMessage && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-500 dark:border-red-900 dark:bg-red-950/50">
                {errorMessage}
              </div>
            )}

            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom complet</FormLabel>

                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>

                  <FormControl>
                    <Input
                      placeholder="nom@exemple.com"
                      type="email"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mot de passe</FormLabel>

                  <FormControl>
                    <Input
                      placeholder="••••••••"
                      type="password"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Confirmer le mot de passe
                  </FormLabel>

                  <FormControl>
                    <Input
                      placeholder="••••••••"
                      type="password"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading
                ? 'Création du compte...'
                : "S'inscrire"}
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="justify-center border-t p-4 text-sm text-muted-foreground">
        Déjà un compte ?

        <Link
          href="/login"
          className="ml-1 font-semibold text-primary underline-offset-4 hover:underline"
        >
          Se connecter
          </Link>
      </CardFooter>
    </Card>
  );
}