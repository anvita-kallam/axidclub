import { rsoData } from './rsoData.js';

// Enhanced tag keywords mapping with more specific terms and better categorization
const tagKeywords = {
  'career': {
    keywords: ['career', 'professional', 'networking', 'business', 'finance', 'consulting', 'leadership', 'development', 'industry', 'mentorship', 'entrepreneurship', 'startup', 'marketing', 'association', 'society', 'institute', 'organization', 'careers'],
    weight: 1.3,
    isPrimary: true
  },
  'creative': {
    keywords: ['art', 'creative', 'music', 'dance', 'theater', 'film', 'writing', 'magazine', 'journal', 'poetry', 'design', 'animation', 'pottery', 'sewing', 'quilt', 'fiber', 'arts', 'performance', 'a cappella', 'choir', 'band', 'vocal', 'showcase', 'studio', 'comedy', 'stand-up'],
    weight: 1.2,
    isPrimary: true
  },
  'tech': {
    keywords: ['tech', 'computer', 'software', 'coding', 'programming', 'ai', 'artificial intelligence', 'data science', 'cybersecurity', 'hackathon', 'robotics', 'engineering', 'hardware', 'app development', 'ios', 'silicon', 'supercomputing', 'neural', 'brain-computer', 'algorithm', 'machine learning', 'computing', 'digital', 'code'],
    weight: 1.3,
    isPrimary: true
  },
  'service': {
    keywords: ['service', 'volunteer', 'community', 'outreach', 'nonprofit', 'pro bono', 'charity', 'fundraising', 'helping', 'aid', 'relief', 'tutoring', 'mentoring', 'education', 'social good', 'impact', 'support', 'assistance', 'philanthropy', 'coordinating'],
    weight: 1.4,
    isPrimary: true
  },
  'fitness': {
    keywords: ['fitness', 'sport', 'athletic', 'running', 'swimming', 'tennis', 'volleyball', 'basketball', 'soccer', 'hockey', 'rowing', 'triathlon', 'climbing', 'martial arts', 'boxing', 'jiu jitsu', 'tae kwon do', 'yoga', 'exercise', 'training', 'competitive', 'club sport', 'physical', 'skating', 'sailing', 'ski', 'snowboard'],
    weight: 1.1,
    isPrimary: true
  },
  'advocacy': {
    keywords: ['advocacy', 'activism', 'equity', 'diversity', 'inclusion', 'lgbtq', 'women', 'awareness', 'policy', 'social justice', 'rights', 'representation', 'empowerment', 'equality', 'health', 'cancer', 'diabetes'],
    weight: 1.4,
    isPrimary: true
  },
  'low-commitment': {
    keywords: ['casual', 'social', 'recreational', 'gathering', 'coffee', 'board game', 'game', 'hobby', 'relaxed', 'informal', 'flexible'],
    weight: 0.9,
    isPrimary: false // Modifier tag
  },
  'high-commitment': {
    keywords: ['competitive', 'team', 'professional', 'leadership', 'executive', 'intensive', 'rigorous', 'championship', 'tournament', 'national'],
    weight: 1.0,
    isPrimary: false // Modifier tag
  }
};

// Check if a keyword appears in text (with word boundary awareness)
function keywordMatches(text, keyword) {
  // Handle multi-word keywords
  if (keyword.includes(' ')) {
    return text.includes(keyword.toLowerCase());
  }
  // Simple word boundary check for single words
  const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
  return regex.test(text);
}

// Assign tags to an RSO based on its description with improved matching
export function assignTagsToRSO(rso) {
  const description = (rso.description || '').toLowerCase();
  const name = (rso.name || '').toLowerCase();
  const fullText = `${name} ${description}`;
  
  const tagScores = {};
  
  // Score each tag category based on keyword matches
  for (const [tag, config] of Object.entries(tagKeywords)) {
    let score = 0;
    let matchCount = 0;
    
    for (const keyword of config.keywords) {
      if (keywordMatches(fullText, keyword)) {
        matchCount++;
        // Base score for keyword match
        score += config.weight;
        
        // Boost score if keyword appears in name (more relevant)
        if (keywordMatches(name, keyword)) {
          score += 0.8;
        }
        // Smaller boost if in description
        else if (keywordMatches(description, keyword)) {
          score += 0.3;
        }
      }
    }
    
    // Bonus for multiple keyword matches (indicates strong relevance)
    if (matchCount > 1) {
      score += (matchCount - 1) * 0.2;
    }
    
    if (score > 0) {
      tagScores[tag] = score;
    }
  }
  
  // Get top tags (above threshold) or all if none are strong
  const threshold = 0.6;
  const tags = Object.entries(tagScores)
    .filter(([_, score]) => score >= threshold)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 6) // Limit to top 6 tags
    .map(([tag]) => tag);
  
  // Default tags if none found
  if (tags.length === 0) {
    tags.push('social');
  }
  
  return tags;
}

