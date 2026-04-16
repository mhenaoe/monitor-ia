import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowRight, Calendar, User } from "lucide-react";

export default async function MuralPage() {
  const session = await auth();
  if (!session || session.user.rol !== "ESTUDIANTE") redirect("/login");

  // Obtener datos del estudiante para filtrar por programa
  const estudiante = await db.estudiante.findUnique({
    where: { id: session.user.estudianteId },
  });

  // HU-11: Convocatorias activas del programa del estudiante
  const convocatorias = await db.convocatoria.findMany({
    where: {
      estado: "PUBLICADA",
      curso: { programa: estudiante?.programa },
    },
    include: {
      curso: true,
      docente: { include: { usuario: true } },
      _count: { select: { postulaciones: true } },
    },
    orderBy: { fechaFin: "asc" },
  });

  // Verificar en cuáles ya se postuló
  const misPostulaciones = await db.postulacion.findMany({
    where: { estudianteId: session.user.estudianteId },
    select: { convocatoriaId: true, estado: true },
  });
  const postulacionMap = Object.fromEntries(
    misPostulaciones.map((p) => [p.convocatoriaId, p.estado])
  );

  // Stats
  const totalActivas = convocatorias.length;
  const totalPostulados = convocatorias.reduce((acc, c) => acc + c._count.postulaciones, 0);

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Convocatorias activas" value={totalActivas} color="violet" />
        <StatCard label="Estudiantes postulados" value={totalPostulados} color="blue" />
        <StatCard label="Tu programa" value={estudiante?.programa || "-"} color="emerald" isText />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Convocatorias activas</h1>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {convocatorias.map((conv) => {
          const yaPostulado = postulacionMap[conv.id];
          const diasRestantes = Math.ceil(
            (conv.fechaFin.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          );

          return (
            <div
              key={conv.id}
              className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl p-5 text-white relative overflow-hidden group"
            >
              {/* Decorative circle */}
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/10 rounded-full" />

              <h3 className="text-base font-bold mb-2">{conv.curso.nombre}</h3>

              <div className="flex items-center gap-2 text-violet-200 text-xs mb-1">
                <User className="w-3 h-3" />
                <span>
                  {conv.docente.usuario.nombre} {conv.docente.usuario.apellido}
                </span>
              </div>

              <div className="flex items-center gap-2 text-violet-200 text-xs mb-4">
                <Calendar className="w-3 h-3" />
                <span>
                  Cierre:{" "}
                  {conv.fechaFin.toLocaleDateString("es-CO", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                  {diasRestantes > 0 && (
                    <span className="ml-1 text-yellow-300">
                      ({diasRestantes} días)
                    </span>
                  )}
                </span>
              </div>

              {yaPostulado ? (
                <span
                  className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                    yaPostulado === "RECHAZADA"
                      ? "bg-red-500/20 text-red-200"
                      : yaPostulado === "ACEPTADO"
                      ? "bg-emerald-500/20 text-emerald-200"
                      : "bg-white/20 text-white"
                  }`}
                >
                  {yaPostulado === "RECHAZADA"
                    ? "No cumples requisitos"
                    : yaPostulado === "ACEPTADO"
                    ? "¡Seleccionado!"
                    : "Postulación en proceso"}
                </span>
              ) : (
                <Link
                  href={`/estudiante/postulacion?convocatoriaId=${conv.id}`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-white hover:text-yellow-200 transition group-hover:gap-2"
                >
                  Ver convocatoria
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          );
        })}

        {convocatorias.length === 0 && (
          <div className="col-span-3 text-center py-12 text-sm text-gray-400">
            No hay convocatorias activas para tu programa en este momento.
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  isText,
}: {
  label: string;
  value: number | string;
  color: string;
  isText?: boolean;
}) {
  const colors = {
    violet: "text-violet-600",
    blue: "text-blue-600",
    emerald: "text-emerald-600",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
      <p
        className={`${isText ? "text-sm" : "text-2xl"} font-bold ${
          colors[color as keyof typeof colors]
        }`}
      >
        {value}
      </p>
      <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{label}</p>
    </div>
  );
}
