import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Mail, Phone, MapPin, Send, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Contact = () => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        message: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate form submission
        setTimeout(() => {
            toast.success("Message sent! We'll get back to you soon.");
            setFormData({ name: "", email: "", phone: "", message: "" });
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <main className="flex-1 pt-32 pb-20">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="text-center mb-12 animate-fade-in">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gold/10 rounded-full mb-6">
                            <MessageSquare className="h-8 w-8 text-gold" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-heading mb-4">Get In Touch</h1>
                        <p className="text-xl text-muted-foreground">We'd love to hear from you</p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12">
                        {/* Contact Form */}
                        <div className="glass p-8 rounded-3xl animate-slide-up">
                            <h2 className="text-2xl font-heading mb-6">Send Us a Message</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name *</Label>
                                    <Input
                                        id="name"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Your name"
                                        className="h-12"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="your@email.com"
                                        className="h-12"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+91 XXXX XXX XXX"
                                        className="h-12"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="message">Message *</Label>
                                    <Textarea
                                        id="message"
                                        required
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        placeholder="How can we help you?"
                                        className="min-h-[150px]"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gold hover:bg-gold/90 text-white h-12"
                                >
                                    {loading ? (
                                        <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Sending...</>
                                    ) : (
                                        <><Send className="h-4 w-4 mr-2" /> Send Message</>
                                    )}
                                </Button>
                            </form>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
                            <div className="glass p-8 rounded-3xl space-y-6">
                                <h2 className="text-2xl font-heading">Contact Information</h2>

                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="h-12 w-12 bg-gold/10 rounded-xl flex items-center justify-center shrink-0">
                                            <Mail className="h-6 w-6 text-gold" />
                                        </div>
                                        <div>
                                            <p className="font-bold mb-1">Email</p>
                                            <a href="mailto:support@puniora.com" className="text-muted-foreground hover:text-gold transition-colors">
                                                support@puniora.com
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="h-12 w-12 bg-gold/10 rounded-xl flex items-center justify-center shrink-0">
                                            <Phone className="h-6 w-6 text-gold" />
                                        </div>
                                        <div>
                                            <p className="font-bold mb-1">Phone</p>
                                            <p className="text-muted-foreground">+91 XXXX XXX XXX</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="h-12 w-12 bg-gold/10 rounded-xl flex items-center justify-center shrink-0">
                                            <MapPin className="h-6 w-6 text-gold" />
                                        </div>
                                        <div>
                                            <p className="font-bold mb-1">Address</p>
                                            <p className="text-muted-foreground">
                                                Mumbai, Maharashtra<br />
                                                India
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="glass p-8 rounded-3xl space-y-4">
                                <h3 className="text-xl font-heading">Business Hours</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Monday - Friday</span>
                                        <span className="font-bold">10:00 AM - 6:00 PM</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Saturday</span>
                                        <span className="font-bold">10:00 AM - 4:00 PM</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Sunday</span>
                                        <span className="font-bold">Closed</span>
                                    </div>
                                </div>
                            </div>

                            <div className="glass p-8 rounded-3xl space-y-4 bg-gold/5 border border-gold/20">
                                <h3 className="text-xl font-heading">Quick Links</h3>
                                <div className="space-y-2">
                                    <a href="/track-order" className="block text-gold hover:underline">Track Your Order</a>
                                    <a href="/refund-policy" className="block text-gold hover:underline">Returns & Refunds</a>
                                    <a href="/shipping-policy" className="block text-gold hover:underline">Shipping Information</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Contact;
