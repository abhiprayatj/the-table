import { Link } from "react-router-dom";

interface FooterProps {
  onBrowseClassesClick?: () => void;
}

const Footer = ({ onBrowseClassesClick }: FooterProps) => {
  return (
    <footer className="bg-black text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto flex flex-col items-center text-center space-y-8">
        {/* Call to Action */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif">
          We take you from 0 to 1, so you can go from 1 to 1000.
        </h2>

        {/* Navigation Links */}
        <nav className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
          <button
            onClick={onBrowseClassesClick}
            className="text-base sm:text-lg text-white/80 hover:text-white hover:underline transition-colors"
          >
            Browse Classes
          </button>
          <Link
            to="/apply-host"
            className="text-base sm:text-lg text-white/80 hover:text-white hover:underline transition-colors"
          >
            Host a Class
          </Link>
          <a
            href="#"
            className="text-base sm:text-lg text-white/80 hover:text-white hover:underline transition-colors"
          >
            Topic of Interest
          </a>
        </nav>

        {/* Logo */}
        <div className="text-2xl font-serif font-medium">
          the table
        </div>
      </div>
    </footer>
  );
};

export default Footer;
