import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, useRef } from "react";
import { User } from "@supabase/supabase-js";
import { Logo } from "@/components/Logo";
import { Menu, X } from "lucide-react";

interface Credits {
  topped_up_balance: number;
  teaching_balance: number;
}

interface NavigationProps {
  enableScrollTransition?: boolean;
}

export const Navigation = ({ enableScrollTransition = false }: NavigationProps) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState<Credits | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      userIdRef.current = session?.user?.id ?? null;
      if (session?.user) {
        fetchUserData(session.user.id);
      }
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      userIdRef.current = session?.user?.id ?? null;
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setCredits(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Listen for credit updates from other components
  useEffect(() => {
    const handleCreditsUpdate = () => {
      if (userIdRef.current) {
        fetchUserData(userIdRef.current);
      }
    };
    window.addEventListener("credits-updated", handleCreditsUpdate);

    return () => {
      window.removeEventListener("credits-updated", handleCreditsUpdate);
    };
  }, []);

  // Scroll detection for homepage behavior
  useEffect(() => {
    if (!enableScrollTransition) return;

    const handleScroll = () => {
      if (window.scrollY > 0) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [enableScrollTransition]);

  const fetchUserData = async (userId: string) => {
    const { data: creditsData } = await supabase.from("credits").select("*").eq("user_id", userId).single();
    const { data: profileData } = await supabase.from("profiles").select("*").eq("id", userId).single();

    // Check if user has admin role
    const { data: adminCheck } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    setCredits(creditsData);
    setProfile(profileData);
    setIsAdmin(adminCheck || false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsMobileMenuOpen(false);
    navigate("/");
  };

  const handleMobileNavClick = (path: string) => {
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  // Conditional classes based on scroll state
  const baseNavClasses = "fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out";
  
  const navClasses = enableScrollTransition
    ? scrolled
      ? `${baseNavClasses} bg-white text-black shadow-sm`
      : `${baseNavClasses} bg-transparent text-white shadow-none`
    : "border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50";

  const textClasses = enableScrollTransition && !scrolled ? "text-white" : "text-foreground";
  const mutedTextClasses = enableScrollTransition && !scrolled ? "text-white/90 hover:text-white" : "text-muted-foreground hover:text-foreground";

  return (
    <nav className={navClasses}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12">
            <Link to="/" className={`flex items-center gap-2 transition-colors duration-300 ${textClasses}`}>
              <Logo className="w-8 h-8" />
              <span className={`text-2xl font-serif font-medium transition-colors duration-300 ${textClasses}`}>
                the table
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link
                to="/classes"
                className={`text-sm transition-colors duration-300 ${mutedTextClasses}`}
              >
                Browse Classes
              </Link>
              <Link
                to="/be-a-teacher"
                className={`text-sm transition-colors duration-300 ${mutedTextClasses}`}
              >
                Be a Teacher
              </Link>
              {user ? (
                <>
                  {credits && (
                    <div className={`flex items-center gap-3 text-sm transition-colors duration-300 ${textClasses}`}>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-[hsl(var(--topped-up-credit))]" />
                        <span className="font-medium">{credits.topped_up_balance}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-[hsl(var(--teaching-credit))]" />
                        <span className="font-medium">{credits.teaching_balance}</span>
                      </div>
                    </div>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={profile?.avatar_url} />
                          <AvatarFallback
                            className={`transition-colors duration-300 ${
                              enableScrollTransition && !scrolled
                                ? "bg-white/20 text-white"
                                : "bg-muted text-foreground"
                            } text-sm`}
                          >
                            {profile?.full_name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-card">
                      <div className="flex items-center justify-start gap-2 p-2">
                        <div className="flex flex-col space-y-0.5">
                          <p className="text-sm font-medium">{profile?.full_name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate("/profile")}>Profile</DropdownMenuItem>
                      {profile?.host_verified && (
                        <DropdownMenuItem onClick={() => navigate("/create-class")}>Host a Session</DropdownMenuItem>
                      )}
                      {isAdmin && <DropdownMenuItem onClick={() => navigate("/admin")}>Admin Dashboard</DropdownMenuItem>}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut}>Sign Out</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/auth")}
                    className={`text-sm transition-colors duration-300 ${mutedTextClasses}`}
                  >
                    Log In
                  </Button>
                  <Button
                    onClick={() => navigate("/auth?mode=signup")}
                    className={`text-sm transition-colors duration-300 ${
                      enableScrollTransition && !scrolled
                        ? "bg-white/20 hover:bg-white/30 text-white border-white/30"
                        : ""
                    }`}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Navigation */}
            <div className="flex md:hidden items-center gap-2">
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={profile?.avatar_url} />
                        <AvatarFallback
                          className={`transition-colors duration-300 ${
                            enableScrollTransition && !scrolled
                              ? "bg-white/20 text-white"
                              : "bg-muted text-foreground"
                          } text-sm`}
                        >
                          {profile?.full_name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-card">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-0.5">
                        <p className="text-sm font-medium">{profile?.full_name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleMobileNavClick("/profile")}>Profile</DropdownMenuItem>
                    {profile?.host_verified && (
                      <DropdownMenuItem onClick={() => handleMobileNavClick("/create-class")}>Host a Session</DropdownMenuItem>
                    )}
                    {isAdmin && <DropdownMenuItem onClick={() => handleMobileNavClick("/admin")}>Admin Dashboard</DropdownMenuItem>}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>Sign Out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <Button
                variant="ghost"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`h-9 w-9 p-0 transition-colors duration-300 ${textClasses}`}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div
            className={`max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-3 border-t ${
              enableScrollTransition && !scrolled
                ? "border-white/20"
                : "border-border/50"
            }`}
          >
            <Link
              to="/classes"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block text-sm transition-colors duration-300 py-2 ${mutedTextClasses}`}
            >
              Browse Classes
            </Link>
            <Link
              to="/be-a-teacher"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block text-sm transition-colors duration-300 py-2 ${mutedTextClasses}`}
            >
              Be a Teacher
            </Link>
            {!user && (
              <>
                <Button
                  variant="ghost"
                  onClick={() => handleMobileNavClick("/auth")}
                  className={`w-full justify-start text-sm transition-colors duration-300 py-2 h-auto ${mutedTextClasses}`}
                >
                  Log In
                </Button>
                <Button
                  onClick={() => handleMobileNavClick("/auth?mode=signup")}
                  className={`w-full justify-start text-sm transition-colors duration-300 py-2 h-auto ${
                    enableScrollTransition && !scrolled
                      ? "bg-white/20 hover:bg-white/30 text-white border-white/30"
                      : ""
                  }`}
                >
                  Sign Up
                </Button>
              </>
            )}
            {user && (
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className={`w-full justify-start text-sm transition-colors duration-300 py-2 h-auto ${mutedTextClasses}`}
              >
                Sign Out
              </Button>
            )}
          </div>
        </div>
      </nav>
  );
};
