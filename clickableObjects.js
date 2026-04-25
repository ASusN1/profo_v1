// ===== CLICKABLE OBJECTS CONFIGURATION =====
// This file contains the setup for all clickable objects in the portfolio

export const objectInfo = {
    'github_icon': { 
        title: 'GitHub Profile', 
        description: 'Visit my GitHub profile to see my projects and contributions', 
        link: 'https://github.com' 
    },
    'ExtractorV2_1': { 
        title: 'Extractor V2 (Version 1)', 
        description: 'Click to learn more about Extractor V2 - Version 1', 
        link: 'https://github.com/ASusN1/ExtractorV2' 
    },
    'ExtractorV2_2': { 
        title: 'Extractor V2 (Version 2)', 
        description: 'Click to learn more about Extractor V2 - Version 2', 
        link: 'https://github.com/ASusN1/ExtractorV2' 
    },
    'sudoku_1': { 
        title: 'Sudoku Solver (Version 1)', 
        description: 'An interactive sudoku puzzle solver', 
        link: 'https://fluffyorange.itch.io/sudoku-adventure'
    },
    'sudoku_2': { 
        title: 'Sudoku Solver (Version 2)', 
        description: 'An improved sudoku puzzle solver', 
        link: 'https://fluffyorange.itch.io/sudoku-adventure'
    },
    'fat_seal': { 
        title: 'Fat Seal', 
        description: 'Click to learn more about the Fat Seal project', 
        link: "https://github.com/ASusN1/WAKE_UP"
    }
};

// List of valid mesh names - only these will be made clickable
export const validClickableNames = new Set([
    'github_icon',
    'ExtractorV2_1',
    'ExtractorV2_2',
    'sudoku_1',
    'sudoku_2',
    'fat_seal'
]);
