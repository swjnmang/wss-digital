import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import GeoGebraRightTriangle from '../../components/GeoGebraRightTriangle';

interface Task {
  id: number;
  pointA: string;
  pointB: string;
  pointC: string;
  sideA: string;           // Seite gegenüber von A
  sideB: string;           // Seite gegenüber von B
  sideC: string;           // Seite gegenüber von C
  rightAngleAtPoint: string; // Punkt wo der rechte Winkel ist
  markedAngle: 'alpha' | 'beta';
  markedAngleAtPoint: string; // Punkt wo der markierte Winkel ist
}

interface DragItem {
  label: string;
  correctType: 'hypotenuse' | 'opposite' | 'adjacent';
}

interface Assignments {
  hypotenuse: string | null;
  opposite: string | null;
  adjacent: string | null;
}

const RechtwinkligBeschriften: React.FC = () => {
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [taskCount, setTaskCount] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [assignments, setAssignments] = useState<Assignments>({
    hypotenuse: null,
    opposite: null,
    adjacent: null,
  });
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generiere eine neue Aufgabe mit variablen Dreiecks-Orientierungen
  const generateTask = () => {
    const points = [
      ['A', 'B', 'C'],
      ['P', 'Q', 'R'],
      ['X', 'Y', 'Z'],
    ];
    const sides = [
      ['a', 'b', 'c'],
      ['x', 'y', 'z'],
    ];

    const selectedPoints = points[Math.floor(Math.random() * points.length)];
    const selectedSides = sides[Math.floor(Math.random() * sides.length)];
    
    // Zufällig entscheiden, wo der rechte Winkel ist
    const rightAngleOptions = [selectedPoints[0], selectedPoints[1], selectedPoints[2]];
    const rightAngleAtPoint = rightAngleOptions[Math.floor(Math.random() * 3)];
    
    // Markierter Winkel: einer der beiden nicht-rechten Winkel
    const otherPoints = selectedPoints.filter(p => p !== rightAngleAtPoint);
    const markedAngleAtPoint = otherPoints[Math.floor(Math.random() * 2)];
    const markedAngle = markedAngleAtPoint === selectedPoints[0] ? 'alpha' : 'beta';

    const task: Task = {
      id: Date.now(),
      pointA: selectedPoints[0],
      pointB: selectedPoints[1],
      pointC: selectedPoints[2],
      sideA: selectedSides[0],  // Seite gegenüber von A
      sideB: selectedSides[1],  // Seite gegenüber von B
      sideC: selectedSides[2],  // Seite gegenüber von C
      rightAngleAtPoint,
      markedAngle,
      markedAngleAtPoint,
    };

    setCurrentTask(task);
    setTaskCount(taskCount + 1);
    setAssignments({ hypotenuse: null, opposite: null, adjacent: null });
    setShowFeedback(false);
    setFeedback(null);
  };

  useEffect(() => {
    if (!currentTask) {
      generateTask();
    }
  }, []);

  // Bestimme die korrekten Zuordnungen basierend auf der Task
  const getCorrectAssignments = (task: Task) => {
    // Hypotenuse ist die Seite gegenüber vom rechten Winkel
    const pointsArray = [task.pointA, task.pointB, task.pointC];
    const sidesArray = [task.sideA, task.sideB, task.sideC];
    const rightAngleIndex = pointsArray.indexOf(task.rightAngleAtPoint);
    const hypotenuseSide = sidesArray[rightAngleIndex];

    // Gegenkathete ist die Seite gegenüber vom markierten Winkel
    const markedAngleIndex = pointsArray.indexOf(task.markedAngleAtPoint);
    const oppositeSide = sidesArray[markedAngleIndex];

    // Ankathete ist die dritte Seite
    const adjacentSide = sidesArray.find(s => s !== hypotenuseSide && s !== oppositeSide)!;

    return {
      hypotenuse: hypotenuseSide,
      opposite: oppositeSide,
      adjacent: adjacentSide,
    };
  };

  const handleDragStart = (e: React.DragEvent, item: DragItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, target: 'hypotenuse' | 'opposite' | 'adjacent') => {
    e.preventDefault();
    
    if (draggedItem) {
      setAssignments((prev) => {
        const newAssignments = { ...prev };
        Object.keys(newAssignments).forEach((key) => {
          if (newAssignments[key as keyof Assignments] === draggedItem.label) {
            newAssignments[key as keyof Assignments] = null;
          }
        });
        newAssignments[target] = draggedItem.label;
        return newAssignments;
      });
    }
    setDraggedItem(null);
  };

  const handleRemoveAssignment = (target: 'hypotenuse' | 'opposite' | 'adjacent') => {
    setAssignments((prev) => ({
      ...prev,
      [target]: null,
    }));
  };

  const checkSolution = () => {
    if (!currentTask) return;
    const correct_assignments = getCorrectAssignments(currentTask);
    
    const isCorrect =
      assignments.hypotenuse === correct_assignments.hypotenuse &&
      assignments.opposite === correct_assignments.opposite &&
      assignments.adjacent === correct_assignments.adjacent;

    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setShowFeedback(true);

    if (isCorrect) {
      setCorrect(correct + 1);
    }
  };

  if (!currentTask) {
    return <div className="text-center py-8">Laden...</div>;
  }

  const correctAssignments = getCorrectAssignments(currentTask);
  const availableSides = [currentTask.sideA, currentTask.sideB, currentTask.sideC];
  const otherPoints = [currentTask.pointA, currentTask.pointB, currentTask.pointC].filter(
    p => p !== currentTask.rightAngleAtPoint
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 p-8" ref={containerRef}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <Link to="/trigonometrie" className="text-blue-600 hover:text-blue-800 font-semibold">
            ← Zurück zur Übersicht
          </Link>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-orange-900">Rechtwinklige Dreiecke beschriften</h1>
            <p className="text-gray-600 mt-2">Aufgabe {taskCount} | Richtig: {correct}/{Math.max(taskCount - 1, 0)}</p>
          </div>
          <div></div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* GeoGebra Darstellung */}
            <div className="flex flex-col items-center justify-center">
              <div className="bg-gray-50 rounded-lg w-full h-96 border-2 border-gray-200 flex items-center justify-center">
                <GeoGebraRightTriangle
                  pointA={currentTask.pointA}
                  pointB={currentTask.pointB}
                  pointC={currentTask.pointC}
                  sideA={currentTask.sideA}
                  sideB={currentTask.sideB}
                  sideC={currentTask.sideC}
                  markedAngle={currentTask.markedAngle}
                  rightAngleAtPoint={currentTask.rightAngleAtPoint}
                  markedAngleAtPoint={currentTask.markedAngleAtPoint}
                  width={500}
                  height={350}
                />
              </div>
              <p className="text-sm text-gray-600 mt-4 text-center">
                Vom Winkel {currentTask.markedAngle === 'alpha' ? 'α' : 'β'} aus: Was ist Hypotenuse, Gegenkathete und Ankathete?
              </p>
            </div>

            {/* Aufgabe und Zuordnung */}
            <div className="flex flex-col justify-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Ordne die Seiten zu:</h2>

              {/* Zielbereiche */}
              <div className="space-y-4 mb-8">
                {/* Hypotenuse */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-20 bg-gray-50">
                  <p className="text-sm font-semibold text-gray-600 mb-2">Hypotenuse (längste Seite):</p>
                  <div
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 'hypotenuse')}
                    className="bg-white border border-gray-300 rounded p-3 min-h-12 flex items-center justify-between"
                  >
                    {assignments.hypotenuse ? (
                      <>
                        <span className="font-bold text-lg text-blue-600">{assignments.hypotenuse}</span>
                        <button
                          onClick={() => handleRemoveAssignment('hypotenuse')}
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-400 italic">Seite hierher ziehen...</span>
                    )}
                  </div>
                </div>

                {/* Gegenkathete */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-20 bg-gray-50">
                  <p className="text-sm font-semibold text-gray-600 mb-2">
                    Gegenkathete (gegenüber von {currentTask.markedAngle === 'alpha' ? 'α' : 'β'}):
                  </p>
                  <div
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 'opposite')}
                    className="bg-white border border-gray-300 rounded p-3 min-h-12 flex items-center justify-between"
                  >
                    {assignments.opposite ? (
                      <>
                        <span className="font-bold text-lg text-green-600">{assignments.opposite}</span>
                        <button
                          onClick={() => handleRemoveAssignment('opposite')}
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-400 italic">Seite hierher ziehen...</span>
                    )}
                  </div>
                </div>

                {/* Ankathete */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-20 bg-gray-50">
                  <p className="text-sm font-semibold text-gray-600 mb-2">
                    Ankathete (neben {currentTask.markedAngleAtPoint}):
                  </p>
                  <div
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 'adjacent')}
                    className="bg-white border border-gray-300 rounded p-3 min-h-12 flex items-center justify-between"
                  >
                    {assignments.adjacent ? (
                      <>
                        <span className="font-bold text-lg text-purple-600">{assignments.adjacent}</span>
                        <button
                          onClick={() => handleRemoveAssignment('adjacent')}
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-400 italic">Seite hierher ziehen...</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Verfügbare Seiten zum Ziehen */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-600 mb-3">Verfügbare Seiten:</p>
                <div className="flex flex-wrap gap-3">
                  {availableSides.map((side) => (
                    <div
                      key={side}
                      draggable
                      onDragStart={(e) =>
                        handleDragStart(e, {
                          label: side,
                          correctType: side === correctAssignments.hypotenuse ? 'hypotenuse' : 
                                       side === correctAssignments.opposite ? 'opposite' : 'adjacent',
                        })
                      }
                      className="bg-blue-100 border-2 border-blue-500 rounded-lg p-3 cursor-grab active:cursor-grabbing font-bold text-lg hover:bg-blue-200 transition"
                    >
                      {side}
                    </div>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={checkSolution}
                  disabled={!assignments.hypotenuse || !assignments.opposite || !assignments.adjacent}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-lg transition"
                >
                  Überprüfen
                </button>
                <button
                  onClick={generateTask}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
                >
                  Nächste Aufgabe
                </button>
              </div>

              {/* Feedback */}
              {showFeedback && (
                <div
                  className={`mt-6 p-4 rounded-lg text-white font-semibold text-center ${
                    feedback === 'correct' ? 'bg-green-500' : 'bg-red-500'
                  }`}
                >
                  {feedback === 'correct' ? '✓ Richtig!' : '✗ Nicht ganz richtig. Versuche es nochmal!'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RechtwinkligBeschriften;
