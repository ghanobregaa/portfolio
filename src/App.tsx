import { useEffect } from "react";
import { startEngine } from "@/engine/engine";
import { Overlays } from "@/components/layout/Overlays";
import { Nav } from "@/components/layout/Nav";
import { Hero } from "@/components/sections/Hero";
import { Morph } from "@/components/sections/Morph";
import { About } from "@/components/sections/About";
import { Experience } from "@/components/sections/Experience";
import { Certificates } from "@/components/sections/Certificates";
import { Work } from "@/components/sections/Work";
import { Stack } from "@/components/sections/Stack";
import { Playground } from "@/components/sections/Playground";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/layout/Footer";
import { Toast } from "@/components/layout/Toast";
import { Analytics } from "@vercel/analytics/react"

export default function App() {
  useEffect(() => startEngine(), []);

  return (
    <>
      <Analytics />
      <Overlays />
      <Nav />
      <main id="top">
        <Hero />
        <Morph />
        <About />
        <Experience />
        <Certificates />
        <Work />
        <Stack />
        <Playground />
        <Contact />
      </main>
      <Footer />
      <Toast />
    </>
  );
}
