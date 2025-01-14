'use client'

import React from 'react'

import {
  BookIcon,
  LibraryIcon,
  BoxIcon,
  Globe,
  Blocks,
} from 'lucide-react'

import { Card, CardContent } from '@mui/material'

import GlowingText from '@/components/effects/GlowingText'

// Pre-calculated positions for particles to avoid hydration issues
const particlePositions = [
  { left: '10%', top: '20%', delay: '0s', duration: '20s' },
  { left: '25%', top: '15%', delay: '2s', duration: '18s' },
  { left: '40%', top: '80%', delay: '1s', duration: '22s' },
  { left: '55%', top: '30%', delay: '3s', duration: '21s' },
  { left: '70%', top: '65%', delay: '2s', duration: '19s' },
  { left: '85%', top: '40%', delay: '1s', duration: '23s' },
  { left: '15%', top: '60%', delay: '4s', duration: '20s' },
  { left: '30%', top: '35%', delay: '2s', duration: '21s' },
  { left: '45%', top: '70%', delay: '3s', duration: '19s' },
  { left: '60%', top: '25%', delay: '1s', duration: '22s' },
  { left: '75%', top: '55%', delay: '2s', duration: '20s' },
  { left: '90%', top: '45%', delay: '3s', duration: '18s' },
  { left: '20%', top: '85%', delay: '1s', duration: '21s' },
  { left: '35%', top: '50%', delay: '2s', duration: '19s' },
  { left: '50%', top: '75%', delay: '3s', duration: '20s' },
  { left: '65%', top: '40%', delay: '1s', duration: '22s' },
  { left: '80%', top: '60%', delay: '2s', duration: '21s' },
  { left: '95%', top: '30%', delay: '3s', duration: '19s' },
  { left: '5%', top: '45%', delay: '2s', duration: '20s' },
  { left: '48%', top: '92%', delay: '1s', duration: '22s' }
]

const FloatingParticles = () => (
  <div className='absolute inset-0 overflow-hidden pointer-events-none'>
    {particlePositions.map((position, i) => (
      <div
        key={i}
        className='absolute w-2 h-2 bg-[#B45F06]/10 rounded-full animate-float'
        style={{
          left: position.left,
          top: position.top,
          animationDelay: position.delay,
          animationDuration: position.duration
        }}
      />
    ))}
  </div>
)

