import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ConvertSection from "../components/sections/ConvertSection";
import { ThemeProvider } from "../components/ThemeProvider";

export default function ConvertPage({ tools = [], allTools, user = null }) {
    return (
        <ThemeProvider defaultTheme="system" storageKey="zenpdf-theme">
            <div className="min-h-screen flex flex-col bg-background text-foreground">
                <Header tools={allTools ?? tools} user={user} />

                <main className="flex-1">
                    <ConvertSection tools={tools} />
                </main>

                <Footer />
            </div>
        </ThemeProvider>
    );
}