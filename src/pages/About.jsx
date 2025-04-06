import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/common/Navbar';

const About = () => {
  const teamMembers = ['Suhas', 'Bisista', 'Tanush', 'Barath'];
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mousePosition = { x: 0, y: 0 };
    let hue = 230; // Start with blue
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      constructor(x, y, directionX = 0, directionY = 0) {
        this.x = x || Math.random() * canvas.width;
        this.y = y || Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 20) + 10;
        this.directionX = directionX || Math.random() * 2 - 1;
        this.directionY = directionY || Math.random() * 2 - 1;
        this.speed = Math.random() * 0.5 + 0.2;
        this.color = `hsla(${hue + Math.random() * 30}, 100%, 70%, ${Math.random() * 0.3 + 0.2})`;
        this.angle = Math.random() * 360;
        this.spin = Math.random() < 0.5 ? -0.3 : 0.3;
      }

      update() {
        // Mouse repulsion
        let dx = mousePosition.x - this.x;
        let dy = mousePosition.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let maxDistance = 150;
        let force = (maxDistance - distance) / maxDistance;

        if (distance < maxDistance) {
          let angle = Math.atan2(dy, dx);
          this.directionX -= Math.cos(angle) * force * 0.5;
          this.directionY -= Math.sin(angle) * force * 0.5;
        }

        // Boundary check with bounce effect
        if (this.x + this.size > canvas.width || this.x - this.size < 0) {
          this.directionX *= -0.8;
        }
        if (this.y + this.size > canvas.height || this.y - this.size < 0) {
          this.directionY *= -0.8;
        }

        // Update position
        this.x += this.directionX * this.speed;
        this.y += this.directionY * this.speed;
        this.angle += this.spin;

        // Gradually return to base position
        if (distance >= maxDistance) {
          this.x += (this.baseX - this.x) * 0.01;
          this.y += (this.baseY - this.y) * 0.01;
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle * Math.PI / 180);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        
        // Draw star shape
        for (let i = 0; i < 4; i++) {
          ctx.rotate(Math.PI / 2);
          ctx.lineTo(this.size, 0);
          ctx.lineTo(this.size / 3, this.size / 3);
        }
        
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }

    const init = () => {
      particles = [];
      for (let i = 0; i < 80; i++) {
        particles.push(new Particle());
      }
    };

    const createParticlesOnMove = (e) => {
      if (Math.random() < 0.2) { // 20% chance to create a particle
        particles.push(new Particle(
          e.x,
          e.y,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        ));
        // Remove old particles if there are too many
        if (particles.length > 100) {
          particles.splice(0, particles.length - 100);
        }
      }
    };

    const animate = () => {
      ctx.fillStyle = 'rgba(18, 18, 18, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((particle, index) => {
        particle.update();
        particle.draw();
      });
      
      hue = (hue + 0.1) % 360; // Slowly cycle colors
      requestAnimationFrame(animate);
    };

    const handleMouseMove = (event) => {
      mousePosition.x = event.x;
      mousePosition.y = event.y;
      createParticlesOnMove(event);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    init();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#121212] font-roboto overflow-hidden">
      <Navbar />
      
      {/* Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0"
        style={{ opacity: 0.3 }}
      />
      
      {/* Gradient Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] bg-blue-600/20 rounded-full mix-blend-normal filter blur-[120px] animate-blob opacity-50" />
        <div className="absolute top-1/4 -right-1/4 w-[800px] h-[800px] bg-purple-600/20 rounded-full mix-blend-normal filter blur-[120px] animate-blob animation-delay-2000 opacity-50" />
        <div className="absolute -bottom-1/4 left-1/3 w-[800px] h-[800px] bg-indigo-600/20 rounded-full mix-blend-normal filter blur-[120px] animate-blob animation-delay-4000 opacity-50" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <motion.div 
          className="text-center max-w-4xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {/* Enhanced Main Title with Heart */}
          <motion.h1 
            className="text-6xl md:text-8xl font-bold font-montserrat mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div className="bg-gradient-to-r from-white via-blue-200 to-purple-200 text-transparent bg-clip-text inline-block">
              Made with{' '}
              <motion.div
                className="inline-block relative"
                animate={{ 
                  y: [0, -8, 0],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }}
              >
                <motion.div
                  className="absolute -inset-3 bg-gradient-to-br from-red-500/30 to-pink-500/30 rounded-full blur-lg"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                />
                <span role="img" aria-label="heart" className="text-red-500 relative">❤️</span>
              </motion.div>
              {' '}for
            </motion.div>
            <motion.div 
              className="mt-4 bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 text-transparent bg-clip-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              GDG
            </motion.div>
          </motion.h1>

          {/* Enhanced Team Members Display */}
          <motion.div 
            className="relative mt-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 blur-3xl -z-10" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.5,
                    delay: index * 0.1 
                  }}
                  whileHover={{ 
                    y: -5,
                    transition: { duration: 0.2 }
                  }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg blur-xl transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
                  <motion.p 
                    className="relative text-2xl font-light tracking-wide text-white/80 py-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    {member}
                  </motion.p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
