import React, { useState, useEffect } from 'react';

import { motion, AnimatePresence } from 'framer-motion';

const GlowingText = () => {
  const phrases = [
    "Bridging centuries of wisdom with the future of trustless technology...",
    "Empowering the world to share, own, and preserve knowledge—forever onchain...",
    "From dusty shelves to the blockchain: a new era of limitless learning begins...",
    "Transforming how the world accesses, shares, and cherishes knowledge—decentralized and unstoppable...",
  ];

  const [mounted, setMounted] = useState(false);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const currentPhrase = phrases[currentPhraseIndex].split(" ");

  // Only start animations after component mounts on client
  useEffect(() => {
    setMounted(true);

    const interval = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    // Initial server render - static content only
    return (
      <div className="relative w-full">
        <div className="relative flex flex-wrap justify-center gap-x-2 max-w-2xl mx-auto py-4 px-6 rounded-xl backdrop-blur-sm bg-black/10">
          {phrases[0].split(" ").map((word, i) => (
            <span
              key={i}
              className="inline-block font-semibold text-lg bg-gradient-to-r from-[#B45F06] via-[#783F04] to-[#B45F06] bg-clip-text text-transparent"
            >
              {word}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // Client-side render with animations
  return (
    <div className="relative w-full">
      <div className="absolute inset-0 bg-gradient-to-r from-[#B45F06]/20 via-[#783F04]/20 to-[#B45F06]/20 blur-3xl opacity-50" />

      <div className="relative flex flex-wrap justify-center gap-x-2 max-w-2xl mx-auto py-4 px-6 rounded-xl backdrop-blur-sm bg-black/10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhraseIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-wrap justify-center gap-x-2"
          >
            {currentPhrase.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.1,
                }}
                className="inline-block font-semibold text-lg bg-gradient-to-r from-[#B45F06] via-[#783F04] to-[#B45F06] bg-clip-text text-transparent"
              >
                {word}
              </motion.span>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Indicator dots */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex gap-2 mt-4">
        {phrases.map((_, index) => (
          <div
            key={index}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              index === currentPhraseIndex ? 'bg-[#B45F06] scale-125' : 'bg-[#B45F06]/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default GlowingText;
