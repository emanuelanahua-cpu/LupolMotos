import React from "react";
import "./SolicitudTarjeta.css";

export default function SolicitudTarjeta() {
  return (
    <>
      <div className="seccion-solicitud-wrapper">
        <div className="seccion-solicitud-inner">
          {/* Fondos superpuestos */}
          <div className="contenedor-fondos">
            <div className="fondo-base"></div>
            <div className="fondo-encima"></div>
          </div>

          {/* Contenedor Principal */}
          <main className="contenedor-principal-t">
            {/* Grid 1: Lado Izquierdo */}
            <section className="col-izq-t">
              <img
                src="multimedia/solicitud_tarjeta/mano.png"
                alt="Mano sosteniendo celular"
                className="img-mano"
              />
            </section>

            {/* Grid 2: Centro */}
            <section className="col-centro-t">
              <h1 className="titulo-principal-t">
                ¿PROBLEMAS CON TU
                <br />
                DOCUMENTACIÓN VEHICULAR?
              </h1>

              <p className="texto-descripcion-t">
                En{" "}
                <img
                  src="multimedia/Lupolmotos.webp"
                  alt="LupolMotos"
                  className="logo-inline"
                />{" "}
                te ayudamos
                <br className="br-desktop" />
                a gestionar u obtener el duplicado
                <br className="br-desktop" />
                de tu Tarjeta de Identificación
                <br className="br-desktop" />
                Vehicular Electrónica (TIVe) de
                <br className="br-desktop" />
                forma rápida y sin complicaciones.
              </p>

              <div className="contenedor-boton-t">
                <div className="contenedor-boton-box-t">
                  <a
                    href="https://wa.me/51980687475?text=Hola%20asesor%20de%20LupolMotos,%20deseo%20consultar%20sobre%20el%20duplicado%20de%20mi%20TIVe"
                    className="btn-whatsapp-t"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg className="icono-wa-t" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.298 1.592 5.534-.001 10.031-4.498 10.033-10.033.001-2.678-1.041-5.196-2.932-7.088-1.892-1.892-4.41-2.934-7.089-2.933-5.533.001-10.032 4.497-10.033 10.032-.001 1.84.475 3.638 1.381 5.228l-1.003 3.666 3.745-.981zm10.061-6.733c-.058-.098-.216-.156-.453-.274-.236-.118-1.401-.692-1.618-.771-.216-.078-.374-.118-.532.118-.157.235-.61 .771-.747.928-.138.157-.275.176-.512.059-.236-.118-.999-.368-1.905-1.176-.704-.627-1.179-1.402-1.317-1.637-.138-.236-.015-.364.103-.481.106-.105.236-.275.354-.412.118-.137.157-.235.236-.392.079-.157.039-.294-.02-.412-.059-.118-.532-1.285-.729-1.756-.192-.46-.386-.397-.532-.404-.138-.007-.295-.008-.453-.008-.157 0-.413.059-.629.294s-.826.808-.826 1.971c0 1.163.846 2.287.964 2.444.118.157 1.666 2.543 4.037 3.567.565.244 1.006.39 1.349.499.568.18 1.085.154 1.494.093.458-.068 1.401-.572 1.598-1.125.197-.553.197-1.026.138-1.125z" />
                    </svg>
                    CONTÁCTANOS AHORA
                  </a>
                </div>
                <p className="texto-sub-t">
                  Consultar con un asesor vía
                  <br />
                  WhatsApp
                </p>
              </div>
            </section>

            {/* Grid 3: Lado Derecho */}
            <section className="col-der-t">
              <img
                src="multimedia/solicitud_tarjeta/sunarp.png"
                alt="SUNARP"
                className="img-sunarp"
              />
              <img
                src="multimedia/solicitud_tarjeta/tarjeta.png"
                alt="Tarjeta TIVe"
                className="img-tarjeta"
              />
            </section>
          </main>
        </div>
      </div>
    </>
  );
} 