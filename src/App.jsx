import { useState, useEffect } from 'react';
import DvcRenderer from './components/DvcRenderer';
import LoadingScreen from './components/LoadingScreen';
import { START_SCREEN } from './cardConfig';

/**
 * App
 * ─────────────────────────────────────────────────────────
 * Root component — uses static card data for development.
 * Swap to API fetch when ready for production.
 */

// Path to your card image assets (relative to public/)
const ASSETS_PATH = '/assets/images/';

// Static card data for development / demo
const STATIC_CARD_DATA = {
  id: 1,
  user_name: 'Pradeep Prabhakar Kelkar',
  user_designation: 'Senior Vice President',
  department_name: 'Wealth Management',
  email: 'pradeep.kelkar@kunvarji.com',
  mobile_number: '+91 98765 43210',
  address: 'Kunvarji Wealth, Ahmedabad, Gujarat, India',
  company_name: 'Kunvarji Wealth',
  website: 'https://kunvarjiwealth.com',

  // Social links
  facebook_url: 'https://www.facebook.com/kunvarji',
  instagram_url: 'https://www.instagram.com/kunvarji',
  linkedin_url: 'https://www.linkedin.com/company/kunvarji',
  x_url: 'https://x.com/kunvarji',

  // Media
  qr_code: null,
  presentations: null,
  profile_picture: null,
};

export default function App() {
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(START_SCREEN);

  useEffect(() => {
    // Simulate a brief loading state for polish
    const timer = setTimeout(() => {
      setCardData(STATIC_CARD_DATA);

      // Update document title
      let titleText = STATIC_CARD_DATA.user_name;
      if (STATIC_CARD_DATA.user_designation) titleText += ' - ' + STATIC_CARD_DATA.user_designation;
      titleText += ' | Digital Visiting Card';
      if (STATIC_CARD_DATA.company_name) titleText += ' | ' + STATIC_CARD_DATA.company_name;
      document.title = titleText;

      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <DvcRenderer 
      cardData={cardData} 
      assetsPath={ASSETS_PATH} 
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
    />
  );
}
