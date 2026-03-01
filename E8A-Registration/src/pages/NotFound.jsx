import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="not-found-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="not-found-code gradient-text">404</h1>
        <p className="not-found-title">Page Not Found</p>
        <p className="not-found-text">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn-primary">Go Home</Link>
      </motion.div>
    </div>
  );
}