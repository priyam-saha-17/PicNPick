/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { GoogleGenAI, Type } from '@google/genai';
import { useEffect, useState, useMemo, useCallback } from 'react';
import ReactDOM from 'react-dom/client';

const translations = {
  en: {
    appName: "PicNPick",
    tagline: "From Pic to Pick.",
    description: "Upload a photo of any product. Add a description or ask for spare parts or accessories. Our AI will find you the best prices online.",
    uploadPrompt: "Upload a photo to find deals",
    uploadSubtext: "Drop an image here",
    loading1: "Analyzing product from image...",
    loading2: "Searching for the best online deals...",
    loading3: "Compiling your results...",
    tryAgain: "Try Again",
    searchAnother: "Search Another Item",
    loadMore: "Load More Deals",
    loadingMore: "Loading...",
    yourDeals: "Your Deals",
    sortBy: "Sort by:",
    relevanceSort: "Relevance",
    priceSort: "Price: Low to High",
    discountSort: "Biggest Discount",
    deliverySort: "Fastest Delivery",
    trustedSort: "Trusted Sites",
    viewDeal: "View Deal",
    estDelivery: "Est. Delivery",
    noDealsError: "No deals found for this item. Try a clearer picture or a different product.",
    aiInitError: "Failed to initialize AI. Please check your API key.",
    genericError: "An error occurred:",
    productIdentError: "Could not identify the product in the image. Please try a different image.",
    queryPlaceholder: "Optional: find a spare part, different color, etc.",
    search: "Search",
    cancel: "Cancel",
    enterLocationPrompt: "First, let's find deals deliverable to you.",
    selectCountry: "Select your country",
    pincodePlaceholder: "Enter ZIP / Postal Code",
    selectCountryFirst: "Please select a country first.",
    invalidPincode: "Invalid postal code format for the selected country.",
    enterLocationFirst: "Please enter your country and postal code above to start searching."
  },
  es: {
    appName: "PicNPick",
    tagline: "De la Foto a la Selección.",
    description: "Sube una foto de cualquier producto. Añade una descripción o pide repuestos o accesorios. Nuestra IA encontrará los mejores precios para ti.",
    uploadPrompt: "Sube una foto para encontrar ofertas",
    uploadSubtext: "Toma una foto o arrastra una imagen aquí",
    loading1: "Analizando el producto de la imagen...",
    loading2: "Buscando las mejores ofertas en línea...",
    loading3: "Compilando tus resultados...",
    tryAgain: "Intentar de Nuevo",
    searchAnother: "Buscar Otro Artículo",
    loadMore: "Cargar Más Ofertas",
    loadingMore: "Cargando...",
    yourDeals: "Tus Ofertas",
    sortBy: "Ordenar por:",
    relevanceSort: "Relevancia",
    priceSort: "Precio: Menor a Mayor",
    discountSort: "Mayor Descuento",
    deliverySort: "Entrega Más Rápida",
    trustedSort: "Sitios de Confianza",
    viewDeal: "Ver Oferta",
    estDelivery: "Entrega Est.",
    noDealsError: "No se encontraron ofertas para este artículo. Prueba con una imagen más clara o un producto diferente.",
    aiInitError: "Error al inicializar la IA. Por favor, comprueba tu clave de API.",
    genericError: "Ocurrió un error:",
    productIdentError: "No se pudo identificar el producto en la imagen. Por favor, intenta con otra imagen.",
    search: "Buscar",
    cancel: "Cancelar",
    enterLocationPrompt: "Primero, busquemos ofertas que se puedan entregar en tu ubicación.",
    selectCountry: "Selecciona tu país",
    pincodePlaceholder: "Introduce el código postal",
    selectCountryFirst: "Por favor, selecciona un país primero.",
    invalidPincode: "Formato de código postal no válido para el país seleccionado.",
    enterLocationFirst: "Por favor, introduce tu país y código postal arriba para comenzar a buscar."
  },
  fr: {
    appName: "PicNPick",
    tagline: "De la Photo au Choix.",
    description: "Téléchargez une photo de n'importe quel produit. Ajoutez une description ou demandez des pièces de rechange ou des accessoires. Notre IA trouvera les meilleurs prix pour vous.",
    uploadPrompt: "Téléchargez une photo pour trouver des offres",
    uploadSubtext: "Prenez une photo ou déposez une image ici",
    loading1: "Analyse du produit à partir de l'image...",
    loading2: "Recherche des meilleures offres en ligne...",
    loading3: "Compilation de vos résultats...",
    tryAgain: "Réessayer",
    searchAnother: "Chercher un autre article",
    loadMore: "Charger Plus d'Offres",
    loadingMore: "Chargement...",
    yourDeals: "Vos Offres",
    sortBy: "Trier par:",
    relevanceSort: "Pertinence",
    priceSort: "Prix : Croissant",
    discountSort: "Plus Grande Réduction",
    deliverySort: "Livraison la Plus Rapide",
    trustedSort: "Sites de Confiance",
    viewDeal: "Voir l'offre",
    estDelivery: "Livraison Est.",
    noDealsError: "Aucune offre trouvée pour cet article. Essayez une image plus claire ou un produit différent.",
    aiInitError: "Échec de l'initialisation de l'IA. Veuillez vérifier votre clé API.",
    genericError: "Une erreur est survenue:",
    productIdentError: "Impossible d'identifier le produit dans l'image. Veuillez essayer une autre image.",
    queryPlaceholder: "Optionnel : trouver une pièce, une autre couleur, etc.",
    search: "Rechercher",
    cancel: "Annuler",
    enterLocationPrompt: "D'abord, trouvons des offres livrables chez vous.",
    selectCountry: "Sélectionnez votre pays",
    pincodePlaceholder: "Entrez le code postal",
    selectCountryFirst: "Veuillez d'abord sélectionner un pays.",
    invalidPincode: "Format de code postal invalide pour le pays seleccionado.",
    enterLocationFirst: "Veuillez entrer votre pays et votre code postal ci-dessus pour commencer la recherche."
  },
};

