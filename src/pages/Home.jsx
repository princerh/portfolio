import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Projects from "../components/Projects";
import Skills from "../components/Skills";
import Education from "../components/Education";
import Experience from "../components/Experience";
import Documents from "../components/Documents";
import Contact from "../components/Contact";
import Footer from "../components/Footer";

function Home() {
  return (
    <div className="min-h-screen bg-[#050816] text-white">

      <Navbar />

      <main>
        <Hero />
        <Projects />
        <Skills />
        <Education />
        <Experience />
        <Documents />
        <Contact />
      </main>

      <Footer />

    </div>
  );
}

export default Home;