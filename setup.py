from cx_Freeze import setup, Executable

import os.path
base = 'Win32GUI'

executables = [Executable("main.py", base=base)]

PYTHON_INSTALL_DIR = os.path.dirname(os.path.dirname(os.__file__))
os.environ['TCL_LIBRARY'] = os.path.join(PYTHON_INSTALL_DIR, 'tcl', 'tcl8.6')
os.environ['TK_LIBRARY'] = os.path.join(PYTHON_INSTALL_DIR, 'tcl', 'tk8.6')
#include_files = [r"C:\Users\Developer\AppData\Local\Programs\Python\Python37-32\DLLs\tcl86t.dll",
#                     r"C:\Users\Developer\AppData\Local\Programs\Python\Python37-32\DLLs\tk86t.dll"]
packages = ["idna", "datetime", "_thread", "time", "sys", "numpy", "scipy", "glob", "serial", "struct", "pony", "math", "json", "tornado", "threading", "urllib", "hashlib"]
options = {
    'build_exe': {
        'packages': packages,
        'excludes': ['scipy.spatial.cKDTree']
        #'include_files': include_files
    },
}

setup(
    name="VTV-SHELL",
    options=options,
    version="1.0.0.1",
    description='Demo version',
    executables=executables
)
