import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Shield, Lock, Eye, Database, UserCheck, FileText } from "lucide-react";

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <main className="flex-1 pt-32 pb-20">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="text-center mb-12 animate-fade-in">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gold/10 rounded-full mb-6">
                            <Shield className="h-8 w-8 text-gold" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-heading mb-4">Privacy Policy</h1>
                        <p className="text-muted-foreground">Last updated: January 20, 2026</p>
                    </div>

                    <div className="prose prose-lg max-w-none space-y-8 animate-slide-up">
                        <section className="glass p-8 rounded-3xl space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <Eye className="h-6 w-6 text-gold" />
                                <h2 className="text-2xl font-heading m-0">Information We Collect</h2>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                At Puniora, we collect information that you provide directly to us when you create an account, place an order, or contact us. This includes:
                            </p>
                            <ul className="space-y-2 text-muted-foreground">
                                <li><strong>Personal Information:</strong> Name, email address, phone number, and shipping address</li>
                                <li><strong>Payment Information:</strong> Processed securely through Razorpay (we do not store card details)</li>
                                <li><strong>Order History:</strong> Products purchased, order dates, and delivery information</li>
                                <li><strong>Device Information:</strong> IP address, browser type, and device identifiers</li>
                            </ul>
                        </section>

                        <section className="glass p-8 rounded-3xl space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <Database className="h-6 w-6 text-gold" />
                                <h2 className="text-2xl font-heading m-0">How We Use Your Information</h2>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                We use the information we collect to:
                            </p>
                            <ul className="space-y-2 text-muted-foreground">
                                <li>Process and fulfill your orders</li>
                                <li>Send order confirmations and shipping updates</li>
                                <li>Respond to your inquiries and provide customer support</li>
                                <li>Improve our products and services</li>
                                <li>Send promotional emails (with your consent)</li>
                                <li>Detect and prevent fraud</li>
                            </ul>
                        </section>

                        <section className="glass p-8 rounded-3xl space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <Lock className="h-6 w-6 text-gold" />
                                <h2 className="text-2xl font-heading m-0">Data Security</h2>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                We implement industry-standard security measures to protect your personal information. All payment transactions are encrypted using SSL technology. Your data is stored securely on Supabase servers with enterprise-grade security.
                            </p>
                            <div className="bg-gold/5 p-4 rounded-xl border border-gold/20 mt-4">
                                <p className="text-sm text-muted-foreground m-0">
                                    <strong className="text-gold">Note:</strong> While we strive to protect your information, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.
                                </p>
                            </div>
                        </section>

                        <section className="glass p-8 rounded-3xl space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <FileText className="h-6 w-6 text-gold" />
                                <h2 className="text-2xl font-heading m-0">Cookies and Tracking</h2>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                We use cookies and similar tracking technologies to enhance your browsing experience. Cookies help us remember your preferences, analyze site traffic, and personalize content. You can control cookie settings through your browser.
                            </p>
                        </section>

                        <section className="glass p-8 rounded-3xl space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <UserCheck className="h-6 w-6 text-gold" />
                                <h2 className="text-2xl font-heading m-0">Your Rights</h2>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                You have the right to:
                            </p>
                            <ul className="space-y-2 text-muted-foreground">
                                <li>Access your personal data</li>
                                <li>Request correction of inaccurate data</li>
                                <li>Request deletion of your account and data</li>
                                <li>Opt-out of marketing communications</li>
                                <li>Withdraw consent at any time</li>
                            </ul>
                            <p className="text-muted-foreground leading-relaxed mt-4">
                                To exercise these rights, please contact us at <a href="mailto:help@puniora.com" className="text-gold hover:underline">help@puniora.com</a>
                            </p>
                        </section>

                        <section className="glass p-8 rounded-3xl space-y-4">
                            <h2 className="text-2xl font-heading">Third-Party Services</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We use the following third-party services:
                            </p>
                            <ul className="space-y-2 text-muted-foreground">
                                <li><strong>Razorpay:</strong> Payment processing</li>
                                <li><strong>Shiprocket:</strong> Order fulfillment and shipping</li>
                                <li><strong>Supabase:</strong> Database and authentication</li>
                            </ul>
                            <p className="text-muted-foreground leading-relaxed">
                                These services have their own privacy policies governing the use of your information.
                            </p>
                        </section>

                        <section className="glass p-8 rounded-3xl space-y-4">
                            <h2 className="text-2xl font-heading">Changes to This Policy</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
                            </p>
                        </section>

                        <section className="glass p-8 rounded-3xl space-y-4 bg-gold/5 border border-gold/20">
                            <h2 className="text-2xl font-heading">Contact Us</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                If you have any questions about this Privacy Policy, please contact us:
                            </p>
                            <div className="space-y-2 text-muted-foreground">
                                <p><strong>Email:</strong> <a href="mailto:help@puniora.com" className="text-gold hover:underline">help@puniora.com</a></p>
                                <p><strong>Phone:</strong> +91 7010418285</p>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PrivacyPolicy;
