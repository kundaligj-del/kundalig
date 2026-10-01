import { motion } from "framer-motion";
import { ArrowUpRight, BookOpen, Download } from "lucide-react";
import type { Subject } from "@/data/schedule";
import { SubjectIcon } from "@/components/SubjectIcon";

// Har bir fan uchun alohida darslik va PDF havolasini ko'rsatadi.
export function BooksGrid({ subjects }: { subjects: Subject[] }) {
  return (
    <section className="books-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow muted-eyebrow">BILIMLAR JAVONING</span>
          <h2>Kitoblar <span className="heading-sparkle">✦</span></h2>
        </div>
        <div className="lesson-total"><span>{subjects.length}</span> ta fan</div>
      </div>
      <p className="books-intro">Darslikni ko&apos;r yoki PDF havolasini och — hammasi bir joyda.</p>

      <div className="books-grid">
        {subjects.map((subject, index) => (
          <motion.article
            className="book-card"
            key={subject.nomi}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .25, delay: index * .025 }}
            whileHover={{ y: -3 }}
          >
            <div className="book-card-top">
              <SubjectIcon subject={subject} />
              <span className="book-card-arrow"><ArrowUpRight size={14} /></span>
            </div>
            <h3>{subject.nomi}</h3>
            <div className="book-actions">
              <a href={subject.darslikUrl} target="_blank" rel="noopener noreferrer">
                <BookOpen size={14} /> Darslik
              </a>
              <a href={subject.pdfUrl} target="_blank" rel="noopener noreferrer">
                <Download size={14} /> PDF
              </a>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
