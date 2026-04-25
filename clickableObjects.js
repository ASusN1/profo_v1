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
        description: 'When ever you need to dowload video from youtube,insta,or tiktok. Choose Extractor V2 also known as GIMME VideoColorSpace. Written using pure pytthon, you will able to download audio , video, or both with seleceted quailtiy and format. Click to learn more about Extractor V2 - Version 1', 
        link: 'https://github.com/ASusN1/ExtractorV2' 
    },
    'ExtractorV2_2': { 
        title: 'Extractor V2 (Version 2)', 
        description: 'When ever you need to dowload video from youtube,insta,or tiktok. Choose Extractor V2 also known as GIMME VideoColorSpace. Written using pure pytthon, you will able to download audio , video, or both with seleceted quailtiy and format. Click to learn more about Extractor V2 - Version 2', 
        link: 'https://github.com/ASusN1/ExtractorV2'
    },
    'sudoku_1': { 
        title: 'Sudoku Solver (Version 1)', 
        description: 'An interactive sudoku puzzle solver, when you want to play some classic sudoku problems choose my sudoku game, you can also create your own sudoku puzzle and solve it with my game. Click to learn more about Sudoku Solver', 
        link: 'https://fluffyorange.itch.io/sudoku-adventure'
    },
    'sudoku_2': { 
        title: 'Sudoku Solver (Version 2)', 
        description: 'An interactive sudoku puzzle solver, when you want to play some classic sudoku problems choose my sudoku game, you can also create your own sudoku puzzle and solve it with my game. Click to learn more about Sudoku Solver', 
        link: 'https://fluffyorange.itch.io/sudoku-adventure'
    },
    'fat_seal': { 
        title: 'Fat Seal', 
        description: 'Yellow, this is a fat seal, he remind you to do your task with the app WAKE Up. Written using pure python, tinker, piskel and 2 nights without sleep. Click to learn more about WAKE UP', 
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
