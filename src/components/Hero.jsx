import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="hero">
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        The Only Free <span>AI Resume Builder</span> You’ll Ever Need
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Build ATS-optimized resumes that pass screening systems and land interviews.
      </motion.p>

      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="btn-primary big"
      >
        Get Started Free →
      </motion.button>
      <motion.div className="hero-btns">
  <motion.button
    whileHover={{ scale: 1.08 }}
    whileTap={{ scale: 0.95 }}
    className="btn-primary"
  >
    Get Started Free →
  </motion.button>

  <motion.button
    whileHover={{ scale: 1.08 }}
    whileTap={{ scale: 0.95 }}
    className="btn-outline"
  >
    Submit Resume
  </motion.button>
</motion.div>

    </section>
  );
}
