version 1.0.0 (12-27-2023)
==========================
* Initial bare bone version that runs the pomodoro app with bugs.

version 1.0.1 (12-28-2023)
==========================
* popup.js UI styled and formatted
* Extension page now redirects to main.html
* Fixed timer bugs - multiple start, pause, or reset buttons cliks no longer break timer
* Formatted code for enhanced readability
* Added code comments 

version 1.0.2 (12-30-2023)
==========================
* Added break functionality
* 'Gong' sound plays when timer finishes - sound checkbox now functional

version 1.0.3 (01-01-2023)
==========================
* Updated main.html, copied styles from popup.js with minor formatting tweaks
* background.js now uses chrome.storage;
    - Can be used to sync other settings 
    - Sound setting saved here and is synced between main.js, popup.js and background.js
    - popup.js & main.js listen for changes

version 1.0.4 (01-01-2023)
==========================
* Added in animated clock
    - Introduced a new variable in background.js (totalTime) to keep track of total time.



