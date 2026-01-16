import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import ScorePreview from "../components/ScorePreview";
import Companies from "../components/Companies";
import Templates from "../components/Templates";
import Footer from "../components/Footer";
import Background from "../components/Background";
import "../styles/home.css";

export default function Home() {
  return (
    <div className="home-container">
      <Background />
      <div className="content-wrapper">
        <Navbar />
        <Hero />
        <ScorePreview />
        <Companies />
        <Templates />
        <Footer />
      </div>
    </div>
  );
}
