
import { useState, useEffect } from 'react';
import { Download, Award, PartyPopper } from 'lucide-react';


// Separate Celebration Modal Component
export default function CelebrationModal({ isOpen, onClose }){
  const [confetti, setConfetti] = useState([]);

  // Generate confetti when modal opens
  useEffect(() => {
    if (isOpen) {
      generateConfetti();
    }
  }, [isOpen]);

  // Generate random confetti particles
  const generateConfetti = () => {
    const newConfetti = [];
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-yellow-400', 'bg-green-500', 'bg-purple-500'];
    
    for (let i = 0; i < 50; i++) {
      newConfetti.push({
        id: i,
        left: `${Math.random() * 100}%`,
        animationDuration: `${Math.random() * 3 + 2}s`,
        animationDelay: `${Math.random() * 2}s`,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    
    setConfetti(newConfetti);
  };

  // Download certificate function
  const downloadCertificate = () => {
    const link = document.createElement('a');
    link.href = '/api/placeholder/800/600'; // Using placeholder image
    link.download = 'ctf-certificate.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute-view" style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 1000 }}>
      {/* Confetti animation */}
      {confetti.map((particle) => (
        <div
          key={particle.id}
          className={`absolute ${particle.color} w-4 h-4 rounded-full`}
          style={{
            left: particle.left,
            top: 0,
            animation: `fall ${particle.animationDuration} linear ${particle.animationDelay} forwards`
          }}
        />
      ))}
      
      {/* Modal content */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full mx-4 animate-bounce-in">
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 flex space-x-2">
          <PartyPopper className="h-10 w-10 text-yellow-400" />
          <Award className="h-10 w-10 text-yellow-400" />
          <PartyPopper className="h-10 w-10 text-yellow-400" />
        </div>
        
        <h2 className="text-3xl font-bold text-center mb-6 text-blue-600">Congratulations!</h2>
        
        <div className="text-center mb-6">
          <p className="text-xl mb-4">Well done for getting through all the challenges!</p>
          <p className="text-gray-600">You've demonstrated exceptional skills and perseverance.</p>
        </div>
        
        <div className="flex justify-center mb-6">
          <div className="relative border-4 border-yellow-400 p-2 rounded-lg">
            <img 
              src="/api/placeholder/400/300" 
              alt="CTF Achievement Certificate" 
              className="max-w-full h-auto"
            />
            <div className="absolute -bottom-3 -right-3 bg-blue-600 text-white p-2 rounded-full">
              <Award className="h-6 w-6" />
            </div>
          </div>
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={downloadCertificate}
            className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-5 w-5" />
            <span>Download Your Certificate</span>
          </button>
        </div>
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(-10vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          70% {
            opacity: 1;
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }
        .animate-bounce-in {
          animation: bounce-in 0.6s;
        }
      `}</style>
    </div>
  );
};