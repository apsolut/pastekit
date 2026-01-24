import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 ease-ghibli focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-ghibli-card hover:shadow-ghibli-hover hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-ghibli-card hover:bg-destructive/90 hover:shadow-ghibli-hover",
        outline:
          "border border-input bg-background/50 text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground hover:border-primary/30",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: 
          "text-foreground hover:bg-accent hover:text-accent-foreground",
        link: 
          "text-primary underline-offset-4 hover:underline",
        ghibli:
          "bg-primary text-primary-foreground shadow-ghibli-card hover:shadow-ghibli-glow hover:-translate-y-0.5 active:translate-y-0 btn-ghibli",
        ghibliOutline:
          "border-2 border-primary/30 bg-background/60 text-primary hover:bg-primary/10 hover:border-primary/50 backdrop-blur-sm",
        ghibliGhost:
          "text-primary hover:bg-primary/10 hover:text-primary",
        ghibliAccent:
          "bg-ghibli-gold text-accent-foreground shadow-ghibli-card hover:shadow-ghibli-hover hover:-translate-y-0.5",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-6 text-base",
        icon: "h-9 w-9",
        iconSm: "h-8 w-8",
        iconLg: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
