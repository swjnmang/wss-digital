import React, { useState, useEffect } from 'react';

const Scheitelpunkt = () => {
    const [difficulty, setDifficulty] = useState<number>(1);
    const [equation, setEquation] = useState<string>('');
    const [currentFunctionData, setCurrentFunctionData] = useState<{ x_s: number, y_s: number, hint: string } | null>(null);
    const [userX, setUserX] = useState<string>('');
    const [userY, setUserY] = useState<string>('');
    const [feedback, setFeedback] = useState<{ text: string, type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
    const [streak, setStreak] = useState<number>(0);

    const getRandomInt = (min: number, max: number) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    const formatNum = (n: number) => {
        if (n < 0) return `- ${Math.abs(n)}`;
        return `+ ${n}`;
    };

    const formatNumLead = (n: number) => {
        if (n === 1) return "";
        if (n === -1) return "-";
        return n;
    };

    const generateFunction = (level: number) => {
        let funcString = "f(x) = ";
        let x_s = 0, y_s = 0;
        let hint = "";

        if (level === 1) { 
            const a = getRandomInt(1, 3) * (Math.random() < 0.5 ? 1 : -1); 
            const h = getRandomInt(-5, 5);
            const k = getRandomInt(-5, 5);
            x_s = h;
            y_s = k;

            funcString += `${formatNumLead(a)}(x ${formatNum(-h)})² ${formatNum(k)}`;
            funcString = funcString.replace(/\+ -/g, '- ').replace(/\(x - 0\)/g, 'x').replace(/\(x \+ 0\)/g, 'x');
            if (a === 1 && (h !== 0)) funcString = funcString.replace("1(x", "(x");
            if (a === -1 && (h !== 0)) funcString = funcString.replace("-1(x", "-(x");
            if (a === 1 && h === 0) funcString = funcString.replace("1x²", "x²");
            if (a === -1 && h === 0) funcString = funcString.replace("-1x²", "-x²");
            hint = `Bei der Scheitelpunktform f(x) = a(x-d)² + e ist der Scheitelpunkt S(d|e). Achte auf das Vorzeichen bei d!`;
        } else if (level === 2) { 
            const a = getRandomInt(1, 3) * (Math.random() < 0.5 ? 1 : -1);
            x_s = getRandomInt(-4, 4); 
            const b = -2 * a * x_s; 
            const c = getRandomInt(-10, 10);
            y_s = a * x_s * x_s + b * x_s + c;

            funcString += `${formatNumLead(a)}x² `;
            if (b !== 0) funcString += `${formatNum(b)}x `;
            if (c !== 0 || (b===0 && a===0)) funcString += `${formatNum(c)}`; 
            funcString = funcString.replace(/\+ -/g, '- ').trim();
            if (a === 1) funcString = funcString.replace("1x²", "x²");
            if (a === -1) funcString = funcString.replace("-1x²", "-x²");
            if (funcString.endsWith(" + 0")) funcString = funcString.slice(0, -4);
            if (funcString.endsWith(" - 0")) funcString = funcString.slice(0, -4);
            hint = `Für f(x) = ax² + bx + c ist die x-Koordinate des Scheitelpunkts x_s = -b / (2a). Setze x_s in f(x) ein, um y_s zu erhalten.`;
        } else { 
            const a = getRandomInt(1, 4) * (Math.random() < 0.5 ? 1 : -1);
            const b = getRandomInt(-8, 8);
            const c = getRandomInt(-10, 10);
            x_s = -b / (2 * a);
            y_s = a * x_s * x_s + b * x_s + c;
            x_s = Math.round(x_s * 100) / 100;
            y_s = Math.round(y_s * 100) / 100;

            funcString += `${formatNumLead(a)}x² `;
            if (b !== 0) funcString += `${formatNum(b)}x `;
            if (c !== 0 || (b===0 && a===0)) funcString += `${formatNum(c)}`;
            funcString = funcString.replace(/\+ -/g, '- ').trim();
            if (a === 1) funcString = funcString.replace("1x²", "x²");
            if (a === -1) funcString = funcString.replace("-1x²", "-x²");
            if (funcString.endsWith(" + 0")) funcString = funcString.slice(0, -4);
            if (funcString.endsWith(" - 0")) funcString = funcString.slice(0, -4);
            hint = `Nutze x_s = -b / (2a) und y_s = f(x_s). Manchmal ist auch die quadratische Ergänzung hilfreich, um die Scheitelpunktform zu finden.`;
        }
        
        if (funcString === "f(x) = ") funcString = "f(x) = 0"; 
        
        setEquation(funcString);
        setCurrentFunctionData({ x_s, y_s, hint });
        setFeedback(null);
        setUserX('');
        setUserY('');
    };

    useEffect(() => {
        generateFunction(difficulty);
    }, [difficulty]);

    const checkAnswer = () => {
        if (!currentFunctionData) return;

        if (userX === "" || userY === "") {
            setFeedback({ text: "Bitte gib sowohl die x- als auch die y-Koordinate des Scheitelpunkts ein.", type: 'warning' });
            return;
        }

        const xVal = parseFloat(userX.replace(',', '.').replace(/[−–—‐]/g, '-'));
        const yVal = parseFloat(userY.replace(',', '.').replace(/[−–—‐]/g, '-'));

        if (isNaN(xVal) || isNaN(yVal)) {
            setFeedback({ text: "Die Koordinaten müssen Zahlen sein.", type: 'error' });
            return;
        }

        const tolerance = 0.01; 
        const isXCorrect = Math.abs(xVal - currentFunctionData.x_s) < tolerance;
        const isYCorrect = Math.abs(yVal - currentFunctionData.y_s) < tolerance;

        if (isXCorrect && isYCorrect) {
            setStreak(s => s + 1);
            setFeedback({ text: `🎉 Korrekt! Der Scheitelpunkt ist S(${currentFunctionData.x_s} | ${currentFunctionData.y_s}). Super gemacht!`, type: 'success' });
        } else {
            setStreak(0);
            let errorMsg = `Leider nicht ganz richtig. `;
            if(!isXCorrect && !isYCorrect) errorMsg += `Sowohl x- als auch y-Koordinate sind nicht korrekt.`;
            else if (!isXCorrect) errorMsg += `Die x-Koordinate ist nicht korrekt.`;
            else errorMsg += `Die y-Koordinate ist nicht korrekt.`;
            
            errorMsg += ` Der richtige Scheitelpunkt ist S(${currentFunctionData.x_s} | ${currentFunctionData.y_s}).`;
            setFeedback({ text: errorMsg, type: 'error' });
        }
    };

    const showHint = () => {
        if (currentFunctionData?.hint) {
            setFeedback({ text: `Hinweis: ${currentFunctionData.hint}`, type: 'info' });
        }
    };

    const parseInput = (value: string) => parseFloat(value.replace(',', '.').replace(/[−–—‐]/g, '-'));

    const getInputValidationClass = (value: string, target: number | undefined) => {
        if (value === '' || target === undefined) return 'border-gray-300';
        const parsed = parseInput(value);
        if (isNaN(parsed)) return 'border-gray-300';
        return Math.abs(parsed - target) < 0.01
            ? 'border-green-500 bg-green-50 text-green-800'
            : 'border-red-500 bg-red-50 text-red-800';
    };

    const xInputClass = getInputValidationClass(userX, currentFunctionData?.x_s);
    const yInputClass = getInputValidationClass(userY, currentFunctionData?.y_s);

    const taskPrompt = difficulty === 1
        ? 'Lies den Scheitelpunkt aus der Scheitelform ab. Eine Berechnung ist nicht notwendig'
        : 'Bestimme den Scheitelpunkt der Funktion:';

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col items-center text-center mb-6 gap-3">
                <h1 className="text-3xl font-bold">Scheitelpunkt-Trainer</h1>
                <div className="bg-white px-4 py-2 rounded shadow text-blue-600 font-bold">
                    Streak: {streak} 🔥
                </div>
            </div>

            <div className="mb-6">
                <div className="flex gap-2 mb-4 justify-center flex-wrap">
                    <button
                        onClick={() => setDifficulty(1)}
                        className={`px-4 py-2 rounded ${difficulty === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                    >
                        Level 1 (Scheitelpunktform)
                    </button>
                    <button
                        onClick={() => setDifficulty(2)}
                        className={`px-4 py-2 rounded ${difficulty === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                    >
                        Level 2 (Allgemeine Form)
                    </button>
                    <button
                        onClick={() => setDifficulty(3)}
                        className={`px-4 py-2 rounded ${difficulty === 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                    >
                        Level 3 (Profi)
                    </button>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md mb-6 text-center">
                    <p className="text-lg mb-4">{taskPrompt}</p>
                    <div className="text-3xl font-serif text-center bg-gray-50 p-6 rounded mb-8">
                        {equation}
                    </div>

                    <div className="flex items-center justify-center gap-4 mb-8">
                        <span className="text-2xl">S (</span>
                        <input
                            type="text"
                            value={userX}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setUserX(event.target.value)}
                            placeholder="x"
                            className={`w-24 p-3 border-2 rounded text-center text-xl transition-colors ${xInputClass}`}
                            onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => event.key === 'Enter' && checkAnswer()}
                        />
                        <span className="text-2xl">|</span>
                        <input
                            type="text"
                            value={userY}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setUserY(event.target.value)}
                            placeholder="y"
                            className={`w-24 p-3 border-2 rounded text-center text-xl transition-colors ${yInputClass}`}
                            onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => event.key === 'Enter' && checkAnswer()}
                        />
                        <span className="text-2xl">)</span>
                    </div>

                    <div className="flex gap-4 justify-center flex-wrap">
                        <button
                            onClick={checkAnswer}
                            className="bg-green-600 text-white px-8 py-3 rounded hover:bg-green-700 font-bold text-lg"
                        >
                            Prüfen
                        </button>
                        <button
                            onClick={() => generateFunction(difficulty)}
                            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
                        >
                            Neue Aufgabe
                        </button>
                        <button
                            onClick={showHint}
                            className="bg-yellow-500 text-white px-6 py-3 rounded hover:bg-yellow-600"
                        >
                            Tipp
                        </button>
                    </div>

                    {feedback && (
                        <div className={`mt-6 p-4 rounded text-center ${
                            feedback.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
                            feedback.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
                            feedback.type === 'warning' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                            'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                            <div dangerouslySetInnerHTML={{ __html: feedback.text }} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Scheitelpunkt;
