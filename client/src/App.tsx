import { Suspense, lazy } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { CustomCursor } from "@/components/CustomCursor";
import { Header } from "@/components/Header";
import { Hero } from "@/sections/Hero";
import { Manifesto } from "@/sections/Manifesto";
import { Services } from "@/sections/Services";
import { Process } from "@/sections/Process";
import { Capabilities } from "@/sections/Capabilities";
import { Footer } from "@/sections/Footer";

// Contact carries the form + PoW glue — defer it below the fold.
const Contact = lazy(() => import("@/sections/Contact").then((m) => ({ default: m.Contact })));

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[55] h-[2px] origin-left bg-ember"
      aria-hidden
    />
  );
}

export default function App() {
  return (
    <>
      <div className="grain" aria-hidden />
      <ScrollProgress />
      <CustomCursor />
      <Header />

      <main id="top">
        <Hero />
        <Manifesto />
        <Services />
        <Process />
        <Capabilities />
        <Suspense fallback={<div className="min-h-screen" />}>
          <Contact />
        </Suspense>
      </main>

      <Footer />
    </>
  );
}
