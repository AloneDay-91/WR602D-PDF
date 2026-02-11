// assets/react/components/NavLink.jsx
import React from 'react';

/**
 * Composant pour les liens de navigation
 * @param {string} href  - L'URL de destination (fournie par path() en Twig)
 * @param {string} label - Le texte à afficher
 */
const NavLink = ({ href, label }) => {
    // On peut ajouter une logique pour détecter si le lien est actif
    const isActive = window.location.pathname === href;

    const baseStyle = "px-3 py-2 rounded-md text-sm font-medium transition-colors";
    const activeStyle = "bg-blue-600 text-white";
    const inactiveStyle = "text-gray-300 hover:bg-gray-700 hover:text-white";

    return (
        <a
            href={href}
            className={`${baseStyle} ${isActive ? activeStyle : inactiveStyle}`}
            aria-current={isActive ? 'page' : undefined}
        >
            {label}
        </a>
    );
};

export default NavLink;