// Rest of the components remain the same
const OrbitingParticles = () => (
  <div className='absolute inset-0 overflow-hidden pointer-events-none mix-blend-soft-light'>
    <div className='absolute w-full h-full animate-spin-slow'>
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className='absolute rounded-full border-2 border-[#B45F06]/10'
          style={{
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) rotate(${i * 120}deg)`,
            width: `${(i + 1) * 300}px`,
            height: `${(i + 1) * 300}px`,
            boxShadow: '0 0 40px rgba(180, 95, 6, 0.1)'
          }}
        />
      ))}
    </div>
  </div>
)

const GlowingBackground = () => (
  <div className='absolute inset-0 overflow-hidden'>
    <div className='absolute -inset-[10px] bg-gradient-radial from-[#B45F06]/30 via-[#783F04]/20 to-transparent blur-3xl animate-pulse-slow' />
    <div className='absolute right-0 top-0 -inset-[10px] bg-gradient-radial from-[#8B4513]/30 via-[#783F04]/20 to-transparent blur-3xl animate-pulse-slow' />
  </div>
)

const Feature = ({
  icon: Icon,
  title,
  description
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  title: string
  description: string
}) => (
  <div className='group relative'>
    <div className='absolute inset-0 bg-gradient-to-r from-[#B45F06]/20 to-[#783F04]/20 rounded-xl blur-xl transition-opacity opacity-0 group-hover:opacity-100' />
    <div className='relative flex flex-col gap-2 rounded-xl p-6 bg-[#F8F2EB]/5 hover:bg-[#F8F2EB]/10 transition-all duration-500 backdrop-blur-sm border border-[#783F04]/30 hover:border-[#B45F06]/50 group-hover:transform group-hover:scale-105'>
      <div className='flex items-center gap-3'>
        <div className='bg-gradient-to-br from-[#B45F06] to-[#783F04] p-2 rounded-lg shadow-lg group-hover:shadow-[#B45F06]/20 transition-shadow duration-500'>
          <Icon className='w-5 h-5 text-[#F8F2EB]' />
        </div>
        <h3 className='text-lg font-semibold text-[#F8F2EB] group-hover:text-[#B45F06]'>{title}</h3>
      </div>
      <p className='text-sm text-[#F8F2EB]/70 leading-relaxed'>{description}</p>
    </div>
  </div>
)

const ComingSoon = () => {
  // Remove generic type arguments
  const [email, setEmail] = React.useState('');
  const [isSubscribed, setIsSubscribed] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🟢 Form submitted with email:', email);

    if (email) {
      setIsLoading(true); // Start loading
      try {
        console.log('🟡 Sending request to /api/send');
        const response = await fetch('/api/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();
        console.log('🔵 Response received:', { status: response.status, data });

        if (response.ok) {
          console.log('✅ Subscription successful');
          setIsSubscribed(true);
          setEmail('');
        } else {
          console.error('❌ Subscription failed:', data.error);
          alert(`Failed to subscribe: ${data.error}`);
        }
      } catch (error) {
        console.error('❌ Request error:', error);
        alert('An error occurred. Please try again.');
      } finally {
        setIsLoading(false); // Stop loading
      }
    }
  };
  ;

  return (
    <div className='min-h-screen bg-gradient-to-b from-[#1C0F0A] to-[#2B1810] text-[#F8F2EB] flex items-center justify-center p-4 relative overflow-hidden'>
      <GlowingBackground />
      <OrbitingParticles />
      <FloatingParticles />

      <Card className='relative z-10 w-full max-w-4xl bg-[#1C0F0A]/60 backdrop-blur-xl border-[#783F04]/30 shadow-2xl'>
        <CardContent className='p-8'>
          <div className='flex flex-col items-center gap-8'>
            {/* Logo Area */}
            <div className='relative'>
              <div className='absolute inset-0 bg-gradient-to-r from-[#B45F06] to-[#783F04] rounded-2xl blur-2xl opacity-70' />
              <div className='relative w-16 h-16 bg-gradient-to-br from-[#B45F06] to-[#783F04] rounded-2xl p-0.5 hover:rotate-0 transition-transform duration-500'>
                <div className='w-full h-full bg-[#1C0F0A]/95 rounded-2xl flex items-center justify-center'>
                  <LibraryIcon className='w-8 h-8 text-[#F8F2EB]' />
                </div>
              </div>
            </div>

            {/* Title Section */}
            <div className='text-center space-y-4'>
              <div className='relative inline-block'>
                <div className='absolute -inset-2 bg-gradient-to-r from-[#B45F06] to-[#783F04] blur-2xl opacity-50' />
                <h1 className='relative text-4xl font-bold bg-gradient-to-r from-[#B45F06] via-[#8B4513] to-[#783F04] bg-clip-text text-transparent pb-2'>
                  Library Protocol
                </h1>
              </div>
              <GlowingText />
            </div>

            {/* Features Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 w-full'>
              <Feature
                icon={BookIcon}
                title='Libraries'
                description='Libraries are the custodians of knowledge, and Library Protocol provides them with a decentralized, secure, and censorship-resistant platform to digitize, preserve, and share their collections. By joining the global network, libraries can reach new audiences and create an interconnected ecosystem of knowledge that lasts for generations.'
              />
              <Feature
                icon={BoxIcon}
                title='Book Lovers'
                description='A boundless world of books, just a click away.
                For those who find joy in discovering new books and revisiting timeless classics, Library Protocol unlocks a limitless library. Access physical and digital books from around the globe, connect with fellow book enthusiasts, and become part of a community where stories transcend borders.'
              />
              <Feature
                icon={Globe}
                title='Readers'
                description='Revolutionizing access to stories and knowledge for curious minds."
                Readers are at the heart of Library Protocol. With decentralized access to books anyone can explore, learn, and grow without barriers. Library Protocol ensures stories, knowledge, and wisdom are accessible to every curious mind, anytime, anywhere.'
              />
              <Feature
                icon={Blocks}
                title='Community & Educators'
                description='Fostering learning and growth through a decentralized network of wisdom."
                For educators and communities, Library Protocol serves as a transformative tool to bridge gaps in education and foster lifelong learning. With the power of decentralization, and inspire the next generation of thinkers and leaders.'
              />
            </div>


            {/* Subscribe Form */}
            <div className="w-full max-w-md relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#B45F06] to-[#783F04] rounded-lg blur-xl" />
              {isSubscribed ? (
                <div className="relative bg-[#2B5215]/20 rounded-lg p-6 backdrop-blur-sm border border-[#4C8527]/30 transform transition-all duration-500">
                  <p className="text-[#98FB98] text-center text-base font-medium">
                    Welcome to the future of libraries! We&apos;ll keep you updated on our progress.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="relative">
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full px-6 py-3 bg-[#F8F2EB]/5 border border-[#783F04]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B45F06] backdrop-blur-sm text-[#F8F2EB] placeholder-[#F8F2EB]/50 text-base transition-all duration-300"
                      required
                    />
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`absolute right-2 top-1.5 px-6 py-2 rounded-md text-base font-medium transition-all duration-300 transform ${
                        isLoading
                          ? 'bg-[#783F04]/50 cursor-not-allowed'
                          : 'bg-gradient-to-r from-[#B45F06] to-[#783F04] hover:opacity-90 hover:scale-105'
                      }`}
                    >
                      {isLoading ? (
                        <svg
                          className="animate-spin h-5 w-5 text-[#F8F2EB] mx-auto"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      ) : (
                        'Join Waitlist'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ComingSoon

