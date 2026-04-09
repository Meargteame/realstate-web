import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Globe, Phone, Mail, Facebook, Linkedin, Twitter, Youtube, Instagram } from "lucide-react";
import { Link } from "react-router-dom";

export interface AgentProps {
  name: string;
  office: string;
  license: string;
  languages: string[];
  phone: string;
  email: string;
  image?: string;
  isLuxury?: boolean;
}

const AgentCard: React.FC<{ agent: AgentProps }> = ({ agent }) => {
  return (
    <Card className="group rounded-2xl overflow-hidden border-surface-variant/40 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500 h-full flex flex-col pt-6 px-6 pb-4 bg-gradient-to-b from-surface-container-lowest to-surface-container-low/30 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative aspect-square bg-surface-container-low rounded-2xl overflow-hidden mb-6 shadow-inner ring-1 ring-black/5">
        {agent.image ? (
          <img 
            src={agent.image} 
            alt={agent.name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-on-surface/40 text-5xl font-light tracking-widest bg-gradient-to-br from-surface-container to-surface-container-high group-hover:scale-105 transition-transform duration-700">
            {agent.name.split(' ').map(n => n[0]).join('')}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {agent.isLuxury && (
          <Badge className="absolute top-3 left-3 bg-white/90 dark:bg-black/90 backdrop-blur-md text-on-surface shadow-lg border border-white/20 rounded-md px-2.5 py-1 text-[11px] font-semibold tracking-wide gap-1 flex items-center transform -translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
            <span className="text-xs mr-0.5">💎</span> LUXURY
          </Badge>
        )}
      </div>
      <CardContent className="p-0 flex flex-col flex-1 relative z-10">
        <h3 className="text-[19px] font-bold mb-1 text-on-surface leading-tight group-hover:text-primary transition-colors duration-300">
          {agent.name}
        </h3>
        <div className="flex items-center gap-2 mb-4">
          <span className="px-2 py-0.5 rounded-sm bg-surface-container text-[10px] font-medium text-on-surface/70 uppercase tracking-wider">
            License
          </span>
          <span className="text-[12px] font-medium text-on-surface/60">{agent.license}</span>
        </div>
        
        <div className="flex-1">
          <p className="text-[14px] font-bold text-on-surface/80 leading-snug mb-5 flex items-start gap-2">
            <span className="w-1 h-4 bg-primary/30 rounded-full mt-0.5 shrink-0 group-hover:bg-primary transition-colors" />
            {agent.office}
          </p>

          <div className="flex items-center gap-2.5 text-on-surface/70 mb-5 bg-surface-container-lowest border border-surface-variant/50 rounded-lg py-2 px-3 w-fit shadow-sm">
            <Globe className="w-3.5 h-3.5 text-primary/70" />
            <span className="text-[12px] font-semibold">{agent.languages.join(', ')}</span>
          </div>

          <div className="flex flex-col gap-3.5 pl-1">
            <Link to={`tel:${agent.phone}`} className="flex items-center gap-3 text-on-surface/80 hover:text-primary transition-all w-fit group/link">
              <div className="bg-surface-container p-1.5 rounded-md group-hover/link:bg-primary/10 group-hover/link:text-primary text-on-surface/50 transition-colors">
                <Phone className="w-3.5 h-3.5" />
              </div>
              <span className="text-[13px] font-semibold">{agent.phone}</span>
            </Link>
            <Link to={`mailto:${agent.email}`} className="flex items-center gap-3 text-on-surface/80 hover:text-primary transition-all w-fit group/link">
              <div className="bg-surface-container p-1.5 rounded-md group-hover/link:bg-primary/10 group-hover/link:text-primary text-on-surface/50 transition-colors">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <span className="text-[13px] font-semibold">{agent.email}</span>
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-around mt-7 pt-4 border-t border-surface-container-highest/30">
          {[
            { icon: Facebook, href: "#" },
            { icon: Linkedin, href: "#" },
            { icon: Twitter, href: "#" },
            { icon: Youtube, href: "#" },
            { icon: Instagram, href: "#" },
          ].map((social, idx) => (
            <Link key={idx} to={social.href} className="p-2 text-on-surface/40 hover:text-primary hover:bg-primary/10 hover:-translate-y-1 hover:shadow-sm transition-all duration-300 rounded-full">
              <social.icon className="w-[18px] h-[18px]" />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentCard;
