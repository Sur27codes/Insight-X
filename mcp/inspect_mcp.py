import mcp
import mcp.server
import inspect

print("mcp dir:", dir(mcp))
print("mcp.server dir:", dir(mcp.server))

try:
    import mcp.types
    print("mcp.types available")
except ImportError:
    print("mcp.types missing")
