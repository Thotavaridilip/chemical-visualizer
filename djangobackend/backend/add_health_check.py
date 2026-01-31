#!/usr/bin/env python3
"""Script to safely add health check to views.py without encoding issues."""

# Read the current views.py content
with open('equipment/views.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Add the health check class at the end
health_check_code = '''

class HealthCheckView(APIView):
    """Simple health check endpoint to verify deployment."""
    permission_classes = [AllowAny]
    
    def get(self, request):
        return JsonResponse({
            'status': 'ok',
            'message': 'Django backend is running successfully',
            'timestamp': time.time(),
            'null_bytes_fixed': True
        })
'''

# Append the health check code
updated_content = content + health_check_code

# Write back safely
with open('equipment/views.py', 'w', encoding='utf-8') as f:
    f.write(updated_content)

print("✅ Health check added to views.py")

# Verify no null bytes were introduced
with open('equipment/views.py', 'rb') as f:
    binary_content = f.read()
    null_count = binary_content.count(b'\x00')
    print(f"Null byte check: {null_count} null bytes")

# Test compilation
import py_compile
try:
    py_compile.compile('equipment/views.py', doraise=True)
    print("✅ views.py compiles successfully")
except Exception as e:
    print(f"❌ Compilation error: {e}")