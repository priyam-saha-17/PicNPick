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
    uploadSubtext: "Snap a pic or drop an image here",
    loading1: "Identifying your product...",
    loading2: "Scanning e-commerce sites for deals...",
    loading3: "Compiling real-time prices...",
    loading4: "Finding product images and logos...",
    loading5: "Finalizing your personalized results...",
    tryAgain: "Try Again",
    searchAnother: "Search Another Item",
    yourDeals: "Your Deals",
    sortBy: "Sort by:",
    priceSort: "Price: Low to High",
    discountSort: "Biggest Discount",
    deliverySort: "Fastest Delivery",
    trustedSort: "Trusted Sites",
    viewDeal: "View Deal",
    estDelivery: "Est. Delivery",
    noDealsError: "No deals found for this item. Try a clearer picture or a different product.",
    aiInitError: "Failed to initialize AI. Please check your API key.",
    genericError: "An error occurred:",
    productIdentError: "Could not identify the product in the image.",
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
    loading1: "Identificando tu producto...",
    loading2: "Buscando ofertas en sitios de comercio electrónico...",
    loading3: "Compilando precios en tiempo real...",
    loading4: "Buscando imágenes y logos de productos...",
    loading5: "Finalizando tus resultados personalizados...",
    tryAgain: "Intentar de Nuevo",
    searchAnother: "Buscar Otro Artículo",
    yourDeals: "Tus Ofertas",
    sortBy: "Ordenar por:",
    priceSort: "Precio: Menor a Mayor",
    discountSort: "Mayor Descuento",
    deliverySort: "Entrega Más Rápida",
    trustedSort: "Sitios de Confianza",
    viewDeal: "Ver Oferta",
    estDelivery: "Entrega Est.",
    noDealsError: "No se encontraron ofertas para este artículo. Prueba con una imagen más clara o un producto diferente.",
    aiInitError: "Error al inicializar la IA. Por favor, comprueba tu clave de API.",
    genericError: "Ocurrió un error:",
    productIdentError: "No se pudo identificar el producto en la imagen.",
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
    loading1: "Identification de votre produit...",
    loading2: "Recherche d'offres sur les sites e-commerce...",
    loading3: "Compilation des prix en temps réel...",
    loading4: "Recherche d'images et de logos de produits...",
    loading5: "Finalisation de vos résultats personnalisés...",
    tryAgain: "Réessayer",
    searchAnother: "Chercher un autre article",
    yourDeals: "Vos Offres",
    sortBy: "Trier par:",
    priceSort: "Prix : Croissant",
    discountSort: "Plus Grande Réduction",
    deliverySort: "Livraison la Plus Rapide",
    trustedSort: "Sites de Confiance",
    viewDeal: "Voir l'offre",
    estDelivery: "Livraison Est.",
    noDealsError: "Aucune offre trouvée pour cet article. Essayez une image plus claire ou un produit différent.",
    aiInitError: "Échec de l'initialisation de l'IA. Veuillez vérifier votre clé API.",
    genericError: "Une erreur est survenue:",
    productIdentError: "Impossible d'identifier le produit dans l'image.",
    queryPlaceholder: "Optionnel : trouver une pièce, une autre couleur, etc.",
    search: "Rechercher",
    cancel: "Annuler",
    enterLocationPrompt: "D'abord, trouvons des offres livrables chez vous.",
    selectCountry: "Sélectionnez votre pays",
    pincodePlaceholder: "Entrez le code postal",
    selectCountryFirst: "Veuillez d'abord sélectionner un pays.",
    invalidPincode: "Format de code postal invalide pour le pays sélectionné.",
    enterLocationFirst: "Veuillez entrer votre pays et votre code postal ci-dessus pour commencer la recherche."
  },
};

