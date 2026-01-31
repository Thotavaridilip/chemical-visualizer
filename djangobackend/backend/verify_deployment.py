#!/usr/bin/env python3
"""
Deployment verification script to check for common issues before deployment.
"""

import os
import sys
import py_compile
import glob

def check_null_bytes():
    """Check for null bytes in Python files."""
    print("🔍 Checking for null bytes in Python files...")
    
    python_files = []
    for root, dirs, files in os.walk('.'):
        # Skip virtual environment directories
        if any(skip_dir in root for skip_dir in ['venv', '__pycache__', '.git']):
            continue
        for file in files:
            if file.endswith('.py'):
                python_files.append(os.path.join(root, file))
    
    files_with_nulls = []
    
    for filepath in python_files:
        try:
            with open(filepath, 'rb') as f:
                content = f.read()
                null_count = content.count(b'\x00')
                if null_count > 0:
                    files_with_nulls.append((filepath, null_count))
        except Exception as e:
            print(f"   ⚠️  Error reading {filepath}: {e}")
    
    if files_with_nulls:
        print(f"   ❌ Found null bytes in {len(files_with_nulls)} files:")
        for filepath, count in files_with_nulls:
            print(f"      - {filepath}: {count} null bytes")
        return False
    else:
        print(f"   ✅ All {len(python_files)} Python files are clean")
        return True

def check_syntax():
    """Check Python syntax for all application files."""
    print("\n🔍 Checking Python syntax...")
    
    key_files = [
        'manage.py',
        'core/settings.py',
        'core/urls.py',
        'core/wsgi.py',
        'equipment/models.py',
        'equipment/views.py',
        'equipment/urls.py',
        'equipment/serializers.py',
    ]
    
    syntax_errors = []
    
    for filepath in key_files:
        if os.path.exists(filepath):
            try:
                py_compile.compile(filepath, doraise=True)
                print(f"   ✅ {filepath}")
            except py_compile.PyCompileError as e:
                print(f"   ❌ {filepath}: {e}")
                syntax_errors.append((filepath, str(e)))
        else:
            print(f"   ⚠️  {filepath}: File not found")
    
    return len(syntax_errors) == 0

def check_requirements():
    """Check if requirements.txt exists."""
    print("\n🔍 Checking requirements.txt...")
    
    if os.path.exists('requirements.txt'):
        print("   ✅ requirements.txt found")
        return True
    else:
        print("   ❌ requirements.txt not found")
        return False

def main():
    """Run all deployment checks."""
    print("🚀 Django Deployment Verification")
    print("=" * 40)
    
    checks_passed = 0
    total_checks = 3
    
    # Check 1: Null bytes
    if check_null_bytes():
        checks_passed += 1
    
    # Check 2: Syntax
    if check_syntax():
        checks_passed += 1
    
    # Check 3: Requirements
    if check_requirements():
        checks_passed += 1
    
    # Summary
    print("\n" + "=" * 40)
    print(f"📊 Summary: {checks_passed}/{total_checks} checks passed")
    
    if checks_passed == total_checks:
        print("🎉 All checks passed! Ready for deployment.")
        return 0
    else:
        print("❌ Some checks failed. Please fix the issues before deploying.")
        return 1

if __name__ == '__main__':
    sys.exit(main())