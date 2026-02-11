import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Home from "./Home";
import { ThemeProvider } from "../components/ThemeProvider";

export default function PageLayout({ title = "ZenPDF", userName = "Elouan" }) {
    return (
        <ThemeProvider defaultTheme="system" storageKey="zenpdf-theme">
            <div className="min-h-screen flex flex-col bg-background text-foreground">
                <Header siteName={title} userName={userName} />

                <main className="flex-1">
                    <Home />
                </main>

                <Footer/>
            </div>
        </ThemeProvider>
    );
}
