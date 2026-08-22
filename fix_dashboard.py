import re

with open("frontend/src/pages/dashboard/Dashboard.tsx", "r") as f:
    content = f.read()

# Add framer-motion import
content = content.replace('import { useEffect, useState } from "react";', 'import { useEffect, useState } from "react";\nimport { motion } from "framer-motion";')

# Add variants
variants_code = """
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };
"""

content = content.replace('const responseStats = [', variants_code + '\n  const responseStats = [')

# Replace <div className="dashboard-container" ...> with <motion.div ...>
content = content.replace('<div className="dashboard-container"', '<motion.div variants={containerVariants} initial="hidden" animate="show" className="dashboard-container"')
content = re.sub(r'</div>\s*$', '</motion.div>\n', content)

# Wrap Cards with motion.div
content = content.replace('<Col ', '<Col component={motion.div} variants={itemVariants} ')
content = content.replace('<Card ', '<motion.div variants={itemVariants}><Card ')
content = content.replace('</Card>', '</Card></motion.div>')

with open("frontend/src/pages/dashboard/Dashboard.tsx", "w") as f:
    f.write(content)
