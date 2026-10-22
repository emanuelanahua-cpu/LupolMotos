import React from 'react';
import logo from '../assets/LupolMotosHalloween.png';

// Sustituye src/assets/logo.webp para cambiar el logo de toda la web.
export default function BrandLogo() {
  return <img src={logo} alt="Lupol Motos" width="1024" height="363" className="block w-[140px] sm:w-[190px] 2xl:w-[230px] max-w-full h-auto rounded-lg object-contain" />;
}
