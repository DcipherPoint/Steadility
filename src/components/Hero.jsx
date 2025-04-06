import React, { useEffect, useRef, useCallback } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Link } from 'react-router-dom';

const Hero = () => {
  const canvasRef = useRef(null);
  const controls = useAnimation();
  const particlesRef = useRef([]);

  // Optimize particle creation with useMemo
  const createParticle = useCallback(() => {
    return {
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 2 + 1,
      speedX: Math.random() * 0.5 - 0.25,
      speedY: Math.random() * 0.5 - 0.25,
      color: `rgba(255, 255, 255, ${Math.random() * 0.1})`,
    };
  }, []);

  // Optimize animation loop with useCallback
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const animationLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current.forEach(particle => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Wrap around screen
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.y > canvas.height) particle.y = 0;
        if (particle.y < 0) particle.y = canvas.height;

        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(animationLoop);
    };

    animationLoop();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas size with device pixel ratio for better quality
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles
    particlesRef.current = Array.from({ length: 50 }, createParticle);
    animate();

    // Animate gradient orbs
    controls.start({
      x: [0, window.innerWidth * 0.5, 0],
      y: [0, window.innerHeight * 0.5, 0],
      transition: {
        duration: 20,
        repeat: Infinity,
        ease: "linear"
      }
    });

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      particlesRef.current = [];
    };
  }, [animate, controls, createParticle]);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#121212]">
      {/* Optimized Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0"
        style={{ opacity: 0.5 }}
      />

      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Dynamic Gradient Orbs */}
        <motion.div
          animate={controls}
          className="absolute w-[800px] h-[800px] bg-blue-600/30 rounded-full mix-blend-screen filter blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, window.innerWidth * 0.3, 0],
            y: [0, window.innerHeight * 0.7, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
            delay: 5
          }}
          className="absolute w-[800px] h-[800px] bg-purple-600/30 rounded-full mix-blend-screen filter blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, window.innerWidth * 0.7, 0],
            y: [0, window.innerHeight * 0.3, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "linear",
            delay: 10
          }}
          className="absolute w-[800px] h-[800px] bg-indigo-600/30 rounded-full mix-blend-screen filter blur-[120px]"
        />
        
        {/* Optimized Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#121212]/20 to-[#121212] z-10" />
      </div>

      {/* Content */}
      <div className="relative z-20 container mx-auto px-4 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight font-montserrat"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400">
            Sustainable Logistics
          </span>
          <br />
          for a Better Future
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-white/80 max-w-2xl mx-auto mb-8 text-lg md:text-xl font-montserrat"
        >
          Optimizing logistics for a better tomorrow
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link to="/signup">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group px-8 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white hover:bg-white/20 transition-all duration-300 font-montserrat"
            >
              Get Started
              <span className="inline-block ml-2 transition-transform duration-200 group-hover:translate-x-1">→</span>
            </motion.button>
          </Link>
          <Link to="/features">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group px-8 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-white hover:bg-white/10 transition-all duration-300 font-montserrat"
            >
              Learn More
              <span className="inline-block ml-2 transition-transform duration-200 group-hover:translate-x-1">→</span>
            </motion.button>
          </Link>
        </motion.div>
      </div>

      {/* Optimized Scroll Indicator */}
      <motion.div 
        animate={{ 
          y: [0, 10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <svg
          className="w-6 h-6 text-white/50"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </motion.div>
    </div>
  );
};

export default Hero; 