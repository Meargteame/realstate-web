import { motion } from "motion/react";
import { Play, ArrowRight, ShieldCheck, Globe, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

export default function BecomeAgent() {
  return (
    <div className="w-full flex flex-col flex-1 overflow-x-hidden bg-surface-container">
      {/* 1. Immersive Hero Section */}
      <section className="relative h-[85vh] min-h-[700px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 25, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2576&auto=format&fit=crop")' }}
        />
        {/* Deep luxury gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-black/50 to-black/80 z-0" />

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto flex flex-col items-center">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-white text-5xl md:text-7xl lg:text-[90px] font-black mb-8 leading-[1.05] tracking-tight drop-shadow-2xl"
          >
            Where Entrepreneurs <br/> <span className="text-primary">Thrive.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-white/80 text-lg md:text-2xl font-medium leading-relaxed max-w-3xl mb-12"
          >
            ESTATE is home to the dreamers, the doers, and the elite executives. 
            For those who know that real estate is a calling—if you can dream it, you can build it.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative flex items-center justify-center w-24 h-24 rounded-full border border-white/20 hover:border-white/50 bg-black/40 backdrop-blur-md transition-all duration-300 shadow-[0_0_40px_rgba(0,0,0,0.5)]"
          >
            <div className="absolute inset-0 rounded-full border border-primary animate-ping opacity-0 group-hover:opacity-40 transition-opacity" />
            <Play className="w-8 h-8 text-white ml-1 group-hover:text-primary transition-colors" fill="currentColor" />
          </motion.button>
        </div>
      </section>

      {/* 2. Feature Grid / Why Us */}
      <section className="bg-[#111827] relative z-20 -mt-10 mx-4 md:mx-12 rounded-[2rem] shadow-2xl p-10 md:p-16 text-white border border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="flex flex-col items-start">
            <Globe className="w-10 h-10 text-primary mb-6" />
            <h3 className="text-2xl font-bold mb-4">Global Network</h3>
            <p className="text-white/60 leading-relaxed font-medium text-sm">
              Connect with top-tier professionals worldwide. Our vast network empowers you to close international deals effortlessly.
            </p>
          </div>
          <div className="flex flex-col items-start border-t md:border-t-0 md:border-l border-white/10 pt-10 md:pt-0 md:pl-12">
            <TrendingUp className="w-10 h-10 text-primary mb-6" />
            <h3 className="text-2xl font-bold mb-4">Limitless Growth</h3>
            <p className="text-white/60 leading-relaxed font-medium text-sm">
              With elite training and un-capped commission structures, scale your business far beyond traditional limits.
            </p>
          </div>
          <div className="flex flex-col items-start border-t md:border-t-0 md:border-l border-white/10 pt-10 md:pt-0 md:pl-12">
            <ShieldCheck className="w-10 h-10 text-primary mb-6" />
            <h3 className="text-2xl font-bold mb-4">Exclusive Access</h3>
            <p className="text-white/60 leading-relaxed font-medium text-sm">
              Gain access to off-market luxury listings, proprietary tech stacks, and premium concierge services.
            </p>
          </div>
        </div>
      </section>

      {/* 3. The Story Section - Split Layout */}
      <section className="py-32 px-6 max-w-[1400px] mx-auto w-full">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2"
          >
            <span className="text-[11px] font-bold tracking-wider text-primary uppercase mb-4 block">Our Philosophy</span>
            <h2 className="text-4xl md:text-6xl font-black text-on-surface leading-[1.1] mb-8">
              Built by agents, <br/>for agents.
            </h2>
            <div className="w-20 h-1 bg-primary mb-8" />
            <p className="text-lg text-gray-600 leading-relaxed mb-6 font-medium">
              "There's a philosophy built inside this organization that people matter and that you should build an organization around your best people structure, so that you unequivocally succeed with them."
            </p>
            <p className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-10">— Estate Founders</p>
            
            <Link to="#">
              <button className="bg-[#111827] text-white px-8 py-4 rounded-full font-bold text-sm tracking-wider flex items-center gap-3 hover:bg-primary transition-all duration-300">
                DISCOVER OUR CULTURE
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2 relative h-[500px] md:h-[650px] rounded-3xl overflow-hidden shadow-2xl"
          >
            <img 
              src="https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=1000&q=80" 
              alt="Professional"
              className="absolute inset-0 w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-8 left-8 text-white">
              <h3 className="text-2xl font-black mb-1">Millionaire Mindset</h3>
              <p className="text-white/80 font-medium text-sm tracking-widest uppercase">Since 1983</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. Technology & Training - Editorial Cards */}
      <section className="bg-white py-24 px-6 border-t border-gray-100">
        <div className="max-w-[1400px] mx-auto w-full">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-on-surface tracking-tight mb-4">Elevate Your Career</h2>
            <p className="text-gray-500 font-medium text-lg max-w-2xl mx-auto">Explore the tools, training, and operational frameworks designed to scale your performance.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Tech Card */}
            <div className="bg-surface-container rounded-3xl overflow-hidden group">
              <div className="h-64 overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80" alt="Tech" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/20" />
                <span className="absolute top-6 left-6 bg-white/90 backdrop-blur text-[10px] font-bold px-3 py-1.5 uppercase tracking-wider rounded-sm">Innovation</span>
              </div>
              <div className="p-10">
                <h3 className="text-2xl font-black mb-4">Proprietary Technology</h3>
                <p className="text-gray-600 leading-relaxed font-medium mb-8">
                  We believe technology exists to simplify everyday workflows, making room for what truly matters: your client relationships. Experience our AI-driven CRM and seamless transaction pipelines.
                </p>
                <Link to="#" className="text-primary text-sm font-bold flex items-center gap-2 hover:gap-3 transition-all uppercase tracking-widest">
                  Learn More <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Training Card */}
            <div className="bg-surface-container rounded-3xl overflow-hidden group">
              <div className="h-64 overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=1000&q=80" alt="Training" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/20" />
                <span className="absolute top-6 left-6 bg-white/90 backdrop-blur text-[10px] font-bold px-3 py-1.5 uppercase tracking-wider rounded-sm">Excellence</span>
              </div>
              <div className="p-10">
                <h3 className="text-2xl font-black mb-4">World-Class Training</h3>
                <p className="text-gray-600 leading-relaxed font-medium mb-8">
                  Access an ecosystem of award-winning education, coaching, and mentorship. From onboarding basics to advanced wealth-building frameworks, we invest inherently in you.
                </p>
                <Link to="#" className="text-primary text-sm font-bold flex items-center gap-2 hover:gap-3 transition-all uppercase tracking-widest">
                  Learn More <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Call to Action */}
      <section className="bg-primary py-24 px-6 flex flex-col justify-center items-center text-center">
        <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight max-w-3xl leading-[1.1]">Ready to Unlock Your Limitless Potential?</h2>
        <p className="text-white/80 font-medium text-lg md:text-xl max-w-2xl mb-10">
          Join the ranks of top-producing agents who are redefining what it means to run a successful real estate business.
        </p>
        <button className="bg-[#111827] text-white px-10 py-5 rounded-full font-bold text-sm tracking-widest uppercase hover:bg-black transition-all duration-300 shadow-2xl flex items-center gap-3">
          Join Estate Today <ArrowRight className="w-4 h-4" />
        </button>
      </section>
    </div>
  );
}
