import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { RotateCcw, AlertTriangle, Clock, Camera, Mail, Phone } from "lucide-react";

const RefundPolicy = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <main className="flex-1 pt-32 pb-20">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="text-center mb-12 animate-fade-in">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gold/10 rounded-full mb-6">
                            <RotateCcw className="h-8 w-8 text-gold" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-heading mb-4">Refund & Return Policy</h1>
                        <p className="text-muted-foreground">We stand behind the quality of our products</p>
                    </div>

                    <div className="prose prose-lg max-w-none space-y-8 animate-slide-up">
                        <section className="glass p-8 rounded-3xl space-y-4 bg-red-500/5 border border-red-500/20">
                            <div className="flex items-center gap-3 mb-4">
                                <AlertTriangle className="h-6 w-6 text-red-500" />
                                <h2 className="text-2xl font-heading m-0 text-red-600">Important: Damaged Products Only</h2>
                            </div>
                            <p className="text-muted-foreground leading-relaxed font-bold">
                                We only accept returns for products that are damaged during shipping.
                            </p>
                            <p className="text-muted-foreground leading-relaxed">
                                Due to the nature of our luxury fragrances, we cannot accept returns for:
                            </p>
                            <ul className="space-y-2 text-muted-foreground">
                                <li>Change of mind</li>
                                <li>Dislike of fragrance</li>
                                <li>Wrong product ordered by customer</li>
                                <li>Opened or used products</li>
                            </ul>
                        </section>

                        <section className="glass p-8 rounded-3xl space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <Clock className="h-6 w-6 text-gold" />
                                <h2 className="text-2xl font-heading m-0">24-Hour Reporting Window</h2>
                            </div>
                            <div className="bg-gold/10 p-6 rounded-xl border border-gold/20">
                                <p className="text-lg font-bold text-gold m-0 mb-2">
                                    Report damaged products within 24 hours of delivery
                                </p>
                                <p className="text-sm text-muted-foreground m-0">
                                    Claims reported after 24 hours will not be accepted. Please inspect your order immediately upon delivery.
                                </p>
                            </div>
                        </section>

                        <section className="glass p-8 rounded-3xl space-y-4">
                            <h2 className="text-2xl font-heading">Eligible for Return</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Products are eligible for return only if:
                            </p>
                            <ul className="space-y-2 text-muted-foreground">
                                <li>Product arrived broken, cracked, or leaking</li>
                                <li>Packaging was severely damaged during transit</li>
                                <li>Wrong product was delivered (our error)</li>
                                <li>Product is defective or damaged</li>
                            </ul>
                            <div className="bg-muted/30 p-4 rounded-xl border border-border/50 mt-4">
                                <p className="text-sm font-bold mb-2">Not Eligible for Return</p>
                                <ul className="text-sm text-muted-foreground space-y-1 m-0">
                                    <li>• Seal broken or product used</li>
                                    <li>• Minor packaging dents that don't affect product</li>
                                    <li>• Fragrance preference issues</li>
                                    <li>• Buyer's remorse</li>
                                </ul>
                            </div>
                        </section>

                        <section className="glass p-8 rounded-3xl space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <Camera className="h-6 w-6 text-gold" />
                                <h2 className="text-2xl font-heading m-0">Return Process</h2>
                            </div>
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-gold text-white rounded-full flex items-center justify-center font-bold">1</div>
                                    <div>
                                        <h3 className="font-bold mb-1">Document the Damage</h3>
                                        <p className="text-sm text-muted-foreground m-0">
                                            Take clear photos/videos of:
                                        </p>
                                        <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                                            <li>• Damaged product</li>
                                            <li>• Outer packaging</li>
                                            <li>• Shipping label</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-gold text-white rounded-full flex items-center justify-center font-bold">2</div>
                                    <div>
                                        <h3 className="font-bold mb-1">Contact Us Within 24 Hours</h3>
                                        <p className="text-sm text-muted-foreground m-0">
                                            Email us at <a href="mailto:contact@puniora.com" className="text-gold hover:underline">contact@puniora.com</a> or call <strong>+91 7010418285</strong>
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-2 m-0">
                                            Include: Order ID, photos/videos, and description of damage
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-gold text-white rounded-full flex items-center justify-center font-bold">3</div>
                                    <div>
                                        <h3 className="font-bold mb-1">Await Approval</h3>
                                        <p className="text-sm text-muted-foreground m-0">
                                            Our team will review your claim within 24-48 hours and approve if eligible
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-gold text-white rounded-full flex items-center justify-center font-bold">4</div>
                                    <div>
                                        <h3 className="font-bold mb-1">Return Pickup</h3>
                                        <p className="text-sm text-muted-foreground m-0">
                                            Once approved, we'll arrange a free pickup from your address
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-gold text-white rounded-full flex items-center justify-center font-bold">5</div>
                                    <div>
                                        <h3 className="font-bold mb-1">Inspection & Refund</h3>
                                        <p className="text-sm text-muted-foreground m-0">
                                            After receiving and inspecting the product, refund will be processed
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="glass p-8 rounded-3xl space-y-4">
                            <h2 className="text-2xl font-heading">Refund Timeline</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                                    <h3 className="font-bold text-gold mb-2">Online Payment</h3>
                                    <p className="text-muted-foreground text-sm m-0">
                                        Refund to original payment method within <strong>7-10 business days</strong>
                                    </p>
                                </div>
                                <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                                    <h3 className="font-bold text-gold mb-2">Cash on Delivery</h3>
                                    <p className="text-muted-foreground text-sm m-0">
                                        Bank transfer within <strong>7-10 business days</strong> (bank details required)
                                    </p>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-4">
                                Refund processing time may vary depending on your bank or payment provider.
                            </p>
                        </section>

                        <section className="glass p-8 rounded-3xl space-y-4">
                            <h2 className="text-2xl font-heading">Replacement Option</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                For damaged products, you may choose:
                            </p>
                            <ul className="space-y-2 text-muted-foreground">
                                <li><strong>Full Refund:</strong> Money back to original payment method</li>
                                <li><strong>Replacement:</strong> Same product shipped at no extra cost (subject to availability)</li>
                            </ul>
                        </section>

                        <section className="glass p-8 rounded-3xl space-y-4">
                            <h2 className="text-2xl font-heading">Conditions</h2>
                            <ul className="space-y-2 text-muted-foreground">
                                <li>Product must be in original packaging (unopened)</li>
                                <li>All accessories and documentation must be included</li>
                                <li>Proof of purchase (order ID) required</li>
                                <li>Photos/videos of damage are mandatory</li>
                            </ul>
                        </section>

                        <section className="glass p-8 rounded-3xl space-y-4 bg-gold/5 border border-gold/20">
                            <h2 className="text-2xl font-heading">Contact Us</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                For return and refund queries:
                            </p>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Mail className="h-5 w-5 text-gold" />
                                    <a href="mailto:contact@puniora.com" className="text-gold hover:underline">contact@puniora.com</a>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="h-5 w-5 text-gold" />
                                    <span className="text-muted-foreground">+91 7010418285</span>
                                </div>
                            </div>
                            <div className="bg-white/50 p-4 rounded-xl mt-4">
                                <p className="text-sm font-bold mb-1">Business Hours</p>
                                <p className="text-sm text-muted-foreground m-0">Monday - Saturday: 10:00 AM - 6:00 PM IST</p>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default RefundPolicy;
