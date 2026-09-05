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

const loginSchema = z.object({
  email: z.string().email('Adresse e-mail invalide'),
  password: z
    .string()
    .min(6, 'Le mot de passe doit faire au moins 6 caractères'),
});

type LoginSchema = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginSchema) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error(error);
      setErrorMessage(
        'Une erreur est survenue lors de la connexion.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-border/60 shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">
          Connexion
        </CardTitle>

        <CardDescription>
          Entrez vos identifiants pour accéder à votre espace
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

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading
                ? 'Connexion en cours...'
                : 'Se connecter'}
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="justify-center border-t p-4 text-sm text-muted-foreground">
        Pas encore de compte ?

        <Link
          href="/register"
          className="ml-1 font-semibold text-primary underline-offset-4 hover:underline"
        >
          S'inscrire
        </Link>
      </CardFooter>
    </Card>
  );
}