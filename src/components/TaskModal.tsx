import React from 'react';
import { Task, ConsoleOutput } from '../types';
import { RefreshCw, X } from 'lucide-react';
import { SimpleEditor } from './SimpleEditor';
import Console from './ui/Console';
import { MonacoEditor } from './MonakoEditor';

interface TaskModalProps {
    task: Task | null;
    code: string;
    setCode: (code: string) => void;
    consoleOutput: ConsoleOutput[];
    onClose: () => void;
    onSave: () => void;
    onRun: () => void;
    isMobile: boolean;
    syncing: boolean;
}

export const TaskModal: React.FC<TaskModalProps> = ({
    task,
    code,
    setCode,
    consoleOutput,
    onClose,
    onSave,
    onRun,
    isMobile,
    syncing,
}) => {
    // Якщо task === null, не показуємо модал
    if (!task) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 md:p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[95vh] md:h-[90vh] flex flex-col">
                {/* Шапка */}
                <div className="flex justify-between items-start p-4 md:p-6 border-b">
                    <div className="flex-1 min-w-0 pr-2">
                        <h2 className="text-lg md:text-2xl font-bold text-gray-800 break-words">
                            {task.title}
                        </h2>
                        <p className="text-sm md:text-base text-gray-600 mt-1 break-words">
                            {task.description}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 flex-shrink-0"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Контент */}
                <div className="flex-1 p-3 md:p-6 overflow-hidden flex flex-col gap-3 md:gap-4">
                    <div className={isMobile ? 'h-2/5' : 'h-1/2'}>
                        {isMobile ? (
                            <SimpleEditor value={code} onChange={setCode} onRun={onRun} />
                        ) : (
                            <MonacoEditor value={code} onChange={setCode} onRun={onRun} />
                        )}
                    </div>
                    <div className={isMobile ? 'h-3/5' : 'h-1/2'}>
                        <Console output={consoleOutput} />
                    </div>
                </div>

                {/* Футер */}
                <div className="p-3 md:p-6 border-t flex justify-end gap-2 md:gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 md:px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm md:text-base"
                    >
                        Закрити
                    </button>
                    <button
                        onClick={onSave}
                        disabled={syncing}
                        className="px-4 md:px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm md:text-base disabled:opacity-50 flex items-center gap-2"
                    >
                        {syncing && <RefreshCw size={16} className="animate-spin" />}
                        Зберегти
                    </button>
                </div>
            </div>
        </div>
    );
};