const GOOGLE_CSE_API_KEY = "AIzaSyDi9O7QREzU2mw2BLRRz_VB5wG58NZTVzI";
const GOOGLE_CSE_ID = "253d5a5f1c17a444d";

const countries = [
    { name: "Afghanistan", code: "AF" }, { name: "Albania", code: "AL" }, { name: "Algeria", code: "DZ" },
    { name: "Argentina", code: "AR" }, { name: "Australia", code: "AU" }, { name: "Austria", code: "AT" },
    { name: "Bangladesh", code: "BD" }, { name: "Belgium", code: "BE" }, { name: "Bolivia", code: "BO" },
    { name: "Brazil", code: "BR" }, { name: "Canada", code: "CA" }, { name: "Chile", code: "CL" },
    { name: "China", code: "CN" }, { name: "Colombia", code: "CO" }, { name: "Denmark", code: "DK" },
    { name: "Egypt", code: "EG" }, { name: "Finland", code: "FI" }, { name: "France", code: "FR" },
    { name: "Germany", code: "DE" }, { name: "Greece", code: "GR" }, { name: "India", code: "IN" },
    { name: "Indonesia", code: "ID" }, { name: "Ireland", code: "IE" }, { name: "Israel", code: "IL" },
    { name: "Italy", code: "IT" }, { name: "Japan", code: "JP" }, { name: "Malaysia", code: "MY" },
    { name: "Mexico", code: "MX" }, { name: "Netherlands", code: "NL" }, { name: "New Zealand", code: "NZ" },
    { name: "Nigeria", code: "NG" }, { name: "Norway", code: "NO" }, { name: "Pakistan", code: "PK" },
    { name: "Peru", code: "PE" }, { name: "Philippines", code: "PH" }, { name: "Poland", code: "PL" },
    { name: "Portugal", code: "PT" }, { name: "Russia", code: "RU" }, { name: "Saudi Arabia", code: "SA" },
    { name: "Singapore", code: "SG" }, { name: "South Africa", code: "ZA" }, { name: "South Korea", code: "KR" },
    { name: "Spain", code: "ES" }, { name: "Sweden", code: "SE" }, { name: "Switzerland", code: "CH" },
    { name: "Thailand", code: "TH" }, { name: "Turkey", code: "TR" }, { name: "Ukraine", code: "UA" },
    { name: "United Arab Emirates", code: "AE" }, { name: "United Kingdom", code: "GB" }, { name: "United States", code: "US" },
    { name: "Vietnam", code: "VN" }
].sort((a, b) => a.name.localeCompare(b.name));

const pincodeRegexMap: { [key: string]: RegExp } = {
  US: /^\d{5}(-\d{4})?$/, CA: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/, GB: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i, IN: /^\d{6}$/, AU: /^\d{4}$/, DE: /^\d{5}$/, FR: /^\d{5}$/, JP: /^\d{3}-\d{4}$/, BR: /^\d{5}-\d{3}$/, CN: /^\d{6}$/, AF: /^\d{4}$/, AL: /^\d{4}$/, DZ: /^\d{5}$/, AR: /^([A-Z]\d{4}[A-Z]{3}|[A-Z]\d{4})$/, AT: /^\d{4}$/, BD: /^\d{4}$/, BE: /^\d{4}$/, BO: /^\d{4}$/, CL: /^\d{7}$/, CO: /^\d{6}$/, DK: /^\d{4}$/, EG: /^\d{5}$/, FI: /^\d{5}$/, GR: /^\d{3} ?\d{2}$/, ID: /^\d{5}$/, IE: /^[A-Z0-9]{3}[ ]?[A-Z0-9]{4}$/i, IL: /^\d{5,7}$/, IT: /^\d{5}$/, MY: /^\d{5}$/, MX: /^\d{5}$/, NL: /^\d{4} ?[A-Z]{2}$/i, NZ: /^\d{4}$/, NG: /^\d{6}$/, NO: /^\d{4}$/, PK: /^\d{5}$/, PE: /^\d{5}$/, PH: /^\d{4}$/, PL: /^\d{2}-\d{3}$/, PT: /^\d{4}-\d{3}$/, RU: /^\d{6}$/, SA: /^\d{5}(-\d{4})?$/, SG: /^\d{6}$/, ZA: /^\d{4}$/, KR: /^\d{5}$/, ES: /^\d{5}$/, SE: /^\d{3} ?\d{2}$/, CH: /^\d{4}$/, TH: /^\d{5}$/, TR: /^\d{5}$/, UA: /^\d{5}$/, AE: /.+/, VN: /^\d{6}$/
};

const countryCurrencyMap: { [key: string]: string } = {
    US: 'USD', CA: 'CAD', GB: 'GBP', IN: 'INR', AU: 'AUD', DE: 'EUR', FR: 'EUR', JP: 'JPY', BR: 'BRL', CN: 'CNY', AF: 'AFN', AL: 'ALL', DZ: 'DZD', AR: 'ARS', AT: 'EUR', BD: 'BDT', BE: 'EUR', BO: 'BOB', CL: 'CLP', CO: 'COP', DK: 'DKK', EG: 'EGP', FI: 'EUR', GR: 'EUR', ID: 'IDR', IE: 'EUR', IL: 'ILS', IT: 'EUR', MY: 'MYR', MX: 'MXN', NL: 'EUR', NZ: 'NZD', NG: 'NGN', NO: 'NOK', PK: 'PKR', PE: 'PEN', PH: 'PHP', PL: 'PLN', PT: 'EUR', RU: 'RUB', SA: 'SAR', SG: 'SGD', ZA: 'ZAR', KR: 'KRW', ES: 'EUR', SE: 'SEK', CH: 'CHF', TH: 'THB', TR: 'TRY', UA: 'UAH', AE: 'AED', VN: 'VND'
};

