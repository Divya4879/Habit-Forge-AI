

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { HABITS, NEGATIVE_HABITS, TIMEFRAMES, ART_STYLES, CUSTOM_HABIT_ICON } from './constants';
import type { Habit, Timeframe, ArtStyle, SavedComparison, HabitInsight } from './types';
import { createAvatar, visualizeHabit, fileToBase64, getActionableTip, analyzeCustomHabit, getHabitInsights } from './services/geminiService';
import Spinner from './components/Spinner';
import { 
    SparklesIcon, 
    UploadIcon, 
    SaveIcon, 
    DownloadIcon,
    TrashIcon,
    GalleryIcon,
    XIcon,
    XSocialIcon,
    BotIcon,
    LightbulbIcon,
    HeartPulseIcon,
} from './components/IconComponents';

type AppState = 'initial' | 'avatar_creating' | 'avatar_created' | 'transforming' | 'transformed';
type HabitType = 'positive' | 'negative';

const LandingPage: React.FC<{ onStart: () => void }> = ({ onStart }) => (
    <div className="min-h-screen bg-brand-dark text-white font-sans flex flex-col">
        <main className="flex-grow flex flex-col items-center justify-center container mx-auto px-4 py-16 text-center">
            <div className="max-w-3xl animate-fade-in">
                <h1 className="text-3xl font-bold tracking-tight text-white mb-6">
                    HabitForge AI
                </h1>
                <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-green-300 to-yellow-200">
                    Visualize Your Future Self. Today.
                </h2>
                <p className="mt-6 text-lg md:text-xl text-yellow-200/70 max-w-2xl mx-auto">
                    Harness the power of AI to see the long-term impact of your habits, both good and bad. Create a privacy-first avatar and watch your commitment to wellness come to life.
                </p>
                <button 
                    onClick={onStart}
                    className="mt-10 bg-gradient-to-r from-yellow-500 to-yellow-600 text-brand-dark font-bold py-4 px-8 rounded-lg hover:from-yellow-400 hover:to-yellow-500 transition-all transform hover:scale-105 flex items-center justify-center mx-auto text-lg"
                >
                    <SparklesIcon className="w-6 h-6 mr-3" />
                    Start Your Transformation
                </button>
            </div>
            
            <div className="mt-20 md:mt-32 w-full max-w-5xl animate-slide-in-up">
                <h3 className="text-3xl font-bold text-white mb-8">How It Works</h3>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                        <div className="text-yellow-400 font-bold text-5xl mb-3">1</div>
                        <h4 className="text-xl font-semibold mb-2">Upload & Stylize</h4>
                        <p className="text-yellow-200/60">Securely upload a photo and transform it into a unique avatar in your favorite art style.</p>
                    </div>
                    <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                        <div className="text-yellow-400 font-bold text-5xl mb-3">2</div>
                        <h4 className="text-xl font-semibold mb-2">Choose Your Habits</h4>
                        <p className="text-yellow-200/60">Select from a list of life-changing habits (positive or negative) to visualize their impact.</p>
                    </div>
                     <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                        <div className="text-yellow-400 font-bold text-5xl mb-3">3</div>
                        <h4 className="text-xl font-semibold mb-2">See The Future</h4>
                        <p className="text-yellow-200/60">Witness the realistic transformation of your avatar over different timeframes.</p>
                    </div>
                </div>
            </div>
        </main>
        <footer className="w-full text-center p-4 bg-brand-dark/50 text-yellow-300/80 text-sm tracking-wider">
            Made with love by <a href="https://x.com/TechDsa" target="_blank" rel="noopener noreferrer" className="font-bold text-yellow-300 transition-colors hover:text-yellow-200 hover:underline">Divya</a>
        </footer>
    </div>
);


