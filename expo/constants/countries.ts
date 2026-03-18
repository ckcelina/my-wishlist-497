export interface CountryData {
  name: string;
  code: string;
  flag: string;
  currency: string;
  serpApiCode: string;
  cities: string[];
  stores: string[];
}

export interface CurrencyData {
  code: string;
  name: string;
  symbol: string;
}

export const CURRENCIES: CurrencyData[] = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" },
  { code: "MXN", name: "Mexican Peso", symbol: "MX$" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr" },
  { code: "KRW", name: "South Korean Won", symbol: "₩" },
  { code: "TRY", name: "Turkish Lira", symbol: "₺" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "RUB", name: "Russian Ruble", symbol: "₽" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
  { code: "TWD", name: "Taiwan Dollar", symbol: "NT$" },
  { code: "DKK", name: "Danish Krone", symbol: "kr" },
  { code: "PLN", name: "Polish Zloty", symbol: "zł" },
  { code: "THB", name: "Thai Baht", symbol: "฿" },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp" },
  { code: "HUF", name: "Hungarian Forint", symbol: "Ft" },
  { code: "CZK", name: "Czech Koruna", symbol: "Kč" },
  { code: "ILS", name: "Israeli Shekel", symbol: "₪" },
  { code: "CLP", name: "Chilean Peso", symbol: "CL$" },
  { code: "PHP", name: "Philippine Peso", symbol: "₱" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { code: "COP", name: "Colombian Peso", symbol: "COL$" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM" },
  { code: "RON", name: "Romanian Leu", symbol: "lei" },
  { code: "ARS", name: "Argentine Peso", symbol: "AR$" },
  { code: "BGN", name: "Bulgarian Lev", symbol: "лв" },
  { code: "HRK", name: "Croatian Kuna", symbol: "kn" },
  { code: "PEN", name: "Peruvian Sol", symbol: "S/" },
  { code: "PKR", name: "Pakistani Rupee", symbol: "₨" },
  { code: "EGP", name: "Egyptian Pound", symbol: "E£" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦" },
  { code: "BDT", name: "Bangladeshi Taka", symbol: "৳" },
  { code: "VND", name: "Vietnamese Dong", symbol: "₫" },
  { code: "UAH", name: "Ukrainian Hryvnia", symbol: "₴" },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh" },
  { code: "QAR", name: "Qatari Riyal", symbol: "QR" },
  { code: "KWD", name: "Kuwaiti Dinar", symbol: "KD" },
  { code: "BHD", name: "Bahraini Dinar", symbol: "BD" },
  { code: "OMR", name: "Omani Rial", symbol: "OMR" },
  { code: "JOD", name: "Jordanian Dinar", symbol: "JD" },
  { code: "LBP", name: "Lebanese Pound", symbol: "L£" },
  { code: "MAD", name: "Moroccan Dirham", symbol: "MAD" },
  { code: "TND", name: "Tunisian Dinar", symbol: "DT" },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "GH₵" },
  { code: "TZS", name: "Tanzanian Shilling", symbol: "TSh" },
  { code: "UGX", name: "Ugandan Shilling", symbol: "USh" },
  { code: "ETB", name: "Ethiopian Birr", symbol: "Br" },
  { code: "RWF", name: "Rwandan Franc", symbol: "FRw" },
  { code: "XOF", name: "West African CFA Franc", symbol: "CFA" },
  { code: "XAF", name: "Central African CFA Franc", symbol: "FCFA" },
  { code: "LKR", name: "Sri Lankan Rupee", symbol: "Rs" },
  { code: "MMK", name: "Myanmar Kyat", symbol: "K" },
  { code: "KHR", name: "Cambodian Riel", symbol: "៛" },
  { code: "LAK", name: "Lao Kip", symbol: "₭" },
  { code: "NPR", name: "Nepalese Rupee", symbol: "NRs" },
  { code: "GEL", name: "Georgian Lari", symbol: "₾" },
  { code: "AMD", name: "Armenian Dram", symbol: "֏" },
  { code: "AZN", name: "Azerbaijani Manat", symbol: "₼" },
  { code: "UZS", name: "Uzbekistani Som", symbol: "soʻm" },
  { code: "KZT", name: "Kazakhstani Tenge", symbol: "₸" },
  { code: "ISK", name: "Icelandic Krona", symbol: "kr" },
  { code: "DOP", name: "Dominican Peso", symbol: "RD$" },
  { code: "CRC", name: "Costa Rican Colon", symbol: "₡" },
  { code: "GTQ", name: "Guatemalan Quetzal", symbol: "Q" },
  { code: "PAB", name: "Panamanian Balboa", symbol: "B/" },
  { code: "UYU", name: "Uruguayan Peso", symbol: "$U" },
  { code: "BOB", name: "Bolivian Boliviano", symbol: "Bs" },
  { code: "PYG", name: "Paraguayan Guarani", symbol: "₲" },
  { code: "VES", name: "Venezuelan Bolivar", symbol: "Bs.S" },
  { code: "TTD", name: "Trinidad Dollar", symbol: "TT$" },
  { code: "JMD", name: "Jamaican Dollar", symbol: "J$" },
  { code: "BBD", name: "Barbadian Dollar", symbol: "Bds$" },
  { code: "BSD", name: "Bahamian Dollar", symbol: "B$" },
  { code: "BZD", name: "Belize Dollar", symbol: "BZ$" },
  { code: "FJD", name: "Fijian Dollar", symbol: "FJ$" },
  { code: "MUR", name: "Mauritian Rupee", symbol: "MRs" },
  { code: "SCR", name: "Seychellois Rupee", symbol: "SRe" },
  { code: "MVR", name: "Maldivian Rufiyaa", symbol: "Rf" },
  { code: "BND", name: "Brunei Dollar", symbol: "B$" },
  { code: "IQD", name: "Iraqi Dinar", symbol: "ع.د" },
  { code: "LYD", name: "Libyan Dinar", symbol: "LD" },
  { code: "DZD", name: "Algerian Dinar", symbol: "DA" },
  { code: "SDG", name: "Sudanese Pound", symbol: "SDG" },
  { code: "SOS", name: "Somali Shilling", symbol: "Sh" },
  { code: "ZMW", name: "Zambian Kwacha", symbol: "ZK" },
  { code: "MWK", name: "Malawian Kwacha", symbol: "MK" },
  { code: "MZN", name: "Mozambican Metical", symbol: "MT" },
  { code: "AOA", name: "Angolan Kwanza", symbol: "Kz" },
  { code: "BWP", name: "Botswanan Pula", symbol: "P" },
  { code: "NAD", name: "Namibian Dollar", symbol: "N$" },
  { code: "SZL", name: "Eswatini Lilangeni", symbol: "E" },
  { code: "LSL", name: "Lesotho Loti", symbol: "L" },
  { code: "MGA", name: "Malagasy Ariary", symbol: "Ar" },
  { code: "XPF", name: "CFP Franc", symbol: "₣" },
  { code: "PGK", name: "Papua New Guinean Kina", symbol: "K" },
  { code: "WST", name: "Samoan Tala", symbol: "WS$" },
  { code: "TOP", name: "Tongan Paʻanga", symbol: "T$" },
  { code: "VUV", name: "Vanuatu Vatu", symbol: "VT" },
  { code: "SBD", name: "Solomon Islands Dollar", symbol: "SI$" },
  { code: "HTG", name: "Haitian Gourde", symbol: "G" },
  { code: "NIO", name: "Nicaraguan Cordoba", symbol: "C$" },
  { code: "HNL", name: "Honduran Lempira", symbol: "L" },
  { code: "SVC", name: "Salvadoran Colon", symbol: "₡" },
  { code: "CUP", name: "Cuban Peso", symbol: "₱" },
  { code: "GYD", name: "Guyanese Dollar", symbol: "GY$" },
  { code: "SRD", name: "Surinamese Dollar", symbol: "SRD" },
  { code: "AWG", name: "Aruban Florin", symbol: "Afl" },
  { code: "ANG", name: "Netherlands Antillean Guilder", symbol: "NAƒ" },
  { code: "BMD", name: "Bermudian Dollar", symbol: "BD$" },
  { code: "KYD", name: "Cayman Islands Dollar", symbol: "CI$" },
  { code: "MNT", name: "Mongolian Tugrik", symbol: "₮" },
  { code: "KGS", name: "Kyrgyzstani Som", symbol: "сом" },
  { code: "TJS", name: "Tajikistani Somoni", symbol: "SM" },
  { code: "TMT", name: "Turkmenistani Manat", symbol: "T" },
  { code: "AFN", name: "Afghan Afghani", symbol: "؋" },
  { code: "IRR", name: "Iranian Rial", symbol: "﷼" },
  { code: "SYP", name: "Syrian Pound", symbol: "£S" },
  { code: "YER", name: "Yemeni Rial", symbol: "YR" },
  { code: "BIF", name: "Burundian Franc", symbol: "FBu" },
  { code: "CDF", name: "Congolese Franc", symbol: "FC" },
  { code: "DJF", name: "Djiboutian Franc", symbol: "Fdj" },
  { code: "ERN", name: "Eritrean Nakfa", symbol: "Nfk" },
  { code: "GMD", name: "Gambian Dalasi", symbol: "D" },
  { code: "GNF", name: "Guinean Franc", symbol: "FG" },
  { code: "KMF", name: "Comorian Franc", symbol: "CF" },
  { code: "LRD", name: "Liberian Dollar", symbol: "L$" },
  { code: "SLL", name: "Sierra Leonean Leone", symbol: "Le" },
  { code: "STN", name: "São Tomé Dobra", symbol: "Db" },
  { code: "CVE", name: "Cape Verdean Escudo", symbol: "Esc" },
  { code: "MRU", name: "Mauritanian Ouguiya", symbol: "UM" },
  { code: "SSP", name: "South Sudanese Pound", symbol: "SSP" },
  { code: "ZWL", name: "Zimbabwean Dollar", symbol: "Z$" },
  { code: "BTN", name: "Bhutanese Ngultrum", symbol: "Nu" },
  { code: "KPW", name: "North Korean Won", symbol: "₩" },
];

export const COUNTRIES: CountryData[] = [
  {
    name: "Afghanistan", code: "AF", flag: "🇦🇫", currency: "AFN", serpApiCode: "af",
    cities: ["Kabul", "Kandahar", "Herat", "Mazar-i-Sharif", "Jalalabad"],
    stores: [],
  },
  {
    name: "Albania", code: "AL", flag: "🇦🇱", currency: "ALL", serpApiCode: "al",
    cities: ["Tirana", "Durrës", "Vlorë", "Elbasan", "Shkodër"],
    stores: [],
  },
  {
    name: "Algeria", code: "DZ", flag: "🇩🇿", currency: "DZD", serpApiCode: "dz",
    cities: ["Algiers", "Oran", "Constantine", "Annaba", "Blida"],
    stores: ["Jumia"],
  },
  {
    name: "Andorra", code: "AD", flag: "🇦🇩", currency: "EUR", serpApiCode: "ad",
    cities: ["Andorra la Vella", "Escaldes-Engordany"],
    stores: ["Amazon"],
  },
  {
    name: "Angola", code: "AO", flag: "🇦🇴", currency: "AOA", serpApiCode: "ao",
    cities: ["Luanda", "Huambo", "Lobito", "Benguela", "Cabinda"],
    stores: [],
  },
  {
    name: "Antigua and Barbuda", code: "AG", flag: "🇦🇬", currency: "XCD", serpApiCode: "ag",
    cities: ["St. John's"],
    stores: [],
  },
  {
    name: "Argentina", code: "AR", flag: "🇦🇷", currency: "ARS", serpApiCode: "ar",
    cities: ["Buenos Aires", "Córdoba", "Rosario", "Mendoza", "La Plata", "San Miguel de Tucumán", "Mar del Plata", "Salta"],
    stores: ["MercadoLibre", "Amazon"],
  },
  {
    name: "Armenia", code: "AM", flag: "🇦🇲", currency: "AMD", serpApiCode: "am",
    cities: ["Yerevan", "Gyumri", "Vanadzor"],
    stores: [],
  },
  {
    name: "Australia", code: "AU", flag: "🇦🇺", currency: "AUD", serpApiCode: "au",
    cities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast", "Canberra", "Newcastle", "Hobart", "Darwin"],
    stores: ["Amazon AU", "eBay AU", "Kogan", "JB Hi-Fi", "Uber Eats", "DoorDash", "Menulog"],
  },
  {
    name: "Austria", code: "AT", flag: "🇦🇹", currency: "EUR", serpApiCode: "at",
    cities: ["Vienna", "Graz", "Linz", "Salzburg", "Innsbruck"],
    stores: ["Amazon DE", "MediaMarkt", "Lieferando", "Mjam"],
  },
  {
    name: "Azerbaijan", code: "AZ", flag: "🇦🇿", currency: "AZN", serpApiCode: "az",
    cities: ["Baku", "Ganja", "Sumgait"],
    stores: ["Bolt Food", "Wolt"],
  },
  {
    name: "Bahamas", code: "BS", flag: "🇧🇸", currency: "BSD", serpApiCode: "bs",
    cities: ["Nassau", "Freeport"],
    stores: [],
  },
  {
    name: "Bahrain", code: "BH", flag: "🇧🇭", currency: "BHD", serpApiCode: "bh",
    cities: ["Manama", "Riffa", "Muharraq"],
    stores: ["Talabat", "Careem", "Noon", "Amazon", "Deliveroo"],
  },
  {
    name: "Bangladesh", code: "BD", flag: "🇧🇩", currency: "BDT", serpApiCode: "bd",
    cities: ["Dhaka", "Chittagong", "Khulna", "Rajshahi", "Sylhet"],
    stores: ["Daraz", "Foodpanda"],
  },
  {
    name: "Barbados", code: "BB", flag: "🇧🇧", currency: "BBD", serpApiCode: "bb",
    cities: ["Bridgetown"],
    stores: [],
  },
  {
    name: "Belarus", code: "BY", flag: "🇧🇾", currency: "BYN", serpApiCode: "by",
    cities: ["Minsk", "Gomel", "Mogilev", "Vitebsk"],
    stores: [],
  },
  {
    name: "Belgium", code: "BE", flag: "🇧🇪", currency: "EUR", serpApiCode: "be",
    cities: ["Brussels", "Antwerp", "Ghent", "Charleroi", "Liège", "Bruges"],
    stores: ["Amazon", "Bol.com", "Deliveroo", "Uber Eats", "Takeaway"],
  },
  {
    name: "Belize", code: "BZ", flag: "🇧🇿", currency: "BZD", serpApiCode: "bz",
    cities: ["Belize City", "Belmopan"],
    stores: [],
  },
  {
    name: "Benin", code: "BJ", flag: "🇧🇯", currency: "XOF", serpApiCode: "bj",
    cities: ["Cotonou", "Porto-Novo"],
    stores: [],
  },
  {
    name: "Bhutan", code: "BT", flag: "🇧🇹", currency: "BTN", serpApiCode: "bt",
    cities: ["Thimphu", "Phuntsholing"],
    stores: [],
  },
  {
    name: "Bolivia", code: "BO", flag: "🇧🇴", currency: "BOB", serpApiCode: "bo",
    cities: ["La Paz", "Santa Cruz", "Cochabamba", "Sucre"],
    stores: [],
  },
  {
    name: "Bosnia and Herzegovina", code: "BA", flag: "🇧🇦", currency: "BAM", serpApiCode: "ba",
    cities: ["Sarajevo", "Banja Luka", "Tuzla", "Mostar"],
    stores: [],
  },
  {
    name: "Botswana", code: "BW", flag: "🇧🇼", currency: "BWP", serpApiCode: "bw",
    cities: ["Gaborone", "Francistown"],
    stores: [],
  },
  {
    name: "Brazil", code: "BR", flag: "🇧🇷", currency: "BRL", serpApiCode: "br",
    cities: ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza", "Belo Horizonte", "Manaus", "Curitiba", "Recife", "Porto Alegre"],
    stores: ["Amazon BR", "MercadoLibre", "iFood", "Rappi", "Uber Eats", "Magazine Luiza"],
  },
  {
    name: "Brunei", code: "BN", flag: "🇧🇳", currency: "BND", serpApiCode: "bn",
    cities: ["Bandar Seri Begawan"],
    stores: [],
  },
  {
    name: "Bulgaria", code: "BG", flag: "🇧🇬", currency: "BGN", serpApiCode: "bg",
    cities: ["Sofia", "Plovdiv", "Varna", "Burgas"],
    stores: ["eMag", "Foodpanda"],
  },
  {
    name: "Burkina Faso", code: "BF", flag: "🇧🇫", currency: "XOF", serpApiCode: "bf",
    cities: ["Ouagadougou", "Bobo-Dioulasso"],
    stores: [],
  },
  {
    name: "Burundi", code: "BI", flag: "🇧🇮", currency: "BIF", serpApiCode: "bi",
    cities: ["Bujumbura", "Gitega"],
    stores: [],
  },
  {
    name: "Cambodia", code: "KH", flag: "🇰🇭", currency: "KHR", serpApiCode: "kh",
    cities: ["Phnom Penh", "Siem Reap", "Battambang"],
    stores: ["Foodpanda", "Grab"],
  },
  {
    name: "Cameroon", code: "CM", flag: "🇨🇲", currency: "XAF", serpApiCode: "cm",
    cities: ["Douala", "Yaoundé", "Bamenda"],
    stores: ["Jumia"],
  },
  {
    name: "Canada", code: "CA", flag: "🇨🇦", currency: "CAD", serpApiCode: "ca",
    cities: ["Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton", "Ottawa", "Winnipeg", "Quebec City", "Hamilton", "Halifax"],
    stores: ["Amazon CA", "Walmart CA", "Best Buy CA", "Uber Eats", "DoorDash", "Skip The Dishes", "Canadian Tire"],
  },
  {
    name: "Cape Verde", code: "CV", flag: "🇨🇻", currency: "CVE", serpApiCode: "cv",
    cities: ["Praia"],
    stores: [],
  },
  {
    name: "Central African Republic", code: "CF", flag: "🇨🇫", currency: "XAF", serpApiCode: "cf",
    cities: ["Bangui"],
    stores: [],
  },
  {
    name: "Chad", code: "TD", flag: "🇹🇩", currency: "XAF", serpApiCode: "td",
    cities: ["N'Djamena"],
    stores: [],
  },
  {
    name: "Chile", code: "CL", flag: "🇨🇱", currency: "CLP", serpApiCode: "cl",
    cities: ["Santiago", "Valparaíso", "Concepción", "La Serena", "Antofagasta"],
    stores: ["MercadoLibre", "Falabella", "Rappi", "Uber Eats", "PedidosYa"],
  },
  {
    name: "China", code: "CN", flag: "🇨🇳", currency: "CNY", serpApiCode: "cn",
    cities: ["Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Chengdu", "Hangzhou", "Wuhan", "Nanjing", "Xi'an", "Chongqing", "Tianjin", "Suzhou"],
    stores: ["Taobao", "JD.com", "Tmall", "Pinduoduo", "Meituan", "Ele.me"],
  },
  {
    name: "Colombia", code: "CO", flag: "🇨🇴", currency: "COP", serpApiCode: "co",
    cities: ["Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena"],
    stores: ["MercadoLibre", "Rappi", "Uber Eats", "Falabella"],
  },
  {
    name: "Comoros", code: "KM", flag: "🇰🇲", currency: "KMF", serpApiCode: "km",
    cities: ["Moroni"],
    stores: [],
  },
  {
    name: "Congo (DRC)", code: "CD", flag: "🇨🇩", currency: "CDF", serpApiCode: "cd",
    cities: ["Kinshasa", "Lubumbashi", "Mbuji-Mayi"],
    stores: [],
  },
  {
    name: "Congo (Republic)", code: "CG", flag: "🇨🇬", currency: "XAF", serpApiCode: "cg",
    cities: ["Brazzaville", "Pointe-Noire"],
    stores: [],
  },
  {
    name: "Costa Rica", code: "CR", flag: "🇨🇷", currency: "CRC", serpApiCode: "cr",
    cities: ["San José", "Alajuela", "Cartago"],
    stores: ["Uber Eats", "Rappi"],
  },
  {
    name: "Croatia", code: "HR", flag: "🇭🇷", currency: "EUR", serpApiCode: "hr",
    cities: ["Zagreb", "Split", "Rijeka", "Osijek", "Dubrovnik"],
    stores: ["Glovo", "Wolt", "Bolt Food"],
  },
  {
    name: "Cuba", code: "CU", flag: "🇨🇺", currency: "CUP", serpApiCode: "cu",
    cities: ["Havana", "Santiago de Cuba"],
    stores: [],
  },
  {
    name: "Cyprus", code: "CY", flag: "🇨🇾", currency: "EUR", serpApiCode: "cy",
    cities: ["Nicosia", "Limassol", "Larnaca", "Paphos"],
    stores: ["Wolt", "Bolt Food"],
  },
  {
    name: "Czech Republic", code: "CZ", flag: "🇨🇿", currency: "CZK", serpApiCode: "cz",
    cities: ["Prague", "Brno", "Ostrava", "Plzeň"],
    stores: ["Alza.cz", "Mall.cz", "Wolt", "Bolt Food", "Rohlik"],
  },
  {
    name: "Denmark", code: "DK", flag: "🇩🇰", currency: "DKK", serpApiCode: "dk",
    cities: ["Copenhagen", "Aarhus", "Odense", "Aalborg"],
    stores: ["Amazon", "Wolt", "Just Eat", "Nemlig"],
  },
  {
    name: "Djibouti", code: "DJ", flag: "🇩🇯", currency: "DJF", serpApiCode: "dj",
    cities: ["Djibouti City"],
    stores: [],
  },
  {
    name: "Dominica", code: "DM", flag: "🇩🇲", currency: "XCD", serpApiCode: "dm",
    cities: ["Roseau"],
    stores: [],
  },
  {
    name: "Dominican Republic", code: "DO", flag: "🇩🇴", currency: "DOP", serpApiCode: "do",
    cities: ["Santo Domingo", "Santiago de los Caballeros"],
    stores: ["PedidosYa", "Uber Eats"],
  },
  {
    name: "East Timor", code: "TL", flag: "🇹🇱", currency: "USD", serpApiCode: "tl",
    cities: ["Dili"],
    stores: [],
  },
  {
    name: "Ecuador", code: "EC", flag: "🇪🇨", currency: "USD", serpApiCode: "ec",
    cities: ["Quito", "Guayaquil", "Cuenca"],
    stores: ["Rappi", "Uber Eats", "PedidosYa"],
  },
  {
    name: "Egypt", code: "EG", flag: "🇪🇬", currency: "EGP", serpApiCode: "eg",
    cities: ["Cairo", "Alexandria", "Giza", "Sharm El Sheikh", "Luxor", "Aswan", "Hurghada"],
    stores: ["Amazon EG", "Noon", "Talabat", "Elmenus", "Jumia"],
  },
  {
    name: "El Salvador", code: "SV", flag: "🇸🇻", currency: "USD", serpApiCode: "sv",
    cities: ["San Salvador"],
    stores: ["Uber Eats", "Hugo"],
  },
  {
    name: "Equatorial Guinea", code: "GQ", flag: "🇬🇶", currency: "XAF", serpApiCode: "gq",
    cities: ["Malabo"],
    stores: [],
  },
  {
    name: "Eritrea", code: "ER", flag: "🇪🇷", currency: "ERN", serpApiCode: "er",
    cities: ["Asmara"],
    stores: [],
  },
  {
    name: "Estonia", code: "EE", flag: "🇪🇪", currency: "EUR", serpApiCode: "ee",
    cities: ["Tallinn", "Tartu"],
    stores: ["Bolt Food", "Wolt", "Barbora"],
  },
  {
    name: "Eswatini", code: "SZ", flag: "🇸🇿", currency: "SZL", serpApiCode: "sz",
    cities: ["Mbabane", "Manzini"],
    stores: [],
  },
  {
    name: "Ethiopia", code: "ET", flag: "🇪🇹", currency: "ETB", serpApiCode: "et",
    cities: ["Addis Ababa", "Dire Dawa", "Mekelle"],
    stores: ["Deliver Addis"],
  },
  {
    name: "Fiji", code: "FJ", flag: "🇫🇯", currency: "FJD", serpApiCode: "fj",
    cities: ["Suva", "Nadi"],
    stores: [],
  },
  {
    name: "Finland", code: "FI", flag: "🇫🇮", currency: "EUR", serpApiCode: "fi",
    cities: ["Helsinki", "Espoo", "Tampere", "Turku", "Oulu"],
    stores: ["Amazon", "Wolt", "Foodora", "Verkkokauppa"],
  },
  {
    name: "France", code: "FR", flag: "🇫🇷", currency: "EUR", serpApiCode: "fr",
    cities: ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg", "Bordeaux", "Lille", "Montpellier"],
    stores: ["Amazon FR", "Fnac", "Deliveroo", "Uber Eats", "Just Eat", "Cdiscount"],
  },
  {
    name: "Gabon", code: "GA", flag: "🇬🇦", currency: "XAF", serpApiCode: "ga",
    cities: ["Libreville"],
    stores: [],
  },
  {
    name: "Gambia", code: "GM", flag: "🇬🇲", currency: "GMD", serpApiCode: "gm",
    cities: ["Banjul"],
    stores: [],
  },
  {
    name: "Georgia", code: "GE", flag: "🇬🇪", currency: "GEL", serpApiCode: "ge",
    cities: ["Tbilisi", "Batumi", "Kutaisi"],
    stores: ["Glovo", "Bolt Food", "Wolt"],
  },
  {
    name: "Germany", code: "DE", flag: "🇩🇪", currency: "EUR", serpApiCode: "de",
    cities: ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne", "Stuttgart", "Düsseldorf", "Leipzig", "Dortmund", "Dresden"],
    stores: ["Amazon DE", "MediaMarkt", "Saturn", "Lieferando", "Wolt", "Uber Eats", "Flink", "Gorillas"],
  },
  {
    name: "Ghana", code: "GH", flag: "🇬🇭", currency: "GHS", serpApiCode: "gh",
    cities: ["Accra", "Kumasi", "Tamale", "Takoradi"],
    stores: ["Jumia", "Bolt Food", "Glovo"],
  },
  {
    name: "Greece", code: "GR", flag: "🇬🇷", currency: "EUR", serpApiCode: "gr",
    cities: ["Athens", "Thessaloniki", "Patras", "Heraklion", "Larissa"],
    stores: ["Skroutz", "e-food", "Wolt", "Bolt Food"],
  },
  {
    name: "Grenada", code: "GD", flag: "🇬🇩", currency: "XCD", serpApiCode: "gd",
    cities: ["St. George's"],
    stores: [],
  },
  {
    name: "Guatemala", code: "GT", flag: "🇬🇹", currency: "GTQ", serpApiCode: "gt",
    cities: ["Guatemala City", "Quetzaltenango"],
    stores: ["Uber Eats", "Hugo"],
  },
  {
    name: "Guinea", code: "GN", flag: "🇬🇳", currency: "GNF", serpApiCode: "gn",
    cities: ["Conakry"],
    stores: [],
  },
  {
    name: "Guinea-Bissau", code: "GW", flag: "🇬🇼", currency: "XOF", serpApiCode: "gw",
    cities: ["Bissau"],
    stores: [],
  },
  {
    name: "Guyana", code: "GY", flag: "🇬🇾", currency: "GYD", serpApiCode: "gy",
    cities: ["Georgetown"],
    stores: [],
  },
  {
    name: "Haiti", code: "HT", flag: "🇭🇹", currency: "HTG", serpApiCode: "ht",
    cities: ["Port-au-Prince"],
    stores: [],
  },
  {
    name: "Honduras", code: "HN", flag: "🇭🇳", currency: "HNL", serpApiCode: "hn",
    cities: ["Tegucigalpa", "San Pedro Sula"],
    stores: ["Hugo", "Uber Eats"],
  },
  {
    name: "Hungary", code: "HU", flag: "🇭🇺", currency: "HUF", serpApiCode: "hu",
    cities: ["Budapest", "Debrecen", "Szeged", "Miskolc", "Pécs"],
    stores: ["eMag", "Wolt", "Bolt Food", "Foodpanda"],
  },
  {
    name: "Iceland", code: "IS", flag: "🇮🇸", currency: "ISK", serpApiCode: "is",
    cities: ["Reykjavik"],
    stores: ["Amazon"],
  },
  {
    name: "India", code: "IN", flag: "🇮🇳", currency: "INR", serpApiCode: "in",
    cities: ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Ahmedabad", "Pune", "Jaipur", "Surat", "Lucknow", "Kanpur"],
    stores: ["Amazon IN", "Flipkart", "Myntra", "Swiggy", "Zomato", "BigBasket", "Nykaa", "Meesho", "JioMart"],
  },
  {
    name: "Indonesia", code: "ID", flag: "🇮🇩", currency: "IDR", serpApiCode: "id",
    cities: ["Jakarta", "Surabaya", "Bandung", "Medan", "Semarang", "Makassar", "Palembang", "Denpasar"],
    stores: ["Tokopedia", "Shopee", "Lazada", "Grab", "GoFood", "Blibli"],
  },
  {
    name: "Iran", code: "IR", flag: "🇮🇷", currency: "IRR", serpApiCode: "ir",
    cities: ["Tehran", "Mashhad", "Isfahan", "Tabriz", "Shiraz"],
    stores: ["Digikala", "SnappFood"],
  },
  {
    name: "Iraq", code: "IQ", flag: "🇮🇶", currency: "IQD", serpApiCode: "iq",
    cities: ["Baghdad", "Erbil", "Basra", "Sulaymaniyah", "Mosul"],
    stores: ["Talabat", "Toters", "Careem"],
  },
  {
    name: "Ireland", code: "IE", flag: "🇮🇪", currency: "EUR", serpApiCode: "ie",
    cities: ["Dublin", "Cork", "Galway", "Limerick", "Waterford"],
    stores: ["Amazon UK", "Deliveroo", "Just Eat", "Uber Eats"],
  },
  {
    name: "Israel", code: "IL", flag: "🇮🇱", currency: "ILS", serpApiCode: "il",
    cities: ["Tel Aviv", "Jerusalem", "Haifa", "Rishon LeZion", "Beer Sheva"],
    stores: ["Amazon", "Wolt", "10Bis"],
  },
  {
    name: "Italy", code: "IT", flag: "🇮🇹", currency: "EUR", serpApiCode: "it",
    cities: ["Rome", "Milan", "Naples", "Turin", "Palermo", "Florence", "Bologna", "Genoa", "Venice", "Verona"],
    stores: ["Amazon IT", "Deliveroo", "Glovo", "Just Eat", "Uber Eats"],
  },
  {
    name: "Ivory Coast", code: "CI", flag: "🇨🇮", currency: "XOF", serpApiCode: "ci",
    cities: ["Abidjan", "Yamoussoukro", "Bouaké"],
    stores: ["Jumia", "Glovo"],
  },
  {
    name: "Jamaica", code: "JM", flag: "🇯🇲", currency: "JMD", serpApiCode: "jm",
    cities: ["Kingston", "Montego Bay"],
    stores: [],
  },
  {
    name: "Japan", code: "JP", flag: "🇯🇵", currency: "JPY", serpApiCode: "jp",
    cities: ["Tokyo", "Osaka", "Yokohama", "Nagoya", "Sapporo", "Fukuoka", "Kobe", "Kyoto", "Kawasaki", "Sendai"],
    stores: ["Amazon JP", "Rakuten", "Uber Eats", "Demae-can", "Yahoo Shopping"],
  },
  {
    name: "Jordan", code: "JO", flag: "🇯🇴", currency: "JOD", serpApiCode: "jo",
    cities: ["Amman", "Zarqa", "Irbid", "Aqaba"],
    stores: ["Talabat", "Careem", "Opensooq"],
  },
  {
    name: "Kazakhstan", code: "KZ", flag: "🇰🇿", currency: "KZT", serpApiCode: "kz",
    cities: ["Almaty", "Nur-Sultan", "Shymkent", "Karaganda"],
    stores: ["Kaspi", "Glovo", "Wolt"],
  },
  {
    name: "Kenya", code: "KE", flag: "🇰🇪", currency: "KES", serpApiCode: "ke",
    cities: ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"],
    stores: ["Jumia", "Glovo", "Bolt Food", "Uber Eats"],
  },
  {
    name: "Kiribati", code: "KI", flag: "🇰🇮", currency: "AUD", serpApiCode: "ki",
    cities: ["Tarawa"],
    stores: [],
  },
  {
    name: "Kosovo", code: "XK", flag: "🇽🇰", currency: "EUR", serpApiCode: "xk",
    cities: ["Pristina", "Prizren"],
    stores: [],
  },
  {
    name: "Kuwait", code: "KW", flag: "🇰🇼", currency: "KWD", serpApiCode: "kw",
    cities: ["Kuwait City", "Hawalli", "Salmiya", "Jahra"],
    stores: ["Talabat", "Careem", "Deliveroo", "Noon", "Amazon"],
  },
  {
    name: "Kyrgyzstan", code: "KG", flag: "🇰🇬", currency: "KGS", serpApiCode: "kg",
    cities: ["Bishkek", "Osh"],
    stores: [],
  },
  {
    name: "Laos", code: "LA", flag: "🇱🇦", currency: "LAK", serpApiCode: "la",
    cities: ["Vientiane", "Luang Prabang"],
    stores: [],
  },
  {
    name: "Latvia", code: "LV", flag: "🇱🇻", currency: "EUR", serpApiCode: "lv",
    cities: ["Riga", "Daugavpils"],
    stores: ["Wolt", "Bolt Food", "Barbora"],
  },
  {
    name: "Lebanon", code: "LB", flag: "🇱🇧", currency: "LBP", serpApiCode: "lb",
    cities: ["Beirut", "Tripoli", "Sidon", "Jounieh"],
    stores: ["Talabat", "Toters", "Careem"],
  },
  {
    name: "Lesotho", code: "LS", flag: "🇱🇸", currency: "LSL", serpApiCode: "ls",
    cities: ["Maseru"],
    stores: [],
  },
  {
    name: "Liberia", code: "LR", flag: "🇱🇷", currency: "LRD", serpApiCode: "lr",
    cities: ["Monrovia"],
    stores: [],
  },
  {
    name: "Libya", code: "LY", flag: "🇱🇾", currency: "LYD", serpApiCode: "ly",
    cities: ["Tripoli", "Benghazi", "Misrata"],
    stores: [],
  },
  {
    name: "Liechtenstein", code: "LI", flag: "🇱🇮", currency: "CHF", serpApiCode: "li",
    cities: ["Vaduz"],
    stores: ["Amazon"],
  },
  {
    name: "Lithuania", code: "LT", flag: "🇱🇹", currency: "EUR", serpApiCode: "lt",
    cities: ["Vilnius", "Kaunas", "Klaipėda"],
    stores: ["Wolt", "Bolt Food", "Barbora"],
  },
  {
    name: "Luxembourg", code: "LU", flag: "🇱🇺", currency: "EUR", serpApiCode: "lu",
    cities: ["Luxembourg City"],
    stores: ["Amazon", "Wolt"],
  },
  {
    name: "Madagascar", code: "MG", flag: "🇲🇬", currency: "MGA", serpApiCode: "mg",
    cities: ["Antananarivo"],
    stores: [],
  },
  {
    name: "Malawi", code: "MW", flag: "🇲🇼", currency: "MWK", serpApiCode: "mw",
    cities: ["Lilongwe", "Blantyre"],
    stores: [],
  },
  {
    name: "Malaysia", code: "MY", flag: "🇲🇾", currency: "MYR", serpApiCode: "my",
    cities: ["Kuala Lumpur", "George Town", "Johor Bahru", "Ipoh", "Shah Alam", "Kota Kinabalu", "Kuching"],
    stores: ["Shopee MY", "Lazada MY", "Grab", "Foodpanda", "Amazon"],
  },
  {
    name: "Maldives", code: "MV", flag: "🇲🇻", currency: "MVR", serpApiCode: "mv",
    cities: ["Malé"],
    stores: [],
  },
  {
    name: "Mali", code: "ML", flag: "🇲🇱", currency: "XOF", serpApiCode: "ml",
    cities: ["Bamako"],
    stores: [],
  },
  {
    name: "Malta", code: "MT", flag: "🇲🇹", currency: "EUR", serpApiCode: "mt",
    cities: ["Valletta", "Sliema", "St. Julian's"],
    stores: ["Wolt", "Bolt Food"],
  },
  {
    name: "Marshall Islands", code: "MH", flag: "🇲🇭", currency: "USD", serpApiCode: "mh",
    cities: ["Majuro"],
    stores: [],
  },
  {
    name: "Mauritania", code: "MR", flag: "🇲🇷", currency: "MRU", serpApiCode: "mr",
    cities: ["Nouakchott"],
    stores: [],
  },
  {
    name: "Mauritius", code: "MU", flag: "🇲🇺", currency: "MUR", serpApiCode: "mu",
    cities: ["Port Louis"],
    stores: [],
  },
  {
    name: "Mexico", code: "MX", flag: "🇲🇽", currency: "MXN", serpApiCode: "mx",
    cities: ["Mexico City", "Guadalajara", "Monterrey", "Puebla", "Tijuana", "León", "Cancún", "Mérida", "Querétaro", "Chihuahua"],
    stores: ["Amazon MX", "MercadoLibre", "Uber Eats", "Rappi", "DiDi Food", "Walmart MX"],
  },
  {
    name: "Micronesia", code: "FM", flag: "🇫🇲", currency: "USD", serpApiCode: "fm",
    cities: ["Palikir"],
    stores: [],
  },
  {
    name: "Moldova", code: "MD", flag: "🇲🇩", currency: "MDL", serpApiCode: "md",
    cities: ["Chișinău"],
    stores: ["Glovo"],
  },
  {
    name: "Monaco", code: "MC", flag: "🇲🇨", currency: "EUR", serpApiCode: "mc",
    cities: ["Monaco"],
    stores: ["Deliveroo", "Uber Eats"],
  },
  {
    name: "Mongolia", code: "MN", flag: "🇲🇳", currency: "MNT", serpApiCode: "mn",
    cities: ["Ulaanbaatar"],
    stores: [],
  },
  {
    name: "Montenegro", code: "ME", flag: "🇲🇪", currency: "EUR", serpApiCode: "me",
    cities: ["Podgorica", "Budva", "Nikšić"],
    stores: [],
  },
  {
    name: "Morocco", code: "MA", flag: "🇲🇦", currency: "MAD", serpApiCode: "ma",
    cities: ["Casablanca", "Rabat", "Marrakech", "Fes", "Tangier", "Agadir"],
    stores: ["Jumia", "Glovo"],
  },
  {
    name: "Mozambique", code: "MZ", flag: "🇲🇿", currency: "MZN", serpApiCode: "mz",
    cities: ["Maputo", "Beira"],
    stores: [],
  },
  {
    name: "Myanmar", code: "MM", flag: "🇲🇲", currency: "MMK", serpApiCode: "mm",
    cities: ["Yangon", "Mandalay", "Naypyidaw"],
    stores: ["Grab", "Foodpanda"],
  },
  {
    name: "Namibia", code: "NA", flag: "🇳🇦", currency: "NAD", serpApiCode: "na",
    cities: ["Windhoek"],
    stores: [],
  },
  {
    name: "Nauru", code: "NR", flag: "🇳🇷", currency: "AUD", serpApiCode: "nr",
    cities: ["Yaren"],
    stores: [],
  },
  {
    name: "Nepal", code: "NP", flag: "🇳🇵", currency: "NPR", serpApiCode: "np",
    cities: ["Kathmandu", "Pokhara", "Lalitpur"],
    stores: ["Daraz", "Foodmandu"],
  },
  {
    name: "Netherlands", code: "NL", flag: "🇳🇱", currency: "EUR", serpApiCode: "nl",
    cities: ["Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven", "Groningen"],
    stores: ["Amazon NL", "Bol.com", "Coolblue", "Thuisbezorgd", "Uber Eats", "Deliveroo", "Flink"],
  },
  {
    name: "New Zealand", code: "NZ", flag: "🇳🇿", currency: "NZD", serpApiCode: "nz",
    cities: ["Auckland", "Wellington", "Christchurch", "Hamilton", "Tauranga", "Dunedin"],
    stores: ["Amazon", "Mighty Ape", "Uber Eats", "DoorDash", "Menulog"],
  },
  {
    name: "Nicaragua", code: "NI", flag: "🇳🇮", currency: "NIO", serpApiCode: "ni",
    cities: ["Managua"],
    stores: [],
  },
  {
    name: "Niger", code: "NE", flag: "🇳🇪", currency: "XOF", serpApiCode: "ne",
    cities: ["Niamey"],
    stores: [],
  },
  {
    name: "Nigeria", code: "NG", flag: "🇳🇬", currency: "NGN", serpApiCode: "ng",
    cities: ["Lagos", "Abuja", "Kano", "Ibadan", "Port Harcourt", "Benin City"],
    stores: ["Jumia", "Konga", "Bolt Food", "Glovo", "Chowdeck"],
  },
  {
    name: "North Korea", code: "KP", flag: "🇰🇵", currency: "KPW", serpApiCode: "kp",
    cities: ["Pyongyang"],
    stores: [],
  },
  {
    name: "North Macedonia", code: "MK", flag: "🇲🇰", currency: "MKD", serpApiCode: "mk",
    cities: ["Skopje", "Bitola"],
    stores: [],
  },
  {
    name: "Norway", code: "NO", flag: "🇳🇴", currency: "NOK", serpApiCode: "no",
    cities: ["Oslo", "Bergen", "Trondheim", "Stavanger"],
    stores: ["Amazon", "Foodora", "Wolt"],
  },
  {
    name: "Oman", code: "OM", flag: "🇴🇲", currency: "OMR", serpApiCode: "om",
    cities: ["Muscat", "Salalah", "Sohar"],
    stores: ["Talabat", "Careem", "Noon", "Amazon"],
  },
  {
    name: "Pakistan", code: "PK", flag: "🇵🇰", currency: "PKR", serpApiCode: "pk",
    cities: ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar"],
    stores: ["Daraz", "Foodpanda", "Careem"],
  },
  {
    name: "Palau", code: "PW", flag: "🇵🇼", currency: "USD", serpApiCode: "pw",
    cities: ["Ngerulmud"],
    stores: [],
  },
  {
    name: "Palestine", code: "PS", flag: "🇵🇸", currency: "ILS", serpApiCode: "ps",
    cities: ["Ramallah", "Gaza City", "Hebron", "Nablus"],
    stores: [],
  },
  {
    name: "Panama", code: "PA", flag: "🇵🇦", currency: "PAB", serpApiCode: "pa",
    cities: ["Panama City"],
    stores: ["Uber Eats", "PedidosYa"],
  },
  {
    name: "Papua New Guinea", code: "PG", flag: "🇵🇬", currency: "PGK", serpApiCode: "pg",
    cities: ["Port Moresby"],
    stores: [],
  },
  {
    name: "Paraguay", code: "PY", flag: "🇵🇾", currency: "PYG", serpApiCode: "py",
    cities: ["Asunción", "Ciudad del Este"],
    stores: ["PedidosYa"],
  },
  {
    name: "Peru", code: "PE", flag: "🇵🇪", currency: "PEN", serpApiCode: "pe",
    cities: ["Lima", "Arequipa", "Trujillo", "Cusco"],
    stores: ["MercadoLibre", "Rappi", "PedidosYa", "Uber Eats", "Falabella"],
  },
  {
    name: "Philippines", code: "PH", flag: "🇵🇭", currency: "PHP", serpApiCode: "ph",
    cities: ["Manila", "Quezon City", "Cebu City", "Davao", "Makati"],
    stores: ["Shopee PH", "Lazada PH", "Grab", "Foodpanda"],
  },
  {
    name: "Poland", code: "PL", flag: "🇵🇱", currency: "PLN", serpApiCode: "pl",
    cities: ["Warsaw", "Kraków", "Łódź", "Wrocław", "Poznań", "Gdańsk"],
    stores: ["Allegro", "Amazon PL", "Wolt", "Bolt Food", "Glovo", "Pyszne.pl"],
  },
  {
    name: "Portugal", code: "PT", flag: "🇵🇹", currency: "EUR", serpApiCode: "pt",
    cities: ["Lisbon", "Porto", "Braga", "Faro", "Coimbra"],
    stores: ["Amazon ES", "Worten", "Uber Eats", "Glovo", "Bolt Food"],
  },
  {
    name: "Qatar", code: "QA", flag: "🇶🇦", currency: "QAR", serpApiCode: "qa",
    cities: ["Doha", "Al Wakrah", "Al Khor"],
    stores: ["Talabat", "Careem", "Deliveroo", "Noon", "Amazon"],
  },
  {
    name: "Romania", code: "RO", flag: "🇷🇴", currency: "RON", serpApiCode: "ro",
    cities: ["Bucharest", "Cluj-Napoca", "Timișoara", "Iași", "Constanța"],
    stores: ["eMag", "Glovo", "Bolt Food", "Tazz"],
  },
  {
    name: "Russia", code: "RU", flag: "🇷🇺", currency: "RUB", serpApiCode: "ru",
    cities: ["Moscow", "Saint Petersburg", "Novosibirsk", "Yekaterinburg", "Kazan", "Nizhny Novgorod"],
    stores: ["Ozon", "Wildberries", "Yandex Market", "Yandex Lavka", "Delivery Club"],
  },
  {
    name: "Rwanda", code: "RW", flag: "🇷🇼", currency: "RWF", serpApiCode: "rw",
    cities: ["Kigali"],
    stores: ["Bolt Food"],
  },
  {
    name: "Saint Kitts and Nevis", code: "KN", flag: "🇰🇳", currency: "XCD", serpApiCode: "kn",
    cities: ["Basseterre"],
    stores: [],
  },
  {
    name: "Saint Lucia", code: "LC", flag: "🇱🇨", currency: "XCD", serpApiCode: "lc",
    cities: ["Castries"],
    stores: [],
  },
  {
    name: "Saint Vincent", code: "VC", flag: "🇻🇨", currency: "XCD", serpApiCode: "vc",
    cities: ["Kingstown"],
    stores: [],
  },
  {
    name: "Samoa", code: "WS", flag: "🇼🇸", currency: "WST", serpApiCode: "ws",
    cities: ["Apia"],
    stores: [],
  },
  {
    name: "San Marino", code: "SM", flag: "🇸🇲", currency: "EUR", serpApiCode: "sm",
    cities: ["San Marino"],
    stores: [],
  },
  {
    name: "São Tomé and Príncipe", code: "ST", flag: "🇸🇹", currency: "STN", serpApiCode: "st",
    cities: ["São Tomé"],
    stores: [],
  },
  {
    name: "Saudi Arabia", code: "SA", flag: "🇸🇦", currency: "SAR", serpApiCode: "sa",
    cities: ["Riyadh", "Jeddah", "Mecca", "Medina", "Dammam", "Khobar", "Tabuk", "Abha"],
    stores: ["Noon", "Amazon SA", "Jarir", "Talabat", "Careem", "HungerStation", "Namshi"],
  },
  {
    name: "Senegal", code: "SN", flag: "🇸🇳", currency: "XOF", serpApiCode: "sn",
    cities: ["Dakar"],
    stores: ["Jumia"],
  },
  {
    name: "Serbia", code: "RS", flag: "🇷🇸", currency: "RSD", serpApiCode: "rs",
    cities: ["Belgrade", "Novi Sad", "Niš"],
    stores: ["Wolt", "Glovo"],
  },
  {
    name: "Seychelles", code: "SC", flag: "🇸🇨", currency: "SCR", serpApiCode: "sc",
    cities: ["Victoria"],
    stores: [],
  },
  {
    name: "Sierra Leone", code: "SL", flag: "🇸🇱", currency: "SLL", serpApiCode: "sl",
    cities: ["Freetown"],
    stores: [],
  },
  {
    name: "Singapore", code: "SG", flag: "🇸🇬", currency: "SGD", serpApiCode: "sg",
    cities: ["Singapore"],
    stores: ["Amazon SG", "Shopee SG", "Lazada SG", "Grab", "Foodpanda", "Deliveroo"],
  },
  {
    name: "Slovakia", code: "SK", flag: "🇸🇰", currency: "EUR", serpApiCode: "sk",
    cities: ["Bratislava", "Košice"],
    stores: ["Wolt", "Bolt Food"],
  },
  {
    name: "Slovenia", code: "SI", flag: "🇸🇮", currency: "EUR", serpApiCode: "si",
    cities: ["Ljubljana", "Maribor"],
    stores: ["Wolt", "Bolt Food"],
  },
  {
    name: "Solomon Islands", code: "SB", flag: "🇸🇧", currency: "SBD", serpApiCode: "sb",
    cities: ["Honiara"],
    stores: [],
  },
  {
    name: "Somalia", code: "SO", flag: "🇸🇴", currency: "SOS", serpApiCode: "so",
    cities: ["Mogadishu", "Hargeisa"],
    stores: [],
  },
  {
    name: "South Africa", code: "ZA", flag: "🇿🇦", currency: "ZAR", serpApiCode: "za",
    cities: ["Johannesburg", "Cape Town", "Durban", "Pretoria", "Port Elizabeth", "Bloemfontein"],
    stores: ["Takealot", "Amazon", "Uber Eats", "Mr D Food", "Checkers Sixty60"],
  },
  {
    name: "South Korea", code: "KR", flag: "🇰🇷", currency: "KRW", serpApiCode: "kr",
    cities: ["Seoul", "Busan", "Incheon", "Daegu", "Daejeon", "Gwangju", "Ulsan", "Suwon"],
    stores: ["Coupang", "Gmarket", "11st", "Baemin", "Yogiyo"],
  },
  {
    name: "South Sudan", code: "SS", flag: "🇸🇸", currency: "SSP", serpApiCode: "ss",
    cities: ["Juba"],
    stores: [],
  },
  {
    name: "Spain", code: "ES", flag: "🇪🇸", currency: "EUR", serpApiCode: "es",
    cities: ["Madrid", "Barcelona", "Valencia", "Seville", "Bilbao", "Málaga", "Zaragoza", "Palma de Mallorca"],
    stores: ["Amazon ES", "El Corte Inglés", "Glovo", "Uber Eats", "Just Eat", "Deliveroo"],
  },
  {
    name: "Sri Lanka", code: "LK", flag: "🇱🇰", currency: "LKR", serpApiCode: "lk",
    cities: ["Colombo", "Kandy", "Galle"],
    stores: ["Daraz", "Uber Eats", "PickMe Food"],
  },
  {
    name: "Sudan", code: "SD", flag: "🇸🇩", currency: "SDG", serpApiCode: "sd",
    cities: ["Khartoum", "Omdurman"],
    stores: [],
  },
  {
    name: "Suriname", code: "SR", flag: "🇸🇷", currency: "SRD", serpApiCode: "sr",
    cities: ["Paramaribo"],
    stores: [],
  },
  {
    name: "Sweden", code: "SE", flag: "🇸🇪", currency: "SEK", serpApiCode: "se",
    cities: ["Stockholm", "Gothenburg", "Malmö", "Uppsala"],
    stores: ["Amazon SE", "CDON", "Foodora", "Wolt", "Uber Eats"],
  },
  {
    name: "Switzerland", code: "CH", flag: "🇨🇭", currency: "CHF", serpApiCode: "ch",
    cities: ["Zurich", "Geneva", "Basel", "Bern", "Lausanne"],
    stores: ["Amazon", "Digitec", "Galaxus", "Uber Eats", "Eat.ch"],
  },
  {
    name: "Syria", code: "SY", flag: "🇸🇾", currency: "SYP", serpApiCode: "sy",
    cities: ["Damascus", "Aleppo", "Homs"],
    stores: [],
  },
  {
    name: "Taiwan", code: "TW", flag: "🇹🇼", currency: "TWD", serpApiCode: "tw",
    cities: ["Taipei", "Kaohsiung", "Taichung", "Tainan", "Hsinchu"],
    stores: ["Shopee TW", "Momo", "PChome", "Uber Eats", "Foodpanda"],
  },
  {
    name: "Tajikistan", code: "TJ", flag: "🇹🇯", currency: "TJS", serpApiCode: "tj",
    cities: ["Dushanbe"],
    stores: [],
  },
  {
    name: "Tanzania", code: "TZ", flag: "🇹🇿", currency: "TZS", serpApiCode: "tz",
    cities: ["Dar es Salaam", "Dodoma", "Zanzibar City", "Mwanza"],
    stores: ["Jumia", "Bolt Food"],
  },
  {
    name: "Thailand", code: "TH", flag: "🇹🇭", currency: "THB", serpApiCode: "th",
    cities: ["Bangkok", "Chiang Mai", "Pattaya", "Phuket", "Hat Yai", "Nonthaburi"],
    stores: ["Shopee TH", "Lazada TH", "Grab", "Foodpanda", "Line Man"],
  },
  {
    name: "Togo", code: "TG", flag: "🇹🇬", currency: "XOF", serpApiCode: "tg",
    cities: ["Lomé"],
    stores: [],
  },
  {
    name: "Tonga", code: "TO", flag: "🇹🇴", currency: "TOP", serpApiCode: "to",
    cities: ["Nukuʻalofa"],
    stores: [],
  },
  {
    name: "Trinidad and Tobago", code: "TT", flag: "🇹🇹", currency: "TTD", serpApiCode: "tt",
    cities: ["Port of Spain", "San Fernando"],
    stores: [],
  },
  {
    name: "Tunisia", code: "TN", flag: "🇹🇳", currency: "TND", serpApiCode: "tn",
    cities: ["Tunis", "Sfax", "Sousse"],
    stores: ["Jumia", "Glovo"],
  },
  {
    name: "Turkey", code: "TR", flag: "🇹🇷", currency: "TRY", serpApiCode: "tr",
    cities: ["Istanbul", "Ankara", "Izmir", "Bursa", "Antalya", "Adana", "Konya"],
    stores: ["Trendyol", "Hepsiburada", "Amazon TR", "Yemeksepeti", "Getir"],
  },
  {
    name: "Turkmenistan", code: "TM", flag: "🇹🇲", currency: "TMT", serpApiCode: "tm",
    cities: ["Ashgabat"],
    stores: [],
  },
  {
    name: "Tuvalu", code: "TV", flag: "🇹🇻", currency: "AUD", serpApiCode: "tv",
    cities: ["Funafuti"],
    stores: [],
  },
  {
    name: "Uganda", code: "UG", flag: "🇺🇬", currency: "UGX", serpApiCode: "ug",
    cities: ["Kampala", "Entebbe"],
    stores: ["Jumia", "Bolt Food", "Glovo"],
  },
  {
    name: "Ukraine", code: "UA", flag: "🇺🇦", currency: "UAH", serpApiCode: "ua",
    cities: ["Kyiv", "Kharkiv", "Odessa", "Dnipro", "Lviv"],
    stores: ["Rozetka", "Glovo", "Bolt Food"],
  },
  {
    name: "United Arab Emirates", code: "AE", flag: "🇦🇪", currency: "AED", serpApiCode: "ae",
    cities: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Al Ain"],
    stores: ["Noon", "Amazon AE", "Namshi", "Talabat", "Deliveroo", "Careem", "Uber Eats", "Zomato", "InstaShop"],
  },
  {
    name: "United Kingdom", code: "GB", flag: "🇬🇧", currency: "GBP", serpApiCode: "uk",
    cities: ["London", "Manchester", "Birmingham", "Leeds", "Glasgow", "Liverpool", "Bristol", "Edinburgh", "Cardiff", "Belfast", "Sheffield", "Newcastle"],
    stores: ["Amazon UK", "Argos", "Currys", "John Lewis", "Deliveroo", "Uber Eats", "Just Eat", "Ocado"],
  },
  {
    name: "United States", code: "US", flag: "🇺🇸", currency: "USD", serpApiCode: "us",
    cities: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose", "Austin", "Jacksonville", "San Francisco", "Seattle", "Denver", "Washington DC", "Nashville", "Boston", "Portland", "Las Vegas", "Miami", "Atlanta", "Orlando", "Minneapolis", "Tampa", "Detroit", "Charlotte", "Salt Lake City", "New Orleans", "Honolulu"],
    stores: ["Amazon", "Walmart", "Target", "Best Buy", "Costco", "Uber Eats", "DoorDash", "Grubhub", "Instacart", "eBay"],
  },
  {
    name: "Uruguay", code: "UY", flag: "🇺🇾", currency: "UYU", serpApiCode: "uy",
    cities: ["Montevideo"],
    stores: ["MercadoLibre", "PedidosYa", "Rappi"],
  },
  {
    name: "Uzbekistan", code: "UZ", flag: "🇺🇿", currency: "UZS", serpApiCode: "uz",
    cities: ["Tashkent", "Samarkand", "Bukhara"],
    stores: [],
  },
  {
    name: "Vanuatu", code: "VU", flag: "🇻🇺", currency: "VUV", serpApiCode: "vu",
    cities: ["Port Vila"],
    stores: [],
  },
  {
    name: "Vatican City", code: "VA", flag: "🇻🇦", currency: "EUR", serpApiCode: "va",
    cities: ["Vatican City"],
    stores: [],
  },
  {
    name: "Venezuela", code: "VE", flag: "🇻🇪", currency: "VES", serpApiCode: "ve",
    cities: ["Caracas", "Maracaibo", "Valencia", "Barquisimeto"],
    stores: [],
  },
  {
    name: "Vietnam", code: "VN", flag: "🇻🇳", currency: "VND", serpApiCode: "vn",
    cities: ["Ho Chi Minh City", "Hanoi", "Da Nang", "Hai Phong", "Can Tho"],
    stores: ["Shopee VN", "Lazada VN", "Tiki", "Grab", "ShopeeFood"],
  },
  {
    name: "Yemen", code: "YE", flag: "🇾🇪", currency: "YER", serpApiCode: "ye",
    cities: ["Sana'a", "Aden"],
    stores: [],
  },
  {
    name: "Zambia", code: "ZM", flag: "🇿🇲", currency: "ZMW", serpApiCode: "zm",
    cities: ["Lusaka", "Ndola", "Kitwe"],
    stores: [],
  },
  {
    name: "Zimbabwe", code: "ZW", flag: "🇿🇼", currency: "ZWL", serpApiCode: "zw",
    cities: ["Harare", "Bulawayo"],
    stores: [],
  },
];

export function getCountryByCode(code: string): CountryData | undefined {
  return COUNTRIES.find((c) => c.code === code);
}

export function getCountryByName(name: string): CountryData | undefined {
  return COUNTRIES.find((c) => c.name.toLowerCase() === name.toLowerCase());
}

export function getCurrencyByCode(code: string): CurrencyData | undefined {
  return CURRENCIES.find((c) => c.code === code);
}

export function getCurrencySymbol(code: string): string {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? code;
}

export function formatPrice(amount: number, currencyCode: string): string {
  const currency = getCurrencyByCode(currencyCode);
  if (!currency) return `${currencyCode} ${amount.toFixed(2)}`;

  const noDecimalCurrencies = ["JPY", "KRW", "VND", "IDR", "HUF", "CLP", "PYG", "UGX", "KMF", "BIF", "RWF", "DJF", "GNF", "VUV", "XOF", "XAF", "XPF"];
  const decimals = noDecimalCurrencies.includes(currencyCode) ? 0 : 2;

  return `${currency.symbol}${amount.toFixed(decimals)}`;
}

export const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.5,
  AUD: 1.53,
  CAD: 1.36,
  CHF: 0.88,
  CNY: 7.24,
  SEK: 10.45,
  NZD: 1.67,
  MXN: 17.15,
  SGD: 1.34,
  HKD: 7.82,
  NOK: 10.55,
  KRW: 1320,
  TRY: 32.5,
  INR: 83.4,
  RUB: 92,
  BRL: 4.97,
  ZAR: 18.6,
  TWD: 31.5,
  DKK: 6.88,
  PLN: 4.02,
  THB: 35.8,
  IDR: 15700,
  HUF: 358,
  CZK: 23.2,
  ILS: 3.65,
  CLP: 940,
  PHP: 56.5,
  AED: 3.67,
  COP: 3950,
  SAR: 3.75,
  MYR: 4.72,
  RON: 4.58,
  ARS: 870,
  BGN: 1.80,
  PEN: 3.72,
  PKR: 278,
  EGP: 30.9,
  NGN: 1550,
  BDT: 110,
  VND: 24500,
  UAH: 38.5,
  KES: 155,
  QAR: 3.64,
  KWD: 0.31,
  BHD: 0.376,
  OMR: 0.385,
  JOD: 0.709,
  LBP: 89500,
  MAD: 10.1,
  TND: 3.12,
  GHS: 15.2,
  TZS: 2510,
  UGX: 3800,
  ETB: 56.8,
  RWF: 1270,
  XOF: 605,
  XAF: 605,
  LKR: 320,
  NPR: 133,
  GEL: 2.68,
  KZT: 460,
  ISK: 137,
  DOP: 58.5,
  CRC: 520,
  GTQ: 7.82,
  UYU: 39.5,
  BOB: 6.91,
  PYG: 7350,
  TTD: 6.79,
  JMD: 155,
  MNT: 3420,
  IQD: 1310,
  DZD: 135,
  ZMW: 26.5,
  MZN: 63.8,
  AOA: 835,
  BWP: 13.6,
  NAD: 18.6,
  MGA: 4500,
  FJD: 2.23,
  MUR: 44.5,
  MVR: 15.42,
  BND: 1.34,
  IRR: 42000,
  YER: 250,
  AFN: 69.5,
  SYP: 13000,
  MMK: 2100,
  KHR: 4100,
  LAK: 20500,
  VES: 36.5,
};

export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
  if (fromCurrency === toCurrency) return amount;

  const fromRate = EXCHANGE_RATES[fromCurrency] ?? 1;
  const toRate = EXCHANGE_RATES[toCurrency] ?? 1;

  const usdAmount = amount / fromRate;
  return usdAmount * toRate;
}
