"""
WorkWise AI — Prompt Injection Protection
Detects and blocks common prompt injection attacks before they reach the LLM.
"""

import re
from typing import Dict

# Patterns that indicate prompt injection attempts
INJECTION_PATTERNS = [
    # Direct instruction override
    r"ignore\s+(all\s+)?previous\s+instructions",
    r"ignore\s+(all\s+)?above\s+instructions",
    r"disregard\s+(all\s+)?previous",
    r"forget\s+(all\s+)?previous",
    r"override\s+(all\s+)?instructions",
    r"new\s+instructions?\s*:",
    
    # System prompt extraction
    r"(reveal|show|display|print|output)\s+(your\s+)?(system\s+prompt|instructions|rules|hidden\s+prompt)",
    r"what\s+are\s+your\s+(system\s+)?instructions",
    r"repeat\s+(your\s+)?(system|initial)\s+(prompt|instructions)",
    
    # Role manipulation
    r"you\s+are\s+now\s+a",
    r"act\s+as\s+(a\s+)?different",
    r"pretend\s+(you\s+are|to\s+be)",
    r"switch\s+(to\s+)?(role|mode)",
    r"enter\s+(developer|debug|admin|sudo)\s+mode",
    r"jailbreak",
    
    # Database attacks
    r"(drop|delete|truncate|destroy)\s+(all\s+)?(database|collection|table|db)",
    r"db\.\w+\.(drop|delete|remove)",
    r"mongo.*\.(drop|delete)",
    
    # Data exfiltration
    r"(show|reveal|list|display|dump)\s+(all\s+)?(employee\s+)?(salaries|passwords|credentials|tokens|api\s*keys|secrets)",
    r"expose\s+(all\s+)?(internal|private|secret)",
    r"(export|extract)\s+(all\s+)?data",
    
    # Code injection
    r"```(python|javascript|bash|shell|sql)",
    r"eval\s*\(",
    r"exec\s*\(",
    r"os\.(system|popen|exec)",
    r"subprocess\.",
    r"__import__",
]

# Compile patterns for performance
COMPILED_PATTERNS = [re.compile(p, re.IGNORECASE) for p in INJECTION_PATTERNS]


def sanitize_input(message: str) -> Dict:
    """
    Check if a message contains prompt injection attempts.
    
    Returns:
        { "safe": True/False, "reason": str }
    """
    if not message or not message.strip():
        return {"safe": False, "reason": "Empty message"}
    
    # Check message length (prevent token-stuffing attacks)
    if len(message) > 5000:
        return {"safe": False, "reason": "Message exceeds maximum length (5000 characters)"}
    
    # Check against injection patterns
    for pattern in COMPILED_PATTERNS:
        match = pattern.search(message)
        if match:
            return {
                "safe": False,
                "reason": f"Blocked: potential prompt injection detected — '{match.group()}'"
            }
    
    # Check for excessive special characters (obfuscation attempts)
    special_ratio = sum(1 for c in message if not c.isalnum() and not c.isspace()) / max(len(message), 1)
    if special_ratio > 0.5:
        return {"safe": False, "reason": "Message contains excessive special characters"}
    
    return {"safe": True, "reason": ""}
