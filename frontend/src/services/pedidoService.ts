import { request } from "./api";
export interface PedidoInput {
  cliente: {
    nombre: string;
    telefono: string;
    email: string;
    direccion: string;
  };
  items: { moto_id: number; cantidad: number }[];
  total_centimos: number;
  notas: string;
}
export interface ReciboPedido {
  id: number;
  numero: string;
  estado: string;
  total_centimos: number;
  enlace_whatsapp: string;
}
let intento: { firma: string; clave: string } | null = null;
export async function enviarPedido(data: PedidoInput): Promise<ReciboPedido> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(JSON.stringify(data)),
  );
  const firma = Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
  try {
    intento ||= JSON.parse(
      sessionStorage.getItem("lupol-intento-pedido") || "null",
    );
  } catch {
    /* privado */
  }
  if (intento?.firma !== firma) intento = { firma, clave: crypto.randomUUID() };
  try {
    sessionStorage.setItem("lupol-intento-pedido", JSON.stringify(intento));
  } catch {
    /* privado */
  }
  return request<ReciboPedido>("/api/pedidos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, clave: intento.clave }),
  });
}
export function terminarIntento() {
  intento = null;
  try {
    sessionStorage.removeItem("lupol-intento-pedido");
  } catch {
    /* privado */
  }
}