const countries = [
    { name: "United States", code: "US" }, { name: "Canada", code: "CA" }, { name: "United Kingdom", code: "GB" }, { name: "India", code: "IN" },
    { name: "Australia", code: "AU" }, { name: "Germany", code: "DE" }, { name: "France", code: "FR" }, { name: "Japan", code: "JP" },
    { name: "Brazil", code: "BR" }, { name: "China", code: "CN" }, { name: "Afghanistan", code: "AF" }, { name: "Albania", code: "AL" },
    { name: "Algeria", code: "DZ" }, { name: "Argentina", code: "AR" }, { name: "Austria", code: "AT" }, { name: "Bangladesh", code: "BD" },
    { name: "Belgium", code: "BE" }, { name: "Bolivia", code: "BO" }, { name: "Chile", code: "CL" }, { name: "Colombia", code: "CO" },
    { name: "Denmark", code: "DK" }, { name: "Egypt", code: "EG" }, { name: "Finland", code: "FI" }, { name: "Greece", code: "GR" },
    { name: "Indonesia", code: "ID" }, { name: "Ireland", code: "IE" }, { name: "Israel", code: "IL" }, { name: "Italy", code: "IT" },
    { name: "Malaysia", code: "MY" }, { name: "Mexico", code: "MX" }, { name: "Netherlands", code: "NL" }, { name: "New Zealand", code: "NZ" },
    { name: "Nigeria", code: "NG" }, { name: "Norway", code: "NO" }, { name: "Pakistan", code: "PK" }, { name: "Peru", code: "PE" },
    { name: "Philippines", code: "PH" }, { name: "Poland", code: "PL" }, { name: "Portugal", code: "PT" }, { name: "Russia", code: "RU" },
    { name: "Saudi Arabia", code: "SA" }, { name: "Singapore", code: "SG" }, { name: "South Africa", code: "ZA" }, { name: "South Korea", code: "KR" },
    { name: "Spain", code: "ES" }, { name: "Sweden", code: "SE" }, { name: "Switzerland", code: "CH" }, { name: "Thailand", code: "TH" },
    { name: "Turkey", code: "TR" }, { name: "Ukraine", code: "UA" }, { name: "United Arab Emirates", code: "AE" }, { name: "Vietnam", code: "VN" }
];

const pincodeRegexMap: { [key: string]: RegExp } = {
  US: /^\d{5}(-\d{4})?$/,
  CA: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
  GB: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i,
  IN: /^\d{6}$/,
  AU: /^\d{4}$/,
  DE: /^\d{5}$/,
  FR: /^\d{5}$/,
  JP: /^\d{3}-\d{4}$/,
  BR: /^\d{5}-\d{3}$/,
  CN: /^\d{6}$/
};

interface Deal {
  productName: string;
  retailer: string;
  price: number;
  priceString: string;
  originalPrice?: number;
  deliveryEstimate: string;
  productImageUrl: string;
  retailerLogoUrl: string;
  discount: number;
  isAvailable: boolean;
  searchQuery: string;
  retailerDomain: string;
}
type SortByType = 'price' | 'delivery' | 'discount' | 'trusted';

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

const dealSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        productName: { type: Type.STRING },
        retailer: { type: Type.STRING, description: "The name of the e-commerce platform, e.g., 'Amazon', 'Walmart'." },
        price: { type: Type.NUMBER, description: "The current selling price as a number, for sorting purposes." },
        priceString: { type: Type.STRING, description: "The price formatted as a string with the correct local currency symbol, e.g., '$19.99', '€25.00', '₹1,499.00'." },
        originalPrice: { type: Type.NUMBER, description: "The original price if the item is on sale, otherwise same as price." },
        deliveryEstimate: { type: Type.STRING, description: "A brief delivery estimate, e.g., '2-3 days'." },
        productImageUrl: { type: Type.STRING, description: "CRITICAL: A direct, valid URL to the main high-quality image of the product from the retailer's page." },
        retailerLogoUrl: { type: Type.STRING, description: "A direct, valid URL to the logo of the retailer." },
        isAvailable: { type: Type.BOOLEAN, description: "Set to true if the product is in stock and available, otherwise false." },
        searchQuery: { type: Type.STRING, description: "A concise and precise search query for the product, like a model number or exact title, to be used in a URL." },
        retailerDomain: { type: Type.STRING, description: "The base domain of the retailer's website, e.g., 'amazon.com', 'walmart.ca', 'flipkart.com'." }
      },
      required: ["productName", "retailer", "price", "priceString", "deliveryEstimate", "productImageUrl", "retailerLogoUrl", "isAvailable", "searchQuery", "retailerDomain"]
    }
};

