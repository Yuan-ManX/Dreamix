"""
Action Project Startup Script
Starts both the backend and frontend servers
"""

import subprocess
import sys
import os
import time
import threading
import signal

# Global processes
backend_process = None
frontend_process = None


def signal_handler(sig, frame):
    """Handle Ctrl+C and other signals"""
    print("\n\nShutting down servers...")
    
    if backend_process:
        print("Stopping backend...")
        backend_process.terminate()
        try:
            backend_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            backend_process.kill()
    
    if frontend_process:
        print("Stopping frontend...")
        frontend_process.terminate()
        try:
            frontend_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            frontend_process.kill()
    
    print("Servers stopped. Goodbye!")
    sys.exit(0)


def start_backend():
    """Start the backend server"""
    global backend_process
    
    print("Starting Action Backend...")
    backend_dir = os.path.join(os.path.dirname(__file__), "backend")
    
    # Check if venv exists
    venv_python = os.path.join(backend_dir, "venv", "bin", "python")
    if not os.path.exists(venv_python):
        venv_python = "python"  # Fallback to system python
    
    backend_process = subprocess.Popen(
        [venv_python, "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"],
        cwd=backend_dir,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
        universal_newlines=True
    )
    
    # Print backend output
    def print_backend_output():
        for line in iter(backend_process.stdout.readline, ''):
            print(f"[Backend] {line}", end='')
    
    threading.Thread(target=print_backend_output, daemon=True).start()
    
    # Give backend some time to start
    time.sleep(3)
    return backend_process


def start_frontend():
    """Start the frontend server"""
    global frontend_process
    
    print("\nStarting Action Frontend...")
    frontend_dir = os.path.join(os.path.dirname(__file__), "frontend")
    
    frontend_process = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=frontend_dir,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
        universal_newlines=True
    )
    
    # Print frontend output
    def print_frontend_output():
        for line in iter(frontend_process.stdout.readline, ''):
            print(f"[Frontend] {line}", end='')
    
    threading.Thread(target=print_frontend_output, daemon=True).start()
    
    return frontend_process


def main():
    """Main startup function"""
    print("=" * 60)
    print("Action! - AI-Native Interactive Video Agent")
    print("=" * 60)
    print()
    
    # Register signal handler
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    try:
        # Start backend
        start_backend()
        
        # Start frontend
        start_frontend()
        
        print("\n" + "=" * 60)
        print("Action is now running!")
        print("=" * 60)
        print(f"Backend API:    http://localhost:8000")
        print(f"API Docs:       http://localhost:8000/docs")
        print(f"Frontend:       http://localhost:3000")
        print("=" * 60)
        print("\nPress Ctrl+C to stop all servers\n")
        
        # Keep main thread alive
        while True:
            time.sleep(1)
            
    except Exception as e:
        print(f"Error: {e}")
        signal_handler(None, None)


if __name__ == "__main__":
    main()
