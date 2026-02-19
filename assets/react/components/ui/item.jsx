import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

// Item

const itemVariants = cva(
    "flex items-center gap-3 rounded-lg",
    {
        variants: {
            variant: {
                default: "",
                outline: "border border-border",
                muted: "bg-muted",
            },
            size: {
                default: "p-3",
                sm: "p-2",
                xs: "p-1.5",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

const Item = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";
    return (
        <Comp
            ref={ref}
            className={cn(itemVariants({ variant, size }), className)}
            {...props}
        />
    );
});
Item.displayName = "Item";

// ItemGroup

const ItemGroup = React.forwardRef(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col", className)} {...props} />
));
ItemGroup.displayName = "ItemGroup";

// ItemSeparator

const ItemSeparator = React.forwardRef(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("h-px bg-border mx-3", className)} {...props} />
));
ItemSeparator.displayName = "ItemSeparator";

// ItemMedia

const itemMediaVariants = cva(
    "flex shrink-0 items-center justify-center",
    {
        variants: {
            variant: {
                default: "",
                icon: "h-9 w-9 rounded-md bg-secondary text-secondary-foreground",
                avatar: "h-9 w-9 rounded-full overflow-hidden",
                image: "h-10 w-10 rounded-md overflow-hidden",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

const ItemMedia = React.forwardRef(({ className, variant, ...props }, ref) => (
    <div ref={ref} className={cn(itemMediaVariants({ variant }), className)} {...props} />
));
ItemMedia.displayName = "ItemMedia";

// ItemContent

const ItemContent = React.forwardRef(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex min-w-0 flex-1 flex-col gap-0.5", className)} {...props} />
));
ItemContent.displayName = "ItemContent";

// ItemTitle

const ItemTitle = React.forwardRef(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("truncate text-sm font-medium", className)} {...props} />
));
ItemTitle.displayName = "ItemTitle";

// ItemDescription

const ItemDescription = React.forwardRef(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("truncate text-xs text-muted-foreground", className)} {...props} />
));
ItemDescription.displayName = "ItemDescription";

// ItemActions

const ItemActions = React.forwardRef(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex shrink-0 items-center gap-2", className)} {...props} />
));
ItemActions.displayName = "ItemActions";

// ItemHeader

const ItemHeader = React.forwardRef(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("px-3 py-1.5 text-xs font-medium text-muted-foreground", className)} {...props} />
));
ItemHeader.displayName = "ItemHeader";

// ItemFooter

const ItemFooter = React.forwardRef(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("px-3 py-1.5 text-xs text-muted-foreground", className)} {...props} />
));
ItemFooter.displayName = "ItemFooter";

export {
    Item,
    ItemGroup,
    ItemSeparator,
    ItemMedia,
    ItemContent,
    ItemTitle,
    ItemDescription,
    ItemActions,
    ItemHeader,
    ItemFooter,
};