import React from 'react';
import { icons } from 'lucide-react';
import { Button } from './ui/button';
import { ModeToggle } from './ModeToggle';
import { useTheme } from './ThemeProvider';
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuTrigger,
    NavigationMenuContent,
    NavigationMenuLink,
    navigationMenuTriggerStyle,
} from './ui/navigation-menu';
import { cn } from '../lib/utils';

function getIcon(iconName) {
    return icons[iconName] || icons.Wrench;
}

function ListItem({ className, title, icon: Icon, children, href, ...props }) {
    return (
        <li>
            <NavigationMenuLink asChild>
                <a
                    href={href}
                    className={cn(
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                        className
                    )}
                    {...props}
                >
                    <div className="flex items-center gap-2">
                        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                        <div className="text-sm font-medium leading-none">{title}</div>
                    </div>
                    <p className="line-clamp-2 text-xs leading-snug text-muted-foreground mt-1">
                        {children}
                    </p>
                </a>
            </NavigationMenuLink>
        </li>
    );
}

export default function Header({ tools = [] }) {
    const { theme } = useTheme();
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const logoSrc = isDark ? '/images/logo-icon-dark.png' : '/images/logo-icon.png';

    return (
        <header className="flex items-center justify-between border-b border-border bg-background px-20 py-2.5">
            <div className="max-w-5xl mx-auto w-full flex items-center justify-between gap-10">
                <div className="flex items-center gap-12">
                    {/* Logo */}
                    <a href="/" className="flex items-center gap-2.5">
                        <img src={logoSrc} alt="ZenPDF logo" className="w-32" />
                    </a>

                    {/* Navigation */}
                    <NavigationMenu className="hidden md:flex">
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <NavigationMenuLink href="/" className={navigationMenuTriggerStyle()}>
                                    Accueil
                                </NavigationMenuLink>
                            </NavigationMenuItem>

                            {tools.length > 0 && (
                                <NavigationMenuItem>
                                    <NavigationMenuTrigger>Outils</NavigationMenuTrigger>
                                    <NavigationMenuContent>
                                        <ul className="grid w-[400px] gap-1 p-3 md:w-[500px] md:grid-cols-2">
                                            {tools.map((tool) => {
                                                const Icon = getIcon(tool.icon);
                                                return (
                                                    <ListItem
                                                        key={tool.id}
                                                        title={tool.name}
                                                        icon={Icon}
                                                        href={`/convertisseur/${tool.slug}`}
                                                    >
                                                        {tool.description}
                                                    </ListItem>
                                                );
                                            })}
                                        </ul>
                                    </NavigationMenuContent>
                                </NavigationMenuItem>
                            )}

                            <NavigationMenuItem>
                                <NavigationMenuLink href="/history" className={navigationMenuTriggerStyle()}>
                                    Historique
                                </NavigationMenuLink>
                            </NavigationMenuItem>

                            <NavigationMenuItem>
                                <NavigationMenuLink href="/contact" className={navigationMenuTriggerStyle()}>
                                    Contact
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>

                {/* Right section */}
                <div className="flex items-center gap-2">
                    <ModeToggle />
                    <Button variant="outline">
                        Connexion
                    </Button>
                    <Button variant="default">
                        Inscription
                    </Button>
                </div>
            </div>
        </header>
    );
}