// Calculate tag frequency and importance from user answers
function analyzeUserTags(userTags) {
  const tagFrequency = {};
  const tagImportance = {};
  
  // Count frequency of each tag
  userTags.forEach(tag => {
    tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
  });
  
  // Calculate importance based on frequency and tag weight
  Object.keys(tagFrequency).forEach(tag => {
    const config = tagKeywords[tag];
    const frequency = tagFrequency[tag];
    const baseWeight = config ? config.weight : 1.0;
    
    // Importance = frequency * base weight (with diminishing returns)
    tagImportance[tag] = baseWeight * (1 + Math.log(frequency + 1));
  });
  
  return { tagFrequency, tagImportance };
}

// Calculate match score between user interests and RSO tags with improved algorithm
export function calculateMatchScore(userTags, rsoTags, userTagAnalysis = null) {
  if (!rsoTags || rsoTags.length === 0) return 0;
  if (!userTags || userTags.length === 0) return 0;
  
  // Analyze user tags if not provided
  if (!userTagAnalysis) {
    userTagAnalysis = analyzeUserTags(userTags);
  }
  const { tagFrequency, tagImportance } = userTagAnalysis;
  
  // Separate primary interests from commitment modifiers
  const primaryUserTags = userTags.filter(tag => {
    const config = tagKeywords[tag];
    return config && config.isPrimary;
  });
  const commitmentUserTags = userTags.filter(tag => {
    const config = tagKeywords[tag];
    return config && !config.isPrimary;
  });
  
  const primaryRsoTags = rsoTags.filter(tag => {
    const config = tagKeywords[tag];
    return config && config.isPrimary;
  });
  const commitmentRsoTags = rsoTags.filter(tag => {
    const config = tagKeywords[tag];
    return config && !config.isPrimary;
  });
  
  // Calculate primary interest match score (weighted by frequency and importance)
  let primaryScore = 0;
  let totalImportance = 0;
  
  primaryUserTags.forEach(tag => {
    const importance = tagImportance[tag] || 1.0;
    totalImportance += importance;
    
    if (primaryRsoTags.includes(tag)) {
      // Bonus for matching important/frequent tags
      primaryScore += importance * 1.5;
    }
  });
  
  // Normalize primary score
  if (totalImportance > 0) {
    primaryScore = primaryScore / totalImportance;
  }
  
  // Calculate commitment level match
  let commitmentScore = 1.0; // Default: no penalty
  if (commitmentUserTags.length > 0 && commitmentRsoTags.length > 0) {
    const userWantsLow = commitmentUserTags.includes('low-commitment');
    const userWantsHigh = commitmentUserTags.includes('high-commitment');
    const rsoIsLow = commitmentRsoTags.includes('low-commitment');
    const rsoIsHigh = commitmentRsoTags.includes('high-commitment');
    
    // Penalty for commitment mismatch
    if (userWantsLow && rsoIsHigh) {
      commitmentScore = 0.6; // User wants low commitment but RSO is high
    } else if (userWantsHigh && rsoIsLow) {
      commitmentScore = 0.7; // User wants high commitment but RSO is low
    } else if ((userWantsLow && rsoIsLow) || (userWantsHigh && rsoIsHigh)) {
      commitmentScore = 1.2; // Perfect match
    }
  }
  
  // Calculate overlap ratio (how many user interests are matched)
  const matchingPrimaryTags = primaryUserTags.filter(tag => primaryRsoTags.includes(tag));
  const overlapRatio = primaryUserTags.length > 0 
    ? matchingPrimaryTags.length / primaryUserTags.length 
    : 0;
  
  // Bonus for matching multiple interests (diversity bonus)
  const diversityBonus = matchingPrimaryTags.length > 1 
    ? Math.min(0.15, (matchingPrimaryTags.length - 1) * 0.05) 
    : 0;
  
  // Bonus for matching high-importance tags
  const importantTags = ['career', 'service', 'advocacy', 'tech'];
  const importantMatches = matchingPrimaryTags.filter(tag => importantTags.includes(tag)).length;
  const importantBonus = importantMatches > 0 ? 0.1 * importantMatches : 0;
  
  // Penalty if RSO has many tags but few match (too broad/not specific enough)
  const specificityPenalty = primaryRsoTags.length > primaryUserTags.length * 2.5 
    ? 0.08 
    : 0;
  
  // Calculate final score
  const finalScore = Math.min(1.0, 
    primaryScore * 0.5 +           // Primary interest match (50%)
    overlapRatio * 0.25 +           // Overlap ratio (25%)
    diversityBonus +                 // Diversity bonus
    importantBonus -                 // Important tag bonus
    specificityPenalty               // Specificity penalty
  ) * commitmentScore;              // Apply commitment modifier
  
  return Math.max(0, finalScore); // Ensure non-negative
}

