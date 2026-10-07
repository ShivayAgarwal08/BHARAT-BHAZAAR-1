import React, { createContext, useContext, useState, useEffect } from 'react';

// Basic translations
const translations = {
  en: {
    // Artisan Dashboard
    myShop: "My Shop",
    addNewProduct: "Add New Product",
    shopStats: "Shop Statistics",
    totalProducts: "Total Products",
    totalViews: "Total Views",
    totalOrders: "Total Orders",
    recentProducts: "Recent Products",
    price: "Price",
    stock: "Stock",
    views: "Views",
    edit: "Edit",
    delete: "Delete",
    noProducts: "You haven't added any products yet.",
    // Create Request
    createRequest: "Create Growth Request",
    createRequestSub: "Find a student to help grow your business digitally.",
    // Add Product
    backToDashboard: "Back to Dashboard",
    addProductTitle: "Add New Product",
    titleLabel: "Product Title",
    titlePlaceholder: "e.g., Handwoven Silk Saree",
    descLabel: "Description",
    descPlaceholder: "Describe your product...",
    priceLabel: "Price (₹)",
    quantityLabel: "Quantity Available",
    categoryLabel: "Category",
    imageLabel: "Product Image",
    saving: "Saving...",
    saveProduct: "Save Product",
    // Language Toggle
    switchToHindi: "हिंदी",
    switchToEnglish: "English"
  },
  hi: {
    // Artisan Dashboard
    myShop: "मेरी दुकान",
    addNewProduct: "नया उत्पाद जोड़ें",
    shopStats: "दुकान के आंकड़े",
    totalProducts: "कुल उत्पाद",
    totalViews: "कुल दृश्य",
    totalOrders: "कुल आदेश",
    recentProducts: "हाल के उत्पाद",
    price: "कीमत",
    stock: "स्टॉक",
    views: "दृश्य",
    edit: "संपादित करें",
    delete: "हटाएं",
    noProducts: "आपने अभी तक कोई उत्पाद नहीं जोड़ा है।",
    // Create Request
    createRequest: "विकास अनुरोध बनाएं",
    createRequestSub: "अपने व्यवसाय को डिजिटल रूप से बढ़ाने में मदद के लिए एक छात्र खोजें।",
    // Add Product
    backToDashboard: "डैशबोर्ड पर वापस जाएं",
    addProductTitle: "नया उत्पाद जोड़ें",
    titleLabel: "उत्पाद का शीर्षक",
    titlePlaceholder: "उदा., हाथ से बुनी सिल्क साड़ी",
    descLabel: "विवरण",
    descPlaceholder: "अपने उत्पाद का वर्णन करें...",
    priceLabel: "कीमत (₹)",
    quantityLabel: "उपलब्ध मात्रा",
    categoryLabel: "श्रेणी",
    imageLabel: "उत्पाद की छवि",
    saving: "सहेजा जा रहा है...",
    saveProduct: "उत्पाद सहेजें",
    // Language Toggle
    switchToHindi: "हिंदी",
    switchToEnglish: "English"
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('bb_language') || 'en');

  useEffect(() => {
    localStorage.setItem('bb_language', lang);
  }, [lang]);

  const t = (key) => {
    return translations[lang][key] || translations['en'][key] || key;
  };

  const toggleLanguage = () => {
    setLang(lang === 'en' ? 'hi' : 'en');
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
