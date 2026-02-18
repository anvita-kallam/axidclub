import { useState } from 'react';
import Quiz from './Quiz';
import Results from './Results';

function App() {
  const [quizComplete, setQuizComplete] = useState(false);
  const [userTags, setUserTags] = useState([]);

  const handleQuizComplete = (tags) => {
    setUserTags(tags);
    setQuizComplete(true);
  };

  const handleRestart = () => {
    setQuizComplete(false);
    setUserTags([]);
  };

  return (
    <div className="App">
      {!quizComplete ? (
        <Quiz onComplete={handleQuizComplete} />
      ) : (
        <Results userTags={userTags} onRestart={handleRestart} />
      )}
    </div>
  );
}

export default App;
