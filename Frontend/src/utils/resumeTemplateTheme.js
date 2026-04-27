export const templateStyles = {
  'Professional Classic': {
    fontFamily: 'Arial, sans-serif',
    primaryColor: '#020202',
    secondaryColor: '#0a0a0a',
    accentColor: '#1199f4',
    backgroundColor: '#ffffff',
    headerBg: '#f8f9fa',
    sectionSpacing: 15,
    fontSize: { header: 24, subheader: 16, body: 12, small: 10 },
  },
  'Modern Tech': {
    fontFamily: 'Helvetica, sans-serif',
    primaryColor: '#080808',
    secondaryColor: '#090909',
    accentColor: '#00d4aa',
    backgroundColor: '#ffffff',
    headerBg: '#eef7ff',
    sectionSpacing: 12,
    fontSize: { header: 26, subheader: 14, body: 11, small: 9 },
  },
  'Executive Premium': {
    fontFamily: 'Times New Roman, serif',
    primaryColor: '#080808',
    secondaryColor: '#2d3748',
    accentColor: '#d69e2e',
    backgroundColor: '#ffffff',
    headerBg: '#f5f7fb',
    sectionSpacing: 18,
    fontSize: { header: 28, subheader: 18, body: 12, small: 10 },
  },
  'Creative Minimal': {
    fontFamily: 'Georgia, serif',
    primaryColor: '#0d0d0d',
    secondaryColor: '#0a0a0a',
    accentColor: '#e53e3e',
    backgroundColor: '#ffffff',
    headerBg: '#f7fafc',
    sectionSpacing: 10,
    fontSize: { header: 22, subheader: 15, body: 11, small: 9 },
  },
  'Academic Research': {
    fontFamily: 'Times New Roman, serif',
    primaryColor: '#0c0c0c',
    secondaryColor: '#0c0c0c',
    accentColor: '#2563eb',
    backgroundColor: '#ffffff',
    headerBg: '#f8fafc',
    sectionSpacing: 14,
    fontSize: { header: 24, subheader: 16, body: 11, small: 9 },
  },
};

const templateNameMap = {
  'professional-classic': 'Professional Classic',
  'modern-tech': 'Modern Tech',
  'executive-premium': 'Executive Premium',
  'creative-minimal': 'Creative Minimal',
  'academic-research': 'Academic Research',
};

export const resolveTemplateTheme = (templateOrName, fallbackName = 'Professional Classic') => {
  if (templateOrName && typeof templateOrName === 'object') {
    if (templateOrName.style) {
      return { ...templateStyles['Professional Classic'], ...templateOrName.style };
    }
    const named = templateOrName.name || fallbackName;
    const resolved = templateNameMap[String(named).toLowerCase()] || named;
    return templateStyles[resolved] || templateStyles['Professional Classic'];
  }

  const rawName = typeof templateOrName === 'string' ? templateOrName : fallbackName;
  const resolved = templateNameMap[String(rawName).toLowerCase()] || rawName;
  return templateStyles[resolved] || templateStyles['Professional Classic'];
};