const retailerLogos: { [key: string]: string } = {
    // India
    'amazon.in': 'https://drive.google.com/file/d/17yhLeiEyJbfavxOX3n2n3V5TQkQD1nkk/view?usp=drive_link',
    'flipkart.com': 'https://drive.google.com/file/d/1FBdbmwv9zNHFA8u7kJxELCxPuJ3jNmrz/view?usp=drive_link',
    'snapdeal.com': 'https://drive.google.com/file/d/1Gbc7TIJG71uYHsH_GOe6xz90p1nHqaOv/view?usp=drive_link',
    'tatacliq.com': 'https://drive.google.com/file/d/1IzLTekisW7uNIS2GGqXkc1xjegmRiNJs/view?usp=drive_link',
    'reliancedigital.in': 'https://drive.google.com/file/d/1tCx8bJrLgiuBK7R1PTnlK-Yb_0ED-uc3/view?usp=drive_link',
    'bigbasket.com': 'https://upload.wikimedia.org/wikipedia/commons/5/52/Bigbasket-logo.svg',
    'blinkit.com': 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Blinkit_logo.svg',
    'jiomart.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/JioMart_logo.svg/2560px-JioMart_logo.svg.png',
    'spencers.in': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Spencers-logo-new.svg/1280px-Spencers-logo-new.svg.png',
    'dmart.in': 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9e/DMart_logo.svg/440px-DMart_logo.svg.png',
    'myntra.com': 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Myntra_logo.svg',
    'ajio.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Ajio_logo.svg/1280px-Ajio_logo.svg.png',
    'nykaa.com': 'https://upload.wikimedia.org/wikipedia/commons/e/e2/Nykaa_Logo.svg',
    'zivame.com': 'https://logos-world.net/wp-content/uploads/2023/07/Zivame-Logo.png',
    'bewakoof.com': 'https://upload.wikimedia.org/wikipedia/commons/9/99/Bewakoof_logo_2021.svg',
    'croma.com': 'https://drive.google.com/file/d/10HRpWSIFBWy54VwWi9lgY_KlMcBc4sfD/view?usp=drive_link',
    'vijaysales.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Vijay_Sales_logo.svg/2560px-Vijay_Sales_logo.svg.png',
    'pepperfry.com': 'https://upload.wikimedia.org/wikipedia/en/thumb/8/87/Pepperfry_logo.svg/1280px-Pepperfry_logo.svg.png',
    'urbanladder.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Urban_Ladder_logo.svg/1280px-Urban_Ladder_logo.svg.png',
    'ikea.com': 'https://upload.wikimedia.org/wikipedia/commons/c/c7/IKEA_logo.svg',
    'nike.com': 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg',
    'adidas.co.in': 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg',
    'reebok.in': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Reebok_2019_logo.svg/1280px-Reebok_2019_logo.svg.png',
    'puma.com': 'https://upload.wikimedia.org/wikipedia/en/9/94/Puma_Logo.svg',
    'boodmo.com': 'https://boodmo.com/images/logo-boodmo.svg',
    'cartrade.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/CarTrade_logo.svg/1280px-CarTrade_logo.svg.png',
    
    // USA
    'amazon.com': 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
    'walmart.com': 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Walmart_logo.svg',
    'target.com': 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Target_logo.svg',
    'bestbuy.com': 'https://upload.wikimedia.org/wikipedia/commons/f/f5/Best_Buy_Logo.svg',
    'ebay.com': 'https://upload.wikimedia.org/wikipedia/commons/1/1b/EBay_logo.svg',
    'kroger.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Kroger_logo.svg/1280px-Kroger_logo.svg.png',
    'instacart.com': 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Instacart_logo_and_wordmark.svg',
    'wholefoodsmarket.com': 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Whole_Foods_Market_201x_logo.svg',
    'safeway.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Safeway_Inc._logo.svg/1280px-Safeway_Inc._logo.svg.png',
    'macys.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Macy%27s_logo_2019.svg/1280px-Macy%27s_logo_2019.svg.png',
    'nordstrom.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Nordstrom_Logo.svg/1280px-Nordstrom_Logo.svg.png',
    'bloomingdales.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Bloomingdale%27s_logo.svg/1280px-Bloomingdale%27s_logo.svg.png',
    'shein.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Shein-logo.svg/1280px-Shein-logo.svg.png',
    'asos.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/ASOS_logo.svg/1280px-ASOS_logo.svg.png',
    'bhphotovideo.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/B%26H_Photo_Video_logo.svg/1280px-B%26H_Photo_Video_logo.svg.png',
    'newegg.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Newegg_logo.svg/1280px-Newegg_logo.svg.png',
    'microcenter.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Micro_Center_logo.svg/1280px-Micro_Center_logo.svg.png',
    'wayfair.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Wayfair_logo.svg/1280px-Wayfair_logo.svg.png',
    'overstock.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Overstock.com_logo.svg/1280px-Overstock.com_logo.svg.png',
    'homedepot.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/TheHomeDepot.svg/1280px-TheHomeDepot.svg.png',
    'lowes.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Lowe%27s_logo.svg/1280px-Lowe%27s_logo.svg.png',
    'zappos.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Zappos_logo.svg/1280px-Zappos_logo.svg.png',
    'footlocker.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Foot_Locker_logo.svg/1280px-Foot_Locker_logo.svg.png',
    'dickssportinggoods.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Dicks-sporting-goods-logo.svg/1280px-Dicks-sporting-goods-logo.svg.png',
    'rockauto.com': 'https://www.rockauto.com/Images/ra_logo-160x78.png',
    'autozone.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/AutoZone_logo.svg/1280px-AutoZone_logo.svg.png',
    'advanceautoparts.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Advance_Auto_Parts_logo.svg/1280px-Advance_Auto_Parts_logo.svg.png',
    'napaonline.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/NAPA_Auto_Parts_logo.svg/1280px-NAPA_Auto_Parts_logo.svg.png',
    'adidas.com': 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg',
    
    // UK
    'amazon.co.uk': 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
    'argos.co.uk': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Argos_logo.svg/1280px-Argos_logo.svg.png',
    'tesco.com': 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b0/Tesco_Logo.svg/1280px-Tesco_Logo.svg.png',
    'sainsburys.co.uk': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Sainsbury%27s_logo.svg/1280px-Sainsbury%27s_logo.svg.png',
    'currys.co.uk': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Currys_logo.svg/1280px-Currys_logo.svg.png',
    'johnlewis.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/John_Lewis_%26_Partners_logo.svg/1280px-John_Lewis_%26_Partners_logo.svg.png',
    'boots.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Boots_logo.svg/1280px-Boots_logo.svg.png',
    'halfords.com': 'https://upload.wikimedia.org/wikipedia/en/thumb/0/07/Halfords_logo.svg/1280px-Halfords_logo.svg.png',
    
    // Canada
    'amazon.ca': 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
    'walmart.ca': 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Walmart_logo.svg',
    'canadiantire.ca': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Canadian_Tire_logo.svg/1280px-Canadian_Tire_logo.svg.png',
    'bestbuy.ca': 'https://upload.wikimedia.org/wikipedia/commons/f/f5/Best_Buy_Logo.svg',
    'costco.ca': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Costco_logo.svg/1280px-Costco_logo.svg.png',
    'sportchek.ca': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Sport_chek_logo.svg/1280px-Sport_chek_logo.svg.png',
    'rona.ca': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Rona_logo.svg/1280px-Rona_logo.svg.png',
    
    // Australia
    'amazon.com.au': 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
    'woolworths.com.au': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Woolworths_2008_logo.svg/1280px-Woolworths_2008_logo.svg.png',
    'coles.com.au': 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f6/Coles_logo.svg/1280px-Coles_logo.svg.png',
    'kmart.com.au': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Kmart_Australia_logo.svg/1280px-Kmart_Australia_logo.svg.png',
    'myer.com.au': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Myer_logo.svg/1280px-Myer_logo.svg.png',
    'harveynorman.com.au': 'https://upload.wikimedia.org/wikipedia/en/thumb/b/bb/Harvey_Norman_Logo.svg/1280px-Harvey_Norman_Logo.svg.png',
    'bunnings.com.au': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Bunnings_Warehouse_logo.svg/1280px-Bunnings_Warehouse_logo.svg.png',
    
    // Germany
    'mediamarkt.de': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Media_Markt_logo.svg/1280px-Media_Markt_logo.svg.png',
    'saturn.de': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Saturn_Hansaring_logo.svg/1280px-Saturn_Hansaring_logo.svg.png',
    'otto.de': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Otto_logo_2022.svg/1280px-Otto_logo_2022.svg.png',
    'zalando.de': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Zalando_logo.svg/1280px-Zalando_logo.svg.png',
    
    // France
    'fnac.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Fnac_Logo.svg/1280px-Fnac_Logo.svg.png',
    'cdiscount.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Cdiscount-logo.svg/1280px-Cdiscount-logo.svg.png',
    'laredoute.fr': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/La_Redoute_logo.svg/1280px-La_Redoute_logo.svg.png',
    
    // Japan
    'rakuten.co.jp': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Rakuten_logo.svg/1280px-Rakuten_logo.svg.png',
    'yahoo.co.jp': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Yahoo_Shopping_logo.svg/1280px-Yahoo_Shopping_logo.svg.png',
    'zozo.jp': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Zozotown_logo.svg/1280px-Zozotown_logo.svg.png',

    // Latin America
    'mercadolibre.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Mercado_Livre_logo.svg/1280px-Mercado_Livre_logo.svg.png',
    'mercadolivre.com.br': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Mercado_Livre_logo.svg/1280px-Mercado_Livre_logo.svg.png',
    'americanas.com.br': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Americanas.com_logo.svg/1280px-Americanas.com_logo.svg.png',
    'magazineluiza.com.br': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Magazine_Luiza_logo.svg/1280px-Magazine_Luiza_logo.svg.png',
    'mercadolibre.com.mx': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Mercado_Livre_logo.svg/1280px-Mercado_Livre_logo.svg.png',
    'liverpool.com.mx': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Liverpool_logo.svg/1280px-Liverpool_logo.svg.png',
    'coppel.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Coppel_logo.svg/1280px-Coppel_logo.svg.png',

    // Spain
    'elcorteingles.es': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/El_Corte_Ingl%C3%A9s_logo.svg/1280px-El_Corte_Ingl%C3%A9s_logo.svg.png',
    'pccomponentes.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/PcComponentes_logo.svg/1280px-PcComponentes_logo.svg.png',
    
    // Netherlands
    'bol.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Bol.com_logo.svg/1280px-Bol.com_logo.svg.png',
    'coolblue.nl': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Coolblue_logo.svg/1280px-Coolblue_logo.svg.png',
    
    // China
    'taobao.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Taobao_logo.svg/1280px-Taobao_logo.svg.png',
    'jd.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/JD.com_logo.svg/1280px-JD.com_logo.svg.png',
    'tmall.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Tmall_logo.svg/1280px-Tmall_logo.svg.png',

    // South Korea
    'coupang.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Coupang_logo.svg/1280px-Coupang_logo.svg.png',
    'gmarket.co.kr': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Gmarket_logo.svg/1280px-Gmarket_logo.svg.png',

    // Russia
    'ozon.ru': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Ozon_logo_2019.svg/1280px-Ozon_logo_2019.svg.png',
    'wildberries.ru': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Wildberries_logo_2022.svg/1280px-Wildberries_logo_2022.svg.png',
    
    // Global
    'aliexpress.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/AliExpress_logo.svg/1280px-AliExpress_logo.svg.png',
    'dhgate.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/DHgate.com_logo.svg/1280px-DHgate.com_logo.svg.png',
    'rakuten.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Rakuten_logo.svg/1280px-Rakuten_logo.svg.png',
    'lazada.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Lazada_logo.svg/1280px-Lazada_logo.svg.png',
    'shopee.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Shopee_logo.svg/1280px-Shopee_logo.svg.png',
};

