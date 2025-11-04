import React from "react";
import { Sun, Moon, LayoutGrid, Grid3X3, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useThemeToggle } from "@/hooks/useToggleTheme";
import Guide from "@/pages/Guide";
import Auth from "@/pages/Auth";

const Header = () => {
  const { darkMode, toggleDarkMode } = useThemeToggle();
  return (
    <header className="bg-background sticky top-0 z-50 w-full border-b shadow-xs">
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex size-9 items-center justify-center rounded-md bg-muted-foreground/10">
            <LayoutGrid />
          </span>
          <h1 className="font-sans text-2xl font-semibold">
            LEGO Mosaic Studio
          </h1>
        </div>

        <div className="flex items-center gap-1">
          {/* Grid overlay */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Show or hide grid"
            title="Toggle grid overlay"
          >
            <Grid3X3 />
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
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" aria-label="Log in" title="Log in">
                Log In
              </Button>
            </DialogTrigger>
            <Auth />
          </Dialog>
        </div>
      </div>
    </header>
  );
};

export default Header;
