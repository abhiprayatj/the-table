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
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { Logo } from "@/components/Logo";

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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      }
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setCredits(null);
        setProfile(null);
      }
    });
    return () => subscription.unsubscribe();
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
    navigate("/");
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

          <div className="flex items-center space-x-6">
            <Link
              to="/classes"
              className={`hidden sm:block text-sm transition-colors duration-300 ${mutedTextClasses}`}
            >
              Browse Classes
            </Link>
            <Link
              to="/be-a-teacher"
              className={`hidden sm:block text-sm transition-colors duration-300 ${mutedTextClasses}`}
            >
              Be a Teacher
            </Link>
            {user ? (
              <>
                {credits && (
                  <div className={`hidden sm:flex items-center gap-3 text-sm transition-colors duration-300 ${textClasses}`}>
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
        </div>
      </div>
    </nav>
  );
};
