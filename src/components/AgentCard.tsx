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
    <Card className="rounded-2xl overflow-hidden border-gray-100 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
      <div className="relative aspect-[4/5] bg-gray-100">
        {agent.image ? (
          <img 
            src={agent.image} 
            alt={agent.name} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl font-bold">
            {agent.name.split(' ').map(n => n[0]).join('')}
          </div>
        )}
        {agent.isLuxury && (
          <Badge className="absolute top-4 left-4 bg-kw-footer hover:bg-kw-dark text-white rounded-full px-3 py-1 text-[10px] font-bold gap-1">
            <span className="text-xs">💎</span> Luxury
          </Badge>
        )}
      </div>
      <CardContent className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-bold mb-1">{agent.name}</h3>
        <p className="text-[12px] text-gray-500 mb-4">License #: {agent.license}</p>
        
        <div className="flex-1">
          <p className="text-[15px] font-bold text-gray-700 leading-tight mb-4">
            {agent.office}
          </p>

          <div className="flex items-center gap-2 text-gray-600 mb-3">
            <Globe className="w-4 h-4" />
            <span className="text-[13px]">{agent.languages.join(', ')}</span>
          </div>

          <div className="flex flex-col gap-3">
            <Link to={`tel:${agent.phone}`} className="flex items-center gap-2 text-kw-footer hover:text-kw-red transition-colors">
              <Phone className="w-4 h-4" />
              <span className="text-[13px] font-medium underline underline-offset-4">{agent.phone}</span>
            </Link>
            <Link to={`mailto:${agent.email}`} className="flex items-center gap-2 text-kw-footer hover:text-kw-red transition-colors">
              <Mail className="w-4 h-4" />
              <span className="text-[13px] font-medium underline underline-offset-4">{agent.email}</span>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-100">
          <Link to="#" className="text-gray-400 hover:text-kw-dark transition-colors"><Facebook className="w-4 h-4" /></Link>
          <Link to="#" className="text-gray-400 hover:text-kw-dark transition-colors"><Linkedin className="w-4 h-4" /></Link>
          <Link to="#" className="text-gray-400 hover:text-kw-dark transition-colors"><Twitter className="w-4 h-4" /></Link>
          <Link to="#" className="text-gray-400 hover:text-kw-dark transition-colors"><Youtube className="w-4 h-4" /></Link>
          <Link to="#" className="text-gray-400 hover:text-kw-dark transition-colors"><Instagram className="w-4 h-4" /></Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentCard;
