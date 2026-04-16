"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GraduationCap, LogIn, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devCorreo, setDevCorreo] = useState("");

  const handleMicrosoftLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("microsoft-entra-id", { callbackUrl: "/" });
    } catch {
      setError("Error al conectar con Office 365. Intenta de nuevo.");
      setIsLoading(false);
    }
  };

  const handleDevLogin = async (correo: string) => {
    setIsLoading(true);
    setError(null);
    const result = await signIn("credentials", {
      correo,
      redirect: false,
    });

    if (result?.error) {
      setError("Usuario no encontrado. Verifica el correo.");
      setIsLoading(false);
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-violet-50 to-purple-50 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-200 rounded-full opacity-30 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full opacity-30 blur-3xl" />

      <div className="relative w-full max-w-md mx-4">
        {/* Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-violet-500/25">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Monitor<span className="text-violet-600">IA</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Gestión de materias y monitores
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 p-3 mb-6 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Microsoft Login Button */}
          <Button
            onClick={handleMicrosoftLogin}
            disabled={isLoading}
            size="lg"
            className="w-full"
          >
            <LogIn className="w-5 h-5" />
            {isLoading ? "Conectando..." : "Ingresar con cuenta institucional"}
          </Button>

          <p className="text-xs text-gray-400 text-center mt-4">
            Usa tu correo @udem.edu.co para ingresar
          </p>

          {/* Dev login - solo en desarrollo */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-400 text-center mb-3 uppercase tracking-wider">
                🔧 Modo desarrollo
              </p>
              <div className="space-y-2">
                <input
                  type="email"
                  value={devCorreo}
                  onChange={(e) => setDevCorreo(e.target.value)}
                  placeholder="correo@udem.edu.co"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <Button
                  onClick={() => handleDevLogin(devCorreo)}
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={!devCorreo || isLoading}
                >
                  Ingresar como usuario de prueba
                </Button>

                {/* Quick login buttons */}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleDevLogin("docente@udem.edu.co")}
                    disabled={isLoading}
                    className="flex-1 px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition disabled:opacity-50"
                  >
                    Docente
                  </button>
                  <button
                    onClick={() => handleDevLogin("estudiante@udem.edu.co")}
                    disabled={isLoading}
                    className="flex-1 px-3 py-1.5 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition disabled:opacity-50"
                  >
                    Estudiante
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-400 text-center mt-6">
          Universidad de Medellín · Sistema de Monitorías · 2026-1
        </p>
      </div>
    </div>
  );
}