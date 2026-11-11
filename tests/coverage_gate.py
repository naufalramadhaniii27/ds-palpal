#!/usr/bin/env python3
"""CI wrapper: the coverage gate in check mode (see tools/audit_coverage.py)."""
import os, subprocess, sys
sys.exit(subprocess.call([sys.executable, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "tools", "audit_coverage.py"), "--check"]))
