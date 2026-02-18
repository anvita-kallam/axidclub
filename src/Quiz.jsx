import { useState, useRef, useEffect } from 'react';
import Question from './Question';
import betxiImage from './betxi.jpg';
import sportsImage from './sports.png';

const quizQuestions = [
  {
    id: 1,
    question: "What's your ideal way to spend a free afternoon?",
    type: 'multiple',
    options: [
      { label: "Working on a creative project or hobby", value: ['creative', 'low-commitment'] },
      { label: "Attending a networking event or workshop", value: ['career', 'advocacy'] },
      { label: "Volunteering or helping in the community", value: ['service', 'advocacy'] },
      { label: "Coding, building, or learning new tech skills", value: ['tech', 'career'] },
      { label: "Playing sports or working out", value: ['fitness'] },
      { label: "Relaxing with friends or social activities", value: ['low-commitment', 'social'] }
    ]
  },
  {
    id: 2,
    question: "How important is professional development to you?",
    type: 'likert',
    options: [
      { label: "Extremely important - I'm focused on building my career", value: ['career', 'high-commitment'] },
      { label: "Very important - I want to grow professionally", value: ['career'] },
      { label: "Somewhat important - I'm interested but flexible", value: ['career', 'low-commitment'] },
      { label: "Not very important - I prefer other priorities", value: ['low-commitment'] }
    ]
  },
  {
    id: 3,
    question: "Which creative outlet appeals to you most?",
    type: 'multiple',
    options: [
      { label: "Music, singing, or performing", value: ['creative'] },
      { label: "Dance or movement", value: ['creative', 'fitness'] },
      { label: "Visual arts, design, or crafts", value: ['creative'] },
      { label: "Writing, journalism, or storytelling", value: ['creative', 'advocacy'] },
      { label: "I'm not particularly drawn to creative activities", value: [] }
    ]
  },
  {
    id: 4,
    question: "How do you feel about technology and coding?",
    type: 'likert',
    options: [
      { label: "Love it! I'm passionate about tech and want to dive deep", value: ['tech', 'high-commitment'] },
      { label: "Really enjoy it - I want to learn and grow", value: ['tech'] },
      { label: "Interested but still learning", value: ['tech', 'low-commitment'] },
      { label: "Neutral - not my main focus", value: [] }
    ]
  },
  {
    id: 5,
    question: "What's your approach to community service?",
    type: 'multiple',
    options: [
      { label: "I'm passionate about making a difference", value: ['service', 'advocacy', 'high-commitment'] },
      { label: "I enjoy volunteering when I can", value: ['service'] },
      { label: "I'm interested but prefer flexible opportunities", value: ['service', 'low-commitment'] },
      { label: "It's not a priority for me right now", value: [] }
    ]
  },
  {
    id: 6,
    question: "How active do you want to be?",
    type: 'multiple',
    options: [
      { label: "Very active - I love sports and fitness", value: ['fitness', 'high-commitment'] },
      { label: "Moderately active - I enjoy staying fit", value: ['fitness'] },
      { label: "Casually active - light activities are fine", value: ['fitness', 'low-commitment'] },
      { label: "Not particularly interested in fitness activities", value: [] }
    ]
  },
  {
    id: 8,
    question: "What's your interest level in advocacy and social change?",
    type: 'multiple',
    options: [
      { label: "Very passionate - I want to drive change", value: ['advocacy', 'service', 'high-commitment'] },
      { label: "Interested - I care about important issues", value: ['advocacy'] },
      { label: "Somewhat interested - I support causes I believe in", value: ['advocacy', 'low-commitment'] },
      { label: "Not a main focus for me", value: [] }
    ]
  },
  {
    id: 9,
    question: "What level of commitment are you looking for?",
    type: 'multiple',
    options: [
      { label: "High commitment - I want to be deeply involved", value: ['high-commitment'] },
      { label: "Moderate commitment - regular but manageable", value: [] },
      { label: "Low commitment - flexible and casual", value: ['low-commitment'] },
      { label: "I'm open to anything that fits my interests", value: [] }
    ]
  },
  {
    id: 10,
    question: "Which area would you most like to explore or develop?",
    type: 'multiple',
    options: [
      { label: "Leadership skills and taking on responsibilities", value: ['career', 'advocacy', 'high-commitment'] },
      { label: "Technical skills and innovation", value: ['tech', 'career'] },
      { label: "Creative expression and artistic growth", value: ['creative'] },
      { label: "Community impact and service", value: ['service', 'advocacy'] },
      { label: "Just finding a fun, supportive community", value: ['low-commitment', 'social'] }
    ]
  }
];

export default function Quiz({ onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const isProcessingRef = useRef(false);
  const timeoutRef = useRef(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleAnswer = (value) => {
    // Prevent multiple submissions during processing
    if (isProcessingRef.current) return;
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    isProcessingRef.current = true;
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
    
    // Move to next question after a short delay
    timeoutRef.current = setTimeout(() => {
      try {
        isProcessingRef.current = false;
        if (currentQuestion < quizQuestions.length - 1) {
          setCurrentQuestion(currentQuestion + 1);
        } else {
          // Quiz complete - aggregate all tags from all answers
          // Keep duplicates to track frequency (important for matching algorithm)
          const allTags = [];
          newAnswers.forEach(answer => {
            if (Array.isArray(answer)) {
              allTags.push(...answer);
            } else if (answer) {
              allTags.push(answer);
            }
          });
          // Pass all tags (with duplicates) to matching algorithm for frequency analysis
          onComplete(allTags);
        }
      } catch (error) {
        console.error('Error processing answer:', error);
        isProcessingRef.current = false;
      }
    }, 500);
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const question = quizQuestions[currentQuestion];
  const canGoBack = currentQuestion > 0;
  const previousAnswer = answers[currentQuestion - 1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cute-light-blue via-cute-light-yellow to-cute-light-blue py-12 px-4 relative">
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-8">
          <div className="text-5xl md:text-6xl font-bold text-cute-navy mb-4 drop-shadow-sm axid-greek">
            ΑΞΔ
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-cute-navy mb-3 drop-shadow-sm">
            Find Your Perfect RSO Match
          </h1>
          <p className="text-lg text-cute-navy opacity-80">
            Let's discover which clubs align with your interests!
          </p>
        </div>
        
        <Question
          question={question.question}
          options={question.options}
          type={question.type}
          onAnswer={handleAnswer}
          onBack={handleBack}
          canGoBack={canGoBack}
          questionNumber={currentQuestion + 1}
          totalQuestions={quizQuestions.length}
          previousAnswer={previousAnswer}
        />
      </div>
      <div 
        className="fixed bottom-0 right-0 w-96 h-96 md:w-[500px] md:h-[500px] opacity-60 pointer-events-none z-0"
        style={{
          backgroundImage: `url(${betxiImage})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'bottom right'
        }}
      ></div>
      <div 
        className="fixed top-0 left-0 w-96 h-96 md:w-[500px] md:h-[500px] opacity-60 pointer-events-none z-0"
        style={{
          backgroundImage: `url(${sportsImage})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'top left'
        }}
      ></div>
    </div>
  );
}