const ImageSlider: React.FC<{before: string, after: string}> = ({ before, after }) => {
    const [sliderValue, setSliderValue] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSliderValue(Number(e.target.value));
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.buttons !== 1) return;
        const rect = containerRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = (x / rect.width) * 100;
        setSliderValue(Math.max(0, Math.min(100, percentage)));
    };

    return (
        <div ref={containerRef} onMouseMove={handleMouseMove} className="relative w-full aspect-square cursor-ew-resize select-none overflow-hidden rounded-2xl">
            <img src={before} alt="Before" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
            <div className="absolute inset-0 w-full h-full" style={{ clipPath: `inset(0 ${100 - sliderValue}% 0 0)` }}>
                <img src={after} alt="After" className="w-full h-full object-cover" draggable={false} />
            </div>
            <div className="absolute inset-0" style={{ left: `calc(${sliderValue}% - 1px)` }}>
                <div className="h-full w-0.5 bg-white/80 shadow-lg">
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center cursor-ew-resize">
                        <div className="h-4 w-4 transform rotate-45 border-2 border-brand-dark border-t-transparent border-l-transparent"></div>
                        <div className="h-4 w-4 transform -rotate-45 border-2 border-brand-dark border-b-transparent border-r-transparent -ml-2"></div>
                    </div>
                </div>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={sliderValue} 
              onChange={handleSliderChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
              aria-label="Before and after image comparison slider"
            />
        </div>
    );
};