const getSearchUrl = (domain: string, query: string): string => {
    const encodedQuery = encodeURIComponent(query);
    try {
        const url = new URL(`https://${domain}`);
        if (url.hostname.includes('amazon')) {
            return `https://${url.hostname}/s?k=${encodedQuery}`;
        }
        if (url.hostname.includes('walmart')) {
            return `https://${url.hostname}/search?q=${encodedQuery}`;
        }
        if (url.hostname.includes('ebay')) {
            return `https://${url.hostname}/sch/i.html?_nkw=${encodedQuery}`;
        }
        if (url.hostname.includes('flipkart')) {
            return `https://${url.hostname}/search?q=${encodedQuery}`;
        }
    } catch (e) {
        console.error("Invalid domain provided for search URL:", domain);
    }
    // Generic fallback
    return `https://${domain}/search?q=${encodedQuery}`;
};


function App() {
  const [image, setImage] = useState<{ file: File; dataUrl: string } | null>(null);
  const [textQuery, setTextQuery] = useState('');
  const [productName, setProductName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [deals, setDeals] = useState<Deal[]>([]);
  const [error, setError] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [pincode, setPincode] = useState('');
  const [pincodeError, setPincodeError] = useState('');
  const [sortBy, setSortBy] = useState<SortByType>('price');
  const [ai, setAi] = useState<GoogleGenAI | null>(null);
  const [language, setLanguage] = useState<'en' | 'es' | 'fr'>('en');
  const [columns, setColumns] = useState<number>(3);

  const t = useCallback((key: keyof typeof translations['en']) => {
    return translations[language][key] || translations['en'][key];
  }, [language]);
  
  const LOADING_MESSAGES = useMemo(() => [t('loading1'), t('loading2'), t('loading3'), t('loading4'), t('loading5')], [t]);

  useEffect(() => {
    try {
      setAi(new GoogleGenAI({apiKey: process.env.API_KEY}));
    } catch (e) {
      setError(t('aiInitError'));
      console.error(e);
    }
  }, [t]);

  useEffect(() => {
    let interval: number;
    if (isLoading) {
      let messageIndex = 0;
      setLoadingMessage(LOADING_MESSAGES[0]);
      interval = window.setInterval(() => {
        messageIndex = (messageIndex + 1) % LOADING_MESSAGES.length;
        setLoadingMessage(LOADING_MESSAGES[messageIndex]);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isLoading, LOADING_MESSAGES]);

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

    try {
      const base64Data = await fileToBase64(image.file);
      const imagePart = { inlineData: { mimeType: image.file.type, data: base64Data } };
      
      const countryName = countries.find(c => c.code === selectedCountry)?.name || selectedCountry;
      const locationInfo = `The user's delivery location is in ${countryName}, with the postal code: "${pincode}". Based on this location, determine the local currency and provide all prices in that currency.`;
      
      const userPrompt = textQuery 
        ? `The user provided this specific request for the product in the image: "${textQuery}". `
        : 'Identify the primary product in the image. ';
      
      const prompt = `You are an expert shopping assistant. ${userPrompt}${locationInfo} Search major e-commerce platforms like Amazon, Walmart, eBay, and others to find at least 20 current, real deals for this product or the closest available matches. CRITICAL: Only include products that are currently in stock and available for purchase. CRITICAL: The productImageUrl MUST be the primary image from the product's listing page on the retailer's website. Do not use generic or search result images. Return the results as a JSON array.`;
      
      const dealsResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, { text: prompt }] },
        config: { 
          responseMimeType: "application/json",
          responseSchema: dealSchema
        },
      });
      
      let parsedDeals: Deal[] = JSON.parse(dealsResponse.text);

      parsedDeals = parsedDeals
        .filter(d => d.isAvailable)
        .map(d => ({
          ...d,
          discount: d.originalPrice && d.price < d.originalPrice ? Math.round(((d.originalPrice - d.price) / d.originalPrice) * 100) : 0,
        }));


      setProductName(parsedDeals[0]?.productName || t('yourDeals'));
      if (parsedDeals.length === 0) setError(t('noDealsError'));
      setDeals(parsedDeals);

    } catch (e: any) {
      setError(`${t('genericError')} ${e.message}`);
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
  }

  const sortedDeals = useMemo(() => {
    const trustedRetailers = ['amazon', 'walmart', 'ebay', 'best buy', 'target', 'flipkart'];
    return [...deals].sort((a, b) => {
      switch (sortBy) {
        case 'trusted':
            const aIsTrusted = trustedRetailers.some(tr => a.retailer.toLowerCase().includes(tr));
            const bIsTrusted = trustedRetailers.some(tr => b.retailer.toLowerCase().includes(tr));
            if (aIsTrusted && !bIsTrusted) return -1;
            if (!aIsTrusted && bIsTrusted) return 1;
            return a.price - b.price; // fallback to price for trusted sites
        case 'discount': return b.discount - a.discount;
        case 'delivery': return (parseInt(a.deliveryEstimate) || 99) - (parseInt(b.deliveryEstimate) || 99);
        case 'price': default: return a.price - b.price;
      }
    });
  }, [deals, sortBy]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="loading-container">
          {image && <img src={image.dataUrl} alt="Uploaded product" />}
          <div className="spinner"></div>
          <p className="loading-message" aria-live="polite">{loadingMessage}</p>
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
                    <option value="price">{t('priceSort')}</option>
                    <option value="discount">{t('discountSort')}</option>
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
                        <span className="original-price">${deal.originalPrice.toFixed(2)}</span>
                      )}
                    </div>
                    <p>{t('estDelivery')}: {deal.deliveryEstimate}</p>
                  </div>
                </div>
                 <div className="deal-card-footer">
                    <a href={getSearchUrl(deal.retailerDomain, deal.searchQuery)} target="_blank" rel="noopener noreferrer">{t('viewDeal')}</a>
                 </div>
              </div>
            ))}
          </div>
          <div style={{textAlign: 'center', marginTop: '1.5rem'}}>
            <button className="button" onClick={handleReset}>{t('searchAnother')}</button>
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
             <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="45" stroke="url(#paint0_linear_logo)" strokeWidth="10"/>
                <path d="M62.366 28H37.634C35.9521 28 34.5625 29.2312 34.3914 30.9028L31 68L50 82L69 68L65.6086 30.9028C65.4375 29.2312 64.0479 28 62.366 28Z" fill="url(#paint1_linear_logo)"/>
                <path d="M50 50L31 68M50 50L69 68" stroke="white" strokeOpacity="0.3" strokeWidth="2"/>
                <circle cx="50" cy="46" r="10" fill="white"/>
                <circle cx="50" cy="46" r="5" fill="#0d8eff"/>
                <defs>
                <linearGradient id="paint0_linear_logo" x1="50" y1="0" x2="50" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFFFFF"/>
                <stop offset="1" stopColor="#B3D5FF"/>
                </linearGradient>
                <linearGradient id="paint1_linear_logo" x1="50" y1="28" x2="50" y2="82" gradientUnits="userSpaceOnUse">
                <stop stopColor="#0d8eff"/>
                <stop offset="1" stopColor="#0056B3"/>
                </linearGradient>
                </defs>
            </svg>
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