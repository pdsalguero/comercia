import { NotFoundContent } from "@/components/layout/NotFoundContent";

// notFound() dentro del sitio (categoría inexistente, aviso borrado): el layout (main) ya pone barra y
// pie, así que acá va solo el contenido. Sin este archivo se usaría app/not-found.tsx, que trae su propia
// barra, y quedaban dos barras apiladas.
export default function MainNotFound() {
  return <NotFoundContent />;
}