// Get top matching RSOs for user with improved filtering and diversity
export function getTopMatches(userTags, count = 5) {
  if (!userTags || userTags.length === 0) {
    // Return some popular/general RSOs if no tags
    return rsoData.slice(0, count).map(rso => ({
      ...rso,
      tags: assignTagsToRSO(rso),
      score: 0.3
    }));
  }
  
  // Analyze user tags once
  const userTagAnalysis = analyzeUserTags(userTags);
  
  // Assign tags to all RSOs
  const rsoWithTags = rsoData.map(rso => ({
    ...rso,
    tags: assignTagsToRSO(rso)
  }));
  
  // Calculate scores
  const scoredRSOs = rsoWithTags.map(rso => ({
    ...rso,
    score: calculateMatchScore(userTags, rso.tags, userTagAnalysis)
  }));
  
  // Sort by score (descending) and filter
  const sortedRSOs = scoredRSOs
    .sort((a, b) => {
      // Primary sort: score
      if (Math.abs(a.score - b.score) > 0.01) {
        return b.score - a.score;
      }
      // Secondary sort: number of matching tags (tiebreaker)
      const aMatches = userTags.filter(tag => a.tags.includes(tag)).length;
      const bMatches = userTags.filter(tag => b.tags.includes(tag)).length;
      return bMatches - aMatches;
    })
    .filter(rso => rso.score > 0.15); // Only return RSOs with meaningful scores

  // Group RSOs by broader score tiers for more variation
  const scoreTiers = {
    top: [],      // Top 20% of scores
    high: [],     // Next 20%
    medium: [],   // Next 30%
    good: []      // Remaining 30%
  };
  
  if (sortedRSOs.length > 0) {
    const topScore = sortedRSOs[0].score;
    const scoreRange = topScore - 0.15;
    
    sortedRSOs.forEach(rso => {
      const scoreRatio = (rso.score - 0.15) / scoreRange;
      if (scoreRatio >= 0.8) {
        scoreTiers.top.push(rso);
      } else if (scoreRatio >= 0.6) {
        scoreTiers.high.push(rso);
      } else if (scoreRatio >= 0.3) {
        scoreTiers.medium.push(rso);
      } else {
        scoreTiers.good.push(rso);
      }
    });
  }

  // Shuffle all tiers for maximum variation
  Object.keys(scoreTiers).forEach(tier => {
    const group = scoreTiers[tier];
    for (let i = group.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [group[i], group[j]] = [group[j], group[i]];
    }
  });

  // Build a diverse selection from different tiers
  const topMatches = [];
  const usedTagCombinations = new Set();
  const usedNames = new Set();
  
  // Strategy: Pick from different tiers with some randomness
  const tierOrder = ['top', 'high', 'medium', 'good'];
  let tierIndex = 0;
  let attempts = 0;
  const maxAttempts = sortedRSOs.length * 2;
  
  while (topMatches.length < count && attempts < maxAttempts) {
    attempts++;
    
    // Cycle through tiers, but with some randomness
    const currentTier = tierOrder[tierIndex % tierOrder.length];
    const tierRSOs = scoreTiers[currentTier];
    
    if (tierRSOs.length === 0) {
      tierIndex++;
      continue;
    }
    
    // Pick a random RSO from current tier
    const randomIndex = Math.floor(Math.random() * tierRSOs.length);
    const rso = tierRSOs[randomIndex];
    
    // Skip if already used
    if (usedNames.has(rso.name)) {
      tierIndex++;
      continue;
    }
    
    // Check for tag diversity (but be more lenient)
    const primaryTags = rso.tags.filter(tag => {
      const config = tagKeywords[tag];
      return config && config.isPrimary;
    }).sort().join(',');
    
    // Only skip if we have 2+ RSOs with the exact same tag combination
    const similarCount = topMatches.filter(m => {
      const mPrimaryTags = m.tags.filter(tag => {
        const config = tagKeywords[tag];
        return config && config.isPrimary;
      }).sort().join(',');
      return mPrimaryTags === primaryTags;
    }).length;
    
    // Allow up to 1 duplicate tag combination, then skip
    if (similarCount >= 1 && topMatches.length >= 2) {
      tierIndex++;
      continue;
    }
    
    // Add this RSO
    topMatches.push(rso);
    usedTagCombinations.add(primaryTags);
    usedNames.add(rso.name);
    
    // Move to next tier for diversity
    tierIndex++;
    
    // Occasionally jump back to top tier for quality
    if (Math.random() < 0.3 && topMatches.length < count) {
      tierIndex = 0;
    }
  }
  
  // If we still don't have enough, fill from any remaining RSOs
  if (topMatches.length < count) {
    const allRemaining = sortedRSOs
      .filter(rso => !usedNames.has(rso.name))
      .sort(() => Math.random() - 0.5); // Randomize
    
    const needed = count - topMatches.length;
    topMatches.push(...allRemaining.slice(0, needed));
  }
  
  // Final shuffle - only keep the absolute top match stable
  if (topMatches.length > 1) {
    const topOne = topMatches[0];
    const rest = topMatches.slice(1);
    
    // Shuffle the rest completely
    for (let i = rest.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rest[i], rest[j]] = [rest[j], rest[i]];
    }
    
    // Sometimes even shuffle the top one in (10% chance)
    if (Math.random() < 0.1 && rest.length > 0) {
      const shuffled = [topOne, ...rest];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    }
    
    return [topOne, ...rest];
  }
  
  return topMatches;
}

