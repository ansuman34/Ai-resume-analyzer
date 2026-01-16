import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function ScorePreview() {
  const [score, setScore] = useState(0);

  const breakdown = [
    { label: "Content Quality", value: 35, max: 35 },
    { label: "ATS & Structure", value: 21, max: 25 },
    { label: "Job Optimization", value: 22, max: 25 },
    { label: "Writing Quality", value: 10, max: 10 },
    { label: "Application Ready", value: 5, max: 5 },
  ];

  const finalScore = 93;

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setScore(i);
      if (i === finalScore) clearInterval(timer);
    }, 20);
  }, []);

  return (
    <section className="score-section">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="score-card"
      >
        <h2>Your Resume Score</h2>

        <div className="score">{score}<span>/100</span></div>

        <div className="bars">
          {breakdown.map((b, i) => {
            const percent = (b.value / b.max) * 100;

            return (
              <div className="bar-row" key={i}>
                <div className="bar-header">
                  <span>{b.label}</span>
                  <span>{b.value}/{b.max}</span>
                </div>

                <div className="bar-bg">
                  <motion.div
                    className="bar-fill"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${percent}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-primary submit-btn"
        >
          Submit Resume
        </motion.button>
      </motion.div>
    </section>
  );
}
