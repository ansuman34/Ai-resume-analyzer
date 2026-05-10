const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'that', 'this', 'your', 'you', 'are', 'was', 'were', 'have', 'has',
  'had', 'about', 'into', 'through', 'across', 'using', 'use', 'used', 'their', 'them', 'our', 'ours', 'his',
  'her', 'its', 'job', 'role', 'work', 'responsible', 'resume', 'experience', 'years', 'year', 'skills', 'skill'
]);

const ROLE_KEYWORDS = [
  {
    role: 'Frontend Developer',
    keywords: ['react', 'javascript', 'typescript', 'html', 'css', 'redux', 'next', 'ui', 'frontend', 'tailwind']
  },
  {
    role: 'Backend Developer',
    keywords: ['node', 'express', 'api', 'mongodb', 'sql', 'postgres', 'backend', 'microservices', 'redis', 'jwt']
  },
  {
    role: 'Full Stack Developer',
    keywords: ['react', 'node', 'express', 'api', 'javascript', 'typescript', 'mongodb', 'sql', 'frontend', 'backend']
  },
  {
    role: 'Data Analyst',
    keywords: ['excel', 'sql', 'python', 'powerbi', 'tableau', 'analytics', 'dashboard', 'reporting', 'statistics']
  },
  {
    role: 'Data Scientist',
    keywords: ['python', 'machine', 'learning', 'model', 'pandas', 'numpy', 'tensorflow', 'pytorch', 'nlp']
  },
  {
    role: 'DevOps Engineer',
    keywords: ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'ci', 'cd', 'terraform', 'jenkins', 'linux']
  },
  {
    role: 'Product Manager',
    keywords: ['product', 'roadmap', 'stakeholder', 'kpi', 'metrics', 'agile', 'scrum', 'strategy', 'user', 'market']
  }
];

const SKILL_PHRASE_LIBRARY = [
  'react', 'next.js', 'node.js', 'express', 'javascript', 'typescript', 'html', 'css',
  'redux', 'tailwind', 'graphql', 'rest api', 'api development', 'microservices',
  'mongodb', 'postgresql', 'mysql', 'sql', 'redis', 'firebase',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins', 'ci/cd',
  'python', 'java', 'c++', 'c#', 'pandas', 'numpy', 'scikit-learn', 'machine learning',
  'deep learning', 'nlp', 'power bi', 'tableau', 'excel', 'data analysis',
  'agile', 'scrum', 'jira', 'stakeholder management', 'product management',
  'unit testing', 'integration testing', 'git', 'linux', 'problem solving', 'communication'
];

const flattenContentText = (value, seen = new WeakSet()) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map((item) => flattenContentText(item, seen)).join(' ');
  if (typeof value === 'object') {
    if (seen.has(value)) return '';
    seen.add(value);
    return Object.values(value).map((item) => flattenContentText(item, seen)).join(' ');
  }
  return '';
};

