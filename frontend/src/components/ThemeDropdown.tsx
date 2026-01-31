import { useState } from "react";
import { Check, ChevronDown, Search, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/context/ThemeContext";
import { themes } from "@/lib/themes";

const ColorBox = ({ color }: { color: string }) => (
  <div
    className="border-muted h-3 w-3 rounded-sm border border-black/10 dark:border-white/10"
    style={{ backgroundColor: color }}
  />
);

export function ThemeDropdown() {
  const { theme: currentThemeId, changeTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const currentTheme = themes.find((t) => t.id === currentThemeId) || themes[0];
  // Sort themes alphabetically
  const sortedThemes = [...themes].sort((a, b) => a.name.localeCompare(b.name));

  const filteredThemes = sortedThemes.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()),
  );

  const randomize = () => {
    const random = Math.floor(Math.random() * themes.length);
    changeTheme(themes[random].id);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="group relative w-full justify-between gap-2 border md:min-w-56"
          role="combobox"
          aria-expanded={open}
        >
          <div className="flex w-full items-center gap-3 overflow-hidden">
            <div className="flex gap-0.5">
              {currentTheme.colors.map((c, i) => (
                <ColorBox key={i} color={c} />
              ))}
            </div>
            <span className="truncate text-left font-medium capitalize">
              {currentTheme.name}
            </span>
          </div>
          <ChevronDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command className="h-full w-full">
          <div className="flex w-full items-center">
            <div className="flex w-full items-center border-b px-3 py-1">
              <Search className="size-4 shrink-0 opacity-50" />
              <Input
                placeholder="Search themes..."
                className="border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center justify-between px-3 py-2">
            <div className="text-muted-foreground text-sm">
              {filteredThemes.length} theme
              {filteredThemes.length !== 1 ? "s" : ""}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="size-6 p-1"
              onClick={randomize}
              title="Random theme"
            >
              <Shuffle className="h-3.5 w-3.5" />
            </Button>
          </div>
          <Separator />
          <CommandList>
            <ScrollArea className="h-[300px]">
              <CommandEmpty>No themes found.</CommandEmpty>
              <CommandGroup heading="Built-in Themes">
                {filteredThemes.map((theme) => (
                  <CommandItem
                    key={theme.id}
                    value={theme.name}
                    onSelect={() => {
                      changeTheme(theme.id);
                      setOpen(false);
                      setSearch("");
                    }}
                    className="flex cursor-pointer items-center gap-2 py-2"
                  >
                    <div className="flex gap-0.5">
                      {theme.colors.map((c, i) => (
                        <ColorBox key={i} color={c} />
                      ))}
                    </div>
                    <div className="flex flex-1 items-center gap-2">
                      <span className="text-sm font-medium capitalize">
                        {theme.name}
                      </span>
                    </div>
                    {theme.id === currentThemeId && (
                      <Check className="h-4 w-4 shrink-0 opacity-70" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
