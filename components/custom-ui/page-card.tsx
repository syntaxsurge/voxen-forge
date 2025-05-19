import { ElementType, ReactNode } from "react";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

/** Props for the encapsulated page section card component. */
export interface PageCardProps {
  /** Lucide icon component */
  icon: ElementType;
  /** Card title text */
  title: string;
  /** Optional small description below the title */
  description?: string;
  /** Optional right-aligned header actions (e.g. buttons) */
  actions?: ReactNode;
  /** Main body content */
  children: ReactNode;
  /** Extra classes applied to the Card wrapper */
  className?: string;
}

/**
 * Encapsulates the repeated "page section” card pattern
 * seen across dashboard pages: icon + title + description
 * with optional actions and body content.
 */
export default function PageCard({
  icon: Icon,
  title,
  description,
  actions,
  children,
  className = "",
}: PageCardProps) {
  return (
    <Card
      className={`shadow-md transition-shadow hover:shadow-lg ${className}`}
    >
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        {/* Icon + title + description */}
        <div className="flex items-center gap-3">
          <Icon className="text-primary h-10 w-10 flex-shrink-0" />
          <div>
            <CardTitle className="text-2xl font-extrabold tracking-tight">
              {title}
            </CardTitle>
            {description && (
              <p className="text-muted-foreground mt-1 text-sm">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Right-side actions */}
        {actions}
      </CardHeader>

      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}
