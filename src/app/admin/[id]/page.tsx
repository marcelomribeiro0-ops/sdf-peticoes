import { notFound } from "next/navigation";
import { getTeseById } from "@/lib/teses";
import { FormTese } from "@/components/FormTese";

export const dynamic = "force-dynamic";

export default async function EditarTesePage({
  params,
}: {
  params: { id: string };
}) {
  const tese = await getTeseById(params.id);
  if (!tese) notFound();
  return <FormTese modo="editar" inicial={tese} />;
}
