import React from 'react';
import { icons, User, LogOut, Settings, Lock } from 'lucide-react';
import { hasToolAccess } from '../lib/access';
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
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from './ui/dropdown-menu';
import { cn } from '../lib/utils';

function getIcon(iconName) {
    return icons[iconName] || icons.Wrench;
}

function ListItem({ className, title, icon: Icon, children, href, locked = false, ...props }) {
    if (locked) {
        return (
            <li>
                <div className={cn(
                    "block select-none space-y-1 rounded-md p-3 leading-none opacity-50 cursor-not-allowed",
                    className
                )}>
                    <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm font-medium leading-none">{title}</div>
                    </div>
                    <p className="line-clamp-2 text-xs leading-snug text-muted-foreground mt-1">
                        {children}
                    </p>
                </div>
            </li>
        );
    }

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

function UserAvatar({ firstname, lastname }) {
    const initials = `${firstname?.[0] ?? ''}${lastname?.[0] ?? ''}`.toUpperCase();
    return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
            {initials || <User className="h-4 w-4" />}
        </div>
    );
}

export default function Header({ tools = [], user = null, userRoles = null }) {
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
                                                const accessible = hasToolAccess(user, tool);
                                                return (
                                                    <ListItem
                                                        key={tool.id}
                                                        title={tool.name}
                                                        icon={Icon}
                                                        href={`/convertisseur/${tool.slug}`}
                                                        locked={!accessible}
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

                            <NavigationMenuItem>
                                <NavigationMenuLink href="/abonnement" className={navigationMenuTriggerStyle()}>
                                    Abonnements
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>

                {/* Right section */}
                <div className="flex items-center gap-2">
                    <ModeToggle />

                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent transition-colors outline-none">
                                    <UserAvatar firstname={user.firstname} lastname={user.lastname} />
                                    <span className="hidden sm:block font-medium max-w-[120px] truncate">
                                        {user.firstname}
                                    </span>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>
                                    <p className="font-medium text-foreground">{user.firstname} {user.lastname}</p>
                                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <a href="/compte" className="flex items-center gap-2 cursor-pointer">
                                        <Settings className="h-4 w-4" />
                                        Mon compte
                                    </a>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <a href="/logout" className="flex items-center gap-2 cursor-pointer text-red-500 focus:text-red-500">
                                        <LogOut className="h-4 w-4" />
                                        Se déconnecter
                                    </a>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <>
                            <Button variant="outline" asChild>
                                <a href="/login">Connexion</a>
                            </Button>
                            <Button variant="default" asChild>
                                <a href="/register">Inscription</a>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
