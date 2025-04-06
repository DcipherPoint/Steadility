import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/common/Navbar';

const Contact = () => {
  const [formData, setFormData] = useState({
    email: '',
    feedback: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add form submission logic here
    console.log('Form submitted:', formData);
  };

  return (
    <div className="min-h-screen bg-[#121212] font-roboto overflow-hidden">
      <Navbar />
      
      {/* Animated Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] bg-blue-600/20 rounded-full mix-blend-normal filter blur-[120px] animate-blob opacity-50" />
        <div className="absolute top-1/4 -right-1/4 w-[800px] h-[800px] bg-purple-600/20 rounded-full mix-blend-normal filter blur-[120px] animate-blob animation-delay-2000 opacity-50" />
        <div className="absolute -bottom-1/4 left-1/3 w-[800px] h-[800px] bg-indigo-600/20 rounded-full mix-blend-normal filter blur-[120px] animate-blob animation-delay-4000 opacity-50" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          <form 
            onSubmit={handleSubmit}
            className="backdrop-blur-xl bg-white/5 p-8 rounded-2xl border border-white/10 shadow-2xl"
          >
            <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-white via-blue-200 to-purple-200 text-transparent bg-clip-text font-montserrat">
              Get in Touch
            </h2>
            
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-gray-300 mb-2 text-sm">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 transition-colors"
                  placeholder="your@email.com"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-gray-300 mb-2 text-sm">
                  Your Feedback
                </label>
                <textarea
                  required
                  value={formData.feedback}
                  onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 transition-colors min-h-[120px] resize-none"
                  placeholder="Share your thoughts..."
                />
              </motion.div>

              <motion.button
                type="submit"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
              >
                Send Message
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
