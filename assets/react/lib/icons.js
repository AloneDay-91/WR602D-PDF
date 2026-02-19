import { lazy } from "react";
import dynamicIconImports from "lucide-react/dynamicIconImports";

const iconCache = {};

export function getIcon(name) {
    if (!name) return null;

    // Convert PascalCase to kebab-case for lucide dynamic imports
    const kebab = name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

    if (dynamicIconImports[kebab]) {
        if (!iconCache[kebab]) {
            iconCache[kebab] = lazy(dynamicIconImports[kebab]);
        }
        return iconCache[kebab];
    }

    return null;
}