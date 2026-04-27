import { useEffect } from 'react';
import { useLenis } from '../hooks/useLenis';
import Navigation from '../sections/Navigation';
import Hero from '../sections/Hero';
import Manifesto from '../sections/Manifesto';
import Anatomy from '../sections/Anatomy';
import Tiers from '../sections/Tiers';
import Footer from '../sections/Footer';
import ParchmentUnroll from '../effects/ParchmentUnroll';
import { siteConfig } from '../config';

function Home() {
  useLenis();

  useEffect(() => {
    document.title = siteConfig.siteTitle || '';
    document.documentElement.lang = siteConfig.language || '';
  }, []);

  return (
    <>
      <Navigation />
      <ParchmentUnroll />
      <main>
        <Hero />
        <Manifesto />
        <Anatomy />
        <Tiers />
        <Footer />
      </main>
    </>
  );
}

export default Home;
