export default function Templates() {
 const templates = [
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSx4jZKBrPlzSrwPKIy2-VXEy7F4GMuZr6Sgw&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQl6g1lSI1C3hgLJCR0n5xxW6U-qgAK1p-3xw&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsoBI4Qz_sBfv9xmgebGxsxSTNQFFTbvud_g&s",
];

  return (
    <section className="templates-showcase">
      <h2>Professional Resume Templates</h2>
      <p>ATS-optimized templates designed by experts to help you land your dream job.</p>

      <div className="template-stage">
        {templates.map((t, i) => (
          <div key={i} className={`template-card card-${i}`}>
            <img src={t} alt="resume template" />
          </div>
        ))}
      </div>

      <div className="template-cta">
        <button className="btn-submit-resume">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          Submit Your Resume
        </button>
      </div>
    </section>
  );
}

