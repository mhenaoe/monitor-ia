import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { publicarConvocatoria, cerrarConvocatoria } from "@/lib/actions/convocatorias";
import { Button } from "@/components/ui/button";
import { Plus, MoreVertical } from "lucide-react";
import Link from "next/link";

export default async function ConvocatoriasPage() {
  const session = await auth();
  if (!session || session.user.rol !== "DOCENTE") redirect("/login");

  const convocatorias = await db.convocatoria.findMany({
    where: { docenteId: session.user.docenteId },
    include: {
      curso: true,
      _count: { select: { postulaciones: true } },
    },
    orderBy: { creadoEn: "desc" },
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Mis Convocatorias</h1>
          <p className="text-sm text-gray-500 mt-1">
            Administra el estado de tus ofertas de monitoría.
          </p>
        </div>
        <Link href="/docente/convocatorias/nueva">
          <Button>
            <Plus className="w-4 h-4" />
            Nueva
          </Button>
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Curso
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Candidatos
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Cierre
              </th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Acción
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {convocatorias.map((conv) => (
              <tr key={conv.id} className="hover:bg-gray-50/50 transition">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {conv.curso.nombre}
                </td>
                <td className="px-6 py-4">
                  <EstadoBadge estado={conv.estado} />
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {conv._count.postulaciones}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {conv.fechaFin.toLocaleDateString("es-CO", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </td>
                <td className="px-6 py-4 text-right">
                  <ConvocatoriaActions
                    id={conv.id}
                    estado={conv.estado}
                  />
                </td>
              </tr>
            ))}

            {convocatorias.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">
                  No tienes convocatorias aún. ¡Crea tu primera!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EstadoBadge({ estado }: { estado: string }) {
  const styles = {
    BORRADOR: "bg-gray-100 text-gray-600",
    PUBLICADA: "bg-emerald-50 text-emerald-700",
    CERRADA: "bg-red-50 text-red-600",
  };

  return (
    <span
      className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full ${
        styles[estado as keyof typeof styles] || styles.BORRADOR
      }`}
    >
      {estado.charAt(0) + estado.slice(1).toLowerCase()}
    </span>
  );
}

function ConvocatoriaActions({ id, estado }: { id: string; estado: string }) {
  return (
    <div className="flex items-center justify-end gap-2">
      {estado === "BORRADOR" && (
        <form action={publicarConvocatoria.bind(null, id)}>
          <Button type="submit" size="sm" variant="outline">
            Publicar
          </Button>
        </form>
      )}
      {estado === "PUBLICADA" && (
        <form action={cerrarConvocatoria.bind(null, id)}>
          <Button type="submit" size="sm" variant="ghost">
            Cerrar
          </Button>
        </form>
      )}
    </div>
  );
}
