"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const products = [
  {
    id: 1,
    name: "Air Max Infinity",
    category: "Shoes",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    color: "#ef4444",
  },
  {
    id: 2,
    name: "Urban Explorer",
    category: "Clothes",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80",
    color: "#6366f1",
  },
  {
    id: 3,
    name: "Pro Vision X",
    category: "Phones",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
    color: "#0ea5e9",
  },
  {
    id: 4,
    name: "Chrono Elite",
    category: "Watches",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    color: "#f59e0b",
  },
];

export default function Product3DShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 1500); // Super fast dynamic pace
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative flex h-[500px] w-full items-center justify-center [perspective:1200px]">
      
      {/* Dynamic Background Glow */}
      <div 
        className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-[80px] transition-colors duration-1000"
        style={{ backgroundColor: products[currentIndex].color }}
      />

      <div className="relative h-[380px] w-[300px]">
        <AnimatePresence mode="popLayout">
          {products.map((product, index) => {
            const relativeIndex = (index - currentIndex + products.length) % products.length;

            // Only render the first 3 to create the stack effect
            if (relativeIndex > 2) return null;

            const isFront = relativeIndex === 0;

            return (
              <motion.div
                key={product.id}
                layout
                initial={{ 
                  opacity: 0, 
                  scale: 0.7, 
                  y: -100, 
                  z: -100 
                }}
                animate={{ 
                  opacity: 1 - relativeIndex * 0.2, 
                  scale: 1 - relativeIndex * 0.08,
                  y: relativeIndex * -30,
                  z: relativeIndex * -40,
                  rotateX: relativeIndex * 5,
                  zIndex: products.length - relativeIndex,
                  filter: `blur(${relativeIndex * 1.5}px)`
                }}
                exit={{ 
                  opacity: 0, 
                  scale: 1.05, 
                  y: 200, 
                  x: -50,
                  rotateZ: -15,
                  filter: "blur(10px)"
                }}
                transition={{ 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 30, 
                  mass: 0.8 
                }}
                className="absolute inset-0 rounded-[2rem] shadow-2xl overflow-hidden border border-white/20 origin-bottom bg-brand-900"
                style={{
                  boxShadow: isFront ? `0 30px 60px -15px ${product.color}60` : "none"
                }}
              >
                {/* Image */}
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />

                {/* Content only visible clearly on front card */}
                <motion.div 
                  className="absolute bottom-6 left-6 right-6 text-white"
                  animate={{ opacity: isFront ? 1 : 0, y: isFront ? 0 : 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div 
                    className="mb-3 w-max rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md border border-white/30 shadow-lg"
                    style={{ backgroundColor: `${product.color}40` }}
                  >
                    {product.category}
                  </div>
                  <h3 className="text-3xl font-black tracking-tight drop-shadow-2xl">
                    {product.name}
                  </h3>
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Progress indicators moved outside */}
      <div className="absolute -bottom-6 flex gap-3">
        {products.map((_, idx) => (
          <div 
            key={idx} 
            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? "w-10 bg-brand-400" : "w-3 bg-white/20"}`} 
          />
        ))}
      </div>
    </div>
  );
}