interface Deal {
  productName: string;
  retailer: string;
  price: number;
  priceString: string;
  originalPrice?: number;
  deliveryEstimate: string;
  deliveryEstimateDays: number;
  productImageUrl: string;
  retailerLogoUrl: string;
  discount: number;
  isAvailable: boolean;
  searchQuery: string;
  retailerDomain: string;
}
type SortByType = 'relevance' | 'price' | 'trusted' | 'discount' | 'delivery';

const useSpeechRecognition = (onResult: (transcript: string) => void) => {
  const [isListening, setIsListening] = useState(false);
  const recognition = useMemo(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return null;
    const instance = new SpeechRecognition();
    instance.continuous = false;
    instance.interimResults = false;
    instance.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      setIsListening(false);
    };
    instance.onend = () => setIsListening(false);
    instance.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };
    return instance;
  }, [onResult]);

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
    } else {
      recognition?.start();
      setIsListening(true);
    }
  };

  return { isListening, toggleListening, isSupported: !!recognition };
};

const BackgroundSlideshow = () => (
    <div className="background-slideshow">
        <div></div><div></div><div></div><div></div>
    </div>
);

// Helpers for parsing and normalization
const getImageFromItem = (item: any) => {
  const pagemap = item.pagemap || {};
  return pagemap.cse_image?.[0]?.src
    || pagemap.metatags?.[0]?.['og:image']
    || pagemap.metatags?.[0]?.['twitter:image']
    || item.link?.replace(/\?.*$/, '') + '/thumbnail';
};

