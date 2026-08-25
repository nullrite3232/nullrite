"use client";

import { HTMLAttributes, forwardRef } from "react";

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ children, size = "lg", className = "", ...props }, ref) => {
    const sizeStyles = {
      sm: "max-w-3xl",
      md: "max-w-5xl",
      lg: "max-w-7xl",
      xl: "max-w-[1400px]",
      full: "max-w-full",
    };

    return (
      <div
        ref={ref}
        className={`mx-auto w-full px-4 sm:px-6 lg:px-8 ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = "Container";

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  variant?: "default" | "alt" | "dark";
  padding?: "sm" | "md" | "lg" | "xl";
}

export const Section = forwardRef<HTMLElement, SectionProps>(
  ({
    children,
    variant = "default",
    padding = "lg",
    className = "",
    ...props
  }, ref) => {
    const variantStyles = {
      default: "bg-bg",
      alt: "bg-black2",
      dark: "bg-panel",
    };

    const paddingStyles = {
      sm: "py-12",
      md: "py-16",
      lg: "py-24",
      xl: "py-32",
    };

    return (
      <section
        ref={ref}
        className={`${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
        {...props}
      >
        <Container>{children}</Container>
      </section>
    );
  }
);

Section.displayName = "Section";