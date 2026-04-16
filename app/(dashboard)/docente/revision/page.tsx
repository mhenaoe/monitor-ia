import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { actualizarEstadoCandidato } from "@/lib/actions/postulaciones";
import { Button } from "@/components/ui/button";
import { Search, FileText } from "lucide-react";

export default async function RevisionPage() {
  const session = await auth();
  if (!session || session.user.rol !== "DOCENTE") redirect("/login");

  // Obtener convocatorias publicadas del docente con sus postulaciones
  const convocatorias = await db.convocatoria.findMany({
    where: {
      docenteId: session.user.docenteId,
      estado: { in: ["PUBLICADA", "CERRADA"] },
    },
    include: {
      curso: true,
      postulaciones: {
        where: {
          estado: { in: ["APROBADA_FASE_1", "APROBADA_FASE_2", "ACEPTADO", "DENEGADO"] },
        },
        include: {
          estudiante: { include: { usuario: true } },
        },
        orderBy: { puntajeIA: { sort: "desc", nulls: "last" } },
      },
    },
  });

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Candidatos Fase II</h1>
          <p className="text-sm text-gray-500 mt-1">
            Ranking optimizado por <span className="text-violet-600 font-medium">MonitorIA</span>
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            placeholder="Buscar por nombre..."
            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none w-64"
          />
        </div>
      </div>

      {convocatorias.map((conv) => (
        <div key={conv.id} className="mb-8">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            {conv.curso.nombre}
          </h3>

          <div className="space-y-3">
            {conv.postulaciones.map((post, index) => (
              <div
                key={post.id}
                className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-violet-200 transition"
              >
                {/* Candidate info */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                    C{index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {post.estudiante.usuario.nombre} {post.estudiante.usuario.apellido}
                    </p>
                    <p className="text-xs text-gray-500">
                      {post.estudiante.programa} · Semestre {post.estudiante.semestre}
                    </p>
                  </div>
                </div>

                {/* Score + Actions */}
                <div className="flex items-center gap-4">
                  {post.puntajeIA && (
                    <div className="text-right">
                      <p className="text-xs text-gray-400 uppercase">Score IA</p>
                      <p className="text-lg font-bold text-violet-600">
                        {Math.round(post.puntajeIA)}%
                      </p>
                    </div>
                  )}

                  {post.hojaDeVidaUrl && (
                    <button className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium">
                      HV
                    </button>
                  )}

                  {post.estado === "APROBADA_FASE_1" || post.estado === "APROBADA_FASE_2" ? (
                    <div className="flex gap-2">
                      <form action={actualizarEstadoCandidato.bind(null, post.id, "ACEPTADO")}>
                        <Button type="submit" size="sm">
                          Elegir
                        </Button>
                      </form>
                      <form action={actualizarEstadoCandidato.bind(null, post.id, "DENEGADO")}>
                        <Button type="submit" size="sm" variant="ghost">
                          Rechazar
                        </Button>
                      </form>
                    </div>
                  ) : (
                    <span
                      className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        post.estado === "ACEPTADO"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {post.estado === "ACEPTADO" ? "Aceptado" : "Denegado"}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {conv.postulaciones.length === 0 && (
              <div className="text-center py-8 text-sm text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                No hay candidatos que hayan aprobado la Fase I aún.
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
