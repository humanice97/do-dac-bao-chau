import Header from '@/components/marketing/Header'
import Hero from '@/components/marketing/Hero'
import Trust from '@/components/marketing/Trust'
import Services from '@/components/marketing/Services'
import Process from '@/components/marketing/Process'
import Commitment from '@/components/marketing/Commitment'
import Gallery from '@/components/marketing/Gallery'
import FAQ from '@/components/marketing/FAQ'
import ContactForm from '@/components/marketing/ContactForm'
import Footer from '@/components/marketing/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Trust />
      <Services />
      <Process />
      <Commitment />
      <Gallery />
      <FAQ />
      <ContactForm />
      <Footer />
    </main>
  )
}

