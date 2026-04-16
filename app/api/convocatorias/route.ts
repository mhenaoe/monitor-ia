import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const convocatoria = await db.convocatoria.findUnique({
    where: { id },
    include: {
      curso: { select: { nombre: true, codigo: true } },
      docente: {
        include: {
          usuario: { select: { nombre: true, apellido: true } },
        },
      },
      criterios: {
        select: { nombre: true, campo: true, operador: true, valor: true },
      },
    },
  });

  if (!convocatoria) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  return NextResponse.json(convocatoria);
}
