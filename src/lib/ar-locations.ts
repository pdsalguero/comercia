// Provincias y localidades que usa el formulario de publicar y el de editar un aviso.
// El aviso guarda la provincia en listings.city y la localidad en listings.neighborhood (texto).

export const ARGENTINA_PROVINCES = [
  "Buenos Aires",
  "CABA",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán",
];

export const LOCALITIES_BY_PROVINCE: Record<string, string[]> = {
  "Buenos Aires": [
    "La Plata","Mar del Plata","Bahía Blanca","Quilmes","Lanús","Lomas de Zamora","General San Martín",
    "Morón","Tres de Febrero","Tigre","San Isidro","Vicente López","Berazategui","Florencio Varela",
    "Almirante Brown","Esteban Echeverría","La Matanza","Merlo","Moreno","Hurlingham","Ituzaingó",
    "San Miguel","Malvinas Argentinas","José C. Paz","Avellaneda","Pergamino","Tandil","Junín",
    "Pilar","Campana","Zárate","San Nicolás de los Arroyos","Necochea","Olavarría","Azul","Luján",
    "Mercedes","San Antonio de Padua","Pacheco","Mar del Plata","Dolores","9 de Julio","Pehuajó",
    "Trenque Lauquen","General Pico","Coronel Suárez","Balcarce","Miramar","Villa Gesell",
    "Pinamar","Mar de Ajó","San Clemente del Tuyú","Otro",
  ],
  "CABA": [
    "Almagro","Balvanera","Barracas","Belgrano","Boedo","Caballito","Chacarita","Coghlan",
    "Colegiales","Constitución","Flores","Floresta","La Boca","La Paternal","Liniers","Mataderos",
    "Monte Castro","Montserrat","Nueva Pompeya","Núñez","Palermo","Parque Avellaneda",
    "Parque Chacabuco","Parque Chas","Parque Patricios","Puerto Madero","Recoleta","Retiro",
    "Saavedra","San Cristóbal","San Nicolás","San Telmo","Vélez Sársfield","Versalles",
    "Villa Crespo","Villa del Parque","Villa Devoto","Villa General Mitre","Villa Lugano",
    "Villa Luro","Villa Ortúzar","Villa Pueyrredón","Villa Real","Villa Riachuelo","Villa Santa Rita",
    "Villa Soldati","Villa Urquiza","Otro",
  ],
  "Catamarca": [
    "San Fernando del Valle de Catamarca","Andalgalá","Tinogasta","Belén","Santa María",
    "La Rioja","Recreo","San José","Fiambalá","Hualfín","Pomán","Otro",
  ],
  "Chaco": [
    "Resistencia","Presidencia Roque Sáenz Peña","Villa Ángela","Charata","Barranqueras",
    "Fontana","Juan José Castelli","Las Breñas","Quitilipi","Presidencia de la Plaza",
    "La Escondida","Machagai","Puerto Tirol","Otro",
  ],
  "Chubut": [
    "Rawson","Comodoro Rivadavia","Trelew","Puerto Madryn","Esquel","Rada Tilly",
    "Sarmiento","Camarones","Gaiman","Dolavon","28 de Julio","Alto Río Senguer","Otro",
  ],
  "Córdoba": [
    "Córdoba Capital","Villa Carlos Paz","Río Cuarto","San Francisco","Villa María","Río Tercero",
    "Alta Gracia","Cosquín","La Falda","Villa General Belgrano","Cruz del Eje","Deán Funes",
    "Jesús María","Oncativo","Arroyito","Marcos Juárez","Bell Ville","Laboulaye","Victorica",
    "Mina Clavero","Villa Dolores","Río Ceballos","Saldán","Mendiolaza","Unquillo","La Calera",
    "Malagueño","Pilar","Laguna Larga","Monte Buey","Otro",
  ],
  "Corrientes": [
    "Corrientes","Goya","Posadas","Paso de los Libres","Curuzú Cuatiá","Mercedes","Saladas",
    "Santo Tomé","Bella Vista","Esquina","Ituzaingó","Yapeyú","Monte Caseros","Otro",
  ],
  "Entre Ríos": [
    "Paraná","Concordia","Gualeguaychú","Concepción del Uruguay","Gualeguay","Villaguay",
    "Colón","San Salvador","Federal","La Paz","Crespo","Diamante","Victoria","Federación","Otro",
  ],
  "Formosa": [
    "Formosa","Clorinda","Pirané","El Colorado","Ingeniero Juárez","Las Lomitas",
    "General Enrique Mosconi","Comandante Fontana","Otro",
  ],
  "Jujuy": [
    "San Salvador de Jujuy","Palpalá","San Pedro de Jujuy","Libertador General San Martín",
    "Humahuaca","Tilcara","La Quiaca","Abra Pampa","El Carmen","Perico","Fraile Pintado","Otro",
  ],
  "La Pampa": [
    "Santa Rosa","General Pico","Toay","Realicó","General Acha","Eduardo Castex","Victorica",
    "Intendente Alvear","Guatraché","25 de Mayo","Bernardo Larroudé","Otro",
  ],
  "La Rioja": [
    "La Rioja","Chilecito","Aimogasta","Chamical","Chepes","Villa Unión","Vinchina",
    "Patquía","Famatina","Villa Castelli","Otro",
  ],
  "Mendoza": [
    "Mendoza Capital","Godoy Cruz","Guaymallén","Las Heras","Maipú","Luján de Cuyo",
    "San Rafael","Rivadavia","Junín","General Alvear","Malargüe","La Paz","San Martín",
    "Tunuyán","Tupungato","San Carlos","Ciudad","Rodeo del Medio","Otro",
  ],
  "Misiones": [
    "Posadas","Oberá","El Dorado","Eldorado","Apóstoles","Leandro N. Alem","Puerto Iguazú",
    "Aristóbulo del Valle","Montecarlo","San Vicente","Puerto Rico","Concepción de la Sierra","Otro",
  ],
  "Neuquén": [
    "Neuquén Capital","Cipolletti","Cutral Có","Plaza Huincul","Plottier","San Martín de los Andes",
    "Villa La Angostura","Zapala","Junín de los Andes","Las Lajas","Chos Malal","Rincón de los Sauces","Otro",
  ],
  "Río Negro": [
    "Viedma","Bariloche","General Roca","Cipolletti","Allen","Villa Regina","Lamarque",
    "Ingeniero Jacobacci","El Bolsón","Choele Choel","Las Grutas","Sierra Grande","Otro",
  ],
  "Salta": [
    "Salta Capital","San Ramón de la Nueva Orán","Tartagal","General Güemes","Cafayate",
    "Rosario de la Frontera","Metán","Joaquín V. González","Embarcación","Cerrillos","Otro",
  ],
  "San Juan": [
    "Capital","Rivadavia","Rawson","Santa Lucía","Chimbas","Pocito","Caucete",
    "25 de Mayo","Ullum","Zonda","Sarmiento","Angaco","Albardón","Jáchal","Otro",
  ],
  "San Luis": [
    "San Luis Capital","Villa Mercedes","Merlo","Quines","Justo Daract","La Toma",
    "Buena Esperanza","Arizona","Concarán","Naschel","Otro",
  ],
  "Santa Cruz": [
    "Río Gallegos","Caleta Olivia","Pico Truncado","Puerto Madryn","Los Antiguos",
    "Perito Moreno","Las Heras","El Calafate","Gobernador Gregores","Puerto Santa Cruz","Otro",
  ],
  "Santa Fe": [
    "Rosario","Santa Fe Capital","Rafaela","Venado Tuerto","Santo Tomé","Villa Constitución",
    "Reconquista","Avellaneda","Cañada de Gómez","Casilda","Esperanza","Las Rosas","Rufino",
    "San Lorenzo","Firmat","Villa Gobernador Gálvez","Pérez","Funes","Roldan","Otro",
  ],
  "Santiago del Estero": [
    "Santiago del Estero Capital","La Banda","Termas de Río Hondo","Añatuya","Frías",
    "Loreto","Fernández","Quimilí","Suncho Corral","Monte Quemado","Otro",
  ],
  "Tierra del Fuego": [
    "Ushuaia","Río Grande","Tolhuin","Otro",
  ],
  "Tucumán": [
    "San Miguel de Tucumán","Tafí Viejo","Banda del Río Salí","Yerba Buena","Concepción",
    "Monteros","Aguilares","Alderetes","Famaillá","Juan Bautista Alberdi","Simoca",
    "Bella Vista","Trancas","Otro",
  ],
};

// Separa la ubicación guardada de un aviso en provincia + localidad, contemplando los formatos que
// dejaron versiones anteriores del sitio: localidad como "Albardón, San Juan", provincia vacía, o
// solo un código de zona en attributes.zone (ej. "albardon").
export function splitListingLocation(
  city: string | null | undefined,
  neighborhood: string | null | undefined,
  zoneLabel?: { province: string; locality: string } | null,
): { province: string; locality: string } {
  let province = city && ARGENTINA_PROVINCES.includes(city) ? city : "";
  let locality = (neighborhood ?? "").trim();
  const comma = locality.lastIndexOf(",");
  if (comma > 0) {
    const tail = locality.slice(comma + 1).trim();
    if (ARGENTINA_PROVINCES.includes(tail)) {
      province = province || tail;
      locality = locality.slice(0, comma).trim();
    }
  }
  if (!province && zoneLabel?.province && ARGENTINA_PROVINCES.includes(zoneLabel.province)) province = zoneLabel.province;
  if (!locality && zoneLabel?.locality) locality = zoneLabel.locality;
  return { province, locality };
}
