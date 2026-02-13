try:
    from mcp.server.fastmcp import FastMCP
    print("FastMCP available")
except ImportError:
    print("FastMCP NOT available")
    try:
        import mcp.server
        print("mcp.server available")
    except ImportError:
        print("mcp.server NOT available")