// Generate explanation for why an RSO matches with improved messaging
export function generateMatchExplanation(rso, userTags) {
  // Remove duplicates from userTags first
  const uniqueUserTags = [...new Set(userTags)];
  const matchingTags = uniqueUserTags.filter(tag => rso.tags.includes(tag));
  
  if (matchingTags.length === 0) {
    return "This club offers opportunities that align with your interests!";
  }
  
  // Separate primary and modifier tags, removing duplicates
  const uniquePrimaryTags = [...new Set(matchingTags.filter(tag => {
    const config = tagKeywords[tag];
    return config && config.isPrimary;
  }))];
  
  const uniqueModifierTags = [...new Set(matchingTags.filter(tag => {
    const config = tagKeywords[tag];
    return config && !config.isPrimary;
  }))];
  
  // Get RSO-specific tags (tags the RSO has that user might not have selected)
  const rsoSpecificTags = rso.tags.filter(tag => {
    const config = tagKeywords[tag];
    return config && config.isPrimary && !uniquePrimaryTags.includes(tag);
  });
  
  const tagExplanations = {
    'career': ['professional development', 'career growth', 'building your network', 'industry connections'],
    'creative': ['creative expression', 'the arts', 'artistic pursuits', 'creative projects'],
    'tech': ['technology', 'innovation', 'tech skills', 'cutting-edge projects'],
    'service': ['community service', 'making a difference', 'helping others', 'giving back'],
    'fitness': ['staying active', 'physical wellness', 'fitness activities', 'an active lifestyle'],
    'advocacy': ['advocacy', 'social change', 'important causes', 'driving impact']
  };
  
  // Different explanation templates for variety
  const templates = [
    (interests) => `Based on your quiz responses, ${interests} are important to you, and this club focuses on exactly that!`,
    (interests) => `Your answers showed a strong interest in ${interests}, which aligns perfectly with what this club offers.`,
    (interests) => `This club is ideal for you because it centers around ${interests}, matching what you're looking for.`,
    (interests) => `You expressed interest in ${interests} throughout the quiz, and this club specializes in those areas.`,
    (interests) => `Your quiz results highlighted ${interests} as priorities, and this club provides opportunities in those fields.`
  ];
  
  // Prioritize more important tags in explanation
  const importantOrder = ['career', 'tech', 'service', 'advocacy', 'creative', 'fitness'];
  const sortedPrimaryTags = uniquePrimaryTags.sort((a, b) => {
    const aIndex = importantOrder.indexOf(a);
    const bIndex = importantOrder.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
  
  // Get unique explanations with variety
  const uniqueExplanations = [];
  const seenTags = new Set();
  
  for (const tag of sortedPrimaryTags.slice(0, 2)) {
    if (!seenTags.has(tag)) {
      const explanations = tagExplanations[tag];
      if (explanations) {
        // Pick a random explanation variant for variety
        const explanation = explanations[Math.floor(Math.random() * explanations.length)];
        uniqueExplanations.push(explanation);
        seenTags.add(tag);
      }
    }
  }
  
  // Use RSO name hash to pick a consistent template for this RSO
  const rsoHash = rso.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const templateIndex = rsoHash % templates.length;
  const template = templates[templateIndex];
  
  if (uniqueExplanations.length === 0) {
    return "This club aligns with your interests!";
  } else if (uniqueExplanations.length === 1) {
    return template(uniqueExplanations[0]);
  } else {
    const interests = `${uniqueExplanations[0]} and ${uniqueExplanations[1]}`;
    return template(interests);
  }
}
