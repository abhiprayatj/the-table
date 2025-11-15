import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface FooterProps {
  onBrowseClassesClick?: () => void;
  onTopicOfInterestClick?: () => void;
}

const Footer = ({ onBrowseClassesClick, onTopicOfInterestClick }: FooterProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    setProfile(profileData);
  };

  const handleBrowseClasses = () => {
    navigate("/classes");
  };

  const handleHostAClass = () => {
    if (profile?.host_verified) {
      navigate("/create-class");
    } else {
      navigate("/be-a-teacher");
    }
  };

  const handleTopicOfInterest = () => {
    if (onTopicOfInterestClick) {
      onTopicOfInterestClick();
    } else {
      // If not on home page, navigate to home and scroll
      if (location.pathname !== "/") {
        navigate("/");
        // Wait a bit for navigation, then scroll
        setTimeout(() => {
          const section = document.getElementById("learning-interest");
          if (section) {
            section.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      } else {
        const section = document.getElementById("learning-interest");
        if (section) {
          section.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  };

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
            onClick={handleBrowseClasses}
            className="text-base sm:text-lg text-white/80 hover:text-white hover:underline transition-colors"
          >
            Browse Classes
          </button>
          <button
            onClick={handleHostAClass}
            className="text-base sm:text-lg text-white/80 hover:text-white hover:underline transition-colors"
          >
            Host a Class
          </button>
          <button
            onClick={handleTopicOfInterest}
            className="text-base sm:text-lg text-white/80 hover:text-white hover:underline transition-colors"
          >
            Topic of Interest
          </button>
          <Link
            to="/be-a-teacher"
            className="text-base sm:text-lg text-white/80 hover:text-white hover:underline transition-colors"
          >
            Be a Teacher
          </Link>
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
