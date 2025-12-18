import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Users, TrendingUp, Shield, Sparkles, Mail, Phone, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useState } from "react";

const ArtAdvisory = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const services = [
    {
      icon: Users,
      title: "Personal Collection Building",
      description: "Expert guidance in curating a meaningful art collection that reflects your taste and vision.",
      features: ["Personalized recommendations", "Artist introductions", "Collection strategy"],
    },
    {
      icon: TrendingUp,
      title: "Art Investment Advisory",
      description: "Strategic advice on acquiring art as an investment with market insights and value analysis.",
      features: ["Market analysis", "Investment strategy", "Portfolio diversification"],
    },
    {
      icon: Shield,
      title: "Authentication & Appraisal",
      description: "Professional verification and valuation services for your artworks.",
      features: ["Authenticity verification", "Fair market valuation", "Documentation"],
    },
    {
      icon: Sparkles,
      title: "Corporate Art Solutions",
      description: "Transform your business space with carefully selected art that enhances your brand.",
      features: ["Space planning", "Brand alignment", "Installation services"],
    },
  ];

  const advisors = [
    {
      name: "Dr. Sarah Mitchell",
      role: "Senior Art Advisor",
      specialty: "Contemporary & Modern Art",
      experience: "15+ years",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    },
    {
      name: "James Chen",
      role: "Investment Specialist",
      specialty: "Art Market Analysis",
      experience: "12+ years",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    },
    {
      name: "Isabella Romano",
      role: "Collection Curator",
      specialty: "Classical & Renaissance",
      experience: "20+ years",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: "", email: "", phone: "", service: "", message: "" });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-4 sm:mb-6 hover:bg-muted"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Back to Gallery</span>
          <span className="sm:hidden">Back</span>
        </Button>

        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          <Badge variant="secondary" className="mb-4">Expert Guidance</Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Art Advisory Services
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Navigate the art world with confidence. Our expert advisors provide personalized guidance 
            for collectors, investors, and art enthusiasts.
          </p>
        </div>

        {/* Services Grid */}
        <section className="mb-16 sm:mb-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8 text-center">
            Our Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {services.map((service, index) => (
              <Card key={index} className="p-6 sm:p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <service.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {service.title}
                    </h3>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      {service.description}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="mb-16 sm:mb-20">
          <Card className="p-8 sm:p-12 bg-muted/50">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8 text-center">
              Why Choose Our Advisory Services
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">15+</div>
                <p className="text-sm text-muted-foreground">Years of Experience</p>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">500+</div>
                <p className="text-sm text-muted-foreground">Collections Curated</p>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">₹50Cr+</div>
                <p className="text-sm text-muted-foreground">Art Value Managed</p>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">98%</div>
                <p className="text-sm text-muted-foreground">Client Satisfaction</p>
              </div>
            </div>
          </Card>
        </section>

        {/* Meet Our Advisors */}
        <section className="mb-16 sm:mb-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8 text-center">
            Meet Our Expert Advisors
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {advisors.map((advisor, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-muted">
                  <img
                    src={advisor.image}
                    alt={advisor.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-foreground mb-1">
                    {advisor.name}
                  </h3>
                  <p className="text-sm text-primary font-medium mb-2">{advisor.role}</p>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p><span className="font-medium">Specialty:</span> {advisor.specialty}</p>
                    <p><span className="font-medium">Experience:</span> {advisor.experience}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Contact Form */}
        <section className="max-w-3xl mx-auto mb-16">
          <Card className="p-6 sm:p-8 lg:p-10">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                Schedule a Consultation
              </h2>
              <p className="text-muted-foreground">
                Get in touch with our experts to discuss your art needs
              </p>
            </div>

            {isSubmitted ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-foreground mb-2">Thank You!</h3>
                <p className="text-muted-foreground">
                  We've received your inquiry. Our team will contact you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Full Name *
                    </label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Service Interest *
                    </label>
                    <select
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      required
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="">Select a service</option>
                      <option value="collection">Personal Collection Building</option>
                      <option value="investment">Art Investment Advisory</option>
                      <option value="authentication">Authentication & Appraisal</option>
                      <option value="corporate">Corporate Art Solutions</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Message *
                  </label>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about your art needs and goals..."
                    rows={5}
                    required
                  />
                </div>

                <Button type="submit" size="lg" className="w-full">
                  <Calendar className="w-5 h-5 mr-2" />
                  Request Consultation
                </Button>

                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>advisory@artgallery.com</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>+91 98765 43210</span>
                  </div>
                </div>
              </form>
            )}
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ArtAdvisory;

// Made with Bob