const normalizeSkillPhrase = (phrase = '') => phrase
  .toLowerCase()
  .replace(/[^a-z0-9+\-.#/ ]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const normalizeWords = (text = '') => text
  .toLowerCase()
  .replace(/[^a-z0-9+\-.#/ ]/g, ' ')
  .split(/\s+/)
  .filter((word) => word.length >= 3 && !STOP_WORDS.has(word));

const scoreToGrade = (score) => {
  if (score >= 85) return 'A';
  if (score >= 75) return 'B';
  if (score >= 65) return 'C';
  if (score >= 50) return 'D';
  return 'E';
};

const buildRequiredSkills = (jobDescription = '', targetRole = '') => {
  const normalizedJD = normalizeSkillPhrase(jobDescription);
  const requiredSkills = [];

  // Prefer explicit skills from job description.
  for (const phrase of SKILL_PHRASE_LIBRARY) {
    const normalizedPhrase = normalizeSkillPhrase(phrase);
    if (normalizedPhrase && normalizedJD.includes(normalizedPhrase)) {
      requiredSkills.push(normalizedPhrase);
    }
  }

  // Add repeated technical words from JD.
  const jdWords = normalizeWords(normalizedJD);
  const freq = jdWords.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {});

  const frequentTechnicalWords = Object.entries(freq)
    .filter(([word, count]) => count >= 2 || SKILL_PHRASE_LIBRARY.some((skill) => skill.includes(word)))
    .map(([word]) => word)
    .filter((word) => word.length >= 4)
    .filter((word) => !['required', 'strong', 'experience', 'developer', 'engineer'].includes(word))
    .slice(0, 25);

  const fromJD = [...new Set([...requiredSkills, ...frequentTechnicalWords])]
    .filter((word) => {
      if (word.includes(' ')) return true;
      const hasContainingPhrase = requiredSkills.some((skill) => skill.includes(word) && skill !== word);
      return !hasContainingPhrase;
    });
  if (fromJD.length) return fromJD.slice(0, 35);

  // Fallback to role template only if JD isn't provided.
  const roleHint = String(targetRole || '').toLowerCase();
  const roleTemplate = ROLE_KEYWORDS.find((item) => roleHint.includes(item.role.toLowerCase()));
  if (roleTemplate) return roleTemplate.keywords.slice(0, 20);

  return [];
};

const inferJobMatch = (score) => {
  if (score >= 85) return 'Strong';
  if (score >= 70) return 'Moderate';
  return 'Low';
};

const toPercent = (value) => Math.round(value * 100);

const buildSuggestions = ({ keywordMatchRate, quantifiedBulletRate, wordCount, missingKeywords, bulletCount }) => {
  const suggestions = [];

  if (keywordMatchRate < 0.55 && missingKeywords.length) {
    suggestions.push({
      priority: 'high',
      title: 'Add missing job keywords',
      detail: `Include terms like "${missingKeywords.slice(0, 4).join(', ')}" naturally in your summary and experience bullets.`
    });
  }

  if (bulletCount === 0) {
    suggestions.push({
      priority: 'high',
      title: 'Rewrite experience using bullet points',
      detail: 'Add clear bullet points under each role so ATS can parse responsibilities and achievements correctly.'
    });
  } else if (quantifiedBulletRate < 0.5) {
    suggestions.push({
      priority: 'high',
      title: 'Quantify impact in experience bullets',
      detail: 'Add metrics (%, $, time, scale) to show measurable outcomes and improve ATS relevance.'
    });
  }

  if (wordCount < 250) {
    suggestions.push({
      priority: 'medium',
      title: 'Add more role-specific details',
      detail: 'Expand key projects, tools, and outcomes. Most strong resumes have 300-700 words.'
    });
  } else if (wordCount > 900) {
    suggestions.push({
      priority: 'medium',
      title: 'Trim lengthy sections',
      detail: 'Reduce repetition and keep the resume concise to improve readability and scanning.'
    });
  }

  if (!suggestions.length) {
    suggestions.push({
      priority: 'low',
      title: 'Keep tailoring for each role',
      detail: 'You already have a good ATS baseline. Adjust keyword emphasis for each job description.'
    });
  }

  return suggestions;
};

const buildWeakPoints = ({ keywordMatchRate, quantifiedBulletRate, wordCount, bulletCount, missingKeywords, requiredSkills }) => {
  const weakPoints = [];

  if (requiredSkills.length && keywordMatchRate < 0.55) {
    weakPoints.push(`Low JD alignment: only ${toPercent(keywordMatchRate)}% of required skills are reflected in the resume.`);
  }
  if (missingKeywords.length >= 6) {
    weakPoints.push(`Critical required skills are missing: ${missingKeywords.slice(0, 6).join(', ')}.`);
  }
  if (quantifiedBulletRate < 0.4) {
    weakPoints.push('Most experience bullets are not quantified with impact metrics.');
  }
  if (bulletCount < 6) {
    weakPoints.push('Resume has too few bullet points for ATS-friendly skimmability.');
  }
  if (wordCount < 250) {
    weakPoints.push('Resume content is too short; add projects, scope, tools, and outcomes.');
  }
  if (wordCount > 900) {
    weakPoints.push('Resume is too long; shorten repetitive details and keep the most relevant experience.');
  }

  if (!weakPoints.length) {
    weakPoints.push('No major structural ATS weaknesses detected; continue role-specific tailoring.');
  }

  return weakPoints;
};

const buildBestFitRoles = (resumeWordSet, targetRole = '') => {
  const roleScores = ROLE_KEYWORDS.map(({ role, keywords }) => {
    const matched = keywords.filter((keyword) => resumeWordSet.has(keyword));
    const fitScore = Math.round((matched.length / keywords.length) * 100);
    return {
      role,
      fitScore,
      matchedKeywords: matched.slice(0, 6),
      rationale: matched.length
        ? `Matches keywords: ${matched.slice(0, 4).join(', ')}`
        : 'Few role-specific keywords detected'
    };
  });

  roleScores.sort((a, b) => b.fitScore - a.fitScore);

  if (targetRole && targetRole.trim()) {
    const normalizedTarget = targetRole.trim().toLowerCase();
    roleScores.sort((a, b) => {
      const aBoost = a.role.toLowerCase().includes(normalizedTarget) ? 1 : 0;
      const bBoost = b.role.toLowerCase().includes(normalizedTarget) ? 1 : 0;
      if (aBoost !== bBoost) return bBoost - aBoost;
      return b.fitScore - a.fitScore;
    });
  }

  return roleScores.slice(0, 4);
};

const buildScoreReasons = ({ sectionScores, requiredSkills, matchedKeywords, missingKeywords, bulletCount, quantifiedBulletRate }) => {
  const reasons = [];
  reasons.push(`Keyword alignment contributes ${sectionScores.keywordAlignment}% because ${matchedKeywords.length}/${requiredSkills.length || matchedKeywords.length || 1} required skills were matched.`);
  reasons.push(`Impact contributes ${sectionScores.impact}% based on quantified achievements across ${bulletCount} bullet points.`);
  reasons.push(`Structure contributes ${sectionScores.structure}% based on bullet formatting and section scannability.`);
  reasons.push(`Readability contributes ${sectionScores.readability}% from overall resume length and content balance.`);
  if (missingKeywords.length) {
    reasons.push(`Score is reduced by missing required skills: ${missingKeywords.slice(0, 6).join(', ')}.`);
  }
  if (bulletCount > 0 && quantifiedBulletRate < 0.5) {
    reasons.push('Score is reduced because many bullets describe tasks without measurable outcomes.');
  }
  return reasons;
};

const analyzeResume = (resumeInput, options = {}) => {
  const rawText = (resumeInput && resumeInput.resumeText)
    ? resumeInput.resumeText
    : flattenContentText(resumeInput && resumeInput.content);

  const resumeText = String(rawText || '').replace(/\s+/g, ' ').trim();
  const words = resumeText ? resumeText.split(/\s+/) : [];
  const wordCount = words.length;
  const bulletCount = (resumeText.match(/(\n\s*[-*•])|(\s[-*•]\s)/g) || []).length;
  const quantifiedBulletCount = (resumeText.match(/\b\d+(\.\d+)?\s?(%|percent|k|m|b|x|hours?|days?|months?|years?)\b/gi) || []).length;

  const normalizedResumeText = normalizeSkillPhrase(resumeText);
  const resumeWordSet = new Set(normalizeWords(resumeText));
  const detectedSkills = SKILL_PHRASE_LIBRARY
    .map((skill) => normalizeSkillPhrase(skill))
    .filter((skill, index, arr) => skill && arr.indexOf(skill) === index)
    .filter((skill) => normalizedResumeText.includes(skill))
    .slice(0, 35);
  const requiredSkills = buildRequiredSkills(options.jobDescription, options.targetRole);
  const matchedKeywords = requiredSkills.filter((skill) => normalizedResumeText.includes(skill));
  const missingKeywords = requiredSkills.filter((skill) => !normalizedResumeText.includes(skill));

  const keywordMatchRate = requiredSkills.length ? matchedKeywords.length / requiredSkills.length : 0.75;
  const quantifiedBulletRate = bulletCount ? Math.min(1, quantifiedBulletCount / bulletCount) : 0;
  const impactScore = quantifiedBulletRate;
  const keywordScore = keywordMatchRate;
  const readabilityScore = Math.max(0, Math.min(1, 1 - Math.abs(550 - wordCount) / 550));
  const structureScore = Math.max(0, Math.min(1, bulletCount / 8));

  const totalScore = Math.round(
    (readabilityScore * 0.2 + structureScore * 0.2 + keywordScore * 0.35 + impactScore * 0.25) * 100
  );

  const strengths = [];
  if (keywordMatchRate >= 0.65) strengths.push('Strong overlap with required skills from the job description');
  if (quantifiedBulletRate >= 0.5) strengths.push('Experience includes measurable outcomes');
  if (wordCount >= 300 && wordCount <= 800) strengths.push('Resume length is within a strong ATS-friendly range');
  if (bulletCount >= 6) strengths.push('Bullet-point structure supports skimmability');
  if (requiredSkills.length && matchedKeywords.length >= 8) {
    strengths.push('Resume reflects many core technical requirements listed in the job description');
  }

  const score = Math.max(0, Math.min(100, totalScore));
  const grade = scoreToGrade(score);
  const weakPoints = buildWeakPoints({
    keywordMatchRate,
    quantifiedBulletRate,
    wordCount,
    bulletCount,
    missingKeywords,
    requiredSkills
  });
  const bestFitRoles = buildBestFitRoles(resumeWordSet, options.targetRole);
  const diagnosisDetails = {
    keywordCoverage: requiredSkills.length
      ? `${matchedKeywords.length}/${requiredSkills.length} required skills matched`
      : 'No job description provided; keyword coverage uses generic baseline',
    impactEvidence: `${quantifiedBulletCount} quantified bullet indicators detected`,
    structureEvidence: `${bulletCount} bullets, ${wordCount} words`,
    topMissingSkills: missingKeywords.slice(0, 8),
    topMatchedSkills: matchedKeywords.slice(0, 8)
  };
  const sectionScores = {
    readability: toPercent(readabilityScore),
    structure: toPercent(structureScore),
    keywordAlignment: toPercent(keywordScore),
    impact: toPercent(impactScore)
  };
  const scoreReasons = buildScoreReasons({
    sectionScores,
    requiredSkills,
    matchedKeywords,
    missingKeywords,
    bulletCount,
    quantifiedBulletRate
  });
  const improvementPlan = [
    ...missingKeywords.slice(0, 5).map((skill) => `Add "${skill}" where genuinely applicable in summary, skills, or experience bullets.`),
    bulletCount === 0
      ? 'Convert paragraphs into role-wise bullet points for better ATS parsing.'
      : quantifiedBulletRate < 0.5
        ? 'Rewrite at least half of experience bullets with measurable outcomes.'
        : 'Maintain quantified outcomes and keep impact-focused bullets.',
    wordCount < 300
      ? 'Expand project scope, tools used, and outcomes to reach ATS-friendly depth.'
      : wordCount > 900
        ? 'Trim repetitive content and prioritize role-relevant achievements.'
        : 'Keep current length and focus on tailoring to each job description.'
  ];

  return {
    score,
    grade,
    summary: `ATS score ${score}/100 (${grade}). Improve keyword coverage and quantified achievements for better shortlist chances.`,
    jobMatch: inferJobMatch(score),
    metrics: {
      wordCount,
      bulletCount,
      keywordMatchRate,
      quantifiedBulletRate
    },
    sectionScores,
    diagnosis: {
      strongPoints: strengths,
      weakPoints
    },
    diagnosisDetails,
    scoreReasons,
    improvementPlan,
    detectedSkills,
    matchedKeywords: matchedKeywords.slice(0, 20),
    missingKeywords: missingKeywords.slice(0, 20),
    requiredSkills,
    jobKeywordsConsidered: requiredSkills.slice(0, 30),
    bestFitRoles,
    strengths,
    suggestions: buildSuggestions({ keywordMatchRate, quantifiedBulletRate, wordCount, missingKeywords, bulletCount })
  };
};

module.exports = { analyzeResume };
