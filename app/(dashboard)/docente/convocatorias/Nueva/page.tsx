import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  obtenerCursos,
  obtenerConvocatoria,
} from "@/lib/actions/convocatorias";
import { WizardHeader } from "./wizard-header";
import { Paso1Datos } from "./paso-1-datos";

interface Props {
  searchParams: Promise<{
    step?: string;
    id?: string;
  }>;
}

export default async function NuevaConvocatoriaPage({ searchParams }: Props) {
  const params = await searchParams;
  const step = params.step === "2" ? 2 : 1;
  const id = params.id;

  // Si estamos en el paso 2, necesitamos validar que la convocatoria exista
  // (el paso 2 lo implementaremos en el siguiente mensaje)
  if (step === 2) {
    if (!id) {
      redirect("/docente/convocatorias/nueva?step=1");
    }
    const conv = await obtenerConvocatoria(id);
    if (!conv || conv.estado !== "BORRADOR") {
      redirect("/docente/convocatorias");
    }
    // Placeholder hasta que creemos Paso2Criterios
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
        <div className="text-sm text-gray-500">
          Paso 2: Criterios de validación (en construcción)
        </div>
      </div>
    );
  }

  // Paso 1: cargar cursos disponibles
  const cursos = await obtenerCursos();

  return (
    <div className="space-y-4">
      {/* Breadcrumb / back */}
      <Link
        href="/docente/convocatorias"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a convocatorias
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-6 sm:p-8 pb-0">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Nueva Convocatoria
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Crea una oferta de monitoría para uno de tus cursos.
              </p>
            </div>
          </div>

          <WizardHeader currentStep={1} />
        </div>

        <div className="p-6 sm:p-8">
          <Paso1Datos cursos={cursos} />
        </div>
      </div>
    </div>
  );
}