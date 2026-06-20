import * as React from "react"
import { cn } from "@/lib/utils"

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

const TabsContext = React.createContext<{
  selectedValue: string;
  setSelectedValue: (value: string) => void;
}>({ selectedValue: "", setSelectedValue: () => {} });

export function Tabs({ defaultValue, value, onValueChange, className, children, ...props }: TabsProps) {
  const [localValue, setLocalValue] = React.useState(defaultValue);
  const selectedValue = value !== undefined ? value : localValue;
  const setSelectedValue = React.useCallback(
    (val: string) => {
      setLocalValue(val);
      if (onValueChange) onValueChange(val);
    },
    [onValueChange]
  );

  return (
    <TabsContext.Provider value={{ selectedValue, setSelectedValue }}>
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-lg bg-[#0d121f] p-1 text-muted-foreground border border-white/5",
        className
      )}
      {...props}
    />
  );
}

export function TabsTrigger({ value, className, ...props }: React.HTMLAttributes<HTMLButtonElement> & { value: string }) {
  const { selectedValue, setSelectedValue } = React.useContext(TabsContext);
  const isActive = selectedValue === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => setSelectedValue(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        isActive
          ? "bg-card text-foreground shadow border border-white/10"
          : "hover:bg-white/5 hover:text-foreground/85",
        className
      )}
      {...props}
    />
  );
}

export function TabsContent({ value, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  const { selectedValue } = React.useContext(TabsContext);
  const isActive = selectedValue === value;

  if (!isActive) return null;

  return (
    <div
      role="tabpanel"
      className={cn(
        "mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      {...props}
    />
  );
}
