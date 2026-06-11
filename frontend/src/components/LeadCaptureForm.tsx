import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface LeadCaptureFormProps {
  agentId: string;
  propertyId?: string;
  buttonText?: string;
  title?: string;
  subtitle?: string;
  onSuccess?: () => void;
}

export function LeadCaptureForm({ 
  agentId, 
  propertyId, 
  buttonText = "Contact Agent", 
  title = "Get in Touch", 
  subtitle = "Have questions or want to schedule a showing?",
  onSuccess 
}: LeadCaptureFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "I am interested in learning more about this property or your services."
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          agentId,
          propertyId
        })
      });

      if (!response.ok) throw new Error("Failed to submit lead");

      setStatus("success");
      setFormData({ name: "", email: "", phone: "", message: "" });
      if (onSuccess) onSuccess();
      
      // Reset success message after 5 seconds
      setTimeout(() => setStatus("idle"), 5000);
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  return (
    <div className="bg-white p-6 border border-gray-200 shadow-sm rounded-md w-full">
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-1">{title}</h3>
        <p className="text-gray-500 text-sm">{subtitle}</p>
      </div>

      {status === "success" ? (
        <div className="bg-green-50 text-green-800 p-4 rounded-md border border-green-200">
          <p className="font-medium">Message sent successfully!</p>
          <p className="text-sm mt-1">The agent will be in contact with you shortly.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input 
              required
              placeholder="Full Name" 
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="h-11 rounded-sm border-gray-300 focus-visible:ring-black"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              required
              type="email" 
              placeholder="Email" 
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="h-11 rounded-sm border-gray-300 focus-visible:ring-black"
            />
            <Input 
              required
              type="tel" 
              placeholder="Phone" 
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className="h-11 rounded-sm border-gray-300 focus-visible:ring-black"
            />
          </div>
          <div>
            <Textarea 
              required
              placeholder="Message" 
              value={formData.message}
              onChange={e => setFormData({ ...formData, message: e.target.value })}
              className="min-h-[100px] resize-none rounded-sm border-gray-300 focus-visible:ring-black"
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={status === "submitting"}
            className="w-full h-12 bg-[#b40101] hover:bg-[#8a0000] text-white font-semibold rounded-sm transition-colors text-base"
          >
            {status === "submitting" ? "Sending..." : buttonText}
          </Button>
          
          <p className="text-[11px] text-center text-gray-500 mt-4 leading-relaxed">
            By clicking "{buttonText}", you agree to our Terms of Use and Privacy Policy, and consent to receive calls/texts from TORRA associates.
          </p>
        </form>
      )}
    </div>
  );
}
