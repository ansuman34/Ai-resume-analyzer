export const templateStyles = {
  'Default Standard': {
    fontFamily: '"Times New Roman", Times, serif',
    primaryColor: '#000000',
    secondaryColor: '#000000',
    accentColor: '#000000',
    backgroundColor: '#ffffff',
    headerBg: '#ffffff',
    sectionSpacing: 16,
    fontSize: { header: 28, subheader: 16, body: 12, small: 11 },
  }
};

export const resolveTemplateTheme = () => {
  return templateStyles['Default Standard'];
};
