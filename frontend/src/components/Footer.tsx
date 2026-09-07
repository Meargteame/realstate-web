import { Link } from "react-router-dom";
import { useState } from "react";
import { ArrowRight, Twitter, Instagram, Linkedin, Phone, MapPin, Check } from "lucide-react";
import TorraLogo from "./TorraLogo";

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const email = newsletterEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    try {
      const existing = JSON.parse(localStorage.getItem("torra_newsletter") || "[]");
      if (!existing.includes(email)) {
        existing.push(email);
        localStorage.setItem("torra_newsletter", JSON.stringify(existing));
      }
    } catch {
      localStorage.setItem("torra_newsletter", JSON.stringify([email]));
    }
    setSubscribed(true);
    setNewsletterEmail("");
  };

  return (
    <footer style={{ background: '#0f172a', color: '#cbd5e1', paddingTop: '64px', paddingBottom: '48px', paddingLeft: '32px', paddingRight: '32px' }}>
      <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '48px', marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid #334155' }}>
          {/* Brand Info */}
          <div>
            <div style={{ marginBottom: '20px' }}>
              <TorraLogo size={42} color="#ff4d4f" compact showText />
            </div>
            <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#94a3b8', marginBottom: '16px' }}>
              TORRA Commercial & Residential Real Estate Group provides full-service real estate brokerage, property management, and investment advisory services across North America.
            </p>
            <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.6 }}>
              <p style={{ margin: '4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin style={{ width: 14, height: 14, color: '#ff4d4f' }} /> 7945 FM 2757, Forney, TX 75126</p>
              <p style={{ margin: '4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}><Phone style={{ width: 14, height: 14, color: '#ff4d4f' }} /> (469) 345-6868</p>
              <p style={{ margin: '4px 0', color: '#64748b' }}>Texas Brokerage License #0751886</p>
            </div>
          </div>

          {/* Real Estate Links */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px' }}>Real Estate</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li><Link to="/properties" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>Homes for Sale</Link></li>
              <li><Link to="/properties?status=For+Rent" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>Apartments & Rentals</Link></li>
              <li><Link to="/properties?type=Commercial" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>Commercial Properties</Link></li>
              <li><Link to="/properties?type=Land" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>Land & Lots</Link></li>
              <li><Link to="/open-houses" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>Open Houses Schedule</Link></li>
            </ul>
          </div>

          {/* Resources & Tools */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px' }}>Resources & Tools</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li><Link to="/home-value" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>Instant Home Value Estimator</Link></li>
              <li><Link to="/mortgage-calculator" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>Mortgage Payment Calculator</Link></li>
              <li><Link to="/affordability-calculator" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>Home Affordability Calculator</Link></li>
              <li><Link to="/agents" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>Find a Top Realtor</Link></li>
              <li><Link to="/blog" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>Real Estate News & Market Trends</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px' }}>Stay Informed</h4>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '20px' }}>
              Get price drop alerts and new market listings delivered weekly to your inbox.
            </p>
            {subscribed ? (
              <div style={{ color: '#4ade80', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check style={{ width: 18, height: 18 }} /> Subscribed to Market Alerts
              </div>
            ) : (
              <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                  style={{
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    color: '#ffffff',
                    fontSize: '14px',
                    width: '100%',
                    outline: 'none'
                  }}
                />
                <button 
                  type="submit" 
                  style={{ 
                    background: '#b40101', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '8px', 
                    padding: '0 16px', 
                    fontWeight: 700, 
                    cursor: 'pointer' 
                  }}
                >
                  Join
                </button>
              </form>
            )}
          </div>
        </div>

        {/* US Real Estate Equal Housing & MLS Disclaimer */}
        <div style={{ borderBottom: '1px solid #334155', paddingBottom: '32px', marginBottom: '32px', fontSize: '12px', color: '#64748b', lineHeight: 1.7 }}>
          <p style={{ marginBottom: '8px' }}>
            <strong>Equal Housing Opportunity:</strong> TORRA Commercial Real Estate Group fully supports the principles of the Fair Housing Act and the Equal Opportunity Act. Each office is independently owned and operated.
          </p>
          <p style={{ margin: 0 }}>
            Listing information is deemed reliable but is not guaranteed and should be independently verified. Properties subject to prior sale, change, or withdrawal. Neither the listing broker nor TORRA Group shall be responsible for any typographical errors, misinformation, or misprints.
          </p>
        </div>

        {/* Bottom Legal Copyright */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
          <div>© 2026 TORRA Commercial Real Estate Group LLC. All rights reserved.</div>
          <div style={{ display: 'flex', gap: '24px' }}>
            <Link to="/terms" style={{ color: '#64748b', textDecoration: 'none' }}>Terms of Use</Link>
            <Link to="/privacy" style={{ color: '#64748b', textDecoration: 'none' }}>Privacy Policy</Link>
            <span style={{ color: '#64748b' }}>Equal Housing</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
