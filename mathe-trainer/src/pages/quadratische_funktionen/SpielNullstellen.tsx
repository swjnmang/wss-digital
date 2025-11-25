import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

interface Bucket {
    x: number;
    width: number;
}

interface Ball {
    x: number;
    direction: number;
}

interface GameFunction {
    a: number;
    b: number;
    c: number;
    roots: number[];
}

const SpielNullstellen = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [equation, setEquation] = useState("y = x² - 4");
    const [feedback, setFeedback] = useState("-");
    const [gameState, setGameState] = useState<'start' | 'playing' | 'animating' | 'result'>('start');
    
    // Game state refs to avoid closure issues in animation loop
    const gameStateRef = useRef<'start' | 'playing' | 'animating' | 'result'>('start');
    const currentFunctionRef = useRef<GameFunction>({ a: -1, b: 0, c: 4, roots: [-2, 2] });
    const bucketsRef = useRef<Bucket[]>([]);
    const ghostBucketRef = useRef<Bucket>({ x: 0, width: 1.2 });
    const ballsRef = useRef<Ball[]>([]);
    const trailPointsRef = useRef<{x: number, y: number}[]>([]);
    const animationFrameRef = useRef<number>();

    const gridRangeX = 10;
    const canvasWidth = 1000;
    const canvasHeight = 625;
    const gridRangeY = (gridRangeX * canvasHeight) / canvasWidth;

    // Coordinate mapping
    const fromCanvasX = (canvasX: number) => (canvasX / canvasWidth) * (2 * gridRangeX) - gridRangeX;
    const toCanvasX = (mathX: number) => ((mathX + gridRangeX) / (2 * gridRangeX)) * canvasWidth;
    const toCanvasY = (mathY: number) => ((-mathY + gridRangeY) / (2 * gridRangeY)) * canvasHeight;

    const generateQuadraticFunction = () => {
        const a = -1;
        let x1, x2;
        do {
            x1 = Math.floor(Math.random() * 19) - 9; 
            x2 = Math.floor(Math.random() * 19) - 9;
        } while (x1 === x2 && Math.random() < 0.5);

        const b = -a * (x1 + x2);
        const c = a * x1 * x2;
        
        let a_text = a === -1 ? "-" : (a === 1 ? "" : `${a}`);
        let b_text = "";
        if (b !== 0) {
            if (Math.abs(b) === 1) {
                b_text = b > 0 ? " + x" : " - x";
            } else {
                b_text = b > 0 ? ` + ${b}x` : ` - ${Math.abs(b)}x`;
            }
        }
        
        let c_text = c === 0 ? "" : (c > 0 ? ` + ${c}` : ` - ${Math.abs(c)}`);

        setEquation(`y = ${a_text}x²${b_text}${c_text}`);
        
        return { a, b, c, roots: [x1, x2].sort((n1, n2) => n1 - n2) };
    };

    const drawGrid = (ctx: CanvasRenderingContext2D) => {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 1;
        ctx.font = "14px monospace";
        ctx.fillStyle = "#64748b";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        for (let i = -gridRangeX; i <= gridRangeX; i++) {
            ctx.beginPath();
            ctx.moveTo(toCanvasX(i), 0);
            ctx.lineTo(toCanvasX(i), canvasHeight);
            ctx.stroke();
            if (i !== 0) {
               ctx.fillText(i.toString(), toCanvasX(i), toCanvasY(0) + 15);
            }
        }
        for (let i = Math.floor(-gridRangeY); i <= Math.ceil(gridRangeY); i++) {
            ctx.beginPath();
            ctx.moveTo(0, toCanvasY(i));
            ctx.lineTo(canvasWidth, toCanvasY(i));
            ctx.stroke();
             if (i !== 0) {
                ctx.fillText(i.toString(), toCanvasX(0) - 20, toCanvasY(i));
            }
        }

        ctx.strokeStyle = "#475569";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, toCanvasY(0)); ctx.lineTo(canvasWidth, toCanvasY(0)); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(toCanvasX(0), 0); ctx.lineTo(toCanvasX(0), canvasHeight); ctx.stroke();
    };

    const drawBucket = (ctx: CanvasRenderingContext2D, bucket: Bucket, isGhost = false) => {
        const canvasX = toCanvasX(bucket.x);
        const y = toCanvasY(0);
        const width = toCanvasX(bucket.width) - toCanvasX(0);
        
        ctx.fillStyle = isGhost ? "rgba(100, 116, 139, 0.5)" : "#64748b";
        ctx.beginPath();
        ctx.moveTo(canvasX - width / 2, y);
        ctx.lineTo(canvasX - width * 0.4, y + 25);
        ctx.lineTo(canvasX + width * 0.4, y + 25);
        ctx.lineTo(canvasX + width / 2, y);
        ctx.fill();
    };

    const drawBalls = (ctx: CanvasRenderingContext2D) => {
        const { a, b, c } = currentFunctionRef.current;
        ballsRef.current.forEach(ball => {
            const y = a * ball.x * ball.x + b * ball.x + c;
            ctx.fillStyle = "#0ea5e9";
            ctx.beginPath();
            ctx.arc(toCanvasX(ball.x), toCanvasY(y), 10, 0, Math.PI * 2);
            ctx.fill();
        });
    };

    const drawTrail = (ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = "rgba(14, 165, 233, 0.3)";
        trailPointsRef.current.forEach(p => {
            ctx.beginPath();
            ctx.arc(toCanvasX(p.x), toCanvasY(p.y), 4, 0, Math.PI * 2);
            ctx.fill();
        });
    };

    const gameLoop = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        drawGrid(ctx);
        
        bucketsRef.current.forEach(b => drawBucket(ctx, b, false));
        
        if (gameStateRef.current === 'playing' && bucketsRef.current.length < 2) {
            drawBucket(ctx, ghostBucketRef.current, true);
        }

        if (gameStateRef.current === 'animating') {
            // Update balls
            ballsRef.current.forEach(ball => {
                ball.x += ball.direction * 0.05;
            });

            // Add trail
            const { a, b, c } = currentFunctionRef.current;
            ballsRef.current.forEach(ball => {
                const y = a * ball.x * ball.x + b * ball.x + c;
                trailPointsRef.current.push({ x: ball.x, y });
            });

            drawTrail(ctx);
            drawBalls(ctx);

            // Check finish
            if (Math.abs(ballsRef.current[0].x) > gridRangeX + 1) {
                checkHits();
                return; // Stop loop, checkHits will trigger next state
            }
        } else if (gameStateRef.current === 'result') {
             drawTrail(ctx); // Keep showing trail
        }

        animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    const checkHits = () => {
        setGameState('result');
        gameStateRef.current = 'result';
        
        const { roots } = currentFunctionRef.current;
        const bucketWidth = ghostBucketRef.current.width;
        const placedRoots = bucketsRef.current.map(b => b.x).sort((n1, n2) => n1 - n2);

        let hitsCount = 0;
        if (placedRoots.length >= 2) {
            const hit1 = Math.abs(placedRoots[0] - roots[0]) < bucketWidth / 2;
            const hit2 = Math.abs(placedRoots[1] - roots[1]) < bucketWidth / 2;
            if (hit1) hitsCount++;
            if (hit2) hitsCount++;
        }

        if (hitsCount === 2) {
            setFeedback("Volltreffer! +10");
            setScore(s => s + 10);
        } else if (hitsCount === 1) {
            setFeedback("Ein Treffer! +5");
            setScore(s => s + 5);
        } else {
            setFeedback("Daneben!");
        }

        setTimeout(nextRound, 2000);
    };

    const nextRound = () => {
        ballsRef.current = [];
        trailPointsRef.current = [];
        bucketsRef.current = [];
        setFeedback("-");
        
        currentFunctionRef.current = generateQuadraticFunction();
        
        setGameState('playing');
        gameStateRef.current = 'playing';
        
        // Restart loop if it stopped
        cancelAnimationFrame(animationFrameRef.current!);
        gameLoop();
    };

    const startGame = () => {
        setScore(0);
        setGameState('playing');
        gameStateRef.current = 'playing';
        nextRound();
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (gameStateRef.current !== 'playing') return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width; // Handle CSS scaling
        const x = (e.clientX - rect.left) * scaleX;
        
        ghostBucketRef.current.x = fromCanvasX(x);
    };

    const handleClick = () => {
        if (gameStateRef.current !== 'playing') return;
        if (bucketsRef.current.length >= 2) return;

        bucketsRef.current.push({ x: ghostBucketRef.current.x, width: ghostBucketRef.current.width });

        if (bucketsRef.current.length === 2) {
            setGameState('animating');
            gameStateRef.current = 'animating';
            
            const { a, b } = currentFunctionRef.current;
            const vertexX = -b / (2 * a);

            ballsRef.current = [
                { x: vertexX, direction: -1 },
                { x: vertexX, direction: 1 }
            ];
            trailPointsRef.current = [];
        }
    };

    useEffect(() => {
        // Initial draw
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) drawGrid(ctx);
        }
        
        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, []);

    // Start loop when game starts
    useEffect(() => {
        if (gameState === 'playing' || gameState === 'animating') {
            cancelAnimationFrame(animationFrameRef.current!);
            gameLoop();
        }
    }, [gameState]);

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <Link to="/quadratische_funktionen" className="text-teal-600 hover:text-teal-700 font-bold mb-4 inline-block">
                ← Zurück zur Übersicht
            </Link>
            
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <h1 className="text-3xl font-bold text-slate-700 mb-2">Nullstellen-Fänger</h1>
                <p className="text-slate-500 mb-4">Berechne zuerst die Nullstellen schriftlich! Platziere dann die Eimer an den richtigen Positionen.</p>

                <div className="flex justify-between items-center bg-slate-100 p-3 rounded-lg mb-4 text-lg">
                    <div>
                        <span className="font-bold text-slate-600">Punkte: </span>
                        <span className="font-bold text-indigo-600">{score}</span>
                    </div>
                    <div className="bg-slate-800 text-slate-100 px-6 py-3 rounded-lg text-2xl font-bold tracking-wider border-2 border-slate-700 shadow-md">
                        {equation}
                    </div>
                    <div>
                        <span className="font-bold text-slate-600">Treffer: </span>
                        <span className={`font-bold ${
                            feedback.includes('Volltreffer') ? 'text-emerald-500' : 
                            feedback.includes('Ein') ? 'text-sky-500' : 
                            feedback.includes('Daneben') ? 'text-rose-500' : 'text-slate-600'
                        }`}>{feedback}</span>
                    </div>
                </div>

                <div className="relative w-full aspect-[16/10] bg-slate-50 rounded-lg overflow-hidden border-2 border-slate-300">
                    <canvas 
                        ref={canvasRef}
                        className="w-full h-full cursor-none"
                        onMouseMove={handleMouseMove}
                        onClick={handleClick}
                    />
                    
                    {gameState === 'start' && (
                        <div className="absolute inset-0 bg-slate-900 bg-opacity-80 text-white flex flex-col justify-center items-center">
                            <h2 className="text-4xl font-bold mb-4">Bereit?</h2>
                            <p className="mb-6 text-lg">Platziere 2 Eimer mit der Maus und klicke.</p>
                            <button 
                                onClick={startGame}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg text-xl shadow-md transition-transform transform hover:scale-105"
                            >
                                Spiel starten
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SpielNullstellen;
