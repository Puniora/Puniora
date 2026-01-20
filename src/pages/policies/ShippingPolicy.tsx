import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Truck, MapPin, Clock, Package, IndianRupee, Globe } from "lucide-react";

const ShippingPolicy = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <main className="flex-1 pt-32 pb-20">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="text-center mb-12 animate-fade-in">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gold/10 rounded-full mb-6">
                            <Truck className="h-8 w-8 text-gold" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-heading mb-4">Shipping Policy</h1>
                        <p className="text-muted-foreground">Fast, secure, and FREE delivery across India</p>
                    </div>

                    <div className="prose prose-lg max-w-none space-y-8 animate-slide-up">
                        <section className="glass p-8 rounded-3xl space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <IndianRupee className="h-6 w-6 text-gold" />
                                <h2 className="text-2xl font-heading m-0">Shipping Charges</h2>
                            </div>
                            <div className="bg-green-500/10 p-6 rounded-xl border border-green-500/20">
                                <p className="text-2xl font-heading text-green-600 m-0 text-center">
                                    FREE Shipping on All Orders!
                                </p>
                                <p className="text-sm text-muted-foreground text-center mt-2 m-0">
                                    We believe luxury should be accessible. Enjoy complimentary shipping across India.
                                </p>
                            </div>
                        </section>

                        <section className="glass p-8 rounded-3xl space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <Clock className="h-6 w-6 text-gold" />
                                <h2 className="text-2xl font-heading m-0">Delivery Timeframes</h2>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                                    <h3 className="font-bold text-gold mb-2">Metro Cities</h3>
                                    <p className="text-muted-foreground text-sm m-0">3-5 business days</p>
                                    <p className="text-xs text-muted-foreground mt-1 m-0">Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Kolkata</p>
                                </div>
                                <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                                    <h3 className="font-bold text-gold mb-2">Other Cities</h3>
                                    <p className="text-muted-foreground text-sm m-0">5-7 business days</p>
                                    <p className="text-xs text-muted-foreground mt-1 m-0">All other locations across India</p>
                                </div>
                            </div>
                            <div className="bg-gold/5 p-4 rounded-xl border border-gold/20 mt-4">
                                <p className="text-sm text-muted-foreground m-0">
                                    <strong className="text-gold">Note:</strong> Delivery times are estimates and may vary due to unforeseen circumstances, holidays, or weather conditions.
                                </p>
                            </div>
                        </section>

                        <section className="glass p-8 rounded-3xl space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <Package className="h-6 w-6 text-gold" />
                                <h2 className="text-2xl font-heading m-0">Order Processing</h2>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                Orders are processed within 24-48 hours of confirmation. You will receive:
                            </p>
                            <ul className="space-y-2 text-muted-foreground">
                                <li><strong>Order Confirmation:</strong> Immediate email/SMS after placing order</li>
                                <li><strong>Shipping Confirmation:</strong> Tracking details once order is dispatched</li>
                                <li><strong>Delivery Updates:</strong> Real-time SMS notifications</li>
                            </ul>
                        </section>

                        <section className="glass p-8 rounded-3xl space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <Truck className="h-6 w-6 text-gold" />
                                <h2 className="text-2xl font-heading m-0">Shipping Partners</h2>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                We partner with <strong>Shiprocket</strong> and trusted courier services to ensure safe and timely delivery:
                            </p>
                            <div className="grid md:grid-cols-3 gap-3 mt-4">
                                <div className="bg-muted/20 p-3 rounded-lg border border-border/50 text-center">
                                    <p className="font-bold text-sm">Delhivery</p>
                                </div>
                                <div className="bg-muted/20 p-3 rounded-lg border border-border/50 text-center">
                                    <p className="font-bold text-sm">Blue Dart</p>
                                </div>
                                <div className="bg-muted/20 p-3 rounded-lg border border-border/50 text-center">
                                    <p className="font-bold text-sm">DTDC</p>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-4">
                                The courier partner is automatically selected based on your location for optimal delivery.
                            </p>
                        </section>

                        <section className="glass p-8 rounded-3xl space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <MapPin className="h-6 w-6 text-gold" />
                                <h2 className="text-2xl font-heading m-0">Order Tracking</h2>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                Track your order anytime using:
                            </p>
                            <ul className="space-y-2 text-muted-foreground">
                                <li>Order ID and mobile number on our <a href="/track-order" className="text-gold hover:underline">Track Order</a> page</li>
                                <li>Tracking link sent via SMS/email</li>
                                <li>AWB (Air Waybill) number on courier website</li>
                            </ul>
                        </section>

                        <section className="glass p-8 rounded-3xl space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <Globe className="h-6 w-6 text-gold" />
                                <h2 className="text-2xl font-heading m-0">Delivery Coverage</h2>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                We currently deliver to all serviceable pin codes across India. If your location is not serviceable, you will be notified during checkout.
                            </p>
                            <div className="bg-muted/30 p-4 rounded-xl border border-border/50 mt-4">
                                <p className="text-sm font-bold mb-2">International Shipping</p>
                                <p className="text-sm text-muted-foreground m-0">
                                    Currently, we only ship within India. International shipping will be available soon.
                                </p>
                            </div>
                        </section>

                        <section className="glass p-8 rounded-3xl space-y-4">
                            <h2 className="text-2xl font-heading">Packaging</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                All fragrances are carefully packaged in premium boxes with protective materials to ensure they arrive in perfect condition. Each package is sealed and tamper-proof.
                            </p>
                        </section>

                        <section className="glass p-8 rounded-3xl space-y-4">
                            <h2 className="text-2xl font-heading">Failed Delivery Attempts</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                If delivery fails due to:
                            </p>
                            <ul className="space-y-2 text-muted-foreground">
                                <li>Incorrect address</li>
                                <li>Recipient unavailable</li>
                                <li>Refusal to accept</li>
                            </ul>
                            <p className="text-muted-foreground leading-relaxed">
                                The courier will make 2-3 delivery attempts. After that, the order will be returned to us, and you may be charged for re-shipment.
                            </p>
                        </section>

                        <section className="glass p-8 rounded-3xl space-y-4 bg-gold/5 border border-gold/20">
                            <h2 className="text-2xl font-heading">Need Help?</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                For shipping-related queries, contact us:
                            </p>
                            <div className="space-y-2 text-muted-foreground">
                                <p><strong>Email:</strong> <a href="mailto:support@puniora.com" className="text-gold hover:underline">support@puniora.com</a></p>
                                <p><strong>Phone:</strong> +91 XXXX XXX XXX</p>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ShippingPolicy;
