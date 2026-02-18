import React from 'react'
import HeroSection from '../components/HeroSection'
import PackageGrid from '../components/packages/PackageGrid'
import AboutSafari from '../components/AboutSafari'
import TopDestinations from '../components/shared/TopPackages'
import ExpertCTA from '../components/CTA/ExpertCTA'
import FAQHero from '../components/FAQHero'


const Home = () => {
  return (
    <div>
      <HeroSection/>
      <AboutSafari/>
      <TopDestinations/>
      <ExpertCTA/>
      <PackageGrid/>
      <FAQHero/>
    </div>
  )
}

export default Home
