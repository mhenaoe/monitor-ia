import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { agregarCriterio } from "@/lib/actions/convocatorias";
import { Button } from "@/components/ui/button";
import { CheckCircle, Plus } from "lucide-react";

export default async function CriteriosPage() {
  const session = await auth();
  if (!session || session.user.rol !== "DOCENTE") redirect("/login");

  // Obtener convocatorias del docente con sus criterios
  const convocatorias = await db.convocatoria.findMany({
    where: { docenteId: session.user.docenteId },
    include: { curso: true, criterios: true },
    orderBy: { creadoEn: "desc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">
          Filtros Automáticos (Fase I)
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Configura las reglas de paso automático apoyadas por IA.
        </p>
      </div>

      {convocatorias.map((conv) => (
        <div key={conv.id} className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            {conv.curso.nombre}
            <span className="ml-2 text-xs font-normal text-gray-400">
              ({conv.estado.toLowerCase()})
            </span>
          </h3>

          {/* Lista de criterios existentes */}
          <div className="space-y-3 mb-4">
            {conv.criterios.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-violet-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{c.nombre}</p>
                    <p className="text-xs text-gray-500">
                      Requisito de sistema: {c.campo} {c.operador} {c.valor}
                    </p>
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 bg-violet-50 text-violet-700 rounded-full font-medium">
                  {c.tipo === "AUTOMATICO_SIS" ? "Automático SIS" : "Manual"}
                </span>
              </div>
            ))}
          </div>

          {/* Formulario para agregar criterio */}
          {conv.estado === "BORRADOR" && (
            <form action={agregarCriterio} className="border-2 border-dashed border-gray-200 rounded-lg p-4">
              <input type="hidden" name="convocatoriaId" value={conv.id} />
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input
                  name="nombre"
                  placeholder="Nombre del criterio"
                  className="px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none"
                  required
                />
                <select
                  name="tipo"
                  className="px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none"
                >
                  <option value="AUTOMATICO_SIS">Automático SIS</option>
                  <option value="MANUAL">Manual</option>
                </select>
                <select
                  name="campo"
                  className="px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none"
                >
                  <option value="promedioAcumulado">Promedio Acumulado</option>
                  <option value="semestre">Semestre</option>
                  <option value="creditosAprobados">Créditos Aprobados</option>
                </select>
                <div className="flex gap-2">
                  <select
                    name="operador"
                    className="px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none flex-1"
                  >
                    <option value=">=">Mayor o igual (≥)</option>
                    <option value="<=">Menor o igual (≤)</option>
                    <option value="==">Igual (=)</option>
                    <option value=">">Mayor que (&gt;)</option>
                    <option value="<">Menor que (&lt;)</option>
                  </select>
                  <input
                    name="valor"
                    placeholder="Valor"
                    className="px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none w-24"
                    required
                  />
                </div>
              </div>
              <input type="hidden" name="fuente" value="SISTEMA_ACADEMICO" />
              <Button type="submit" size="sm" variant="outline" className="w-full">
                <Plus className="w-4 h-4" />
                Añadir Nuevo Filtro
              </Button>
            </form>
          )}
        </div>
      ))}

      {convocatorias.length === 0 && (
        <div className="text-center py-12 text-sm text-gray-400">
          Crea una convocatoria primero para configurar criterios.
        </div>
      )}
    </div>
  );
}
