import React from "react";
import { Sun, Moon, HelpCircle, Expand, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Logo from "@/assets/media/Logo-2.png";
import { useThemeToggle } from "@/hooks/useToggleTheme";
import { useExpand } from "@/contexts/ExpandContext";
import Guide from "@/pages/Guide";
import Auth from "@/pages/Auth";

const Header = () => {
  const { darkMode, toggleDarkMode } = useThemeToggle();
  const { isExpanded, toggleExpand } = useExpand();

  return (
    <header className="bg-background sticky top-0 z-50 w-full border-b shadow-xs">
      <div className="p-5 flex items-center justify-between">
        <a href="/">
          <img src={Logo} alt="Logo" className="w-48" />
        </a>

        <div className="flex items-center gap-1">
          {/* Full screen */}
          <Button
            variant="ghost"
            size="icon"
            aria-label={isExpanded ? "Shrink view" : "Expand view"}
            title={isExpanded ? "Shrink view" : "Expand view"}
            onClick={toggleExpand}
          >
            {isExpanded ? <Minimize2 /> : <Expand />}
          </Button>

          {/* Guide */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="How to use"
                title="How to use"
              >
                <HelpCircle />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl">
              <Guide />
            </DialogContent>
          </Dialog>

          {/* Dark and light mode */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle light and dark mode"
            onClick={toggleDarkMode}
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Moon /> : <Sun />}
          </Button>

          {/* Log in / Register */}
          {/* <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" aria-label="Log in" title="Log in">
                Log In
              </Button>
            </DialogTrigger>
            <Auth />
          </Dialog> */}
        </div>
      </div>
    </header>
  );
};

export default Header;