const extractPriceInfo = (item: any, countryCode: string): { price: number; priceString: string; originalPrice?: number } => {
    const pagemap = item.pagemap || {};
    const offer = pagemap.offer?.[0] || pagemap.product?.[0]?.offers?.[0] || {};
    const metatags = pagemap.metatags?.[0] || {};
    const currency = metatags['og:price:currency'] || metatags['product:price:currency'] || offer.priceCurrency || countryCurrencyMap[countryCode] || 'USD';

    const parsePriceString = (priceStr: string | number): number => {
        if (!priceStr) return NaN;
        const numStr = String(priceStr).replace(/\s/g, '').replace(/'/g, "");
        let num;
        
        if (numStr.includes('.') && numStr.includes(',')) {
            const lastDot = numStr.lastIndexOf('.');
            const lastComma = numStr.lastIndexOf(',');
            if (lastDot > lastComma) {
                // Format like: 1,234.56
                num = parseFloat(numStr.replace(/,/g, ''));
            } else {
                // Format like: 1.234,56
                num = parseFloat(numStr.replace(/\./g, '').replace(',', '.'));
            }
        } else if (numStr.includes(',')) {
            // Only comma is present. Assume decimal if followed by 2 digits.
            if ((numStr.length - numStr.lastIndexOf(',') - 1) === 2) {
                num = parseFloat(numStr.replace(',', '.'));
            } else {
                num = parseFloat(numStr.replace(/,/g, ''));
            }
        } else {
            // Only dots or no separators.
            num = parseFloat(numStr);
        }
        return num;
    };

    let price: number | undefined;
    let originalPrice: number | undefined;

    const structuredPrice = offer.price || metatags['og:price:amount'] || metatags['product:price:amount'];
    if (structuredPrice) {
        price = parsePriceString(structuredPrice);
    }
    const structuredOriginalPrice = offer.highPrice;
    if (structuredOriginalPrice) {
        originalPrice = parsePriceString(structuredOriginalPrice);
    }

    if (price === undefined || isNaN(price)) {
        const text = `${item.title || ''} ${item.snippet || ''} ${metatags['og:description'] || ''}`;
        const foundPrices: number[] = [];
        
        const allCurrencies = [...new Set(Object.values(countryCurrencyMap))].join('|');
        const symbols = '[₹$€£¥]';
        
        const priceRegexBefore = new RegExp(`(?:${symbols}|${allCurrencies})\\s*([\\d,.'\\s]+)`, 'gi');
        let match;
        while ((match = priceRegexBefore.exec(text)) !== null) {
            const num = parsePriceString(match[1]);
            if (!isNaN(num) && num > 0) foundPrices.push(num);
        }
        
        const priceRegexAfter = new RegExp(`([\\d,.'\\s]+)\\s*(?:${symbols}|${allCurrencies})`, 'gi');
        while ((match = priceRegexAfter.exec(text)) !== null) {
            const num = parsePriceString(match[1]);
            if (!isNaN(num) && num > 0 && !foundPrices.includes(num)) {
                foundPrices.push(num);
            }
        }
        
        const uniquePrices = [...new Set(foundPrices)].sort((a, b) => a - b);
        
        if (uniquePrices.length > 0) {
            price = uniquePrices[0];
            if (uniquePrices.length > 1) {
                originalPrice = uniquePrices[uniquePrices.length - 1];
            }
        }
    }
    
    if (price !== undefined && originalPrice !== undefined && price >= originalPrice) {
        originalPrice = undefined;
    }

    if (price === undefined || isNaN(price)) {
      return { price: Number.POSITIVE_INFINITY, priceString: '—' };
    }

    return {
        price,
        originalPrice,
        priceString: new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(price),
    };
};

const extractDeliveryDays = (item: any): { deliveryEstimate: string; deliveryEstimateDays: number } => {
    const text = item.snippet || '';
    const daysMatch = text.match(/(?:delivery in|within|by|est\.?)\s*(\d{1,2})(?:-(\d{1,2}))?\s*days?/i);
    if (daysMatch) {
        const minDays = parseInt(daysMatch[1], 10);
        const maxDays = daysMatch[2] ? parseInt(daysMatch[2], 10) : minDays;
        const estimate = maxDays > minDays ? `${minDays}-${maxDays} days` : `${minDays} days`;
        return { deliveryEstimate: estimate, deliveryEstimateDays: maxDays };
    }
    return { deliveryEstimate: "Varies", deliveryEstimateDays: 99 };
};

const getRetailerLogo = (domain: string): string => {
    if (!domain) return `https://www.google.com/s2/favicons?domain=store&sz=64`;
    const coreDomain = domain.replace(/^www\./, '');

    // 1. Check for an exact match on the core domain.
    if (retailerLogos[coreDomain]) {
        return retailerLogos[coreDomain];
    }

    // 2. Find the best matching key by checking if the domain ends with a known retailer domain.
    // This handles subdomains like 'm.walmart.com' matching 'walmart.com'.
    // We sort keys by length descending to prioritize more specific matches (e.g., 'amazon.co.uk' over 'co.uk').
    const matchingKey = Object.keys(retailerLogos)
        .sort((a, b) => b.length - a.length)
        .find(key => coreDomain.endsWith(key));
    
    if (matchingKey) {
        return retailerLogos[matchingKey];
    }
    
    // Fallback to Google's favicon service
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
};


const processSearchResults = (items: any[], countryCode: string): Deal[] => {
    return items.map((item: any): Deal | null => {
      const image = getImageFromItem(item);
      if (!image) return null;

      const { price, priceString, originalPrice } = extractPriceInfo(item, countryCode);
      const { deliveryEstimate, deliveryEstimateDays } = extractDeliveryDays(item);
      const retailerName = (item.displayLink || '').replace(/^www\./, '').split('.')[0] || 'Seller';
      const discount = (originalPrice && price < originalPrice) ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
      
      return {
          productName: item.title || (item.pagemap?.product?.[0]?.name || 'Product'),
          retailer: retailerName.charAt(0).toUpperCase() + retailerName.slice(1),
          price,
          priceString,
          originalPrice,
          deliveryEstimate,
          deliveryEstimateDays,
          productImageUrl: image,
          retailerLogoUrl: getRetailerLogo(item.displayLink || ''),
          discount: discount > 0 ? discount : 0,
          isAvailable: true,
          searchQuery: item.link || `https://${item.displayLink}`,
          retailerDomain: item.displayLink || ''
      };
    }).filter((deal): deal is Deal => deal !== null);
}

function App() {
  const [image, setImage] = useState<{ file: File; dataUrl: string } | null>(null);
  const [textQuery, setTextQuery] = useState('');
  const [productName, setProductName] = useState('');
  const [searchQueryState, setSearchQueryState] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [error, setError] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [pincode, setPincode] = useState('');
  const [pincodeError, setPincodeError] = useState('');
  const [sortBy, setSortBy] = useState<SortByType>('discount');
  const [ai, setAi] = useState<GoogleGenAI | null>(null);
  const [language, setLanguage] = useState<'en' | 'es' | 'fr'>('en');
  const [columns, setColumns] = useState<number>(3);

  const t = useCallback((key: keyof typeof translations['en']) => {
    return translations[language][key] || translations['en'][key];
  }, [language]);
  
  const LOADING_MESSAGES = useMemo(() => [t('loading1'), t('loading2'), t('loading3')], [t]);

  useEffect(() => {
    try {
      setAi(new GoogleGenAI({apiKey: process.env.API_KEY}));
    } catch (e) {
      setError(t('aiInitError'));
      console.error(e);
    }
  }, [t]);

  const { isListening, toggleListening, isSupported } = useSpeechRecognition(setTextQuery);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const isLocationSet = useMemo(() => selectedCountry && pincode && !pincodeError, [selectedCountry, pincode, pincodeError]);

  const handlePincodeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const newPincode = e.target.value;
      setPincode(newPincode);
      if (!selectedCountry) {
          setPincodeError(t('selectCountryFirst'));
          return;
      }
      const regex = pincodeRegexMap[selectedCountry];
      if (regex && newPincode) {
          if (!regex.test(newPincode)) {
              setPincodeError(t('invalidPincode'));
          } else {
              setPincodeError('');
          }
      } else {
           setPincodeError(''); // Clear error if no regex or empty input
      }
  }, [selectedCountry, t]);
  
  const findDeals = async () => {
    if (!ai || !image || !isLocationSet) { return; }
    setIsLoading(true);
    setError('');
    setDeals([]);
    setProductName('');
    setSearchQueryState('');

    try {
      // Step 1: Analyze product from the full image and generate search query
      setLoadingMessage(LOADING_MESSAGES[0]);
      setLoadingProgress(20);

      const base64Data = await fileToBase64(image.file);
      const imagePart = { inlineData: { mimeType: image.file.type, data: base64Data } };
      const countryName = countries.find(c => c.code === selectedCountry)?.name || '';

      const identificationSystemInstruction = `You are an expert product analyst. Analyze the provided image to identify the main product. Perform the following tasks and return the result as a single, strict JSON object:
1.  **Identify and Describe:** Locate the primary product in the image. Write a concise, high-level description of it (e.g., "A white, double-door refrigerator").
2.  **Extract Details:** Carefully examine the main product and extract its brand name and model number from any visible text.
3.  **Accuracy is Key:** If the brand or model cannot be identified with high confidence, you MUST return null or an empty string for those fields. DO NOT invent or guess brand or model names.
4.  **Generate Search Query:** Create a highly specific and effective Google search query to find this exact product for sale online. The query must be precise enough to exclude irrelevant results like accessories, spare parts (unless requested by the user), or unrelated items (e.g., fridge magnets for a fridge). For example, a good query would be "buy [Brand] [Model] refrigerator online". Incorporate the user's additional text query "${textQuery}" as well. In fact, give MOST importance to the user's additional query only`;

      const identificationResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: { parts: [imagePart, { text: `Analyze this product. User's location: ${countryName}. Optional user text: ${textQuery}` }] },
          config: {
              systemInstruction: identificationSystemInstruction,
              responseMimeType: "application/json",
              responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                      productDescription: { type: Type.STRING },
                      brand: { type: Type.STRING, nullable: true },
                      model: { type: Type.STRING, nullable: true },
                      searchQuery: { type: Type.STRING }
                  },
                  required: ['productDescription', 'searchQuery']
              }
          }
      });
      const productInfo = JSON.parse(identificationResponse.text);

      let productDisplayName = [productInfo.brand, productInfo.model, productInfo.productDescription]
        .filter(Boolean).join(' ') || 'Product';
      setProductName(productDisplayName);
      setSearchQueryState(productInfo.searchQuery);

      // Step 2: Search with Google Custom Search API
      setLoadingMessage(LOADING_MESSAGES[1]);
      setLoadingProgress(60);

      const gl = selectedCountry.toLowerCase();
      const cr = `country${selectedCountry.toUpperCase()}`;
      const buildSearchUrl = (q: string, start = 1) => `https://www.googleapis.com/customsearch/v1?${new URLSearchParams({
          key: GOOGLE_CSE_API_KEY, cx: GOOGLE_CSE_ID, q, gl, cr, lr: 'lang_en', num: '10', start: String(start)
      })}`;
      
      const combinedItems = [];
      const totalPages = 10;
      for (let i = 0; i < totalPages; i++) {
        const response = await fetch(buildSearchUrl(productInfo.searchQuery, i * 10 + 1));
        
        if (!response.ok) {
            console.error(`Google Search API request failed: ${response.status} ${response.statusText}`);
            // If rate limited, show a user-friendly message and stop.
            if (response.status === 429) {
                setError("Search is temporarily unavailable due to high traffic. Please try again in a moment.");
                break;
            }
            continue; // Skip this page on other errors
        }
        
        const data = await response.json();
        if (data && data.items) {
            combinedItems.push(...data.items);
        }

        // Update progress more smoothly
        setLoadingProgress(60 + ((i + 1) / totalPages) * 30); // Progress from 60% to 90%

        // Brief pause to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      if (combinedItems.length === 0 && !error) {
        setError(t('noDealsError'));
        setIsLoading(false);
        return;
      }

      // Step 3: Process and display deals
      setLoadingMessage(LOADING_MESSAGES[2]);
      setLoadingProgress(95);
      
      const processedDeals = processSearchResults(combinedItems, selectedCountry);
      setLoadingProgress(100);

      if (processedDeals.length === 0 && !error) setError(t('noDealsError'));
      setDeals(processedDeals);

    } catch (e: any) {
      setError(`${t('genericError')} ${e?.message || String(e)}`);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && isLocationSet) {
      setImage({ file, dataUrl: URL.createObjectURL(file) });
    }
  };

  const handleReset = () => {
    setImage(null);
    setDeals([]);
    setError('');
    setProductName('');
    setTextQuery('');
    setSearchQueryState('');
  }

  const sortedDeals = useMemo(() => {
    const dealsToSort = [...deals];
    switch (sortBy) {
      case 'price':
        return dealsToSort.sort((a, b) => a.price - b.price);
      case 'discount':
        return dealsToSort.sort((a, b) => b.discount - a.discount);
      case 'delivery':
        return dealsToSort.sort((a, b) => a.deliveryEstimateDays - b.deliveryEstimateDays);
      case 'trusted':
        const trustedRetailers = ['amazon', 'walmart', 'ebay', 'best buy', 'target', 'flipkart'];
        return dealsToSort.sort((a, b) => {
          const aIsTrusted = trustedRetailers.some(tr => a.retailer.toLowerCase().includes(tr));
          const bIsTrusted = trustedRetailers.some(tr => b.retailer.toLowerCase().includes(tr));
          if (aIsTrusted && !bIsTrusted) return -1;
          if (!aIsTrusted && bIsTrusted) return 1;
          return a.price - b.price; // fallback to price
        });
      case 'relevance':
      default:
        return deals; // The original order is by relevance from the API
    }
  }, [deals, sortBy]);
  
  const AppLogo = () => (
    <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 15H68.2819C70.1039 15 71.8515 15.7061 73.1202 16.9748L88.0252 31.8798C89.2939 33.1485 90 34.8961 90 36.7181V80C90 82.7614 87.7614 85 85 85H20C17.2386 85 15 82.7614 15 80V20C15 17.2386 17.2386 15 20 15Z" fill="url(#paint0_linear_logo)"/>
        <circle cx="32" cy="32" r="7" fill="#121212" stroke="url(#paint1_linear_logo)" strokeWidth="3"/>
        <circle cx="58" cy="58" r="23" fill="white" stroke="url(#paint2_linear_logo)" strokeWidth="6"/>
        <circle cx="58" cy="58" r="12" fill="url(#paint3_linear_logo)"/>
        <defs>
            <linearGradient id="paint0_linear_logo" x1="52.5" y1="15" x2="52.5" y2="85" gradientUnits="userSpaceOnUse">
                <stop stopColor="white"/>
                <stop offset="1" stopColor="#B3D5FF"/>
            </linearGradient>
            <linearGradient id="paint1_linear_logo" x1="32" y1="24" x2="32" y2="40" gradientUnits="userSpaceOnUse">
                <stop stopColor="#0056B3"/>
                <stop offset="1" stopColor="#0d8eff"/>
            </linearGradient>
            <linearGradient id="paint2_linear_logo" x1="58" y1="32" x2="58" y2="84" gradientUnits="userSpaceOnUse">
                <stop stopColor="#0056B3"/>
                <stop offset="1" stopColor="#0d8eff"/>
            </linearGradient>
            <linearGradient id="paint3_linear_logo" x1="58" y1="46" x2="58" y2="70" gradientUnits="userSpaceOnUse">
                <stop stopColor="#0d8eff"/>
                <stop offset="1" stopColor="#0056B3"/>
            </linearGradient>
        </defs>
    </svg>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="loading-container">
          <div className="loading-logo"><AppLogo/></div>
          <p className="loading-message" aria-live="polite">{loadingMessage}</p>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${loadingProgress}%` }}></div>
          </div>
          <span className="progress-percentage">{Math.round(loadingProgress)}%</span>
        </div>
      );
    }
    
    if (error) {
       return (
        <div className="uploader-container">
            <div className="error-message" role="alert">{error}</div>
            <button className="button" onClick={handleReset}>{t('tryAgain')}</button>
        </div>
       )
    }

    if (deals.length > 0) {
      return (
        <div className="results-container">
          <div className="results-header">
            <h2>{productName || t('yourDeals')}</h2>
            <div className="controls-wrapper">
                <div className="layout-controls">
                    {[2,3,4,5].map(num => (
                        <button key={num} className={columns === num ? 'active' : ''} onClick={() => setColumns(num)} aria-label={`Show ${num} columns`}>
                            {Array.from({length: num}).map((_, i) => <span key={i}></span>)}
                        </button>
                    ))}
                </div>
                <div className="sort-controls">
                <label htmlFor="sort">{t('sortBy')}</label>
                <select id="sort" value={sortBy} onChange={(e) => setSortBy(e.target.value as SortByType)}>
                    <option value="discount">{t('discountSort')}</option>
                    <option value="relevance">{t('relevanceSort')}</option>
                    <option value="price">{t('priceSort')}</option>
                    <option value="delivery">{t('deliverySort')}</option>
                    <option value="trusted">{t('trustedSort')}</option>
                </select>
                </div>
            </div>
          </div>
          <div className="deals-grid" style={{'--num-cols': columns} as React.CSSProperties}>
            {sortedDeals.map((deal, index) => (
              <div className="deal-card" key={index}>
                <img src={deal.productImageUrl} alt={deal.productName} className="product-image" loading="lazy"/>
                <div className="deal-card-content">
                  <h3>{deal.productName}</h3>
                  <div className="deal-info">
                     <div className="retailer-info">
                       <img src={deal.retailerLogoUrl} alt={`${deal.retailer} logo`} className="retailer-logo" loading="lazy" />
                       <p><strong>{deal.retailer}</strong></p>
                       {deal.discount > 0 && <span className="discount-badge">{deal.discount}% OFF</span>}
                    </div>
                    <div className="price-container">
                      <span className="price">{deal.priceString}</span>
                      {deal.originalPrice && deal.originalPrice > deal.price && (
                        <span className="original-price">{new Intl.NumberFormat(undefined, { style: 'currency', currency: countryCurrencyMap[selectedCountry] || 'USD' }).format(deal.originalPrice)}</span>
                      )}
                    </div>
                    <p>{t('estDelivery')}: {deal.deliveryEstimate}</p>
                  </div>
                </div>
                 <div className="deal-card-footer">
                    <a href={deal.searchQuery} target="_blank" rel="noopener noreferrer" className="button">{t('viewDeal')}</a>
                 </div>
              </div>
            ))}
          </div>
          <div className="results-footer">
            <button className="button secondary" onClick={handleReset}>{t('searchAnother')}</button>
          </div>
        </div>
      );
    }

    if (image) {
        return (
            <div className="preview-container">
                <img src={image.dataUrl} alt="Product preview" className="image-preview"/>
                <div className="query-input-container">
                    <input 
                        type="text" 
                        className="query-input" 
                        placeholder={t('queryPlaceholder')}
                        value={textQuery}
                        onChange={(e) => setTextQuery(e.target.value)}
                    />
                    {isSupported && (
                        <button onClick={toggleListening} className={`voice-button ${isListening ? 'listening' : ''}`} aria-label="Toggle voice input">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                        </button>
                    )}
                </div>
                <div className="preview-actions">
                    <button className="button secondary" onClick={handleReset}>{t('cancel')}</button>
                    <button className="button" onClick={findDeals}>{t('search')}</button>
                </div>
            </div>
        )
    }

    return (
      <div className="landing-grid">
        <div className="landing-text">
            <h1>{t('tagline')}</h1>
            <p>{t('description')}</p>
        </div>
        <div className="uploader-container">
            <div className="location-container">
                <p>{t('enterLocationPrompt')}</p>
                 <select value={selectedCountry} onChange={(e) => { setSelectedCountry(e.target.value); setPincode(''); setPincodeError(''); }}>
                    <option value="">{t('selectCountry')}</option>
                    {countries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                </select>
                <input
                    type="text"
                    placeholder={t('pincodePlaceholder')}
                    value={pincode}
                    onChange={handlePincodeChange}
                    disabled={!selectedCountry}
                />
                {pincodeError && <span className="pincode-error">{pincodeError}</span>}
            </div>
            <input type="file" id="imageUpload" className="upload-input" accept="image/*" onChange={handleImageChange} disabled={!isLocationSet} />
            <label htmlFor="imageUpload" className={`upload-box ${!isLocationSet ? 'disabled' : ''}`}>
                 {isLocationSet ? (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                        </svg>
                        <p>{t('uploadPrompt')}</p>
                        <span>{t('uploadSubtext')}</span>
                    </>
                 ) : (
                    <span>{t('enterLocationFirst')}</span>
                 )}
            </label>
        </div>
      </div>
    );
  };

  return (
    <div className='app-wrapper'>
      <BackgroundSlideshow />
      <div className="app-container">
        <header className="app-header">
          <div className="app-logo">
             <AppLogo />
            <h1>{t('appName')}</h1>
          </div>
          <div className="language-selector">
            <select value={language} onChange={(e) => setLanguage(e.target.value as 'en' | 'es' | 'fr')} aria-label="Select language">
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
          </div>
        </header>
        <main className="app-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <App />
    );
}