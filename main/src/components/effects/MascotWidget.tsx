// 'use client';

// import { useState, useEffect, useRef } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import Image from "next/image";
// import { Tooltip } from "@mui/material";

// const features = [
//   { title: "Personalized Library Guide", emoji: "📚" },
//   { title: "Book Search & Discovery", emoji: "🔍" },
//   { title: "Borrowing & Lending Facilitator", emoji: "🔄" },
//   { title: "AI Chat & Book Summarization", emoji: "🤖" },
//   { title: "Gamification & Engagement", emoji: "🎮" },
//   { title: "AI-Powered Discussions & Book Clubs", emoji: "💬" },
//   { title: "Announcements", emoji: "📢" },
//   { title: "Multi-Language Support & Translation", emoji: "🌍" },
//   { title: "Author & Genre Insights", emoji: "✍️" },
// ];

// export default function LibraryMascotWidget() {
//   const [expanded, setExpanded] = useState(false);
//   const [showAlert, setShowAlert] = useState(false);
//   const widgetRef = useRef(null); // Ref to track the widget DOM element

//   // Toggle "Psst!" alert every 10 seconds when not expanded
//   useEffect(() => {
//     if (!expanded) {
//       const interval = setInterval(() => {
//         setShowAlert(true);
//         setTimeout(() => setShowAlert(false), 2000); // Hide after 2 seconds
//       }, 10000); // Show every 10 seconds
//       return () => clearInterval(interval);
//     }
//   }, [expanded]);

//   // Handle outside clicks to close the expanded menu
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (widgetRef.current && !widgetRef.current.contains(event.target)) {
//         setExpanded(false); // Close if click is outside the widget
//       }
//     };

//     // Add event listener when expanded is true
//     if (expanded) {
//       document.addEventListener("mousedown", handleClickOutside);
//     }

//     // Cleanup event listener
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [expanded]);

//   return (
//     <div className="fixed bottom-16 left-24 z-50" ref={widgetRef}>
//       <div className="relative flex items-center justify-center">
//         <AnimatePresence>
//           {expanded && (
//             <motion.div
//               className="absolute w-64 h-64"
//               style={{
//                 left: '-136%',
//                 transform: 'translateX(-50%)',
//                 bottom: '-68px',
//               }}
//               initial={{ opacity: 0, scale: 0.5 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 0.5 }}
//               transition={{ duration: 0.3 }}
//             >
//               {features.map((feature, index) => {
//                 const angle = (index / features.length) * 2 * Math.PI;
//                 const radius = 30;
//                 const top = 50 + radius * Math.sin(angle);
//                 const left = 50 + radius * Math.cos(angle);

//                 return (
//                   <Tooltip key={index} title={feature.title} placement="top">
//                     <motion.div
//                       className="absolute flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-lg text-lg cursor-pointer border-2 border-gray-100"
//                       style={{
//                         top: `${top}%`,
//                         left: `${left}%`,
//                         transform: 'translate(-50%, -50%)',
//                       }}
//                       initial={{ opacity: 0, y: 10 }}
//                       animate={{
//                         opacity: 1,
//                         y: 0,
//                         transition: { delay: index * 0.05 },
//                       }}
//                     >
//                       <span role="img" aria-label={feature.title}>{feature.emoji}</span>
//                     </motion.div>
//                   </Tooltip>
//                 );
//               })}
//             </motion.div>
//           )}
//         </AnimatePresence>

//         {/* Mascot with bounce animation and "Psst!" alert */}
//         <motion.div
//           onClick={() => setExpanded(!expanded)}
//           whileHover={{ scale: 1.05 }}
//           animate={{
//             y: [0, -10, 0], // Gentle bounce
//             transition: {
//               duration: 1.5,
//               repeat: Infinity,
//               ease: "easeInOut",
//             },
//           }}
//           whileTap={{ scale: 0.95 }}
//           className="relative w-20 h-20 cursor-pointer"
//         >
//           <Image
//             src="/mascot.png"
//             alt="Library Assistant Mascot"
//             width={80}
//             height={80}
//             className="object-cover rounded-full"
//           />
//           {/* Speech bubble with "Psst!" */}
//           <AnimatePresence>
//             {showAlert && !expanded && (
//               <motion.div
//                 className="absolute -top-8 -right-8 bg-yellow-200 text-black text-sm font-semibold px-2 py-1 rounded-lg shadow-md"
//                 initial={{ opacity: 0, scale: 0.8, y: 10 }}
//                 animate={{ opacity: 1, scale: 1, y: 0 }}
//                 exit={{ opacity: 0, scale: 0.8, y: 10 }}
//                 transition={{ duration: 0.3 }}
//               >
//                 Psst!
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </motion.div>
//       </div>
//     </div>
//   );
// }


