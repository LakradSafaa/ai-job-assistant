"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type CVFile = {
  id: string;
  file_name: string;
  file_url: string;
  created_at: string;
};

export default function CVList() {
  alert("CVList est chargé");

  const [files, setFiles] = useState<CVFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFiles();
  }, []);

  async function loadFiles() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Aucun utilisateur connecté");
      setLoading(false);
      return;
    }

    alert("Utilisateur : " + user.id);

    try {
      const response = await fetch(
        `http://localhost:3001/cv?profileId=${user.id}`
      );

      alert("Status : " + response.status);

      const text = await response.text();

      alert("Réponse reçue");

      console.log(text);

      const data = JSON.parse(text);

      console.log(data);

      setFiles(data);
    } catch (error) {
      console.error(error);
      alert("Erreur : " + error);
    }

    setLoading(false);
  }

  if (loading) {
    return <p>Chargement...</p>;
  }

  if (files.length === 0) {
    return <p>Aucun CV importé.</p>;
  }

  return (
    <div className="space-y-4">
      {files.map((file) => (
        <Card key={file.id}>
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <p className="font-semibold">{file.file_name}</p>

              <p className="text-sm text-gray-500">
                {new Date(file.created_at).toLocaleString("fr-FR")}
              </p>
            </div>

            <Button asChild>
              <a
                href={file.file_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Voir
              </a>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}