import { getTopMatches, generateMatchExplanation } from './rsoMatcher';

export default function Results({ userTags, onRestart }) {
  const matches = getTopMatches(userTags, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cute-light-blue via-cute-light-yellow to-cute-light-blue py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-cute-navy mb-4 drop-shadow-sm">
            Your Perfect Matches!
          </h1>
          <p className="text-lg text-cute-navy opacity-80 mb-8">
            Based on your interests, here are the RSOs we think you'll love:
          </p>
        </div>

        {/* Results Cards */}
        <div className="space-y-5 mb-12">
          {matches.map((rso, index) => (
            <div
              key={rso.name}
              className="bg-white rounded-3xl shadow-lg p-6 md:p-8 border-2 border-cute-blue border-opacity-30 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01]"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-cute-blue to-cute-yellow rounded-full flex items-center justify-center shadow-md">
                  <span className="text-2xl font-bold text-cute-navy">
                    {index + 1}
                  </span>
                </div>
                <div className="flex-grow">
                  <h2 className="text-2xl md:text-3xl font-bold text-cute-navy mb-2">
                    {rso.name}
                  </h2>
                  <p className="text-cute-navy opacity-80 mb-4 text-lg">
                    {rso.description}
                  </p>
                  <div className="bg-gradient-to-r from-cute-light-blue to-cute-light-yellow rounded-2xl p-4 border-l-4 border-cute-blue border-opacity-50">
                    <p className="text-cute-navy font-medium">
                      <span className="text-cute-navy font-bold">Why this matches you:</span>{' '}
                      {generateMatchExplanation(rso, userTags)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Encouragement Message */}
        <div className="bg-white rounded-3xl shadow-lg p-8 text-center mb-8 border-2 border-cute-yellow border-opacity-30">
          <h3 className="text-2xl font-bold text-cute-navy mb-4">
            Ready to Get Involved?
          </h3>
          <p className="text-cute-navy opacity-80 text-lg mb-6">
            These clubs are just the beginning! Reach out to them, attend their events, 
            and find your community at Georgia Tech. You've got this!
          </p>
        </div>

        {/* Restart Button */}
        <div className="text-center">
          <button
            onClick={onRestart}
            className="px-8 py-4 bg-gradient-to-r from-cute-blue to-cute-yellow text-cute-navy rounded-2xl font-bold text-lg hover:shadow-lg transition-all duration-200 shadow-md transform hover:scale-105"
          >
            Take Quiz Again
          </button>
        </div>
      </div>
    </div>
  );
}
