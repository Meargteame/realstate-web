import { Link } from "react-router-dom";

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: "By accessing or using the TORRA Commercial Real Estate Group platform (the \"Service\"), you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use the Service.",
  },
  {
    title: "2. Use of the Service",
    body: "You may use the Service only for lawful purposes and in accordance with these Terms. You agree not to use the Service in any way that violates any applicable federal, state, local, or international law or regulation, or to transmit any advertising or promotional material without our prior written consent.",
  },
  {
    title: "3. Accounts",
    body: "When you create an account with us, you must provide information that is accurate and complete. You are responsible for safeguarding the password you use to access the Service and for any activities under your account. Notify us immediately of any unauthorized use of your account.",
  },
  {
    title: "4. Property Listings",
    body: "Property information displayed on the Service is provided by agents and third-party sources and is believed to be reliable but is not guaranteed. Prices, availability, and property details are subject to change without notice. TORRA is not responsible for errors or omissions in any listing.",
  },
  {
    title: "5. Agent Services",
    body: "TORRA connects buyers and sellers with licensed real estate agents. TORRA does not act as a party to any real estate transaction and makes no representations regarding the conduct of any agent or the outcome of any transaction.",
  },
  {
    title: "6. Intellectual Property",
    body: "The Service and its original content, features, and functionality are and will remain the exclusive property of TORRA Commercial Real Estate Group and its licensors. Our trademarks may not be used without prior written permission.",
  },
  {
    title: "7. Limitation of Liability",
    body: "To the maximum extent permitted by law, TORRA shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your access to or use of, or inability to access or use, the Service.",
  },
  {
    title: "8. Changes to These Terms",
    body: "We reserve the right to modify or replace these Terms at any time. Material changes will be communicated through the Service. Your continued use of the Service after any changes constitutes acceptance of the new Terms.",
  },
  {
    title: "9. Contact Us",
    body: "If you have any questions about these Terms, please contact us at legal@torra-realestate.com or by mail at 7945 FM 2757, Forney, TX 75126.",
  },
];

export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <p className="text-[11px] font-bold tracking-wider text-[#B40101] uppercase mb-3">Legal</p>
      <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">Terms of Use</h1>
      <p className="text-gray-500 mb-12">Last updated: January 1, 2026</p>

      <div className="space-y-10">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-xl font-bold text-gray-900 mb-3">{section.title}</h2>
            <p className="text-gray-600 leading-relaxed">{section.body}</p>
          </section>
        ))}
      </div>

      <div className="mt-16 pt-8 border-t border-gray-200 text-sm text-gray-500">
        See also our{" "}
        <Link to="/privacy" className="text-[#B40101] font-bold underline underline-offset-2 hover:text-[#8A0000]">
          Privacy Policy
        </Link>
        .
      </div>
    </div>
  );
}
