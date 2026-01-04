



## Architecture at a Glance

```
PicoStudio Web Interface (React + Monaco)
          ↓
Express Backend (Node.js + Docker)
          ↓
PicoForge Framework (C++17)
  • Module System (IModule interface)
  • Code Generators (Strategy pattern)
  • Configuration (JSON schema)
  • User Code Preservation (Regex)
          ↓
Docker Container (Multi-stage build)
  Step 1: pico-forge generate
  Step 2: cmake ..
  Step 3: make
  Step 4: Extract UF2
          ↓
UF2 Artifact (Ready to flash)
```


## File List at a Glance

| Location | Files | Size |
|----------|-------|------|
| **Root** | 5 files | 44 KB |
| **.planning/** | 6 files | 113 KB |
| **Total** | **11 files** | **150+ KB** |

---