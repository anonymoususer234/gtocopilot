from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json
import os
import tempfile
import subprocess
import asyncio
from pathlib import Path

app = FastAPI(title="TexasSolver GTO API", version="1.0.0")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class HandInfo(BaseModel):
    """Poker hand information for GTO analysis"""
    board: str  # e.g., "Qs,Jh,2h" or "Qs,Jh,2h,8c" or "Qs,Jh,2h,8c,3d"
    oop_range: str  # Out of position range e.g., "AA,KK,QQ:0.5,AK"
    ip_range: str   # In position range
    pot_size: float = 10.0
    effective_stack: float = 95.0
    position: str = "oop"  # "oop" or "ip" - whose action it is
    
    # Betting configuration (optional, will use defaults if not provided)
    bet_sizes: Optional[Dict[str, List[float]]] = None
    
    # Solver parameters (optional)
    accuracy: float = 0.3
    max_iterations: int = 200
    thread_count: int = 4
    use_isomorphism: bool = True

class GTOResponse(BaseModel):
    """GTO solver response with optimal strategy"""
    success: bool
    strategy: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    computation_time: Optional[float] = None
    convergence: Optional[float] = None

class SolverRequest(BaseModel):
    board: str
    oop_range: str
    ip_range: str
    pot_size: float
    effective_stack: float
    position: str

class SolverAPI:
    def __init__(self):
        self.solver_path = self._find_solver_executable()
        self.resources_path = Path(__file__).parent.parent / "TexasSolver" / "resources"
        
    def _find_solver_executable(self) -> Optional[str]:
        """Find the TexasSolver executable"""
        # Get the absolute path to the backend directory
        backend_dir = Path(__file__).parent
        project_root = backend_dir.parent
        
        # Look for the TexasSolver binary we just built
        possible_paths = [
            project_root / "TexasSolver" / "TexasSolverGui.app" / "Contents" / "MacOS" / "TexasSolverGui",
            project_root / "TexasSolver" / "build" / "TexasSolverConsole",
            project_root / "TexasSolver" / "TexasSolverConsole",
            Path("./TexasSolverConsole"),
        ]
        
        for path in possible_paths:
            if path.exists() and os.access(str(path), os.X_OK):
                return str(path)
        
        return None

    def solve(self, request: SolverRequest) -> dict:
        """Run the solver with the given parameters"""
        if not self.solver_path:
            raise HTTPException(status_code=500, detail="Solver executable not found")
            
        try:
            # Prepare the command
            cmd = [
                self.solver_path,
                "--board", request.board,
                "--oop-range", request.oop_range,
                "--ip-range", request.ip_range,
                "--pot-size", str(request.pot_size),
                "--effective-stack", str(request.effective_stack),
                "--position", request.position
            ]
            
            # Run the solver
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode != 0:
                raise HTTPException(status_code=500, detail=f"Solver error: {result.stderr}")
                
            # Parse the output and return results
            return {
                "status": "success",
                "result": result.stdout
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

# Initialize the solver API
solver_api = SolverAPI()

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "TexasSolver GTO API is running", "version": "1.0.0"}

@app.post("/solve", response_model=GTOResponse)
async def solve_gto(hand_info: HandInfo):
    """
    Solve a poker hand using GTO principles
    
    Args:
        hand_info: Complete poker hand information including board, ranges, stacks, etc.
        
    Returns:
        GTOResponse with optimal strategy or error information
    """
    
    # Validate input
    if not hand_info.board:
        raise HTTPException(status_code=400, detail="Board cards are required")
    
    if not hand_info.oop_range or not hand_info.ip_range:
        raise HTTPException(status_code=400, detail="Both OOP and IP ranges are required")
    
    # Validate board format
    board_cards = hand_info.board.split(',')
    if len(board_cards) < 3 or len(board_cards) > 5:
        raise HTTPException(status_code=400, detail="Board must have 3-5 cards")
    
    # Solve the hand
    result = await solver_api.solve(SolverRequest(
        board=hand_info.board,
        oop_range=hand_info.oop_range,
        ip_range=hand_info.ip_range,
        pot_size=hand_info.pot_size,
        effective_stack=hand_info.effective_stack,
        position=hand_info.position
    ))
    
    if not result["status"] == "success":
        raise HTTPException(status_code=500, detail=result["error"])
    
    return GTOResponse(
        success=True,
        strategy=result["result"],
        computation_time=None,
        convergence=None
    )

@app.get("/health")
async def health_check():
    """Check if the solver is available"""
    return {
        "status": "ok",
        "solver_available": solver_api.solver_path is not None,
        "solver_path": solver_api.solver_path
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 