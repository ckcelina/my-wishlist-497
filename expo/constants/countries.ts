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
    stores: ["AliExpress", "Amazon", "Bamyan Online", "eBay"],
  },
  {
    name: "Albania", code: "AL", flag: "🇦🇱", currency: "ALL", serpApiCode: "al",
    cities: ["Tirana", "Durrës", "Vlorë", "Elbasan", "Shkodër"],
    stores: ["Merrjep", "Neptun", "Gjirafa50", "AliExpress", "eBay", "Mediamarket AL", "iStyle", "Techno AL"],
  },
  {
    name: "Algeria", code: "DZ", flag: "🇩🇿", currency: "DZD", serpApiCode: "dz",
    cities: ["Algiers", "Oran", "Constantine", "Annaba", "Blida"],
    stores: ["Jumia", "Ouedkniss", "EchriBuy", "AliExpress", "Lablob", "Batolis", "eBay"],
  },
  {
    name: "Andorra", code: "AD", flag: "🇦🇩", currency: "EUR", serpApiCode: "ad",
    cities: ["Andorra la Vella", "Escaldes-Engordany"],
    stores: ["Amazon", "Amazon ES", "El Corte Inglés", "AliExpress", "eBay", "Pyrénées Andorra"],
  },
  {
    name: "Angola", code: "AO", flag: "🇦🇴", currency: "AOA", serpApiCode: "ao",
    cities: ["Luanda", "Huambo", "Lobito", "Benguela", "Cabinda"],
    stores: ["Bayqi", "Mercado Angolano", "AliExpress", "Shoprite", "Game Stores", "Pick n Pay"],
  },
  {
    name: "Antigua and Barbuda", code: "AG", flag: "🇦🇬", currency: "XCD", serpApiCode: "ag",
    cities: ["St. John's"],
    stores: ["Amazon", "eBay", "AliExpress", "Courts"],
  },
  {
    name: "Argentina", code: "AR", flag: "🇦🇷", currency: "ARS", serpApiCode: "ar",
    cities: ["Buenos Aires", "Córdoba", "Rosario", "Mendoza", "La Plata", "San Miguel de Tucumán", "Mar del Plata", "Salta"],
    stores: ["MercadoLibre", "Amazon", "Garbarino", "Frávega", "Rappi", "PedidosYa", "Uber Eats", "Tienda Nube", "Farmacity", "Musimundo", "Megatone", "Coto Digital", "Carrefour AR", "Jumbo AR", "Dafiti", "Dexter", "Netshoes AR", "Falabella AR", "Sodimac AR", "Easy AR", "iPoint", "MacStation", "Compumundo"],
  },
  {
    name: "Armenia", code: "AM", flag: "🇦🇲", currency: "AMD", serpApiCode: "am",
    cities: ["Yerevan", "Gyumri", "Vanadzor"],
    stores: ["Wildberries", "SAS", "Menu.am", "Glovo", "Bolt Food", "AliExpress", "List.am", "VLV Electronics", "Zigzag"],
  },
  {
    name: "Australia", code: "AU", flag: "🇦🇺", currency: "AUD", serpApiCode: "au",
    cities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast", "Canberra", "Newcastle", "Hobart", "Darwin"],
    stores: ["Amazon AU", "eBay AU", "Kogan", "JB Hi-Fi", "Uber Eats", "DoorDash", "Menulog", "Woolworths", "Coles", "Bunnings", "Officeworks", "Big W", "The Good Guys", "Harvey Norman", "Catch", "MyDeal", "Chemist Warehouse", "Target AU", "Myer", "David Jones", "Kmart AU", "Dan Murphy's", "BWS", "Iconic", "ASOS AU", "Adore Beauty", "Priceline", "Pet Circle", "Temple & Webster", "Apple AU", "Dell AU", "Lenovo AU", "Samsung AU", "Microsoft AU", "Rebel Sport", "BCF", "Supercheap Auto", "Booktopia"],
  },
  {
    name: "Austria", code: "AT", flag: "🇦🇹", currency: "EUR", serpApiCode: "at",
    cities: ["Vienna", "Graz", "Linz", "Salzburg", "Innsbruck"],
    stores: ["Amazon DE", "MediaMarkt", "Lieferando", "Mjam", "Wolt", "BILLA", "Interspar", "Saturn", "Thalia", "Universal", "Zalando", "OTTO", "Geizhals", "E-Tec", "Cyberport", "Libro", "Müller", "dm AT", "IKEA AT", "XXXLutz", "Möbelix", "Hartlauer"],
  },
  {
    name: "Azerbaijan", code: "AZ", flag: "🇦🇿", currency: "AZN", serpApiCode: "az",
    cities: ["Baku", "Ganja", "Sumgait"],
    stores: ["Bolt Food", "Wolt", "Tap.az", "Umico", "AliExpress", "Baku Electronics", "Kontakt Home", "Irshad Electronics", "Bravo Supermarket"],
  },
  {
    name: "Bahamas", code: "BS", flag: "🇧🇸", currency: "BSD", serpApiCode: "bs",
    cities: ["Nassau", "Freeport"],
    stores: ["Amazon", "eBay", "AliExpress", "John S George", "Robin Hood", "Super Value"],
  },
  {
    name: "Bahrain", code: "BH", flag: "🇧🇭", currency: "BHD", serpApiCode: "bh",
    cities: ["Manama", "Riffa", "Muharraq"],
    stores: ["Talabat", "Careem", "Noon", "Amazon", "Deliveroo", "LuLu Hypermarket", "Jasmi's", "Trolley", "Sharaf DG", "Extra Stores", "Jarir Bookstore", "Virgin Megastore", "Namshi", "Shein", "AliExpress"],
  },
  {
    name: "Bangladesh", code: "BD", flag: "🇧🇩", currency: "BDT", serpApiCode: "bd",
    cities: ["Dhaka", "Chittagong", "Khulna", "Rajshahi", "Sylhet"],
    stores: ["Daraz", "Foodpanda", "Chaldal", "Pickaboo", "Evaly", "Rokomari", "AjkerDeal", "Othoba", "PriyoShop", "Shajgoj", "Star Tech", "Ryans Computers", "AliExpress"],
  },
  {
    name: "Barbados", code: "BB", flag: "🇧🇧", currency: "BBD", serpApiCode: "bb",
    cities: ["Bridgetown"],
    stores: ["Amazon", "eBay", "AliExpress", "Courts", "Massy Stores"],
  },
  {
    name: "Belarus", code: "BY", flag: "🇧🇾", currency: "BYN", serpApiCode: "by",
    cities: ["Minsk", "Gomel", "Mogilev", "Vitebsk"],
    stores: ["Wildberries", "21vek.by", "Onliner", "Deal.by", "Kufar", "AliExpress", "Ozon", "Lamoda BY", "Elektrosila", "5 Element", "Shop.by"],
  },
  {
    name: "Belgium", code: "BE", flag: "🇧🇪", currency: "EUR", serpApiCode: "be",
    cities: ["Brussels", "Antwerp", "Ghent", "Charleroi", "Liège", "Bruges"],
    stores: ["Amazon", "Bol.com", "Deliveroo", "Uber Eats", "Takeaway", "Coolblue", "MediaMarkt", "Zalando", "Fnac", "Colruyt", "Delhaize", "Carrefour", "IKEA BE", "Action", "Krëfel", "Vanden Borre", "Torfs", "JBC", "AS Adventure", "HEMA BE", "Dreamland", "Brico", "Hubo"],
  },
  {
    name: "Belize", code: "BZ", flag: "🇧🇿", currency: "BZD", serpApiCode: "bz",
    cities: ["Belize City", "Belmopan"],
    stores: ["Amazon", "eBay", "AliExpress", "Courts Belize"],
  },
  {
    name: "Benin", code: "BJ", flag: "🇧🇯", currency: "XOF", serpApiCode: "bj",
    cities: ["Cotonou", "Porto-Novo"],
    stores: ["Jumia", "Gozem", "AliExpress", "Afrimarket"],
  },
  {
    name: "Bhutan", code: "BT", flag: "🇧🇹", currency: "BTN", serpApiCode: "bt",
    cities: ["Thimphu", "Phuntsholing"],
    stores: ["Amazon IN", "Flipkart", "AliExpress", "Daraz"],
  },
  {
    name: "Bolivia", code: "BO", flag: "🇧🇴", currency: "BOB", serpApiCode: "bo",
    cities: ["La Paz", "Santa Cruz", "Cochabamba", "Sucre"],
    stores: ["Yaigo", "PedidosYa", "MercadoLibre", "AliExpress", "OLX Bolivia", "Multicenter"],
  },
  {
    name: "Bosnia and Herzegovina", code: "BA", flag: "🇧🇦", currency: "BAM", serpApiCode: "ba",
    cities: ["Sarajevo", "Banja Luka", "Tuzla", "Mostar"],
    stores: ["OLX", "Konzum", "Glovo", "Wolt", "AliExpress", "eBay", "Emmezeta", "Amko Komerc", "Robot", "Imtec"],
  },
  {
    name: "Botswana", code: "BW", flag: "🇧🇼", currency: "BWP", serpApiCode: "bw",
    cities: ["Gaborone", "Francistown"],
    stores: ["Takealot", "Checkers", "Game Stores", "Pick n Pay", "Shoprite", "AliExpress", "Mr Price"],
  },
  {
    name: "Brazil", code: "BR", flag: "🇧🇷", currency: "BRL", serpApiCode: "br",
    cities: ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza", "Belo Horizonte", "Manaus", "Curitiba", "Recife", "Porto Alegre"],
    stores: ["Amazon BR", "MercadoLibre", "iFood", "Rappi", "Uber Eats", "Magazine Luiza", "Americanas", "Casas Bahia", "Shopee BR", "AliExpress", "Submarino", "Extra", "Ponto Frio", "Netshoes", "Dafiti", "Kabum", "Pão de Açúcar", "Carrefour BR", "Centauro", "C&A BR", "Renner", "Riachuelo", "Havan", "Leroy Merlin BR", "Samsung BR", "Apple BR", "Dell BR", "Lenovo BR", "Fast Shop", "Natura", "O Boticário", "Zattini"],
  },
  {
    name: "Brunei", code: "BN", flag: "🇧🇳", currency: "BND", serpApiCode: "bn",
    cities: ["Bandar Seri Begawan"],
    stores: ["Shopee", "Lazada", "AliExpress", "Amazon SG", "Hua Ho", "Soon Lee"],
  },
  {
    name: "Bulgaria", code: "BG", flag: "🇧🇬", currency: "BGN", serpApiCode: "bg",
    cities: ["Sofia", "Plovdiv", "Varna", "Burgas"],
    stores: ["eMag", "Foodpanda", "Glovo", "Wolt", "Bolt Food", "Technopolis", "Pazaruvaj", "AliExpress", "OLX BG", "Technomarket", "Zora", "dm BG", "Kaufland BG", "Lidl BG", "Billa BG"],
  },
  {
    name: "Burkina Faso", code: "BF", flag: "🇧🇫", currency: "XOF", serpApiCode: "bf",
    cities: ["Ouagadougou", "Bobo-Dioulasso"],
    stores: ["Jumia", "Gozem", "AliExpress"],
  },
  {
    name: "Burundi", code: "BI", flag: "🇧🇮", currency: "BIF", serpApiCode: "bi",
    cities: ["Bujumbura", "Gitega"],
    stores: ["Jumia", "AliExpress"],
  },
  {
    name: "Cambodia", code: "KH", flag: "🇰🇭", currency: "KHR", serpApiCode: "kh",
    cities: ["Phnom Penh", "Siem Reap", "Battambang"],
    stores: ["Foodpanda", "Grab", "Shopee", "Lazada", "Nham24", "AliExpress", "Amazon", "Little Fashion", "Khmer24"],
  },
  {
    name: "Cameroon", code: "CM", flag: "🇨🇲", currency: "XAF", serpApiCode: "cm",
    cities: ["Douala", "Yaoundé", "Bamenda"],
    stores: ["Jumia", "Glovo", "AliExpress", "Afrimarket", "Supermarché Casino"],
  },
  {
    name: "Canada", code: "CA", flag: "🇨🇦", currency: "CAD", serpApiCode: "ca",
    cities: ["Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton", "Ottawa", "Winnipeg", "Quebec City", "Hamilton", "Halifax"],
    stores: ["Amazon CA", "Walmart CA", "Best Buy CA", "Uber Eats", "DoorDash", "Skip The Dishes", "Canadian Tire", "Costco CA", "Home Depot CA", "Loblaws", "Shoppers Drug Mart", "The Bay", "Staples CA", "Indigo", "Sport Chek", "MEC", "London Drugs", "IKEA CA", "Apple CA", "Dell CA", "Lenovo CA", "Samsung CA", "Microsoft CA", "Newegg CA", "eBay CA", "Etsy", "Wayfair CA", "SSENSE", "Sephora CA", "Lululemon", "Roots", "Aritzia", "Simons", "Rona", "Metro", "Sobeys", "No Frills", "Real Canadian Superstore", "Instacart CA", "Well.ca"],
  },
  {
    name: "Cape Verde", code: "CV", flag: "🇨🇻", currency: "CVE", serpApiCode: "cv",
    cities: ["Praia"],
    stores: ["Amazon", "AliExpress", "eBay"],
  },
  {
    name: "Central African Republic", code: "CF", flag: "🇨🇫", currency: "XAF", serpApiCode: "cf",
    cities: ["Bangui"],
    stores: ["AliExpress"],
  },
  {
    name: "Chad", code: "TD", flag: "🇹🇩", currency: "XAF", serpApiCode: "td",
    cities: ["N'Djamena"],
    stores: ["AliExpress"],
  },
  {
    name: "Chile", code: "CL", flag: "🇨🇱", currency: "CLP", serpApiCode: "cl",
    cities: ["Santiago", "Valparaíso", "Concepción", "La Serena", "Antofagasta"],
    stores: ["MercadoLibre", "Falabella", "Rappi", "Uber Eats", "PedidosYa", "Lider", "Paris", "Ripley", "Sodimac", "Jumbo", "Cornershop", "Amazon", "AliExpress", "Hites", "ABCDin", "PCFactory", "SP Digital", "Linio CL", "Dafiti CL", "Shopee CL", "Easy CL", "Cencosud", "Santa Isabel", "Tottus CL"],
  },
  {
    name: "China", code: "CN", flag: "🇨🇳", currency: "CNY", serpApiCode: "cn",
    cities: ["Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Chengdu", "Hangzhou", "Wuhan", "Nanjing", "Xi'an", "Chongqing", "Tianjin", "Suzhou"],
    stores: ["Taobao", "JD.com", "Tmall", "Pinduoduo", "Meituan", "Ele.me", "Douyin Mall", "Suning", "Vipshop", "Xiaomi Store", "Dangdang", "NetEase Kaola", "AliExpress", "Amazon CN", "Dewu", "Xianyu", "RED (Xiaohongshu)", "WeChat Store", "Kuaishou Shop", "Gome", "Hema", "Dingdong Maicai"],
  },
  {
    name: "Colombia", code: "CO", flag: "🇨🇴", currency: "COP", serpApiCode: "co",
    cities: ["Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena"],
    stores: ["MercadoLibre", "Rappi", "Uber Eats", "Falabella", "Éxito", "Linio", "Alkosto", "Dafiti", "iFood CO", "Amazon", "AliExpress", "Homecenter", "Jumbo CO", "Ktronix", "Mac Center", "Panamericana", "Shopee CO", "Olímpica", "Carulla"],
  },
  {
    name: "Comoros", code: "KM", flag: "🇰🇲", currency: "KMF", serpApiCode: "km",
    cities: ["Moroni"],
    stores: ["AliExpress"],
  },
  {
    name: "Congo (DRC)", code: "CD", flag: "🇨🇩", currency: "CDF", serpApiCode: "cd",
    cities: ["Kinshasa", "Lubumbashi", "Mbuji-Mayi"],
    stores: ["AliExpress", "Jumia"],
  },
  {
    name: "Congo (Republic)", code: "CG", flag: "🇨🇬", currency: "XAF", serpApiCode: "cg",
    cities: ["Brazzaville", "Pointe-Noire"],
    stores: ["AliExpress"],
  },
  {
    name: "Costa Rica", code: "CR", flag: "🇨🇷", currency: "CRC", serpApiCode: "cr",
    cities: ["San José", "Alajuela", "Cartago"],
    stores: ["Uber Eats", "Rappi", "Amazon", "AliExpress", "PedidosYa", "Walmart CR", "AutoMercado", "Pricesmart CR"],
  },
  {
    name: "Croatia", code: "HR", flag: "🇭🇷", currency: "EUR", serpApiCode: "hr",
    cities: ["Zagreb", "Split", "Rijeka", "Osijek", "Dubrovnik"],
    stores: ["Glovo", "Wolt", "Bolt Food", "Amazon DE", "eBay", "AliExpress", "eKupi", "Sancta Domenica", "HGspot", "Links", "Konzum", "Kaufland HR", "Lidl HR", "Spar HR", "dm HR", "Müller HR", "IKEA HR", "Emmezeta"],
  },
  {
    name: "Cuba", code: "CU", flag: "🇨🇺", currency: "CUP", serpApiCode: "cu",
    cities: ["Havana", "Santiago de Cuba"],
    stores: ["AliExpress"],
  },
  {
    name: "Cyprus", code: "CY", flag: "🇨🇾", currency: "EUR", serpApiCode: "cy",
    cities: ["Nicosia", "Limassol", "Larnaca", "Paphos"],
    stores: ["Wolt", "Bolt Food", "Amazon", "eBay", "AliExpress", "Skroutz CY", "Public CY", "Electroline", "Jumbo CY", "Alphamega"],
  },
  {
    name: "Czech Republic", code: "CZ", flag: "🇨🇿", currency: "CZK", serpApiCode: "cz",
    cities: ["Prague", "Brno", "Ostrava", "Plzeň"],
    stores: ["Alza.cz", "Mall.cz", "Wolt", "Bolt Food", "Rohlik", "Amazon DE", "AliExpress", "CZC.cz", "Heureka", "Notino", "Datart", "Electro World", "IKEA CZ", "Lidl CZ", "Kaufland CZ", "dm CZ", "Lékárna.cz", "Košík.cz"],
  },
  {
    name: "Denmark", code: "DK", flag: "🇩🇰", currency: "DKK", serpApiCode: "dk",
    cities: ["Copenhagen", "Aarhus", "Odense", "Aalborg"],
    stores: ["Amazon", "Wolt", "Just Eat", "Nemlig", "eBay", "AliExpress", "Elgiganten DK", "Power DK", "Proshop", "Komplett DK", "Bilka", "Føtex", "COOP DK", "Matas", "IKEA DK", "Zalando DK", "Saxo", "Coolshop"],
  },
  {
    name: "Djibouti", code: "DJ", flag: "🇩🇯", currency: "DJF", serpApiCode: "dj",
    cities: ["Djibouti City"],
    stores: ["AliExpress"],
  },
  {
    name: "Dominica", code: "DM", flag: "🇩🇲", currency: "XCD", serpApiCode: "dm",
    cities: ["Roseau"],
    stores: ["Amazon", "AliExpress"],
  },
  {
    name: "Dominican Republic", code: "DO", flag: "🇩🇴", currency: "DOP", serpApiCode: "do",
    cities: ["Santo Domingo", "Santiago de los Caballeros"],
    stores: ["PedidosYa", "Uber Eats", "Amazon", "AliExpress", "MercadoLibre RD", "Plaza Lama"],
  },
  {
    name: "East Timor", code: "TL", flag: "🇹🇱", currency: "USD", serpApiCode: "tl",
    cities: ["Dili"],
    stores: ["AliExpress"],
  },
  {
    name: "Ecuador", code: "EC", flag: "🇪🇨", currency: "USD", serpApiCode: "ec",
    cities: ["Quito", "Guayaquil", "Cuenca"],
    stores: ["Rappi", "Uber Eats", "PedidosYa", "Amazon", "AliExpress", "MercadoLibre EC", "De Prati", "Supermaxi", "Coral"],
  },
  {
    name: "Egypt", code: "EG", flag: "🇪🇬", currency: "EGP", serpApiCode: "eg",
    cities: ["Cairo", "Alexandria", "Giza", "Sharm El Sheikh", "Luxor", "Aswan", "Hurghada"],
    stores: ["Amazon EG", "Noon", "Talabat", "Elmenus", "Jumia", "AliExpress", "B.TECH", "2B", "Raya Shop", "Virgin Megastore EG", "Carrefour EG", "Spinneys EG", "Breadfast", "Shein EG"],
  },
  {
    name: "El Salvador", code: "SV", flag: "🇸🇻", currency: "USD", serpApiCode: "sv",
    cities: ["San Salvador"],
    stores: ["Uber Eats", "Hugo", "Amazon", "AliExpress", "PedidosYa"],
  },
  {
    name: "Equatorial Guinea", code: "GQ", flag: "🇬🇶", currency: "XAF", serpApiCode: "gq",
    cities: ["Malabo"],
    stores: ["AliExpress"],
  },
  {
    name: "Eritrea", code: "ER", flag: "🇪🇷", currency: "ERN", serpApiCode: "er",
    cities: ["Asmara"],
    stores: ["AliExpress"],
  },
  {
    name: "Estonia", code: "EE", flag: "🇪🇪", currency: "EUR", serpApiCode: "ee",
    cities: ["Tallinn", "Tartu"],
    stores: ["Bolt Food", "Wolt", "Barbora", "Amazon", "AliExpress", "eBay", "Kaup24", "Pigu", "Hansapost", "Selver", "Rimi EE", "IKEA"],
  },
  {
    name: "Eswatini", code: "SZ", flag: "🇸🇿", currency: "SZL", serpApiCode: "sz",
    cities: ["Mbabane", "Manzini"],
    stores: ["AliExpress", "Shoprite", "Pick n Pay", "Game Stores"],
  },
  {
    name: "Ethiopia", code: "ET", flag: "🇪🇹", currency: "ETB", serpApiCode: "et",
    cities: ["Addis Ababa", "Dire Dawa", "Mekelle"],
    stores: ["Deliver Addis", "AliExpress", "Shega", "Eshi Express"],
  },
  {
    name: "Fiji", code: "FJ", flag: "🇫🇯", currency: "FJD", serpApiCode: "fj",
    cities: ["Suva", "Nadi"],
    stores: ["AliExpress", "Amazon AU", "Courts Fiji"],
  },
  {
    name: "Finland", code: "FI", flag: "🇫🇮", currency: "EUR", serpApiCode: "fi",
    cities: ["Helsinki", "Espoo", "Tampere", "Turku", "Oulu"],
    stores: ["Amazon", "Wolt", "Foodora", "Verkkokauppa", "AliExpress", "eBay", "Gigantti", "Power FI", "Prisma", "S-Market", "K-Market", "Tokmanni", "Clas Ohlson FI", "Zalando FI", "IKEA FI", "XXL FI", "K-Ruoka"],
  },
  {
    name: "France", code: "FR", flag: "🇫🇷", currency: "EUR", serpApiCode: "fr",
    cities: ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg", "Bordeaux", "Lille", "Montpellier"],
    stores: ["Amazon FR", "Fnac", "Deliveroo", "Uber Eats", "Just Eat", "Cdiscount", "AliExpress", "eBay FR", "Darty", "Boulanger", "Leroy Merlin", "Decathlon FR", "Carrefour FR", "Auchan", "Leclerc", "LDLC", "Rue du Commerce", "ManoMano", "Veepee", "Zalando FR", "La Redoute", "IKEA FR", "Sephora FR", "Intermarché", "Monoprix", "Picard"],
  },
  {
    name: "Gabon", code: "GA", flag: "🇬🇦", currency: "XAF", serpApiCode: "ga",
    cities: ["Libreville"],
    stores: ["AliExpress", "Jumia"],
  },
  {
    name: "Gambia", code: "GM", flag: "🇬🇲", currency: "GMD", serpApiCode: "gm",
    cities: ["Banjul"],
    stores: ["AliExpress"],
  },
  {
    name: "Georgia", code: "GE", flag: "🇬🇪", currency: "GEL", serpApiCode: "ge",
    cities: ["Tbilisi", "Batumi", "Kutaisi"],
    stores: ["Glovo", "Bolt Food", "Wolt", "AliExpress", "Amazon", "Zoommer", "Extra.ge", "Mymarket.ge"],
  },
  {
    name: "Germany", code: "DE", flag: "🇩🇪", currency: "EUR", serpApiCode: "de",
    cities: ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne", "Stuttgart", "Düsseldorf", "Leipzig", "Dortmund", "Dresden"],
    stores: ["Amazon DE", "MediaMarkt", "Saturn", "Lieferando", "Wolt", "Uber Eats", "Flink", "Gorillas", "eBay DE", "AliExpress", "OTTO", "Zalando DE", "Cyberport", "Notebooksbilliger", "Thomann", "Alternate", "Mindfactory", "IKEA DE", "Lidl DE", "ALDI DE", "REWE", "dm DE", "Rossmann", "Müller DE", "Decathlon DE", "Douglas", "Thalia DE", "Galeria"],
  },
  {
    name: "Ghana", code: "GH", flag: "🇬🇭", currency: "GHS", serpApiCode: "gh",
    cities: ["Accra", "Kumasi", "Tamale", "Takoradi"],
    stores: ["Jumia", "Bolt Food", "Glovo", "AliExpress", "Tonaton", "Melcom", "CompuGhana", "Shoprite GH", "Game Stores GH"],
  },
  {
    name: "Greece", code: "GR", flag: "🇬🇷", currency: "EUR", serpApiCode: "gr",
    cities: ["Athens", "Thessaloniki", "Patras", "Heraklion", "Larissa"],
    stores: ["Skroutz", "e-food", "Wolt", "Bolt Food", "Amazon", "AliExpress", "eBay", "Public", "Plaisio", "Kotsovolos", "MediaMarkt GR", "AB Vasilopoulos", "Sklavenitis", "My Market GR", "IKEA GR", "Hondos Center"],
  },
  {
    name: "Grenada", code: "GD", flag: "🇬🇩", currency: "XCD", serpApiCode: "gd",
    cities: ["St. George's"],
    stores: ["Amazon", "AliExpress"],
  },
  {
    name: "Guatemala", code: "GT", flag: "🇬🇹", currency: "GTQ", serpApiCode: "gt",
    cities: ["Guatemala City", "Quetzaltenango"],
    stores: ["Uber Eats", "Hugo", "Amazon", "AliExpress", "PedidosYa", "Pricesmart GT"],
  },
  {
    name: "Guinea", code: "GN", flag: "🇬🇳", currency: "GNF", serpApiCode: "gn",
    cities: ["Conakry"],
    stores: ["AliExpress"],
  },
  {
    name: "Guinea-Bissau", code: "GW", flag: "🇬🇼", currency: "XOF", serpApiCode: "gw",
    cities: ["Bissau"],
    stores: ["AliExpress"],
  },
  {
    name: "Guyana", code: "GY", flag: "🇬🇾", currency: "GYD", serpApiCode: "gy",
    cities: ["Georgetown"],
    stores: ["Amazon", "AliExpress"],
  },
  {
    name: "Haiti", code: "HT", flag: "🇭🇹", currency: "HTG", serpApiCode: "ht",
    cities: ["Port-au-Prince"],
    stores: ["Amazon", "AliExpress"],
  },
  {
    name: "Honduras", code: "HN", flag: "🇭🇳", currency: "HNL", serpApiCode: "hn",
    cities: ["Tegucigalpa", "San Pedro Sula"],
    stores: ["Hugo", "Uber Eats", "Amazon", "AliExpress", "PedidosYa", "Pricesmart HN"],
  },
  {
    name: "Hungary", code: "HU", flag: "🇭🇺", currency: "HUF", serpApiCode: "hu",
    cities: ["Budapest", "Debrecen", "Szeged", "Miskolc", "Pécs"],
    stores: ["eMag", "Wolt", "Bolt Food", "Foodpanda", "Amazon DE", "AliExpress", "Alza HU", "Extreme Digital", "MediaMarkt HU", "Euronics HU", "IKEA HU", "Tesco HU", "Auchan HU", "Lidl HU", "Kifli", "GRoby", "dm HU", "Mall HU"],
  },
  {
    name: "Iceland", code: "IS", flag: "🇮🇸", currency: "ISK", serpApiCode: "is",
    cities: ["Reykjavik"],
    stores: ["Amazon", "AliExpress", "eBay", "Elko", "Tölvutek", "Hagkaup", "Krónan", "Bónus IS", "Nettó IS"],
  },
  {
    name: "India", code: "IN", flag: "🇮🇳", currency: "INR", serpApiCode: "in",
    cities: ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Ahmedabad", "Pune", "Jaipur", "Surat", "Lucknow", "Kanpur"],
    stores: ["Amazon IN", "Flipkart", "Myntra", "Swiggy", "Zomato", "BigBasket", "Nykaa", "Meesho", "JioMart", "AliExpress", "Tata CLiQ", "Ajio", "Snapdeal", "Croma", "Reliance Digital", "Vijay Sales", "DMart Ready", "Blinkit", "Zepto", "Dunzo", "Instamart", "Lenskart", "Pepperfry", "Urban Ladder", "FirstCry", "Purplle", "Pharmeasy", "1mg", "Decathlon IN", "Apple IN", "Samsung IN", "OnePlus IN", "Boat"],
  },
  {
    name: "Indonesia", code: "ID", flag: "🇮🇩", currency: "IDR", serpApiCode: "id",
    cities: ["Jakarta", "Surabaya", "Bandung", "Medan", "Semarang", "Makassar", "Palembang", "Denpasar"],
    stores: ["Tokopedia", "Shopee", "Lazada", "Grab", "GoFood", "Blibli", "AliExpress", "Bukalapak", "JD.id", "Zalora ID", "Bhinneka", "Erafone", "Sociolla", "iBox", "Digimap", "Samsung ID"],
  },
  {
    name: "Iran", code: "IR", flag: "🇮🇷", currency: "IRR", serpApiCode: "ir",
    cities: ["Tehran", "Mashhad", "Isfahan", "Tabriz", "Shiraz"],
    stores: ["Digikala", "SnappFood", "AliExpress", "Basalam", "Torob", "Emalls", "Takhfifan", "Snapp Market", "Okala"],
  },
  {
    name: "Iraq", code: "IQ", flag: "🇮🇶", currency: "IQD", serpApiCode: "iq",
    cities: ["Baghdad", "Erbil", "Basra", "Sulaymaniyah", "Mosul"],
    stores: ["Talabat", "Toters", "Careem", "AliExpress", "Amazon", "Miswag", "Opensooq IQ"],
  },
  {
    name: "Ireland", code: "IE", flag: "🇮🇪", currency: "EUR", serpApiCode: "ie",
    cities: ["Dublin", "Cork", "Galway", "Limerick", "Waterford"],
    stores: ["Amazon UK", "Deliveroo", "Just Eat", "Uber Eats", "AliExpress", "eBay", "Argos IE", "Currys IE", "Harvey Norman IE", "Littlewoods Ireland", "DID Electrical", "Dunnes Stores", "Tesco IE", "SuperValu", "IKEA IE", "Smyths Toys IE", "Easons", "Brown Thomas"],
  },
  {
    name: "Israel", code: "IL", flag: "🇮🇱", currency: "ILS", serpApiCode: "il",
    cities: ["Tel Aviv", "Jerusalem", "Haifa", "Rishon LeZion", "Beer Sheva"],
    stores: ["Amazon", "Wolt", "10Bis", "AliExpress", "eBay IL", "iHerb", "Zap", "KSP", "Bug", "Shufersal Online", "Rami Levy", "Victory", "Mega", "AM:PM", "Ivory"],
  },
  {
    name: "Italy", code: "IT", flag: "🇮🇹", currency: "EUR", serpApiCode: "it",
    cities: ["Rome", "Milan", "Naples", "Turin", "Palermo", "Florence", "Bologna", "Genoa", "Venice", "Verona"],
    stores: ["Amazon IT", "Deliveroo", "Glovo", "Just Eat", "Uber Eats", "AliExpress", "eBay IT", "MediaWorld", "Unieuro", "Euronics IT", "Esselunga", "Conad", "Coop IT", "Carrefour IT", "IKEA IT", "Zalando IT", "Yoox", "Decathlon IT", "Leroy Merlin IT", "IBS", "Feltrinelli", "Douglas IT"],
  },
  {
    name: "Ivory Coast", code: "CI", flag: "🇨🇮", currency: "XOF", serpApiCode: "ci",
    cities: ["Abidjan", "Yamoussoukro", "Bouaké"],
    stores: ["Jumia", "Glovo", "AliExpress", "Afrimarket", "Carrefour CI"],
  },
  {
    name: "Jamaica", code: "JM", flag: "🇯🇲", currency: "JMD", serpApiCode: "jm",
    cities: ["Kingston", "Montego Bay"],
    stores: ["Amazon", "eBay", "AliExpress", "Courts Jamaica", "MegaMart", "PriceSmart JM"],
  },
  {
    name: "Japan", code: "JP", flag: "🇯🇵", currency: "JPY", serpApiCode: "jp",
    cities: ["Tokyo", "Osaka", "Yokohama", "Nagoya", "Sapporo", "Fukuoka", "Kobe", "Kyoto", "Kawasaki", "Sendai"],
    stores: ["Amazon JP", "Rakuten", "Uber Eats", "Demae-can", "Yahoo Shopping", "AliExpress", "Mercari", "ZOZOTOWN", "Bic Camera", "Yodobashi", "Kakaku.com", "Joshin", "Edion", "Yamada Denki", "Nitori", "LOFT", "MUJI", "Uniqlo JP", "Don Quijote", "AEON Online", "Ito-Yokado", "Seiyu", "PayPay Mall", "au PAY Market"],
  },
  {
    name: "Jordan", code: "JO", flag: "🇯🇴", currency: "JOD", serpApiCode: "jo",
    cities: ["Amman", "Zarqa", "Irbid", "Aqaba"],
    stores: ["Talabat", "Careem", "Opensooq", "Amazon", "AliExpress", "Noon", "Safeway JO", "Cozmo"],
  },
  {
    name: "Kazakhstan", code: "KZ", flag: "🇰🇿", currency: "KZT", serpApiCode: "kz",
    cities: ["Almaty", "Nur-Sultan", "Shymkent", "Karaganda"],
    stores: ["Kaspi", "Glovo", "Wolt", "AliExpress", "Wildberries KZ", "Ozon KZ", "Technodom", "Sulpak", "Mechta", "Magnum", "Arbuz.kz"],
  },
  {
    name: "Kenya", code: "KE", flag: "🇰🇪", currency: "KES", serpApiCode: "ke",
    cities: ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"],
    stores: ["Jumia", "Glovo", "Bolt Food", "Uber Eats", "AliExpress", "Kilimall", "Masoko", "Zuricart", "Carrefour KE", "Naivas", "Quickmart"],
  },
  {
    name: "Kiribati", code: "KI", flag: "🇰🇮", currency: "AUD", serpApiCode: "ki",
    cities: ["Tarawa"],
    stores: ["AliExpress"],
  },
  {
    name: "Kosovo", code: "XK", flag: "🇽🇰", currency: "EUR", serpApiCode: "xk",
    cities: ["Pristina", "Prizren"],
    stores: ["AliExpress", "eBay", "Gjirafa50"],
  },
  {
    name: "Kuwait", code: "KW", flag: "🇰🇼", currency: "KWD", serpApiCode: "kw",
    cities: ["Kuwait City", "Hawalli", "Salmiya", "Jahra"],
    stores: ["Talabat", "Careem", "Deliveroo", "Noon", "Amazon", "AliExpress", "Xcite", "Blink", "LuLu Hypermarket KW", "The Sultan Center", "Eureka", "Best Al Yousifi", "Sharaf DG KW", "Namshi KW"],
  },
  {
    name: "Kyrgyzstan", code: "KG", flag: "🇰🇬", currency: "KGS", serpApiCode: "kg",
    cities: ["Bishkek", "Osh"],
    stores: ["AliExpress", "Wildberries", "Ozon", "Svetofor"],
  },
  {
    name: "Laos", code: "LA", flag: "🇱🇦", currency: "LAK", serpApiCode: "la",
    cities: ["Vientiane", "Luang Prabang"],
    stores: ["AliExpress", "Shopee", "Lazada"],
  },
  {
    name: "Latvia", code: "LV", flag: "🇱🇻", currency: "EUR", serpApiCode: "lv",
    cities: ["Riga", "Daugavpils"],
    stores: ["Wolt", "Bolt Food", "Barbora", "Amazon", "AliExpress", "eBay", "1a.lv", "Pigu LV", "Rimi LV", "Lidl LV"],
  },
  {
    name: "Lebanon", code: "LB", flag: "🇱🇧", currency: "LBP", serpApiCode: "lb",
    cities: ["Beirut", "Tripoli", "Sidon", "Jounieh"],
    stores: ["Talabat", "Toters", "Careem", "AliExpress", "Amazon", "Keewardz", "Spinneys LB"],
  },
  {
    name: "Lesotho", code: "LS", flag: "🇱🇸", currency: "LSL", serpApiCode: "ls",
    cities: ["Maseru"],
    stores: ["AliExpress", "Shoprite", "Pick n Pay"],
  },
  {
    name: "Liberia", code: "LR", flag: "🇱🇷", currency: "LRD", serpApiCode: "lr",
    cities: ["Monrovia"],
    stores: ["AliExpress"],
  },
  {
    name: "Libya", code: "LY", flag: "🇱🇾", currency: "LYD", serpApiCode: "ly",
    cities: ["Tripoli", "Benghazi", "Misrata"],
    stores: ["AliExpress", "Opensooq LY"],
  },
  {
    name: "Liechtenstein", code: "LI", flag: "🇱🇮", currency: "CHF", serpApiCode: "li",
    cities: ["Vaduz"],
    stores: ["Amazon", "Digitec", "Galaxus", "AliExpress", "eBay"],
  },
  {
    name: "Lithuania", code: "LT", flag: "🇱🇹", currency: "EUR", serpApiCode: "lt",
    cities: ["Vilnius", "Kaunas", "Klaipėda"],
    stores: ["Wolt", "Bolt Food", "Barbora", "Amazon", "AliExpress", "eBay", "Pigu", "Varle", "Senukai", "Maxima", "Rimi LT", "Lidl LT", "IKEA LT"],
  },
  {
    name: "Luxembourg", code: "LU", flag: "🇱🇺", currency: "EUR", serpApiCode: "lu",
    cities: ["Luxembourg City"],
    stores: ["Amazon", "Wolt", "AliExpress", "eBay", "Cactus", "Auchan LU", "IKEA"],
  },
  {
    name: "Madagascar", code: "MG", flag: "🇲🇬", currency: "MGA", serpApiCode: "mg",
    cities: ["Antananarivo"],
    stores: ["AliExpress", "Jumia"],
  },
  {
    name: "Malawi", code: "MW", flag: "🇲🇼", currency: "MWK", serpApiCode: "mw",
    cities: ["Lilongwe", "Blantyre"],
    stores: ["AliExpress", "Shoprite", "Game Stores"],
  },
  {
    name: "Malaysia", code: "MY", flag: "🇲🇾", currency: "MYR", serpApiCode: "my",
    cities: ["Kuala Lumpur", "George Town", "Johor Bahru", "Ipoh", "Shah Alam", "Kota Kinabalu", "Kuching"],
    stores: ["Shopee MY", "Lazada MY", "Grab", "Foodpanda", "Amazon", "AliExpress", "PG Mall", "Lelong", "Harvey Norman MY", "Senheng", "Courts MY", "AEON Online MY", "Tesco MY", "Watsons MY", "Guardian MY", "Zalora MY", "Samsung MY", "Apple MY", "iPrice"],
  },
  {
    name: "Maldives", code: "MV", flag: "🇲🇻", currency: "MVR", serpApiCode: "mv",
    cities: ["Malé"],
    stores: ["AliExpress", "Amazon", "Ooredoo Shop"],
  },
  {
    name: "Mali", code: "ML", flag: "🇲🇱", currency: "XOF", serpApiCode: "ml",
    cities: ["Bamako"],
    stores: ["AliExpress", "Jumia"],
  },
  {
    name: "Malta", code: "MT", flag: "🇲🇹", currency: "EUR", serpApiCode: "mt",
    cities: ["Valletta", "Sliema", "St. Julian's"],
    stores: ["Wolt", "Bolt Food", "Amazon", "AliExpress", "eBay", "ScanMalta", "Forestals"],
  },
  {
    name: "Marshall Islands", code: "MH", flag: "🇲🇭", currency: "USD", serpApiCode: "mh",
    cities: ["Majuro"],
    stores: ["Amazon", "AliExpress"],
  },
  {
    name: "Mauritania", code: "MR", flag: "🇲🇷", currency: "MRU", serpApiCode: "mr",
    cities: ["Nouakchott"],
    stores: ["AliExpress"],
  },
  {
    name: "Mauritius", code: "MU", flag: "🇲🇺", currency: "MUR", serpApiCode: "mu",
    cities: ["Port Louis"],
    stores: ["AliExpress", "Amazon", "Courts MU", "Game Stores MU", "Galaxy.mu"],
  },
  {
    name: "Mexico", code: "MX", flag: "🇲🇽", currency: "MXN", serpApiCode: "mx",
    cities: ["Mexico City", "Guadalajara", "Monterrey", "Puebla", "Tijuana", "León", "Cancún", "Mérida", "Querétaro", "Chihuahua"],
    stores: ["Amazon MX", "MercadoLibre", "Uber Eats", "Rappi", "DiDi Food", "Walmart MX", "AliExpress", "Liverpool", "Palacio de Hierro", "Coppel", "Elektra", "Soriana", "Chedraui", "Home Depot MX", "Costco MX", "Sam's Club MX", "Suburbia", "Sears MX", "Office Depot MX", "Best Buy MX", "Bodega Aurrera", "Cornershop MX", "Sanborns"],
  },
  {
    name: "Micronesia", code: "FM", flag: "🇫🇲", currency: "USD", serpApiCode: "fm",
    cities: ["Palikir"],
    stores: ["Amazon", "AliExpress"],
  },
  {
    name: "Moldova", code: "MD", flag: "🇲🇩", currency: "MDL", serpApiCode: "md",
    cities: ["Chișinău"],
    stores: ["Glovo", "AliExpress", "Amazon", "Darwin", "Ultra", "Maximum"],
  },
  {
    name: "Monaco", code: "MC", flag: "🇲🇨", currency: "EUR", serpApiCode: "mc",
    cities: ["Monaco"],
    stores: ["Deliveroo", "Uber Eats", "Amazon FR", "AliExpress"],
  },
  {
    name: "Mongolia", code: "MN", flag: "🇲🇳", currency: "MNT", serpApiCode: "mn",
    cities: ["Ulaanbaatar"],
    stores: ["AliExpress", "Shoppy.mn", "Mall.mn", "Amazon"],
  },
  {
    name: "Montenegro", code: "ME", flag: "🇲🇪", currency: "EUR", serpApiCode: "me",
    cities: ["Podgorica", "Budva", "Nikšić"],
    stores: ["AliExpress", "eBay", "Amazon", "OLX ME", "Tehnomanija ME"],
  },
  {
    name: "Morocco", code: "MA", flag: "🇲🇦", currency: "MAD", serpApiCode: "ma",
    cities: ["Casablanca", "Rabat", "Marrakech", "Fes", "Tangier", "Agadir"],
    stores: ["Jumia", "Glovo", "AliExpress", "Amazon", "Avito", "Marjane", "Electroplanet", "Cosmos", "Virgin Megastore MA", "Hmizate"],
  },
  {
    name: "Mozambique", code: "MZ", flag: "🇲🇿", currency: "MZN", serpApiCode: "mz",
    cities: ["Maputo", "Beira"],
    stores: ["AliExpress", "Shoprite MZ", "Game Stores MZ"],
  },
  {
    name: "Myanmar", code: "MM", flag: "🇲🇲", currency: "MMK", serpApiCode: "mm",
    cities: ["Yangon", "Mandalay", "Naypyidaw"],
    stores: ["Grab", "Foodpanda", "AliExpress", "Shopee MM", "Shop.com.mm"],
  },
  {
    name: "Namibia", code: "NA", flag: "🇳🇦", currency: "NAD", serpApiCode: "na",
    cities: ["Windhoek"],
    stores: ["AliExpress", "Takealot", "Shoprite NA", "Game Stores NA", "Pick n Pay NA"],
  },
  {
    name: "Nauru", code: "NR", flag: "🇳🇷", currency: "AUD", serpApiCode: "nr",
    cities: ["Yaren"],
    stores: ["AliExpress"],
  },
  {
    name: "Nepal", code: "NP", flag: "🇳🇵", currency: "NPR", serpApiCode: "np",
    cities: ["Kathmandu", "Pokhara", "Lalitpur"],
    stores: ["Daraz", "Foodmandu", "AliExpress", "Amazon IN", "SastoDeal", "Hamrobazar", "Gyapu", "NepBay"],
  },
  {
    name: "Netherlands", code: "NL", flag: "🇳🇱", currency: "EUR", serpApiCode: "nl",
    cities: ["Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven", "Groningen"],
    stores: ["Amazon NL", "Bol.com", "Coolblue", "Thuisbezorgd", "Uber Eats", "Deliveroo", "Flink", "AliExpress", "eBay NL", "MediaMarkt NL", "IKEA NL", "Zalando NL", "Wehkamp", "HEMA", "Action", "Albert Heijn", "Jumbo NL", "Lidl NL", "Etos", "Kruidvat", "Decathlon NL", "Bax Music", "Gamma", "Praxis"],
  },
  {
    name: "New Zealand", code: "NZ", flag: "🇳🇿", currency: "NZD", serpApiCode: "nz",
    cities: ["Auckland", "Wellington", "Christchurch", "Hamilton", "Tauranga", "Dunedin"],
    stores: ["Amazon", "Mighty Ape", "Uber Eats", "DoorDash", "Menulog", "AliExpress", "eBay NZ", "PB Tech", "Noel Leeming", "Harvey Norman NZ", "The Warehouse", "Briscoes", "Farmers", "Countdown", "New World", "Pak'nSave", "Trademe", "1-Day", "Torpedo7", "Rebel Sport NZ"],
  },
  {
    name: "Nicaragua", code: "NI", flag: "🇳🇮", currency: "NIO", serpApiCode: "ni",
    cities: ["Managua"],
    stores: ["Amazon", "AliExpress", "Hugo"],
  },
  {
    name: "Niger", code: "NE", flag: "🇳🇪", currency: "XOF", serpApiCode: "ne",
    cities: ["Niamey"],
    stores: ["AliExpress"],
  },
  {
    name: "Nigeria", code: "NG", flag: "🇳🇬", currency: "NGN", serpApiCode: "ng",
    cities: ["Lagos", "Abuja", "Kano", "Ibadan", "Port Harcourt", "Benin City"],
    stores: ["Jumia", "Konga", "Bolt Food", "Glovo", "Chowdeck", "AliExpress", "Jiji", "Slot", "Amazon", "PayPorte", "Dealdey", "Supermart", "Shoprite NG", "SPAR NG"],
  },
  {
    name: "North Korea", code: "KP", flag: "🇰🇵", currency: "KPW", serpApiCode: "kp",
    cities: ["Pyongyang"],
    stores: [],
  },
  {
    name: "North Macedonia", code: "MK", flag: "🇲🇰", currency: "MKD", serpApiCode: "mk",
    cities: ["Skopje", "Bitola"],
    stores: ["AliExpress", "eBay", "Glovo", "Wolt", "Anhoch", "Setec"],
  },
  {
    name: "Norway", code: "NO", flag: "🇳🇴", currency: "NOK", serpApiCode: "no",
    cities: ["Oslo", "Bergen", "Trondheim", "Stavanger"],
    stores: ["Amazon", "Foodora", "Wolt", "AliExpress", "eBay", "Komplett", "Elkjøp", "Power NO", "Kolonial (Oda)", "REMA 1000", "Kiwi NO", "COOP NO", "Meny", "XXL NO", "IKEA NO", "Zalando NO", "Finn.no", "NetOnNet NO"],
  },
  {
    name: "Oman", code: "OM", flag: "🇴🇲", currency: "OMR", serpApiCode: "om",
    cities: ["Muscat", "Salalah", "Sohar"],
    stores: ["Talabat", "Careem", "Noon", "Amazon", "AliExpress", "LuLu Hypermarket OM", "Sharaf DG OM", "Extra Stores OM", "Namshi"],
  },
  {
    name: "Pakistan", code: "PK", flag: "🇵🇰", currency: "PKR", serpApiCode: "pk",
    cities: ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar"],
    stores: ["Daraz", "Foodpanda", "Careem", "AliExpress", "Amazon", "iShopping", "Goto", "Yayvo", "HomeShopping", "Telemart", "Mega.pk", "Naheed", "Alfatah"],
  },
  {
    name: "Palau", code: "PW", flag: "🇵🇼", currency: "USD", serpApiCode: "pw",
    cities: ["Ngerulmud"],
    stores: ["Amazon", "AliExpress"],
  },
  {
    name: "Palestine", code: "PS", flag: "🇵🇸", currency: "ILS", serpApiCode: "ps",
    cities: ["Ramallah", "Gaza City", "Hebron", "Nablus"],
    stores: ["AliExpress", "Amazon", "Opensooq PS"],
  },
  {
    name: "Panama", code: "PA", flag: "🇵🇦", currency: "PAB", serpApiCode: "pa",
    cities: ["Panama City"],
    stores: ["Uber Eats", "PedidosYa", "Amazon", "AliExpress", "Pricesmart PA", "Riba Smith"],
  },
  {
    name: "Papua New Guinea", code: "PG", flag: "🇵🇬", currency: "PGK", serpApiCode: "pg",
    cities: ["Port Moresby"],
    stores: ["AliExpress", "Amazon AU"],
  },
  {
    name: "Paraguay", code: "PY", flag: "🇵🇾", currency: "PYG", serpApiCode: "py",
    cities: ["Asunción", "Ciudad del Este"],
    stores: ["PedidosYa", "Amazon", "AliExpress", "MercadoLibre PY", "Nissei", "Tupi", "Salemma"],
  },
  {
    name: "Peru", code: "PE", flag: "🇵🇪", currency: "PEN", serpApiCode: "pe",
    cities: ["Lima", "Arequipa", "Trujillo", "Cusco"],
    stores: ["MercadoLibre", "Rappi", "PedidosYa", "Uber Eats", "Falabella", "Amazon", "AliExpress", "Ripley PE", "Sodimac PE", "Tottus", "Wong", "Metro PE", "Plaza Vea", "Linio PE", "Promart"],
  },
  {
    name: "Philippines", code: "PH", flag: "🇵🇭", currency: "PHP", serpApiCode: "ph",
    cities: ["Manila", "Quezon City", "Cebu City", "Davao", "Makati"],
    stores: ["Shopee PH", "Lazada PH", "Grab", "Foodpanda", "AliExpress", "Amazon", "Zalora PH", "BeautyMNL", "Kimstore", "SM Store", "Abenson", "Robinsons Online", "Watsons PH", "Mercury Drug", "GCash Shop", "MetroMart"],
  },
  {
    name: "Poland", code: "PL", flag: "🇵🇱", currency: "PLN", serpApiCode: "pl",
    cities: ["Warsaw", "Kraków", "Łódź", "Wrocław", "Poznań", "Gdańsk"],
    stores: ["Allegro", "Amazon PL", "Wolt", "Bolt Food", "Glovo", "Pyszne.pl", "AliExpress", "eBay", "x-kom", "Morele", "MediaMarkt PL", "RTV Euro AGD", "Komputronik", "IKEA PL", "Leroy Merlin PL", "Decathlon PL", "Empik", "Zalando PL", "Kaufland PL", "Lidl PL", "Żabka", "Biedronka", "Rossmann PL", "Ceneo"],
  },
  {
    name: "Portugal", code: "PT", flag: "🇵🇹", currency: "EUR", serpApiCode: "pt",
    cities: ["Lisbon", "Porto", "Braga", "Faro", "Coimbra"],
    stores: ["Amazon ES", "Worten", "Uber Eats", "Glovo", "Bolt Food", "AliExpress", "eBay", "Fnac PT", "PCDiga", "MediaMarkt PT", "IKEA PT", "Continente", "Pingo Doce", "Auchan PT", "Lidl PT", "Decathlon PT", "Zalando PT", "KuantoKusta"],
  },
  {
    name: "Qatar", code: "QA", flag: "🇶🇦", currency: "QAR", serpApiCode: "qa",
    cities: ["Doha", "Al Wakrah", "Al Khor"],
    stores: ["Talabat", "Careem", "Deliveroo", "Noon", "Amazon", "AliExpress", "LuLu Hypermarket QA", "Jarir QA", "Sharaf DG QA", "Virgin Megastore QA", "Al Meera", "Monoprix QA"],
  },
  {
    name: "Romania", code: "RO", flag: "🇷🇴", currency: "RON", serpApiCode: "ro",
    cities: ["Bucharest", "Cluj-Napoca", "Timișoara", "Iași", "Constanța"],
    stores: ["eMag", "Glovo", "Bolt Food", "Tazz", "AliExpress", "Amazon DE", "Altex", "Flanco", "Dedeman", "IKEA RO", "Carrefour RO", "Kaufland RO", "Lidl RO", "Mega Image", "PCGarage", "CEL.ro", "Fashion Days", "Elefant.ro", "dm RO"],
  },
  {
    name: "Russia", code: "RU", flag: "🇷🇺", currency: "RUB", serpApiCode: "ru",
    cities: ["Moscow", "Saint Petersburg", "Novosibirsk", "Yekaterinburg", "Kazan", "Nizhny Novgorod"],
    stores: ["Ozon", "Wildberries", "Yandex Market", "Yandex Lavka", "Delivery Club", "AliExpress", "DNS", "M.Video", "Eldorado", "Citilink", "Lamoda", "KazanExpress", "SberMegaMarket", "Perekrestok", "VkusVill", "Samokat"],
  },
  {
    name: "Rwanda", code: "RW", flag: "🇷🇼", currency: "RWF", serpApiCode: "rw",
    cities: ["Kigali"],
    stores: ["Bolt Food", "AliExpress", "Jumia RW", "Simba Supermarket"],
  },
  {
    name: "Saint Kitts and Nevis", code: "KN", flag: "🇰🇳", currency: "XCD", serpApiCode: "kn",
    cities: ["Basseterre"],
    stores: ["Amazon", "AliExpress"],
  },
  {
    name: "Saint Lucia", code: "LC", flag: "🇱🇨", currency: "XCD", serpApiCode: "lc",
    cities: ["Castries"],
    stores: ["Amazon", "AliExpress"],
  },
  {
    name: "Saint Vincent", code: "VC", flag: "🇻🇨", currency: "XCD", serpApiCode: "vc",
    cities: ["Kingstown"],
    stores: ["Amazon", "AliExpress"],
  },
  {
    name: "Samoa", code: "WS", flag: "🇼🇸", currency: "WST", serpApiCode: "ws",
    cities: ["Apia"],
    stores: ["AliExpress"],
  },
  {
    name: "San Marino", code: "SM", flag: "🇸🇲", currency: "EUR", serpApiCode: "sm",
    cities: ["San Marino"],
    stores: ["Amazon IT", "AliExpress"],
  },
  {
    name: "São Tomé and Príncipe", code: "ST", flag: "🇸🇹", currency: "STN", serpApiCode: "st",
    cities: ["São Tomé"],
    stores: ["AliExpress"],
  },
  {
    name: "Saudi Arabia", code: "SA", flag: "🇸🇦", currency: "SAR", serpApiCode: "sa",
    cities: ["Riyadh", "Jeddah", "Mecca", "Medina", "Dammam", "Khobar", "Tabuk", "Abha"],
    stores: ["Noon", "Amazon SA", "Jarir", "Talabat", "Careem", "HungerStation", "Namshi", "AliExpress", "Shein SA", "Extra Stores", "Sharaf DG SA", "LuLu Hypermarket SA", "Panda", "Tamimi Markets", "Nana Direct", "Virgin Megastore SA", "Xcite SA", "Styli", "Ounass"],
  },
  {
    name: "Senegal", code: "SN", flag: "🇸🇳", currency: "XOF", serpApiCode: "sn",
    cities: ["Dakar"],
    stores: ["Jumia", "AliExpress", "Expat-Dakar", "CoinAfrique"],
  },
  {
    name: "Serbia", code: "RS", flag: "🇷🇸", currency: "RSD", serpApiCode: "rs",
    cities: ["Belgrade", "Novi Sad", "Niš"],
    stores: ["Wolt", "Glovo", "AliExpress", "eBay", "Amazon DE", "Kupujemprodajem", "Tehnomanija", "Gigatron", "WinWin", "Emmezeta RS", "Idea RS", "Univerexport"],
  },
  {
    name: "Seychelles", code: "SC", flag: "🇸🇨", currency: "SCR", serpApiCode: "sc",
    cities: ["Victoria"],
    stores: ["AliExpress", "Amazon"],
  },
  {
    name: "Sierra Leone", code: "SL", flag: "🇸🇱", currency: "SLL", serpApiCode: "sl",
    cities: ["Freetown"],
    stores: ["AliExpress"],
  },
  {
    name: "Singapore", code: "SG", flag: "🇸🇬", currency: "SGD", serpApiCode: "sg",
    cities: ["Singapore"],
    stores: ["Amazon SG", "Shopee SG", "Lazada SG", "Grab", "Foodpanda", "Deliveroo", "AliExpress", "Qoo10", "Courts SG", "Harvey Norman SG", "Best Denki", "Challenger", "FairPrice Online", "Cold Storage", "RedMart", "iHerb", "Zalora SG", "Love Bonito", "Carousell", "Samsung SG", "Apple SG"],
  },
  {
    name: "Slovakia", code: "SK", flag: "🇸🇰", currency: "EUR", serpApiCode: "sk",
    cities: ["Bratislava", "Košice"],
    stores: ["Wolt", "Bolt Food", "AliExpress", "Amazon DE", "Alza SK", "Mall SK", "Datart SK", "NAY", "IKEA SK", "Kaufland SK", "Lidl SK", "Tesco SK", "dm SK"],
  },
  {
    name: "Slovenia", code: "SI", flag: "🇸🇮", currency: "EUR", serpApiCode: "si",
    cities: ["Ljubljana", "Maribor"],
    stores: ["Wolt", "Bolt Food", "AliExpress", "Amazon DE", "eBay", "Big Bang", "Harvey Norman SI", "Mimovrste", "Enaa", "Mercator", "Spar SI", "Lidl SI", "IKEA"],
  },
  {
    name: "Solomon Islands", code: "SB", flag: "🇸🇧", currency: "SBD", serpApiCode: "sb",
    cities: ["Honiara"],
    stores: ["AliExpress"],
  },
  {
    name: "Somalia", code: "SO", flag: "🇸🇴", currency: "SOS", serpApiCode: "so",
    cities: ["Mogadishu", "Hargeisa"],
    stores: ["AliExpress"],
  },
  {
    name: "South Africa", code: "ZA", flag: "🇿🇦", currency: "ZAR", serpApiCode: "za",
    cities: ["Johannesburg", "Cape Town", "Durban", "Pretoria", "Port Elizabeth", "Bloemfontein"],
    stores: ["Takealot", "Amazon", "Uber Eats", "Mr D Food", "Checkers Sixty60", "AliExpress", "eBay ZA", "Makro", "Game Stores", "Incredible Connection", "Builders Warehouse", "Pick n Pay", "Woolworths ZA", "Shoprite", "Dis-Chem", "Loot", "Superbalist", "Zando", "Yuppiechef", "NetFlorist", "OneDayOnly", "Mr Price"],
  },
  {
    name: "South Korea", code: "KR", flag: "🇰🇷", currency: "KRW", serpApiCode: "kr",
    cities: ["Seoul", "Busan", "Incheon", "Daegu", "Daejeon", "Gwangju", "Ulsan", "Suwon"],
    stores: ["Coupang", "Gmarket", "11st", "Baemin", "Yogiyo", "AliExpress", "Amazon", "SSG.com", "WeMakePrice", "TMON", "Musinsa", "Olive Young", "Samsung Store KR", "Lotte ON", "Interpark", "Emart", "Homeplus", "CU", "GS Fresh", "Kurly", "Naver Shopping"],
  },
  {
    name: "South Sudan", code: "SS", flag: "🇸🇸", currency: "SSP", serpApiCode: "ss",
    cities: ["Juba"],
    stores: ["AliExpress"],
  },
  {
    name: "Spain", code: "ES", flag: "🇪🇸", currency: "EUR", serpApiCode: "es",
    cities: ["Madrid", "Barcelona", "Valencia", "Seville", "Bilbao", "Málaga", "Zaragoza", "Palma de Mallorca"],
    stores: ["Amazon ES", "El Corte Inglés", "Glovo", "Uber Eats", "Just Eat", "Deliveroo", "AliExpress", "eBay ES", "MediaMarkt ES", "PcComponentes", "Worten ES", "IKEA ES", "Carrefour ES", "Mercadona", "Lidl ES", "Decathlon ES", "Zalando ES", "Fnac ES", "Leroy Merlin ES", "Casa del Libro", "Wallapop", "Zara Online"],
  },
  {
    name: "Sri Lanka", code: "LK", flag: "🇱🇰", currency: "LKR", serpApiCode: "lk",
    cities: ["Colombo", "Kandy", "Galle"],
    stores: ["Daraz", "Uber Eats", "PickMe Food", "AliExpress", "Amazon", "Kapruka", "Wasi.lk", "Softlogic", "Singer Online", "Keells Online"],
  },
  {
    name: "Sudan", code: "SD", flag: "🇸🇩", currency: "SDG", serpApiCode: "sd",
    cities: ["Khartoum", "Omdurman"],
    stores: ["AliExpress"],
  },
  {
    name: "Suriname", code: "SR", flag: "🇸🇷", currency: "SRD", serpApiCode: "sr",
    cities: ["Paramaribo"],
    stores: ["AliExpress", "Amazon"],
  },
  {
    name: "Sweden", code: "SE", flag: "🇸🇪", currency: "SEK", serpApiCode: "se",
    cities: ["Stockholm", "Gothenburg", "Malmö", "Uppsala"],
    stores: ["Amazon SE", "CDON", "Foodora", "Wolt", "Uber Eats", "AliExpress", "eBay", "Elgiganten SE", "NetOnNet", "Komplett SE", "MediaMarkt SE", "IKEA SE", "Zalando SE", "H&M SE", "Webhallen", "Kjell & Company", "ICA Online", "MatHem", "Hemköp", "Boozt", "Adlibris"],
  },
  {
    name: "Switzerland", code: "CH", flag: "🇨🇭", currency: "CHF", serpApiCode: "ch",
    cities: ["Zurich", "Geneva", "Basel", "Bern", "Lausanne"],
    stores: ["Amazon", "Digitec", "Galaxus", "Uber Eats", "Eat.ch", "AliExpress", "eBay", "Brack", "Microspot", "IKEA CH", "Coop CH", "Migros", "Manor", "Interdiscount", "Fust", "MediaMarkt CH", "Zalando CH", "Decathlon CH", "Nespresso CH"],
  },
  {
    name: "Syria", code: "SY", flag: "🇸🇾", currency: "SYP", serpApiCode: "sy",
    cities: ["Damascus", "Aleppo", "Homs"],
    stores: ["AliExpress"],
  },
  {
    name: "Taiwan", code: "TW", flag: "🇹🇼", currency: "TWD", serpApiCode: "tw",
    cities: ["Taipei", "Kaohsiung", "Taichung", "Tainan", "Hsinchu"],
    stores: ["Shopee TW", "Momo", "PChome", "Uber Eats", "Foodpanda", "AliExpress", "Amazon JP", "Yahoo TW", "Ruten", "ETMall", "Books.com.tw", "Rakuten TW", "7-11 Online", "Costco TW", "Carrefour TW", "MUJI TW", "Uniqlo TW"],
  },
  {
    name: "Tajikistan", code: "TJ", flag: "🇹🇯", currency: "TJS", serpApiCode: "tj",
    cities: ["Dushanbe"],
    stores: ["AliExpress", "Wildberries"],
  },
  {
    name: "Tanzania", code: "TZ", flag: "🇹🇿", currency: "TZS", serpApiCode: "tz",
    cities: ["Dar es Salaam", "Dodoma", "Zanzibar City", "Mwanza"],
    stores: ["Jumia", "Bolt Food", "AliExpress", "Zuricart TZ", "Shoprite TZ"],
  },
  {
    name: "Thailand", code: "TH", flag: "🇹🇭", currency: "THB", serpApiCode: "th",
    cities: ["Bangkok", "Chiang Mai", "Pattaya", "Phuket", "Hat Yai", "Nonthaburi"],
    stores: ["Shopee TH", "Lazada TH", "Grab", "Foodpanda", "Line Man", "AliExpress", "Amazon", "JD Central", "Central Online", "Tops Online", "HomePro", "Big C", "Lotus's", "Robinson", "Power Buy", "Banana IT", "JIB", "Watsons TH", "Zalora TH"],
  },
  {
    name: "Togo", code: "TG", flag: "🇹🇬", currency: "XOF", serpApiCode: "tg",
    cities: ["Lomé"],
    stores: ["AliExpress", "Jumia"],
  },
  {
    name: "Tonga", code: "TO", flag: "🇹🇴", currency: "TOP", serpApiCode: "to",
    cities: ["Nukuʻalofa"],
    stores: ["AliExpress"],
  },
  {
    name: "Trinidad and Tobago", code: "TT", flag: "🇹🇹", currency: "TTD", serpApiCode: "tt",
    cities: ["Port of Spain", "San Fernando"],
    stores: ["Amazon", "AliExpress", "eBay", "Courts TT", "PriceSmart TT", "Massy Stores TT"],
  },
  {
    name: "Tunisia", code: "TN", flag: "🇹🇳", currency: "TND", serpApiCode: "tn",
    cities: ["Tunis", "Sfax", "Sousse"],
    stores: ["Jumia", "Glovo", "AliExpress", "Amazon", "Mytek", "Tunisianet", "Zoom", "SBS Informatique", "Carrefour TN"],
  },
  {
    name: "Turkey", code: "TR", flag: "🇹🇷", currency: "TRY", serpApiCode: "tr",
    cities: ["Istanbul", "Ankara", "Izmir", "Bursa", "Antalya", "Adana", "Konya"],
    stores: ["Trendyol", "Hepsiburada", "Amazon TR", "Yemeksepeti", "Getir", "AliExpress", "n11", "GittiGidiyor", "Çiçeksepeti", "MediaMarkt TR", "Teknosa", "Vatan Bilgisayar", "Migros", "A101", "BIM", "Boyner", "LC Waikiki", "DeFacto", "Koçtaş", "IKEA TR"],
  },
  {
    name: "Turkmenistan", code: "TM", flag: "🇹🇲", currency: "TMT", serpApiCode: "tm",
    cities: ["Ashgabat"],
    stores: ["AliExpress"],
  },
  {
    name: "Tuvalu", code: "TV", flag: "🇹🇻", currency: "AUD", serpApiCode: "tv",
    cities: ["Funafuti"],
    stores: ["AliExpress"],
  },
  {
    name: "Uganda", code: "UG", flag: "🇺🇬", currency: "UGX", serpApiCode: "ug",
    cities: ["Kampala", "Entebbe"],
    stores: ["Jumia", "Bolt Food", "Glovo", "AliExpress", "Kilimall UG", "Shoprite UG"],
  },
  {
    name: "Ukraine", code: "UA", flag: "🇺🇦", currency: "UAH", serpApiCode: "ua",
    cities: ["Kyiv", "Kharkiv", "Odessa", "Dnipro", "Lviv"],
    stores: ["Rozetka", "Glovo", "Bolt Food", "AliExpress", "Amazon", "Prom.ua", "OLX UA", "Foxtrot", "Comfy", "Allo", "Silpo", "ATB", "Novus", "IKEA UA", "Epicentr", "Moyo"],
  },
  {
    name: "United Arab Emirates", code: "AE", flag: "🇦🇪", currency: "AED", serpApiCode: "ae",
    cities: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Al Ain"],
    stores: ["Noon", "Amazon AE", "Namshi", "Talabat", "Deliveroo", "Careem", "Uber Eats", "Zomato", "InstaShop", "AliExpress", "Sharaf DG", "Jumbo Electronics", "LuLu Hypermarket", "Carrefour AE", "Virgin Megastore AE", "Ounass", "Mumzworld", "Sivvi", "Spinneys AE", "Kibsons", "El Grocer"],
  },
  {
    name: "United Kingdom", code: "GB", flag: "🇬🇧", currency: "GBP", serpApiCode: "uk",
    cities: ["London", "Manchester", "Birmingham", "Leeds", "Glasgow", "Liverpool", "Bristol", "Edinburgh", "Cardiff", "Belfast", "Sheffield", "Newcastle"],
    stores: ["Amazon UK", "Argos", "Currys", "John Lewis", "Deliveroo", "Uber Eats", "Just Eat", "Ocado", "AliExpress", "eBay UK", "ASOS", "Tesco", "Sainsbury's", "Asda", "Morrisons", "Waitrose", "M&S", "Next", "Very", "AO.com", "Screwfix", "B&Q", "IKEA UK", "Boots", "Superdrug", "Halfords", "Smyths Toys", "WHSmith", "Waterstones", "Apple UK", "Samsung UK", "Dell UK", "Decathlon UK", "Sports Direct"],
  },
  {
    name: "United States", code: "US", flag: "🇺🇸", currency: "USD", serpApiCode: "us",
    cities: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose", "Austin", "Jacksonville", "San Francisco", "Seattle", "Denver", "Washington DC", "Nashville", "Boston", "Portland", "Las Vegas", "Miami", "Atlanta", "Orlando", "Minneapolis", "Tampa", "Detroit", "Charlotte", "Salt Lake City", "New Orleans", "Honolulu"],
    stores: ["Amazon", "Walmart", "Target", "Best Buy", "Costco", "Uber Eats", "DoorDash", "Grubhub", "Instacart", "eBay", "AliExpress", "Apple", "Samsung", "Dell", "Lenovo", "Microsoft Store", "Newegg", "B&H Photo", "Home Depot", "Lowe's", "Wayfair", "Etsy", "Nordstrom", "Macy's", "Nike", "Adidas", "Sephora", "Ulta", "Kroger", "Whole Foods", "Trader Joe's", "CVS", "Walgreens", "Chewy", "GameStop", "REI", "Zappos", "SHEIN", "Temu"],
  },
  {
    name: "Uruguay", code: "UY", flag: "🇺🇾", currency: "UYU", serpApiCode: "uy",
    cities: ["Montevideo"],
    stores: ["MercadoLibre", "PedidosYa", "Rappi", "Amazon", "AliExpress", "Tienda Inglesa", "Geant", "Mosca", "Tata", "Divino"],
  },
  {
    name: "Uzbekistan", code: "UZ", flag: "🇺🇿", currency: "UZS", serpApiCode: "uz",
    cities: ["Tashkent", "Samarkand", "Bukhara"],
    stores: ["AliExpress", "Wildberries UZ", "Uzum Market", "Korzinka", "Makro UZ"],
  },
  {
    name: "Vanuatu", code: "VU", flag: "🇻🇺", currency: "VUV", serpApiCode: "vu",
    cities: ["Port Vila"],
    stores: ["AliExpress"],
  },
  {
    name: "Vatican City", code: "VA", flag: "🇻🇦", currency: "EUR", serpApiCode: "va",
    cities: ["Vatican City"],
    stores: ["Amazon IT", "AliExpress"],
  },
  {
    name: "Venezuela", code: "VE", flag: "🇻🇪", currency: "VES", serpApiCode: "ve",
    cities: ["Caracas", "Maracaibo", "Valencia", "Barquisimeto"],
    stores: ["AliExpress", "Amazon", "MercadoLibre VE", "Yummy"],
  },
  {
    name: "Vietnam", code: "VN", flag: "🇻🇳", currency: "VND", serpApiCode: "vn",
    cities: ["Ho Chi Minh City", "Hanoi", "Da Nang", "Hai Phong", "Can Tho"],
    stores: ["Shopee VN", "Lazada VN", "Tiki", "Grab", "ShopeeFood", "AliExpress", "Amazon", "Sendo", "Thế Giới Di Động", "Điện Máy Xanh", "FPT Shop", "CellphoneS", "Bách Hóa Xanh", "VinMart", "Hasaki", "Zalora VN"],
  },
  {
    name: "Yemen", code: "YE", flag: "🇾🇪", currency: "YER", serpApiCode: "ye",
    cities: ["Sana'a", "Aden"],
    stores: ["AliExpress"],
  },
  {
    name: "Zambia", code: "ZM", flag: "🇿🇲", currency: "ZMW", serpApiCode: "zm",
    cities: ["Lusaka", "Ndola", "Kitwe"],
    stores: ["AliExpress", "Jumia ZM", "Shoprite ZM", "Game Stores ZM", "Pick n Pay ZM"],
  },
  {
    name: "Zimbabwe", code: "ZW", flag: "🇿🇼", currency: "ZWL", serpApiCode: "zw",
    cities: ["Harare", "Bulawayo"],
    stores: ["AliExpress", "Zimall", "Shoprite ZW", "Pick n Pay ZW", "OK Zimbabwe"],
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
