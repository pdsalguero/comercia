// Marcas más buscadas en Argentina, por tipo de vehículo (slugs del catálogo de marcas).
// Las usan el menú de marcas del Navbar y la tira "Marcas populares" del home.
export const POPULAR_BRANDS: Record<string, string[]> = {
  auto:      ["volkswagen", "toyota", "ford", "chevrolet", "fiat", "renault", "peugeot", "citroen", "nissan", "honda", "jeep", "hyundai"],
  camioneta: ["toyota", "ford", "volkswagen", "chevrolet", "fiat", "nissan", "renault", "peugeot", "jeep", "citroen", "hyundai"],
  moto:      ["honda", "yamaha", "zanella", "motomel", "corven", "gilera", "bajaj", "suzuki", "kawasaki", "ktm", "benelli", "keeway"],
};

// Mezcla para el home (todos los tipos): autos y pickups primero, con las motos más elegidas al final.
export const POPULAR_BRANDS_HOME: string[] = [
  "toyota", "volkswagen", "ford", "chevrolet", "fiat", "renault", "peugeot", "honda", "yamaha", "nissan", "jeep", "zanella",
];
