<?php

declare(strict_types=1);

// Legal page content is hardcoded in the frontend (src/pages/legal/), not
// database-editable. These version strings are the single source of truth
// for what "current" means when recording consent — bump them by hand
// whenever the corresponding frontend page's text changes materially, and
// keep the frontend pages' displayed "Version X.X" in sync.
const LEGAL_TERMS_VERSION = '1.0';
const LEGAL_PRIVACY_VERSION = '1.0';
