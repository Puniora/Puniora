import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Sparkles, Heart, Award, Users, Target, Leaf } from "lucide-react";

const About = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <main className="flex-1 pt-32 pb-20">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="text-center mb-12 animate-fade-in">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gold/10 rounded-full mb-6">
                            <Sparkles className="h-8 w-8 text-gold" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-heading mb-4">About Puniora</h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Crafting luxury fragrances that tell your story
                        </p>
                    </div>

                    <div className="prose prose-lg max-w-none space-y-8 animate-slide-up">
                        <section className="glass p-8 rounded-3xl space-y-4">
                            <h2 className="text-3xl font-heading text-center mb-6">Our Story</h2>
                            <p className="text-muted-foreground leading-relaxed text-lg">
                                Puniora was born from a passion for creating exceptional fragrances that transcend the ordinary. We believe that a scent is more than just a fragrance—it's a memory, an emotion, a statement of who you are.
                            </p>
                            <p className="text-muted-foreground leading-relaxed text-lg">
                                Founded with the vision of making luxury accessible, we curate and create perfumes that blend timeless elegance with contemporary sophistication. Each fragrance in our collection is carefully crafted to evoke emotions and create lasting impressions.
                            </p>
                        </section>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="glass p-6 rounded-2xl space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 bg-gold/10 rounded-xl flex items-center justify-center">
                                        <Target className="h-6 w-6 text-gold" />
                                    </div>
                                    <h3 className="text-xl font-heading m-0">Our Mission</h3>
                                </div>
                                <p className="text-muted-foreground text-sm leading-relaxed m-0">
                                    To democratize luxury fragrances by offering premium quality scents at accessible prices, ensuring everyone can experience the art of fine perfumery.
                                </p>
                            </div>

                            <div className="glass p-6 rounded-2xl space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 bg-gold/10 rounded-xl flex items-center justify-center">
                                        <Sparkles className="h-6 w-6 text-gold" />
                                    </div>
                                    <h3 className="text-xl font-heading m-0">Our Vision</h3>
                                </div>
                                <p className="text-muted-foreground text-sm leading-relaxed m-0">
                                    To become India's most trusted destination for luxury fragrances, known for our commitment to quality, authenticity, and customer satisfaction.
                                </p>
                            </div>
                        </div>

                        <section className="glass p-8 rounded-3xl space-y-6 bg-gold/5 border border-gold/20">
                            <h2 className="text-2xl font-heading text-center">What Sets Us Apart</h2>

                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="text-center space-y-3">
                                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gold/10 rounded-full">
                                        <Award className="h-7 w-7 text-gold" />
                                    </div>
                                    <h3 className="font-bold">Premium Quality</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Only the finest ingredients and formulations make it into our collection
                                    </p>
                                </div>

                                <div className="text-center space-y-3">
                                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gold/10 rounded-full">
                                        <Heart className="h-7 w-7 text-gold" />
                                    </div>
                                    <h3 className="font-bold">Customer First</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Your satisfaction is our priority, from selection to delivery
                                    </p>
                                </div>

                                <div className="text-center space-y-3">
                                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gold/10 rounded-full">
                                        <Leaf className="h-7 w-7 text-gold" />
                                    </div>
                                    <h3 className="font-bold">Sustainable</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Committed to eco-friendly practices and responsible sourcing
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="glass p-8 rounded-3xl space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <Users className="h-6 w-6 text-gold" />
                                <h2 className="text-2xl font-heading m-0">Our Values</h2>
                            </div>
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-2 h-2 bg-gold rounded-full mt-2"></div>
                                    <div>
                                        <h3 className="font-bold mb-1">Authenticity</h3>
                                        <p className="text-sm text-muted-foreground m-0">
                                            We guarantee 100% authentic products. No compromises on quality.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-2 h-2 bg-gold rounded-full mt-2"></div>
                                    <div>
                                        <h3 className="font-bold mb-1">Transparency</h3>
                                        <p className="text-sm text-muted-foreground m-0">
                                            Clear pricing, honest descriptions, and open communication.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-2 h-2 bg-gold rounded-full mt-2"></div>
                                    <div>
                                        <h3 className="font-bold mb-1">Excellence</h3>
                                        <p className="text-sm text-muted-foreground m-0">
                                            Striving for perfection in every aspect of our service.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-2 h-2 bg-gold rounded-full mt-2"></div>
                                    <div>
                                        <h3 className="font-bold mb-1">Innovation</h3>
                                        <p className="text-sm text-muted-foreground m-0">
                                            Constantly evolving to bring you the latest and best in fragrances.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="glass p-8 rounded-3xl space-y-4">
                            <h2 className="text-2xl font-heading">Our Collection</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                From fresh and floral to deep and woody, our curated collection features fragrances for every personality, occasion, and mood. Whether you're looking for an everyday signature scent or a special occasion fragrance, Puniora has something extraordinary for you.
                            </p>
                            <div className="grid md:grid-cols-3 gap-4 mt-6">
                                <div className="bg-muted/20 p-4 rounded-xl border border-border/50 text-center">
                                    <p className="text-2xl font-heading text-gold mb-1">For Men</p>
                                    <p className="text-xs text-muted-foreground">Bold & Sophisticated</p>
                                </div>
                                <div className="bg-muted/20 p-4 rounded-xl border border-border/50 text-center">
                                    <p className="text-2xl font-heading text-gold mb-1">For Women</p>
                                    <p className="text-xs text-muted-foreground">Elegant & Timeless</p>
                                </div>
                                <div className="bg-muted/20 p-4 rounded-xl border border-border/50 text-center">
                                    <p className="text-2xl font-heading text-gold mb-1">Unisex</p>
                                    <p className="text-xs text-muted-foreground">Versatile & Modern</p>
                                </div>
                            </div>
                        </section>

                        <section className="glass p-8 rounded-3xl space-y-4 text-center">
                            <h2 className="text-2xl font-heading">Join Our Journey</h2>
                            <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                                Thank you for choosing Puniora. We're honored to be part of your fragrance journey. Every spray, every scent, every moment—crafted with care, delivered with love.
                            </p>
                            <div className="pt-4">
                                <a href="/products" className="inline-flex items-center justify-center px-8 py-3 bg-gold hover:bg-gold/90 text-white rounded-full font-bold transition-colors">
                                    Explore Our Collection
                                </a>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default About;