const VisualizerApp: React.FC = () => {
    const [originalImage, setOriginalImage] = useState<{ base64: string, mimeType: string, url: string } | null>(null);
    const [baseAvatar, setBaseAvatar] = useState<string | null>(null);
    const [transformedAvatar, setTransformedAvatar] = useState<string | null>(null);
    const [habitType, setHabitType] = useState<HabitType>('positive');
    const [selectedHabits, setSelectedHabits] = useState<Habit[]>([HABITS[0]]);
    const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>(TIMEFRAMES[0]);
    const [selectedStyle, setSelectedStyle] = useState<ArtStyle>(ART_STYLES[0]);
    const [appState, setAppState] = useState<AppState>('initial');
    const [error, setError] = useState<string | null>(null);
    
    const [savedComparisons, setSavedComparisons] = useState<SavedComparison[]>([]);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    
    const [actionableTip, setActionableTip] = useState<string | null>(null);
    const [isTipLoading, setIsTipLoading] = useState(false);

    const [customHabits, setCustomHabits] = useState<Habit[]>([]);
    const [customHabitName, setCustomHabitName] = useState('');
    const [isCreatingCustomHabit, setIsCreatingCustomHabit] = useState(false);

    const [isInsightModalOpen, setIsInsightModalOpen] = useState(false);
    const [insightContent, setInsightContent] = useState<HabitInsight | null>(null);
    const [isInsightLoading, setIsInsightLoading] = useState(false);

    const positiveCustomHabitsCount = useMemo(() => customHabits.filter(h => !h.isNegative).length, [customHabits]);
    const negativeCustomHabitsCount = useMemo(() => customHabits.filter(h => h.isNegative).length, [customHabits]);
    
    const currentHabitList = useMemo(() => {
        const baseList = habitType === 'positive' ? HABITS : NEGATIVE_HABITS;
        const relevantCustomHabits = customHabits.filter(h => (habitType === 'positive' ? !h.isNegative : h.isNegative));
        return [...baseList, ...relevantCustomHabits];
    }, [habitType, customHabits]);
    
    useEffect(() => {
        const isCurrentSelectionValid = selectedHabits.every(h => currentHabitList.some(cl => cl.id === h.id));
        if (!isCurrentSelectionValid || selectedHabits.length === 0) {
            setSelectedHabits([currentHabitList[0]]);
        }
    }, [habitType, currentHabitList, selectedHabits]);

    const loadingMessage = useMemo(() => {
        if (appState === 'avatar_creating') return 'Stylizing your avatar... This can take a moment.';
        if (appState === 'transforming') return `Visualizing impact of ${selectedHabits.map(h => h.name).join(' + ')}...`;
        if (isCreatingCustomHabit) return `Analyzing "${customHabitName}"...`;
        return '';
    }, [appState, selectedHabits, isCreatingCustomHabit, customHabitName]);

    useEffect(() => {
        try {
            const saved = localStorage.getItem('habitComparisons');
            if (saved) {
                setSavedComparisons(JSON.parse(saved));
            }
            const savedCustom = localStorage.getItem('customHabits');
            if (savedCustom) {
                // Functions are not serializable, so the icon component is lost in localStorage.
                // We need to re-hydrate the custom habits with the icon component.
                const parsedCustom: Omit<Habit, 'icon'>[] = JSON.parse(savedCustom);
                const customHabitsWithIcons = parsedCustom.map((habit) => ({
                    ...habit,
                    icon: CUSTOM_HABIT_ICON,
                }));
                setCustomHabits(customHabitsWithIcons);
            }
        } catch (e) {
            console.error("Failed to load from local storage.", e);
        }
    }, []);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const { base64, mimeType } = await fileToBase64(file);
                setOriginalImage({ base64, mimeType, url: URL.createObjectURL(file) });
                setError(null);
            } catch (err) {
                setError('Failed to read file.');
                console.error(err);
            }
        }
    };

    const handleCreateAvatar = useCallback(async () => {
        if (!originalImage) return;
        setAppState('avatar_creating');
        setError(null);
        try {
            const avatar = await createAvatar(originalImage.base64, originalImage.mimeType, selectedStyle.name);
            setBaseAvatar(avatar);
            setAppState('avatar_created');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            setAppState('initial');
        }
    }, [originalImage, selectedStyle]);
    
    const handleVisualize = useCallback(async (habits: Habit[], timeframe: Timeframe) => {
        if (!baseAvatar || habits.length === 0) return;
        setAppState('transforming');
        setTransformedAvatar(null);
        setActionableTip(null);
        setError(null);
        try {
            const transformed = await visualizeHabit(baseAvatar, habits, timeframe, habitType);
            setTransformedAvatar(transformed);
            setAppState('transformed');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            setAppState('avatar_created');
        }
    }, [baseAvatar, habitType]);
    
    const handleReset = () => {
        setOriginalImage(null);
        setBaseAvatar(null);
        setTransformedAvatar(null);
        setSelectedHabits([HABITS[0]]);
        setSelectedTimeframe(TIMEFRAMES[0]);
        setSelectedStyle(ART_STYLES[0]);
        setAppState('initial');
        setError(null);
        setActionableTip(null);
    };

    const handleSaveComparison = () => {
        if (!baseAvatar || !transformedAvatar) return;
        const newComparison: SavedComparison = {
            id: Date.now().toString(),
            baseAvatar,
            transformedAvatar,
            habitName: selectedHabits.map(h => h.name).join(' + '),
            timeframeName: selectedTimeframe.name,
            createdAt: new Date().toISOString(),
        };
        const updatedComparisons = [newComparison, ...savedComparisons];
        setSavedComparisons(updatedComparisons);
        localStorage.setItem('habitComparisons', JSON.stringify(updatedComparisons));
    };

    const handleDeleteComparison = (id: string) => {
        const updatedComparisons = savedComparisons.filter(c => c.id !== id);
        setSavedComparisons(updatedComparisons);
        localStorage.setItem('habitComparisons', JSON.stringify(updatedComparisons));
    };
    
    const handleDownloadImage = async (): Promise<void> => {
        if (!baseAvatar || !transformedAvatar) return;

        return new Promise(async (resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return resolve();

            const img1 = new Image();
            const img2 = new Image();
            
            img1.crossOrigin = "anonymous";
            img2.crossOrigin = "anonymous";
            
            const promises = [
                new Promise(res => { img1.onload = res; img1.src = baseAvatar; }),
                new Promise(res => { img2.onload = res; img2.src = transformedAvatar; })
            ];

            await Promise.all(promises);

            const width = img1.width;
            const height = img1.height;
            const padding = 50;
            const titleHeight = 100;

            canvas.width = (width * 2) + (padding * 3);
            canvas.height = height + (padding * 2) + titleHeight;

            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = 'white';
            ctx.font = 'bold 40px sans-serif';
            ctx.textAlign = 'center';

            ctx.fillText('Before', padding + width / 2, padding + titleHeight / 2);
            ctx.fillText(`After: ${selectedTimeframe.name}`, padding * 2 + width + width / 2, padding + titleHeight / 2);

            ctx.drawImage(img1, padding, padding + titleHeight, width, height);
            ctx.drawImage(img2, padding * 2 + width, padding + titleHeight, width, height);

            const link = document.createElement('a');
            link.download = `habit_transformation_${selectedHabits.map(h => h.name.replace(/ /g, '_')).join('_')}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            resolve();
        });
    };

    const handleCreateCustomHabit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customHabitName.trim() || isCreatingCustomHabit) return;

        setIsCreatingCustomHabit(true);
        setError(null);
        try {
            const analysis = await analyzeCustomHabit(customHabitName);

            if (analysis.isNegative) {
                if (negativeCustomHabitsCount >= 2) {
                    setError("You have reached the limit of 2 custom negative habits.");
                    setIsCreatingCustomHabit(false);
                    return;
                }
            } else {
                if (positiveCustomHabitsCount >= 2) {
                    setError("You have reached the limit of 2 custom positive habits.");
                    setIsCreatingCustomHabit(false);
                    return;
                }
            }

            const newHabit: Habit = {
                ...analysis,
                id: `custom_${Date.now()}`,
                icon: CUSTOM_HABIT_ICON,
            };
            const updatedCustomHabits = [...customHabits, newHabit];
            setCustomHabits(updatedCustomHabits);
            localStorage.setItem('customHabits', JSON.stringify(updatedCustomHabits));
            
            setHabitType(newHabit.isNegative ? 'negative' : 'positive');
            setSelectedHabits([newHabit]);
            setCustomHabitName('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsCreatingCustomHabit(false);
        }
    };

    const handleShowInsights = async (habit: Habit) => {
        setIsInsightLoading(true);
        setIsInsightModalOpen(true);
        setInsightContent(null);
        setError(null);
        try {
            const insights = await getHabitInsights(habit);
            setInsightContent(insights);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not load insights.');
            setIsInsightModalOpen(false);
        } finally {
            setIsInsightLoading(false);
        }
    };

    const handlePathToRecovery = () => {
        const negativeHabit = selectedHabits[0];
        if (!negativeHabit?.recoveryHabitId) return;
        
        const recoveryHabit = HABITS.find(h => h.id === negativeHabit.recoveryHabitId);
        if (recoveryHabit) {
            setHabitType('positive');
            setSelectedHabits([recoveryHabit]);
            handleVisualize([recoveryHabit], selectedTimeframe);
        }
    };

    const handleHabitSelection = (habit: Habit) => {
        setSelectedHabits(prev => {
            const isSelected = prev.some(h => h.id === habit.id);
            if (isSelected) {
                return prev.filter(h => h.id !== habit.id);
            }
            if (prev.length < 3) {
                return [...prev, habit];
            }
            return prev; // Max 3 selected
        });
    };

    const renderNavbar = () => (
        <nav className="fixed top-0 left-0 w-full bg-brand-dark/80 backdrop-blur-sm z-20 border-b border-white/10">
            <div className="container mx-auto px-4 h-16 flex justify-between items-center">
                <h1 className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-green-300">
                    HabitForge AI
                </h1>
                 {savedComparisons.length > 0 && (
                    <button 
                        onClick={() => setIsGalleryOpen(true)}
                        className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors"
                        aria-label="Open gallery"
                    >
                        <GalleryIcon className="w-6 h-6 text-yellow-300" />
                    </button>
                )}
            </div>
        </nav>
    );

    const renderInitialUploader = () => (
        <div className="w-full max-w-lg mx-auto animate-slide-in-up">
            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10">
                <h2 className="text-2xl font-semibold text-center text-white mb-4">1. Create Your Avatar</h2>
                <label htmlFor="file-upload" className="relative block w-full h-64 border-2 border-dashed border-yellow-400/50 rounded-lg cursor-pointer hover:border-yellow-300 transition-colors group">
                    {originalImage?.url ? (
                        <img src={originalImage.url} alt="Uploaded preview" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-yellow-300/70 group-hover:text-yellow-200">
                            <UploadIcon className="w-12 h-12 mb-2"/>
                            <span className="font-semibold">Click to upload an image</span>
                            <span className="text-sm">PNG, JPG, WEBP</span>
                        </div>
                    )}
                </label>
                <input id="file-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
                
                {originalImage && (
                    <div className="mt-6 space-y-4">
                        <div>
                            <label htmlFor="style-select" className="block text-sm font-medium text-yellow-200/80 mb-1">Select Avatar Style</label>
                            <select
                                id="style-select"
                                value={selectedStyle.id}
                                onChange={(e) => setSelectedStyle(ART_STYLES.find(s => s.id === e.target.value) || ART_STYLES[0])}
                                className="w-full bg-black/30 border border-yellow-400/50 rounded-md p-2 text-white focus:ring-yellow-400 focus:border-yellow-400"
                            >
                                {ART_STYLES.map(style => <option key={style.id} value={style.id}>{style.name}</option>)}
                            </select>
                        </div>
                        <button 
                            onClick={handleCreateAvatar}
                            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-brand-dark font-bold py-3 px-4 rounded-lg hover:from-yellow-400 hover:to-yellow-500 transition-all transform hover:scale-105 flex items-center justify-center"
                        >
                            <SparklesIcon className="w-5 h-5 mr-2" />
                            Generate My Avatar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
    
    const renderHabitSelector = () => {
        const isPositiveLimitReached = habitType === 'positive' && positiveCustomHabitsCount >= 2;
        const isNegativeLimitReached = habitType === 'negative' && negativeCustomHabitsCount >= 2;
        const isCustomHabitLimitReached = isPositiveLimitReached || isNegativeLimitReached;

        return (
            <div className="w-full max-w-4xl mx-auto flex flex-col lg:flex-row gap-8 items-start animate-slide-in-up">
                <div className="w-full lg:w-1/3 text-center">
                    <h2 className="text-2xl font-semibold text-white mb-4">Your Avatar</h2>
                    <img src={baseAvatar!} alt="Generated Avatar" className="rounded-2xl shadow-2xl border-2 border-yellow-400/50 mx-auto" />
                     <button onClick={handleReset} className="text-sm mt-4 text-red-400 hover:text-red-300">
                        Start Over
                    </button>
                </div>
                <div className="w-full lg:w-2/3 bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10">
                    <h2 className="text-2xl font-semibold text-white mb-4">2. Visualize Your Progress</h2>
                    <div className="space-y-6">
                        <div>
                            <div className="flex bg-black/20 rounded-lg p-1 mb-4">
                                <button onClick={() => setHabitType('positive')} className={`w-1/2 py-2 rounded-md font-semibold transition-colors ${habitType === 'positive' ? 'bg-green-500 text-white' : 'text-gray-300 hover:bg-white/10'}`}>
                                    Positive Habits
                                </button>
                                <button onClick={() => setHabitType('negative')} className={`w-1/2 py-2 rounded-md font-semibold transition-colors ${habitType === 'negative' ? 'bg-red-500 text-white' : 'text-gray-300 hover:bg-white/10'}`}>
                                    Negative Habits
                                </button>
                            </div>
                            <label className="block text-sm font-medium text-yellow-200/80 mb-2">Select up to 3 Habits</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {currentHabitList.map(habit => (
                                    <button
                                        key={habit.id}
                                        onClick={() => handleHabitSelection(habit)}
                                        className={`p-3 rounded-lg border-2 transition-all text-left flex flex-col items-start min-h-[100px] relative group ${selectedHabits.some(h => h.id === habit.id) ? `border-yellow-400 ${habitType === 'positive' ? 'bg-green-500/10' : 'bg-red-500/10'}` : 'bg-black/20 border-transparent hover:border-yellow-400/50'}`}
                                        aria-pressed={selectedHabits.some(h => h.id === habit.id)}
                                    >
                                        <habit.icon className="w-7 h-7 mb-2 text-yellow-300"/>
                                        <span className="font-semibold text-white text-sm leading-tight">{habit.name}</span>
                                        <button onClick={(e) => { e.stopPropagation(); handleShowInsights(habit); }} className="absolute top-1 right-1 p-1 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 hover:bg-black/60 transition-opacity" aria-label={`Insights for ${habit.name}`}>
                                            <LightbulbIcon className="w-4 h-4 text-yellow-200" />
                                        </button>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <form onSubmit={handleCreateCustomHabit} className="flex gap-2">
                               <input 
                                    type="text"
                                    value={customHabitName}
                                    onChange={(e) => setCustomHabitName(e.target.value)}
                                    placeholder={isCustomHabitLimitReached ? "Custom habit limit reached" : "Or create a custom habit..."}
                                    className="flex-grow bg-black/30 border border-yellow-400/50 rounded-md p-2 text-white focus:ring-yellow-400 focus:border-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isCreatingCustomHabit || isCustomHabitLimitReached}
                               />
                               <button type="submit" disabled={isCreatingCustomHabit || !customHabitName.trim() || isCustomHabitLimitReached} className="bg-purple-500 text-white px-4 rounded-md font-semibold hover:bg-purple-400 disabled:bg-gray-500 disabled:cursor-not-allowed">
                                    Add
                               </button>
                            </form>
                        </div>

                         <div>
                            <label className="block text-sm font-medium text-yellow-200/80 mb-2">Select Timeframe</label>
                            <div className="flex flex-wrap gap-2">
                                {TIMEFRAMES.map(tf => (
                                    <button
                                        key={tf.id}
                                        onClick={() => setSelectedTimeframe(tf)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedTimeframe.id === tf.id ? 'bg-yellow-400 text-brand-dark' : 'bg-black/30 text-yellow-200 hover:bg-black/50'}`}
                                        aria-pressed={selectedTimeframe.id === tf.id}
                                    >
                                        {tf.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button 
                            onClick={() => handleVisualize(selectedHabits, selectedTimeframe)}
                            disabled={selectedHabits.length === 0}
                            className={`w-full font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${habitType === 'positive' ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-400 hover:to-green-500' : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-400 hover:to-red-500'}`}
                        >
                            <SparklesIcon className="w-5 h-5 mr-2" />
                            {habitType === 'positive' ? 'Show Me The Glow Up' : 'Visualize The Impact'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    const renderTransformedResult = () => (
        <div className="w-full max-w-6xl mx-auto text-center animate-slide-in-up">
            <div className="grid md:grid-cols-2 gap-4 md:gap-8 items-center">
                <div className="flex flex-col items-center">
                    <h3 className="text-2xl font-semibold text-white mb-4">Before</h3>
                    <img src={baseAvatar!} alt="Base Avatar" className="rounded-2xl shadow-2xl border-2 border-yellow-400/50" />
                </div>
                <div className="flex flex-col items-center">
                     <h3 className={`text-2xl font-semibold mb-4 ${habitType === 'positive' ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-green-300' : 'text-red-400'}`}>
                        After {selectedTimeframe.name}
                    </h3>
                    <ImageSlider before={baseAvatar!} after={transformedAvatar!} />
                </div>
            </div>

            <div className="mt-6 bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10 max-w-4xl mx-auto">
                <p className="text-lg text-white">
                    This is the visual representation of committing to <span className="font-bold text-yellow-300">{selectedHabits.map(h => h.name).join(' + ')}</span> for <span className="font-bold text-yellow-300">{selectedTimeframe.name}</span>.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {TIMEFRAMES.map(tf => (
                        <button
                            key={tf.id}
                            onClick={() => {
                                setSelectedTimeframe(tf);
                                handleVisualize(selectedHabits, tf);
                            }}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedTimeframe.id === tf.id ? 'bg-yellow-400 text-brand-dark' : 'bg-black/30 text-yellow-200 hover:bg-black/50'}`}
                        >
                            {tf.name}
                        </button>
                    ))}
                </div>
                 {habitType === 'positive' && selectedHabits.length === 1 && !actionableTip && (
                    <div className="mt-4">
                        <button onClick={async () => { setIsTipLoading(true); setActionableTip(await getActionableTip(selectedHabits[0])); setIsTipLoading(false); }} disabled={isTipLoading} className="flex items-center gap-2 mx-auto bg-purple-500/20 text-purple-200 border border-purple-400/50 px-4 py-2 rounded-lg hover:bg-purple-500/30 transition-colors disabled:opacity-50">
                            <BotIcon className="w-5 h-5"/> {isTipLoading ? 'Getting tip...' : 'Get AI Pro Tip'}
                        </button>
                    </div>
                )}
                 {actionableTip && (
                    <div className="mt-4 text-left p-4 bg-purple-900/20 rounded-lg animate-fade-in">
                        <p className="text-purple-200"><strong className="text-purple-100 font-bold">Pro Tip:</strong> {actionableTip}</p>
                    </div>
                )}
                 {habitType === 'negative' && selectedHabits.length === 1 && selectedHabits[0].recoveryHabitId && (
                     <div className="mt-4">
                        <button onClick={handlePathToRecovery} className="flex items-center gap-2 mx-auto bg-green-500/20 text-green-200 border border-green-400/50 px-4 py-2 rounded-lg hover:bg-green-500/30 transition-colors">
                            <HeartPulseIcon className="w-5 h-5"/> Show Path to Recovery
                        </button>
                    </div>
                )}
            </div>
            
            <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button onClick={handleSaveComparison} className="flex items-center gap-2 bg-blue-500/20 text-blue-200 border border-blue-400/50 px-5 py-2 rounded-lg hover:bg-blue-500/30 transition-colors">
                    <SaveIcon className="w-5 h-5"/> Save
                </button>
                 <button onClick={async () => { await handleDownloadImage(); const text = `Just visualized the impact of "${selectedHabits.map(h => h.name).join(' + ')}" for ${selectedTimeframe.name}! The results are so motivating. ✨\n\nCreate your own at:`; const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}&hashtags=HabitForgeAI`; window.open(url, '_blank'); }} className="flex items-center gap-2 bg-gray-200/20 text-gray-100 border border-gray-400/50 px-5 py-2 rounded-lg hover:bg-gray-200/30 transition-colors">
                    <XSocialIcon className="w-5 h-5"/> Share on X
                </button>
                <button onClick={handleDownloadImage} className="flex items-center gap-2 bg-green-500/20 text-green-200 border border-green-400/50 px-5 py-2 rounded-lg hover:bg-green-500/30 transition-colors">
                    <DownloadIcon className="w-5 h-5"/> Download
                </button>
                 <button onClick={() => setAppState('avatar_created')} className="flex items-center gap-2 bg-gray-500/20 text-gray-200 border border-gray-400/50 px-5 py-2 rounded-lg hover:bg-gray-500/30 transition-colors">
                    Change Habit
                </button>
            </div>
        </div>
    );
    
    const renderGalleryModal = () => (
        isGalleryOpen && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center animate-fade-in" onClick={() => setIsGalleryOpen(false)}>
                <div className="bg-brand-dark max-w-6xl w-full h-[90vh] rounded-2xl p-6 border border-yellow-400/20 overflow-y-auto" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl font-bold text-yellow-300">My Gallery</h2>
                        <button onClick={() => setIsGalleryOpen(false)} className="p-2 rounded-full hover:bg-white/10">
                            <XIcon className="w-6 h-6 text-white"/>
                        </button>
                    </div>
                    {savedComparisons.length === 0 ? (
                        <p className="text-center text-gray-400 mt-12">You haven't saved any comparisons yet.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {savedComparisons.map(comp => (
                                <div key={comp.id} className="bg-white/5 p-4 rounded-lg group relative">
                                    <div className="grid grid-cols-2 gap-2">
                                        <img src={comp.baseAvatar} alt="Base" className="rounded-md" />
                                        <img src={comp.transformedAvatar} alt="Transformed" className="rounded-md" />
                                    </div>
                                    <div className="mt-3 text-sm">
                                        <p className="font-bold text-white">{comp.habitName}</p>
                                        <p className="text-yellow-200/80">{comp.timeframeName}</p>
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteComparison(comp.id)}
                                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 hover:bg-red-500/80 transition-all"
                                        aria-label="Delete comparison"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )
    );

    const renderInsightModal = () => (
        isInsightModalOpen && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center animate-fade-in" onClick={() => setIsInsightModalOpen(false)}>
                <div className="bg-gradient-to-br from-brand-green-light to-brand-dark max-w-2xl w-full rounded-2xl p-8 border border-yellow-400/20" onClick={e => e.stopPropagation()}>
                    {isInsightLoading || !insightContent ? (
                        <div className="text-center p-8"><Spinner message="Generating AI insights..."/></div>
                    ) : (
                        <div className="animate-fade-in">
                             <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-green-300 mb-6">{insightContent.habitName}</h2>
                             <div className="space-y-5">
                                <div>
                                    <h3 className="text-lg font-semibold text-green-300 mb-2">Key Benefits</h3>
                                    <ul className="list-disc list-inside space-y-1 text-green-200/80">
                                        {insightContent.benefits.map((item, i) => <li key={i}>{item}</li>)}
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-yellow-300 mb-2">Common Challenges</h3>
                                    <ul className="list-disc list-inside space-y-1 text-yellow-200/80">
                                        {insightContent.challenges.map((item, i) => <li key={i}>{item}</li>)}
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-purple-300 mb-2">Pro-Tips for Success</h3>
                                    <ul className="list-disc list-inside space-y-1 text-purple-200/80">
                                        {insightContent.proTips.map((item, i) => <li key={i}>{item}</li>)}
                                    </ul>
                                </div>
                             </div>
                             <button onClick={() => setIsInsightModalOpen(false)} className="mt-8 w-full bg-yellow-500/20 text-yellow-200 font-bold py-2 px-4 rounded-lg hover:bg-yellow-500/30 transition-colors">Close</button>
                        </div>
                    )}
                </div>
            </div>
        )
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-brand-green-dark via-brand-dark to-brand-yellow-dark text-white font-sans">
            {renderNavbar()}
            <div className="pt-16">
                <main className="container mx-auto px-4 pb-20 pt-12 relative z-10">
                    {appState !== 'initial' && error && <div className="max-w-xl mx-auto bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg mb-8 text-center animate-fade-in" role="alert">{error}</div>}
                    
                    {appState === 'initial' && renderInitialUploader()}
                    {(appState === 'avatar_creating' || appState === 'transforming' || isCreatingCustomHabit) && <Spinner message={loadingMessage} />}
                    {appState === 'avatar_created' && baseAvatar && renderHabitSelector()}
                    {appState === 'transformed' && transformedAvatar && renderTransformedResult()}
                </main>
            </div>
            {renderGalleryModal()}
            {renderInsightModal()}
            <footer className="fixed bottom-0 left-0 w-full text-center p-4 bg-brand-dark/90 backdrop-blur-sm text-yellow-300/80 text-sm tracking-wider">
                 Made with love by <a href="https://x.com/TechDsa" target="_blank" rel="noopener noreferrer" className="font-bold text-yellow-300 transition-colors hover:text-yellow-200 hover:underline">Divya</a>
            </footer>
        </div>
    );
};


const App: React.FC = () => {
    const [page, setPage] = useState<'landing' | 'visualizer'>('landing');

    if (page === 'landing') {
        return <LandingPage onStart={() => setPage('visualizer')} />;
    }

    return <VisualizerApp />;
}

export default App;
