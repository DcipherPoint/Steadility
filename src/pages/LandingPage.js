import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Hero from '../components/Hero';
import '../styles/ScrollTransition.css';

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition duration-200 hover:bg-gray-50">
    <div className="text-blue-600 mb-4">
      <Icon className="w-12 h-12 mx-auto" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500">{description}</p>
  </div>
);

const features = [
  {
    icon: (props) => (
      <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Real-time Optimization',
    description: 'Optimize your logistics operations in real-time with our advanced algorithms and machine learning capabilities.'
  },
  {
    icon: (props) => (
      <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Secure & Reliable',
    description: 'Your data is protected with enterprise-grade security. We ensure 99.9% uptime for your critical operations.'
  },
  {
    icon: (props) => (
      <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    ),
    title: 'Sustainable Solutions',
    description: 'Reduce your carbon footprint while optimizing costs. Our platform helps you achieve your sustainability goals.'
  }
];

const LandingPage = () => {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    // Add Google Fonts
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&family=Roboto:wght@300;400&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    const handleScroll = () => {
      const position = window.pageYOffset;
      setScrollPosition(position);
      
      // Add visible class to elements when they come into view
      const fadeElements = document.querySelectorAll('.fade-in:not(.hero-content)');
      fadeElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const isVisible = rect.top <= window.innerHeight * 0.75;
        if (isVisible) {
          element.classList.add('visible');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#121212] text-white font-roboto">
      <Navbar />
      <Hero />
      
      {/* Content Section */}
      <section className="scroll-section content-section py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="font-montserrat text-4xl font-bold mb-8 fade-in text-gray-900">
                Transform Your Operations
              </h2>
              <p className="text-xl mb-12 fade-in text-gray-600 leading-relaxed font-light">
                Reduce carbon emissions by up to 30% while optimizing your logistics operations
                with our cutting-edge platform.
              </p>
              <ul className="space-y-6">
                {[
                  'Real-time optimization',
                  'Sustainable solutions',
                  'Advanced analytics',
                  'Seamless integration'
                ].map((item, index) => (
                  <li key={index} className="flex items-center fade-in">
                    <svg className="w-6 h-6 mr-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-lg font-light text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative fade-in">
              <div className="aspect-w-16 aspect-h-9 rounded-2xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
                <img
                  src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                  alt="Logistics Dashboard"
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="scroll-section hero-section py-32">
        <div className="gradient-overlay"></div>
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <h2 className="font-montserrat text-4xl sm:text-5xl font-bold mb-8 fade-in title-gradient">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-300 mb-12 fade-in max-w-2xl mx-auto font-light">
            Experience the future of sustainable logistics with our hackathon project
          </p>
          <div className="fade-in">
            <Link
              to="/signup"
              className="modern-button px-10 py-4 text-lg font-montserrat font-medium rounded-full text-white inline-flex items-center group"
            >
              Try the Demo
              <svg 
                className="ml-2 w-5 h-5 transform transition-transform group-hover:translate-x-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="bg-[#121212] text-gray-400 py-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm font-light">
          <p>&copy; {new Date().getFullYear()} Steadility. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 