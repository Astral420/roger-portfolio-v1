import { MotionConfig } from "framer-motion";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ChatProvider } from "./contexts/ChatContext";
import { PresenceProvider } from "./contexts/PresenceContext";
import { AmbientLighting } from "./components/layout/AmbientLighting";
import { ScrollProgress } from "./components/layout/ScrollProgress";
import { SiteHeader } from "./components/layout/SiteHeader";
import { Footer } from "./components/layout/Footer";
import { Hero } from "./components/sections/Hero";
import { About } from "./components/sections/About";
import { Experience } from "./components/sections/Experience";
import { Projects } from "./components/sections/Projects";
import { Contact } from "./components/sections/Contact";
import { ChatPlayground } from "./components/chat/ChatPlayground";
import { LiveCursors } from "./components/presence/LiveCursors";

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ThemeProvider>
        <PresenceProvider>
          <ChatProvider>
            <a href="#main-content" className="skip-link">
              Skip to content
            </a>

            <ScrollProgress />
            <AmbientLighting />
            <SiteHeader />

            <main id="main-content" className="relative z-10">
              <Hero />
              <About />
              <Experience />
              <Projects />
              <Contact />
            </main>

            <Footer />
            <ChatPlayground />
            <LiveCursors />
          </ChatProvider>
        </PresenceProvider>
      </ThemeProvider>
    </MotionConfig>
  );
}

export default App;