'use client';

import { useState, useEffect, useRef, SetStateAction } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Tooltip } from "@mui/material";

interface ChatMessage {
  user: string;
  ai: string;
}

interface Feature {
  title: string;
  emoji: string;
}

const features = [
  { title: "Personalized Library Guide", emoji: "📚" },
  { title: "Book Search & Discovery", emoji: "🔍" },
  { title: "Borrowing & Lending Facilitator", emoji: "🔄" },
  { title: "AI Chat & Book Summarization", emoji: "🤖" },
  { title: "Gamification & Engagement", emoji: "🎮" },
  { title: "AI-Powered Discussions & Book Clubs", emoji: "💬" },
  { title: "Announcements", emoji: "📢" },
  { title: "Multi-Language Support & Translation", emoji: "🌍" },
  { title: "Author & Genre Insights", emoji: "✍️" },
]

export default function LibraryMascotWidget() {
  const [expanded, setExpanded] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [chatInput, setChatInput] = useState(""); // For AI Chat modal
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]); // Store chat history
  const widgetRef = useRef<HTMLDivElement>(null);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);


  // Toggle "Psst!" alert every 10 seconds when not expanded
  useEffect(() => {
    if (!expanded && !selectedFeature) {
      const interval = setInterval(() => {
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 2000);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [expanded, selectedFeature]);

  // Handle outside clicks to close everything
  useEffect(() => {
    const handleClickOutside = (event: { target: any; }) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target)) {
        setExpanded(false);
        setSelectedFeature(null);
      }
    };

    if (expanded || selectedFeature) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [expanded, selectedFeature]);

  // Handle feature selection (close menu, open modal)
  const handleFeatureClick = (feature: Feature) => {
    setExpanded(false); // Close the feature menu
    setSelectedFeature(feature); // Open the modal
  };

  // Simulate AI chat response (hardcoded for now)
  const handleChatSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (chatInput.trim()) {
      setChatMessages([...chatMessages, { user: chatInput, ai: "Here's a sample response!" }]);
      setChatInput("");
    }
  };

  // Modal content based on selected feature
  const renderModalContent = () => {
    if (!selectedFeature) return null;

    switch (selectedFeature.title) {
      case "Personalized Library Guide":
        return (
          <div className="p-6">
            <h3 className="text-xl font-bold mb-4">Your Personalized Library Guide</h3>
            <p className="mb-2"><strong>Recommendations:</strong></p>
            <ul className="list-disc pl-5 mb-4">
              <li>"The Great Gatsby" by F. Scott Fitzgerald</li>
              <li>"Moby Dick" by Herman Melville</li>
            </ul>
            <button className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Add All to Reading List
            </button>
          </div>
        );
      case "Book Search & Discovery":
        return (
          <div className="p-6">
            <h3 className="text-xl font-bold mb-4">Book Search & Discovery</h3>
            <input
              type="text"
              placeholder="Search for a book (e.g., 'Dune')..."
              className="w-full p-2 border rounded mb-4"
            />
            <p><strong>Top Result:</strong> "Dune" by Frank Herbert</p>
            <button className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mt-2">
              View Details
            </button>
          </div>
        );
      case "Borrowing & Lending Facilitator":
        return (
          <div className="p-6">
            <h3 className="text-xl font-bold mb-4">Borrowing & Lending</h3>
            <p><strong>Available Now:</strong> "1984" by George Orwell</p>
            <p className="text-sm text-gray-600 mb-4">Due back: March 1, 2025</p>
            <button className="w-full px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600">
              Borrow Book
            </button>
          </div>
        );
      case "AI Chat & Book Summarization":
        return (
          <div className="p-6">
            <h3 className="text-xl font-bold mb-4">AI Chat & Summarization</h3>
            <div className="h-40 overflow-y-auto mb-4 border p-2 rounded">
              {chatMessages.length === 0 ? (
                <p className="text-gray-500">Ask me anything about books!</p>
              ) : (
                chatMessages.map((msg, index) => (
                  <div key={index} className="mb-2">
                    <p className="text-blue-600"><strong>You:</strong> {msg.user}</p>
                    <p className="text-gray-800"><strong>AI:</strong> {msg.ai}</p>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleChatSubmit} className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your question..."
                className="flex-1 p-2 border rounded"
              />
              <button type="submit" className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
                Send
              </button>
            </form>
            <button className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 mt-2">
              Summarize "Pride and Prejudice"
            </button>
          </div>
        );
      case "Gamification & Engagement":
        return (
          <div className="p-6">
            <h3 className="text-xl font-bold mb-4">Gamification & Engagement</h3>
            <p><strong>Current Challenge:</strong> Read 5 books this month</p>
            <p className="mb-4">Progress: 2/5 (40%)</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: "40%" }}></div>
            </div>
            <button className="w-full px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">
              Claim Reward
            </button>
          </div>
        );
      case "AI-Powered Discussions & Book Clubs":
        return (
          <div className="p-6">
            <h3 className="text-xl font-bold mb-4">Book Clubs</h3>
            <p><strong>Active Discussion:</strong> "The Catcher in the Rye"</p>
            <p className="text-sm text-gray-600 mb-4">Next meeting: Feb 25, 2025</p>
            <button className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
              Join Discussion
            </button>
          </div>
        );
      case "Announcements":
        return (
          <div className="p-6">
            <h3 className="text-xl font-bold mb-4">Library Announcements</h3>
            <p><strong>Event:</strong> New Book Arrivals</p>
            <p className="mb-4">Date: Feb 25, 2025</p>
            <button className="w-full px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600">
              View All Announcements
            </button>
          </div>
        );
      case "Multi-Language Support & Translation":
        return (
          <div className="p-6">
            <h3 className="text-xl font-bold mb-4">Language & Translation</h3>
            <p><strong>Translate:</strong> "Bonjour" → "Hello"</p>
            <select className="w-full p-2 border rounded mb-4">
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
            </select>
            <button className="w-full px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600">
              Apply Language
            </button>
          </div>
        );
      case "Author & Genre Insights":
        return (
          <div className="p-6">
            <h3 className="text-xl font-bold mb-4">Author & Genre Insights</h3>
            <p><strong>Author:</strong> Jane Austen</p>
            <p className="mb-4">Genre: Romantic Fiction</p>
            <button className="w-full px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600">
              Explore More Authors
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed bottom-16 left-24 z-50" ref={widgetRef}>
      <div className="relative flex items-center justify-center">
        <AnimatePresence>
          {expanded && !selectedFeature && (
            <motion.div
              className="absolute w-64 h-64"
              style={{
                left: '-136%',
                transform: 'translateX(-50%)',
                bottom: '-68px',
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.3 }}
            >
              {features.map((feature, index) => {
                const angle = (index / features.length) * 2 * Math.PI;
                const radius = 30;
                const top = 50 + radius * Math.sin(angle);
                const left = 50 + radius * Math.cos(angle);

                return (
                  <Tooltip key={index} title={feature.title} placement="top">
                    <motion.div
                      onClick={() => handleFeatureClick(feature)}
                      className="absolute flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-lg text-lg cursor-pointer border-2 border-gray-100"
                      style={{
                        top: `${top}%`,
                        left: `${left}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        transition: { delay: index * 0.05 },
                      }}
                      whileHover={{ scale: 1.1 }}
                    >
                      <span role="img" aria-label={feature.title}>{feature.emoji}</span>
                    </motion.div>
                  </Tooltip>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mascot with bounce animation and "Psst!" alert */}
        <motion.div
          onClick={() => setExpanded(!expanded)}
          whileHover={{ scale: 1.05 }}
          animate={{
            y: [0, -10, 0],
            transition: {
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
          whileTap={{ scale: 0.95 }}
          className="relative w-20 h-20 cursor-pointer"
        >
          <Image
            src="/mascot.png"
            alt="Library Assistant Mascot"
            width={80}
            height={80}
            className="object-cover rounded-full"
          />
          <AnimatePresence>
            {showAlert && !expanded && !selectedFeature && (
              <motion.div
                className="absolute -top-8 -right-8 bg-brown-500 text-white text-sm font-semibold px-2 py-1 rounded-lg shadow-md"
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                transition={{ duration: 0.1 }}
              >
                Psst!
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Enhanced Modal */}
        <AnimatePresence>
          {selectedFeature && (
            <motion.div
              className="absolute bg-white rounded-lg shadow-xl z-50 w-80 h-96 overflow-y-auto"
              style={{
                bottom: '100px', // Farther from bottom edge
                left: '-50%', // Adjusted to be more centered and away from left edge
                transform: 'translateX(-50%)',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              {renderModalContent()}
              <button
                onClick={() => setSelectedFeature(null)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
