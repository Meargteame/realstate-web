import { Link } from "react-router-dom";

const sections = [
  {
    title: "1. Introduction",
    body: "TORRA Commercial Real Estate Group (\"TORRA\", \"we\", \"us\") respects your privacy. This Privacy Policy explains how we collect, use, and protect your personal information when you use our platform (the \"Service\").",
  },
  {
    title: "2. Information We Collect",
    body: "We collect information you provide directly, such as your name, email address, phone number, and property preferences when you create an account, save searches, contact an agent, or submit a form. We also collect usage data automatically, including pages viewed, searches performed, and device and browser information.",
  },
  {
    title: "3. How We Use Your Information",
    body: "We use your information to provide and improve the Service, match you with relevant properties and agents, send property alerts and transactional emails you request, respond to your inquiries, and maintain the security of the platform.",
  },
  {
    title: "4. Sharing Your Information",
    body: "We share your information with licensed real estate agents when you request to be contacted, and with service providers who perform functions on our behalf (such as email delivery and hosting). We do not sell your personal information to third parties.",
  },
  {
    title: "5. Cookies and Tracking",
    body: "We use cookies and similar technologies to remember your preferences, keep you signed in, and understand how the Service is used. You can control cookies through your browser settings, though some features may not function properly if cookies are disabled.",
  },
  {
    title: "6. Data Security",
    body: "We implement reasonable technical and organizational measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is completely secure, and we cannot guarantee absolute security.",
  },
  {
    title: "7. Your Rights",
    body: "Depending on your jurisdiction, you may have the right to access, correct, or delete the personal information we hold about you, and to opt out of marketing communications. To exercise these rights, contact us using the details below.",
  },
  {
    title: "8. Data Retention",
    body: "We retain your personal information for as long as your account is active or as needed to provide the Service, comply with our legal obligations, resolve disputes, and enforce our agreements.",
  },
  {
    title: "9. Contact Us",
    body: "If you have any questions about this Privacy Policy or our data practices, please contact us at privacy@torra-realestate.com or by mail at 7945 FM 2757, Forney, TX 75126.",
  },
];

export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <p className="text-[11px] font-bold tracking-wider text-[#B40101] uppercase mb-3">Legal</p>
      <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">Privacy Policy</h1>
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
        <Link to="/terms" className="text-[#B40101] font-bold underline underline-offset-2 hover:text-[#8A0000]">
          Terms of Use
        </Link>
        .
      </div>
    </div>
  );
}
