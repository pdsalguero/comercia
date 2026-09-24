// GENERADO por tools/catalogo-vehiculos/construir_catalogo.py — no editar a mano.
// Fuentes: listas previas del sitio + agregados manuales + tabla de valuación DNRPA vigente desde 04/09/2026.
// Para cambiar un modelo: editar tools/catalogo-vehiculos/fuentes/*.json y volver a correr el script.

export type TipoCatalogo = "auto" | "camioneta" | "moto" | "cuatriciclo" | "utv" | "camion";

export const CATALOGO_VIGENCIA_DNRPA = "04/09/2026";

export const MARCAS_CATALOGO: Record<TipoCatalogo, { value: string; label: string }[]> = {
 "auto": [
  {
   "value": "aixam",
   "label": "Aixam"
  },
  {
   "value": "alfa_romeo",
   "label": "Alfa Romeo"
  },
  {
   "value": "arcfox",
   "label": "Arcfox"
  },
  {
   "value": "audi",
   "label": "Audi"
  },
  {
   "value": "baic",
   "label": "BAIC"
  },
  {
   "value": "bmw",
   "label": "BMW"
  },
  {
   "value": "byd",
   "label": "BYD"
  },
  {
   "value": "cadillac",
   "label": "Cadillac"
  },
  {
   "value": "changan",
   "label": "Changan"
  },
  {
   "value": "chery",
   "label": "Chery"
  },
  {
   "value": "chevrolet",
   "label": "Chevrolet"
  },
  {
   "value": "chrysler",
   "label": "Chrysler"
  },
  {
   "value": "citroen",
   "label": "Citroën"
  },
  {
   "value": "coradir",
   "label": "Coradir"
  },
  {
   "value": "cupra",
   "label": "Cupra"
  },
  {
   "value": "dacia",
   "label": "Dacia"
  },
  {
   "value": "daewoo",
   "label": "Daewoo"
  },
  {
   "value": "daihatsu",
   "label": "Daihatsu"
  },
  {
   "value": "datsun",
   "label": "Datsun"
  },
  {
   "value": "dfsk",
   "label": "DFSK"
  },
  {
   "value": "dkw",
   "label": "DKW"
  },
  {
   "value": "dodge",
   "label": "Dodge"
  },
  {
   "value": "dongfeng",
   "label": "Dongfeng"
  },
  {
   "value": "ds",
   "label": "DS"
  },
  {
   "value": "faw",
   "label": "FAW"
  },
  {
   "value": "ferrari",
   "label": "Ferrari"
  },
  {
   "value": "fiat",
   "label": "Fiat"
  },
  {
   "value": "ford",
   "label": "Ford"
  },
  {
   "value": "foton",
   "label": "Foton"
  },
  {
   "value": "gac",
   "label": "Gac"
  },
  {
   "value": "gac_gonow",
   "label": "Gac Gonow"
  },
  {
   "value": "galloper",
   "label": "Galloper"
  },
  {
   "value": "geely",
   "label": "Geely"
  },
  {
   "value": "geo",
   "label": "Geo"
  },
  {
   "value": "gmc",
   "label": "GMC"
  },
  {
   "value": "great_wall",
   "label": "Great Wall"
  },
  {
   "value": "haval",
   "label": "Haval"
  },
  {
   "value": "honda",
   "label": "Honda"
  },
  {
   "value": "hummer",
   "label": "Hummer"
  },
  {
   "value": "hyundai",
   "label": "Hyundai"
  },
  {
   "value": "ika",
   "label": "IKA"
  },
  {
   "value": "international",
   "label": "International"
  },
  {
   "value": "isuzu",
   "label": "Isuzu"
  },
  {
   "value": "iveco",
   "label": "Iveco"
  },
  {
   "value": "jac",
   "label": "JAC"
  },
  {
   "value": "jaguar",
   "label": "Jaguar"
  },
  {
   "value": "jeep",
   "label": "Jeep"
  },
  {
   "value": "jetour",
   "label": "Jetour"
  },
  {
   "value": "jmc",
   "label": "JMC"
  },
  {
   "value": "jmev",
   "label": "JMEV"
  },
  {
   "value": "kaiyi",
   "label": "Kaiyi"
  },
  {
   "value": "kia",
   "label": "Kia"
  },
  {
   "value": "lada",
   "label": "Lada"
  },
  {
   "value": "lancer",
   "label": "Lancer"
  },
  {
   "value": "lancia",
   "label": "Lancia"
  },
  {
   "value": "land_rover",
   "label": "Land Rover"
  },
  {
   "value": "lexus",
   "label": "Lexus"
  },
  {
   "value": "lifan",
   "label": "Lifan"
  },
  {
   "value": "lotus",
   "label": "Lotus"
  },
  {
   "value": "mahindra",
   "label": "Mahindra"
  },
  {
   "value": "maserati",
   "label": "Maserati"
  },
  {
   "value": "mazda",
   "label": "Mazda"
  },
  {
   "value": "mclaren",
   "label": "Mclaren"
  },
  {
   "value": "mercedes_benz",
   "label": "Mercedes Benz"
  },
  {
   "value": "mg",
   "label": "MG"
  },
  {
   "value": "mini",
   "label": "Mini"
  },
  {
   "value": "mitsubishi",
   "label": "Mitsubishi"
  },
  {
   "value": "nakai",
   "label": "Nakai"
  },
  {
   "value": "nissan",
   "label": "Nissan"
  },
  {
   "value": "opel",
   "label": "Opel"
  },
  {
   "value": "peugeot",
   "label": "Peugeot"
  },
  {
   "value": "piaggio",
   "label": "Piaggio"
  },
  {
   "value": "plymouth",
   "label": "Plymouth"
  },
  {
   "value": "pontiac",
   "label": "Pontiac"
  },
  {
   "value": "porsche",
   "label": "Porsche"
  },
  {
   "value": "proton",
   "label": "Proton"
  },
  {
   "value": "ram",
   "label": "RAM"
  },
  {
   "value": "range_rover",
   "label": "Range Rover"
  },
  {
   "value": "rastrojero",
   "label": "Rastrojero"
  },
  {
   "value": "renault",
   "label": "Renault"
  },
  {
   "value": "rover",
   "label": "Rover"
  },
  {
   "value": "saab",
   "label": "Saab"
  },
  {
   "value": "seat",
   "label": "SEAT"
  },
  {
   "value": "shineray",
   "label": "Shineray"
  },
  {
   "value": "siam_di_tella",
   "label": "Siam Di Tella"
  },
  {
   "value": "skoda",
   "label": "Skoda"
  },
  {
   "value": "smart",
   "label": "Smart"
  },
  {
   "value": "soueast",
   "label": "Soueast"
  },
  {
   "value": "ssangyong",
   "label": "SsangYong"
  },
  {
   "value": "subaru",
   "label": "Subaru"
  },
  {
   "value": "suzuki",
   "label": "Suzuki"
  },
  {
   "value": "tata",
   "label": "Tata"
  },
  {
   "value": "toyota",
   "label": "Toyota"
  },
  {
   "value": "volkswagen",
   "label": "Volkswagen"
  },
  {
   "value": "volvo",
   "label": "Volvo"
  },
  {
   "value": "wuling",
   "label": "Wuling"
  },
  {
   "value": "zanella",
   "label": "Zanella"
  }
 ],
 "camioneta": [
  {
   "value": "acura",
   "label": "Acura"
  },
  {
   "value": "agrale",
   "label": "Agrale"
  },
  {
   "value": "alfa_romeo",
   "label": "Alfa Romeo"
  },
  {
   "value": "arcfox",
   "label": "Arcfox"
  },
  {
   "value": "aro",
   "label": "Aro"
  },
  {
   "value": "audi",
   "label": "Audi"
  },
  {
   "value": "baic",
   "label": "BAIC"
  },
  {
   "value": "bmw",
   "label": "BMW"
  },
  {
   "value": "byd",
   "label": "BYD"
  },
  {
   "value": "can_am",
   "label": "Can-Am"
  },
  {
   "value": "cfmoto",
   "label": "CFMoto"
  },
  {
   "value": "changan",
   "label": "Changan"
  },
  {
   "value": "chery",
   "label": "Chery"
  },
  {
   "value": "chevrolet",
   "label": "Chevrolet"
  },
  {
   "value": "chrysler",
   "label": "Chrysler"
  },
  {
   "value": "citroen",
   "label": "Citroën"
  },
  {
   "value": "coradir",
   "label": "Coradir"
  },
  {
   "value": "cupra",
   "label": "Cupra"
  },
  {
   "value": "dacia",
   "label": "Dacia"
  },
  {
   "value": "daewoo",
   "label": "Daewoo"
  },
  {
   "value": "daihatsu",
   "label": "Daihatsu"
  },
  {
   "value": "datsun",
   "label": "Datsun"
  },
  {
   "value": "dfsk",
   "label": "DFSK"
  },
  {
   "value": "dkw",
   "label": "DKW"
  },
  {
   "value": "dodge",
   "label": "Dodge"
  },
  {
   "value": "domy",
   "label": "Domy"
  },
  {
   "value": "dongfeng",
   "label": "Dongfeng"
  },
  {
   "value": "ds",
   "label": "DS"
  },
  {
   "value": "faw",
   "label": "FAW"
  },
  {
   "value": "fiat",
   "label": "Fiat"
  },
  {
   "value": "ford",
   "label": "Ford"
  },
  {
   "value": "foton",
   "label": "Foton"
  },
  {
   "value": "gac",
   "label": "Gac"
  },
  {
   "value": "galloper",
   "label": "Galloper"
  },
  {
   "value": "gamma",
   "label": "Gamma"
  },
  {
   "value": "gaz",
   "label": "Gaz"
  },
  {
   "value": "geely",
   "label": "Geely"
  },
  {
   "value": "geo",
   "label": "Geo"
  },
  {
   "value": "gmc",
   "label": "GMC"
  },
  {
   "value": "great_wall",
   "label": "Great Wall"
  },
  {
   "value": "haval",
   "label": "Haval"
  },
  {
   "value": "hei_bao",
   "label": "Hei Bao"
  },
  {
   "value": "honda",
   "label": "Honda"
  },
  {
   "value": "hummer",
   "label": "Hummer"
  },
  {
   "value": "hyundai",
   "label": "Hyundai"
  },
  {
   "value": "ika",
   "label": "IKA"
  },
  {
   "value": "infiniti",
   "label": "Infiniti"
  },
  {
   "value": "integral",
   "label": "Integral"
  },
  {
   "value": "isuzu",
   "label": "Isuzu"
  },
  {
   "value": "iveco",
   "label": "Iveco"
  },
  {
   "value": "jac",
   "label": "JAC"
  },
  {
   "value": "jaguar",
   "label": "Jaguar"
  },
  {
   "value": "jeep",
   "label": "Jeep"
  },
  {
   "value": "jetour",
   "label": "Jetour"
  },
  {
   "value": "jmc",
   "label": "JMC"
  },
  {
   "value": "kawasaki",
   "label": "Kawasaki"
  },
  {
   "value": "kia",
   "label": "Kia"
  },
  {
   "value": "kyc",
   "label": "Kyc"
  },
  {
   "value": "kymco",
   "label": "Kymco"
  },
  {
   "value": "lada",
   "label": "Lada"
  },
  {
   "value": "lamborghini",
   "label": "Lamborghini"
  },
  {
   "value": "lancia",
   "label": "Lancia"
  },
  {
   "value": "land_rover",
   "label": "Land Rover"
  },
  {
   "value": "lexus",
   "label": "Lexus"
  },
  {
   "value": "lifan",
   "label": "Lifan"
  },
  {
   "value": "mahindra",
   "label": "Mahindra"
  },
  {
   "value": "maserati",
   "label": "Maserati"
  },
  {
   "value": "maxus",
   "label": "Maxus"
  },
  {
   "value": "mazda",
   "label": "Mazda"
  },
  {
   "value": "mercedes_benz",
   "label": "Mercedes Benz"
  },
  {
   "value": "mg",
   "label": "MG"
  },
  {
   "value": "mini",
   "label": "Mini"
  },
  {
   "value": "mitsubishi",
   "label": "Mitsubishi"
  },
  {
   "value": "nissan",
   "label": "Nissan"
  },
  {
   "value": "opel",
   "label": "Opel"
  },
  {
   "value": "peugeot",
   "label": "Peugeot"
  },
  {
   "value": "piaggio",
   "label": "Piaggio"
  },
  {
   "value": "plymouth",
   "label": "Plymouth"
  },
  {
   "value": "polaris",
   "label": "Polaris"
  },
  {
   "value": "porsche",
   "label": "Porsche"
  },
  {
   "value": "ram",
   "label": "RAM"
  },
  {
   "value": "range_rover",
   "label": "Range Rover"
  },
  {
   "value": "rastrojero",
   "label": "Rastrojero"
  },
  {
   "value": "renault",
   "label": "Renault"
  },
  {
   "value": "rover",
   "label": "Rover"
  },
  {
   "value": "santana",
   "label": "Santana"
  },
  {
   "value": "saturn",
   "label": "Saturn"
  },
  {
   "value": "seat",
   "label": "SEAT"
  },
  {
   "value": "shineray",
   "label": "Shineray"
  },
  {
   "value": "skoda",
   "label": "Skoda"
  },
  {
   "value": "smart",
   "label": "Smart"
  },
  {
   "value": "ssangyong",
   "label": "SsangYong"
  },
  {
   "value": "subaru",
   "label": "Subaru"
  },
  {
   "value": "sunequip",
   "label": "Sunequip"
  },
  {
   "value": "suzuki",
   "label": "Suzuki"
  },
  {
   "value": "tata",
   "label": "Tata"
  },
  {
   "value": "toyota",
   "label": "Toyota"
  },
  {
   "value": "volkswagen",
   "label": "Volkswagen"
  },
  {
   "value": "volvo",
   "label": "Volvo"
  },
  {
   "value": "wuling",
   "label": "Wuling"
  },
  {
   "value": "yamaha",
   "label": "Yamaha"
  },
  {
   "value": "yuejin",
   "label": "Yuejin"
  },
  {
   "value": "zanella",
   "label": "Zanella"
  }
 ],
 "moto": [
  {
   "value": "appia",
   "label": "Appia"
  },
  {
   "value": "aprilia",
   "label": "Aprilia"
  },
  {
   "value": "arctic_cat",
   "label": "Arctic Cat"
  },
  {
   "value": "ariic",
   "label": "Ariic"
  },
  {
   "value": "bajaj",
   "label": "Bajaj"
  },
  {
   "value": "benelli",
   "label": "Benelli"
  },
  {
   "value": "beta",
   "label": "Beta"
  },
  {
   "value": "betamotor",
   "label": "Betamotor"
  },
  {
   "value": "blackstone",
   "label": "Blackstone"
  },
  {
   "value": "bmw",
   "label": "BMW"
  },
  {
   "value": "brava",
   "label": "Brava"
  },
  {
   "value": "can_am",
   "label": "Can-Am"
  },
  {
   "value": "ceccato",
   "label": "Ceccato"
  },
  {
   "value": "cerro",
   "label": "Cerro"
  },
  {
   "value": "cfmoto",
   "label": "CFMoto"
  },
  {
   "value": "corven",
   "label": "Corven"
  },
  {
   "value": "da_dalt",
   "label": "Da Dalt"
  },
  {
   "value": "daelim",
   "label": "Daelim"
  },
  {
   "value": "dayama",
   "label": "Dayama"
  },
  {
   "value": "ducati",
   "label": "Ducati"
  },
  {
   "value": "elite",
   "label": "Elite"
  },
  {
   "value": "elpra_electric",
   "label": "Elpra Electric"
  },
  {
   "value": "euromot",
   "label": "Euromot"
  },
  {
   "value": "gaf",
   "label": "GAF"
  },
  {
   "value": "gamma",
   "label": "Gamma"
  },
  {
   "value": "garelli",
   "label": "Garelli"
  },
  {
   "value": "garelli_sahel",
   "label": "Garelli Sahel"
  },
  {
   "value": "gasgas",
   "label": "Gas Gas"
  },
  {
   "value": "ghiggeri",
   "label": "Ghiggeri"
  },
  {
   "value": "gilera",
   "label": "Gilera"
  },
  {
   "value": "guerrero",
   "label": "Guerrero"
  },
  {
   "value": "haojue",
   "label": "Haojue"
  },
  {
   "value": "harley_davidson",
   "label": "Harley Davidson"
  },
  {
   "value": "hero",
   "label": "Hero"
  },
  {
   "value": "honda",
   "label": "Honda"
  },
  {
   "value": "husqvarna",
   "label": "Husqvarna"
  },
  {
   "value": "ika",
   "label": "IKA"
  },
  {
   "value": "imsa",
   "label": "Imsa"
  },
  {
   "value": "indian",
   "label": "Indian"
  },
  {
   "value": "italjet",
   "label": "Italjet"
  },
  {
   "value": "jawa",
   "label": "Jawa"
  },
  {
   "value": "jianshe",
   "label": "Jianshe"
  },
  {
   "value": "jincheng",
   "label": "Jincheng"
  },
  {
   "value": "jmstar",
   "label": "Jmstar"
  },
  {
   "value": "kawasaki",
   "label": "Kawasaki"
  },
  {
   "value": "kayo",
   "label": "Kayo"
  },
  {
   "value": "keeway",
   "label": "Keeway"
  },
  {
   "value": "keller",
   "label": "Keller"
  },
  {
   "value": "kiden",
   "label": "Kiden"
  },
  {
   "value": "kikai",
   "label": "Kikai"
  },
  {
   "value": "konisa",
   "label": "Konisa"
  },
  {
   "value": "kove",
   "label": "Kove"
  },
  {
   "value": "ktm",
   "label": "KTM"
  },
  {
   "value": "kymco",
   "label": "Kymco"
  },
  {
   "value": "legnano",
   "label": "Legnano"
  },
  {
   "value": "lifan",
   "label": "Lifan"
  },
  {
   "value": "loncin",
   "label": "Loncin"
  },
  {
   "value": "maverick",
   "label": "Maverick"
  },
  {
   "value": "maverick_motorcycles",
   "label": "Maverick Motorcycles"
  },
  {
   "value": "mondial",
   "label": "Mondial"
  },
  {
   "value": "morbidelli",
   "label": "Morbidelli"
  },
  {
   "value": "moto_guzzi",
   "label": "Moto Guzzi"
  },
  {
   "value": "moto_morini",
   "label": "Moto Morini"
  },
  {
   "value": "motomel",
   "label": "Motomel"
  },
  {
   "value": "mv_agusta",
   "label": "MV Agusta"
  },
  {
   "value": "nakai",
   "label": "Nakai"
  },
  {
   "value": "norton",
   "label": "Norton"
  },
  {
   "value": "nuuv",
   "label": "Nuuv"
  },
  {
   "value": "okinoi",
   "label": "Okinoi"
  },
  {
   "value": "olmo",
   "label": "Olmo"
  },
  {
   "value": "panther",
   "label": "Panther"
  },
  {
   "value": "panther_quads",
   "label": "Panther Quads"
  },
  {
   "value": "piaggio",
   "label": "Piaggio"
  },
  {
   "value": "polaris",
   "label": "Polaris"
  },
  {
   "value": "qingqi",
   "label": "Qingqi"
  },
  {
   "value": "qjmotor",
   "label": "QJMotor"
  },
  {
   "value": "royal_enfield",
   "label": "Royal Enfield"
  },
  {
   "value": "rumi",
   "label": "Rumi"
  },
  {
   "value": "rvm",
   "label": "RVM"
  },
  {
   "value": "segway",
   "label": "Segway"
  },
  {
   "value": "sherco",
   "label": "Sherco"
  },
  {
   "value": "siam",
   "label": "Siam"
  },
  {
   "value": "siambretta",
   "label": "Siambretta"
  },
  {
   "value": "sumo",
   "label": "Sumo"
  },
  {
   "value": "sunra",
   "label": "Sunra"
  },
  {
   "value": "super_soco",
   "label": "Super Soco"
  },
  {
   "value": "suzuki",
   "label": "Suzuki"
  },
  {
   "value": "sym",
   "label": "SYM"
  },
  {
   "value": "teknial",
   "label": "Teknial"
  },
  {
   "value": "tibo",
   "label": "Tibo"
  },
  {
   "value": "triumph",
   "label": "Triumph"
  },
  {
   "value": "tvs",
   "label": "TVS"
  },
  {
   "value": "vespa",
   "label": "Vespa"
  },
  {
   "value": "voge",
   "label": "Voge"
  },
  {
   "value": "yamaha",
   "label": "Yamaha"
  },
  {
   "value": "zanella",
   "label": "Zanella"
  },
  {
   "value": "zontes",
   "label": "Zontes"
  }
 ],
 "cuatriciclo": [
  {
   "value": "arctic_cat",
   "label": "Arctic Cat"
  },
  {
   "value": "beta",
   "label": "Beta"
  },
  {
   "value": "betamotor",
   "label": "Betamotor"
  },
  {
   "value": "blackstone",
   "label": "Blackstone"
  },
  {
   "value": "brava",
   "label": "Brava"
  },
  {
   "value": "can_am",
   "label": "Can-Am"
  },
  {
   "value": "cerro",
   "label": "Cerro"
  },
  {
   "value": "cfmoto",
   "label": "CFMoto"
  },
  {
   "value": "coradir",
   "label": "Coradir"
  },
  {
   "value": "corven",
   "label": "Corven"
  },
  {
   "value": "dayama",
   "label": "Dayama"
  },
  {
   "value": "feresa",
   "label": "Feresa"
  },
  {
   "value": "gamma",
   "label": "Gamma"
  },
  {
   "value": "gilera",
   "label": "Gilera"
  },
  {
   "value": "guerrero",
   "label": "Guerrero"
  },
  {
   "value": "honda",
   "label": "Honda"
  },
  {
   "value": "jianshe",
   "label": "Jianshe"
  },
  {
   "value": "kawasaki",
   "label": "Kawasaki"
  },
  {
   "value": "keller",
   "label": "Keller"
  },
  {
   "value": "kikai",
   "label": "Kikai"
  },
  {
   "value": "konisa",
   "label": "Konisa"
  },
  {
   "value": "kymco",
   "label": "Kymco"
  },
  {
   "value": "maverick",
   "label": "Maverick"
  },
  {
   "value": "mondial",
   "label": "Mondial"
  },
  {
   "value": "motomel",
   "label": "Motomel"
  },
  {
   "value": "panther",
   "label": "Panther"
  },
  {
   "value": "polaris",
   "label": "Polaris"
  },
  {
   "value": "qingqi",
   "label": "Qingqi"
  },
  {
   "value": "segway",
   "label": "Segway"
  },
  {
   "value": "sero",
   "label": "Sero"
  },
  {
   "value": "sumo",
   "label": "Sumo"
  },
  {
   "value": "suzuki",
   "label": "Suzuki"
  },
  {
   "value": "tibo",
   "label": "Tibo"
  },
  {
   "value": "voltmotors",
   "label": "Voltmotors"
  },
  {
   "value": "yamaha",
   "label": "Yamaha"
  },
  {
   "value": "zanella",
   "label": "Zanella"
  }
 ],
 "utv": [
  {
   "value": "arctic_cat",
   "label": "Arctic Cat"
  },
  {
   "value": "can_am",
   "label": "Can-Am"
  },
  {
   "value": "cfmoto",
   "label": "CFMoto"
  },
  {
   "value": "gamma",
   "label": "Gamma"
  },
  {
   "value": "kawasaki",
   "label": "Kawasaki"
  },
  {
   "value": "maverick",
   "label": "Maverick"
  },
  {
   "value": "polaris",
   "label": "Polaris"
  },
  {
   "value": "yamaha",
   "label": "Yamaha"
  }
 ],
 "camion": [
  {
   "value": "3_star",
   "label": "3-star"
  },
  {
   "value": "aeolus",
   "label": "Aeolus"
  },
  {
   "value": "agrale",
   "label": "Agrale"
  },
  {
   "value": "asia",
   "label": "Asia"
  },
  {
   "value": "bedford",
   "label": "Bedford"
  },
  {
   "value": "chevrolet",
   "label": "Chevrolet"
  },
  {
   "value": "citroen",
   "label": "Citroën"
  },
  {
   "value": "daihatsu",
   "label": "Daihatsu"
  },
  {
   "value": "daimler_benz",
   "label": "Daimler Benz"
  },
  {
   "value": "deutz",
   "label": "Deutz"
  },
  {
   "value": "dfm",
   "label": "DFM"
  },
  {
   "value": "dfsk",
   "label": "DFSK"
  },
  {
   "value": "dimex",
   "label": "Dimex"
  },
  {
   "value": "dodge",
   "label": "Dodge"
  },
  {
   "value": "dongfeng",
   "label": "Dongfeng"
  },
  {
   "value": "fiat",
   "label": "Fiat"
  },
  {
   "value": "ford",
   "label": "Ford"
  },
  {
   "value": "foton",
   "label": "Foton"
  },
  {
   "value": "gaz",
   "label": "Gaz"
  },
  {
   "value": "gmc",
   "label": "GMC"
  },
  {
   "value": "grosspal",
   "label": "Grosspal"
  },
  {
   "value": "hino",
   "label": "Hino"
  },
  {
   "value": "hyundai",
   "label": "Hyundai"
  },
  {
   "value": "internacional",
   "label": "Internacional"
  },
  {
   "value": "international",
   "label": "International"
  },
  {
   "value": "isuzu",
   "label": "Isuzu"
  },
  {
   "value": "itati",
   "label": "Itati"
  },
  {
   "value": "iveco",
   "label": "Iveco"
  },
  {
   "value": "jmc",
   "label": "JMC"
  },
  {
   "value": "kama",
   "label": "Kama"
  },
  {
   "value": "kia",
   "label": "Kia"
  },
  {
   "value": "land_rover",
   "label": "Land Rover"
  },
  {
   "value": "lifan",
   "label": "Lifan"
  },
  {
   "value": "mack",
   "label": "Mack"
  },
  {
   "value": "maxus",
   "label": "Maxus"
  },
  {
   "value": "mercedes_benz",
   "label": "Mercedes Benz"
  },
  {
   "value": "metro",
   "label": "Metro"
  },
  {
   "value": "mitsubishi",
   "label": "Mitsubishi"
  },
  {
   "value": "nakai",
   "label": "Nakai"
  },
  {
   "value": "nissan",
   "label": "Nissan"
  },
  {
   "value": "nissan_diesel",
   "label": "Nissan Diesel"
  },
  {
   "value": "peugeot",
   "label": "Peugeot"
  },
  {
   "value": "renault",
   "label": "Renault"
  },
  {
   "value": "saab_scania",
   "label": "Saab Scania"
  },
  {
   "value": "sanxing",
   "label": "Sanxing"
  },
  {
   "value": "scania",
   "label": "Scania"
  },
  {
   "value": "shineray",
   "label": "Shineray"
  },
  {
   "value": "space",
   "label": "Space"
  },
  {
   "value": "ssangyong",
   "label": "SsangYong"
  },
  {
   "value": "tata",
   "label": "Tata"
  },
  {
   "value": "toyota",
   "label": "Toyota"
  },
  {
   "value": "volkswagen",
   "label": "Volkswagen"
  },
  {
   "value": "volvo",
   "label": "Volvo"
  },
  {
   "value": "yuejin",
   "label": "Yuejin"
  },
  {
   "value": "zanella",
   "label": "Zanella"
  }
 ]
};
