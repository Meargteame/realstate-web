import { Link } from "react-router-dom";
import { useState } from "react";
import { ArrowRight, Twitter, Instagram, Linkedin, Phone, MapPin, Check, ShieldCheck, Home } from "lucide-react";
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
    <footer style={{ background: '#090d16', color: '#cbd5e1', paddingTop: '72px', paddingBottom: '48px', paddingLeft: '32px', paddingRight: '32px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
      <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '48px', marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid #1e293b' }}>
          {/* Brand Info */}
          <div>
            <div style={{ marginBottom: '20px' }}>
              <TorraLogo size={42} color="#ef4444" compact showText />
            </div>
            <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#94a3b8', marginBottom: '20px' }}>
              TORRA Commercial & Luxury Residential Real Estate Group delivers premier brokerage, investment advisory, and property marketing solutions across North America.
            </p>
            <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.6 }}>
              <p style={{ margin: '6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin style={{ width: 15, height: 15, color: '#ef4444' }} /> 7945 FM 2757, Forney, TX 75126</p>
              <p style={{ margin: '6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}><Phone style={{ width: 15, height: 15, color: '#ef4444' }} /> (469) 345-6868</p>
              <p style={{ margin: '6px 0', color: '#64748b', fontSize: '12px' }}>Texas Real Estate Commission License #0751886</p>
            </div>
          </div>

          {/* Real Estate Links */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px' }}>Properties</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li><Link to="/properties" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>All Active Listings</Link></li>
              <li><Link to="/properties?minPrice=1000000" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>Luxury Estates ($1M+)</Link></li>
              <li><Link to="/properties?status=For+Rent" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>Apartments & Leases</Link></li>
              <li><Link to="/properties?type=Commercial" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>Commercial & Retail</Link></li>
              <li><Link to="/properties?type=Land" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>Land & Acreage</Link></li>
              <li><Link to="/open-houses" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>Weekend Open Houses</Link></li>
            </ul>
          </div>

          {/* Resources & Tools */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px' }}>Tools & Insights</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li><Link to="/home-value" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>Instant Home Valuation</Link></li>
              <li><Link to="/mortgage-calculator" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>Mortgage Payment Calculator</Link></li>
              <li><Link to="/affordability-calculator" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>Purchasing Power Calculator</Link></li>
              <li><Link to="/agents" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>Find a Certified Agent</Link></li>
              <li><Link to="/blog" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>Real Estate Market Radar</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px' }}>Market Radar Alerts</h4>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '20px' }}>
              Get price reduction notifications and exclusive off-market listings delivered weekly.
            </p>
            {subscribed ? (
              <div style={{ color: '#4ade80', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(74, 222, 128, 0.1)', padding: '10px 14px', borderRadius: '8px' }}>
                <Check style={{ width: 18, height: 18 }} /> Subscribed to Market Radar
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
                    background: '#131b2e',
                    border: '1px solid #334155',
                    borderRadius: '10px',
                    padding: '12px 14px',
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
                    borderRadius: '10px', 
                    padding: '0 20px', 
                    fontWeight: 800, 
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Join
                </button>
              </form>
            )}
          </div>
        </div>

        {/* US Real Estate Equal Housing & MLS Disclaimer */}
        <div style={{ borderBottom: '1px solid #1e293b', paddingBottom: '32px', marginBottom: '32px', fontSize: '12px', color: '#64748b', lineHeight: 1.7 }}>
          <p style={{ marginBottom: '8px' }}>
            <strong>Equal Housing Opportunity:</strong> TORRA Commercial & Luxury Real Estate Group fully supports the principles of the Fair Housing Act and the Equal Opportunity Act. Each office is independently owned and operated.
          </p>
          <p style={{ margin: 0 }}>
            Listing information is deemed reliable but is not guaranteed and should be independently verified. Properties subject to prior sale, change, or withdrawal. Neither the listing broker nor TORRA Group shall be responsible for any typographical errors, misinformation, or misprints.
          </p>
        </div>

        {/* Bottom Legal Copyright */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
          <div>© 2026 TORRA Commercial & Luxury Real Estate Group LLC. All rights reserved.</div>
          <div style={{ display: 'flex', gap: '24px' }}>
            <Link to="/terms" style={{ color: '#64748b', textDecoration: 'none' }}>Terms of Use</Link>
            <Link to="/privacy" style={{ color: '#64748b', textDecoration: 'none' }}>Privacy Policy</Link>
            <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Home style={{ width: 14, height: 14 }} /> Equal Housing
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
