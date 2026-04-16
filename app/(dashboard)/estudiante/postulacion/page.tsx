"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { postularseFase1 } from "@/lib/actions/postulaciones";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, ArrowLeft, Send } from "lucide-react";
import Link from "next/link";

interface ConvocatoriaDetalle {
  id: string;
  curso: { nombre: string; codigo: string };
  docente: { usuario: { nombre: string; apellido: string } };
  fechaFin: string;
  preguntasFase1: { pregunta: string; tipo: string }[];
  criterios: { nombre: string; campo: string; operador: string; valor: string }[];
}

export default function PostulacionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const convocatoriaId = searchParams.get("convocatoriaId");

  const [convocatoria, setConvocatoria] = useState<ConvocatoriaDetalle | null>(null);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [resultado, setResultado] = useState<{
    success?: boolean;
    error?: string;
    criteriosFallidos?: string[];
  } | null>(null);

  useEffect(() => {
    if (convocatoriaId) {
      fetch(`/api/convocatorias/${convocatoriaId}`)
        .then((r) => r.json())
        .then(setConvocatoria);
    }
  }, [convocatoriaId]);

  const handleSubmit = async () => {
    if (!convocatoriaId) return;
    setIsLoading(true);
    const result = await postularseFase1(convocatoriaId, respuestas);
    setResultado(result);
    setIsLoading(false);
  };

  if (!convocatoriaId) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Selecciona una convocatoria desde el mural.</p>
        <Link href="/estudiante/mural" className="text-violet-600 text-sm mt-2 inline-block">
          ← Ir al mural
        </Link>
      </div>
    );
  }

  if (!convocatoria) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Resultado final
  if (resultado) {
    return (
      <div className="max-w-lg mx-auto mt-12">
        <div
          className={`p-6 rounded-xl border ${
            resultado.success
              ? "bg-emerald-50 border-emerald-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          {resultado.success ? (
            <>
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
              <h2 className="text-lg font-bold text-emerald-900 text-center mb-2">
                ¡Postulación enviada!
              </h2>
              <p className="text-sm text-emerald-700 text-center">
                Aprobaste los criterios de la Fase I. El docente revisará tu candidatura.
              </p>
            </>
          ) : (
            <>
              <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
              <h2 className="text-lg font-bold text-red-900 text-center mb-2">
                No cumples los requisitos
              </h2>
              <p className="text-sm text-red-700 text-center mb-3">{resultado.error}</p>
              {resultado.criteriosFallidos && (
                <ul className="space-y-1">
                  {resultado.criteriosFallidos.map((c, i) => (
                    <li key={i} className="text-xs text-red-600 bg-red-100 rounded px-3 py-1.5">
                      {c}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          <Link href="/estudiante/mural">
            <Button variant="outline" className="w-full mt-4">
              <ArrowLeft className="w-4 h-4" />
              Volver al mural
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const preguntas = convocatoria.preguntasFase1 || [];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back */}
      <Link
        href="/estudiante/mural"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al mural
      </Link>

      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-xl p-6 text-white mb-6">
        <h1 className="text-xl font-bold">{convocatoria.curso.nombre}</h1>
        <p className="text-violet-200 text-sm mt-1">
          {convocatoria.docente.usuario.nombre} {convocatoria.docente.usuario.apellido}
          {" · "}Cierre: {new Date(convocatoria.fechaFin).toLocaleDateString("es-CO")}
        </p>
      </div>

      {/* Criterios de validación (info) */}
      <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 mb-6">
        <h3 className="text-sm font-semibold text-violet-900 mb-2">
          Requisitos mínimos (validación automática)
        </h3>
        <ul className="space-y-1">
          {convocatoria.criterios.map((c, i) => (
            <li key={i} className="text-xs text-violet-700">
              • {c.nombre}: {c.campo} {c.operador} {c.valor}
            </li>
          ))}
        </ul>
      </div>

      {/* Formulario Fase 1 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">
          Preguntas de Fase I
        </h2>

        <div className="space-y-4">
          {preguntas.map((p: { pregunta: string; tipo: string }, index: number) => (
            <div key={index}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {p.pregunta}
              </label>
              {p.tipo === "si_no" ? (
                <select
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none"
                  onChange={(e) =>
                    setRespuestas({ ...respuestas, [`p${index}`]: e.target.value })
                  }
                >
                  <option value="">Selecciona</option>
                  <option value="si">Sí</option>
                  <option value="no">No</option>
                </select>
              ) : (
                <input
                  type={p.tipo === "numerico" ? "number" : "text"}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none"
                  onChange={(e) =>
                    setRespuestas({ ...respuestas, [`p${index}`]: e.target.value })
                  }
                />
              )}
            </div>
          ))}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full mt-6"
          size="lg"
        >
          <Send className="w-4 h-4" />
          {isLoading ? "Procesando..." : "Enviar postulación"}
        </Button>
      </div>
    </div>
  );
}
