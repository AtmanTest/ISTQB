// ===== ISTQB CTFL v4.0.1 — Study Plan Page =====

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Chapter, StudyPlan, StudyPlanTask } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useISTQBStore } from '@/store/useISTQBStore';
import { generateId } from '@/lib/utils';
import {
  Calendar, Clock, BookOpen, Brain, FileText,
  Target, CheckCircle2, Circle, ArrowRight,
  Play, RotateCcw, Trophy, Sparkles, Layers,
  ListChecks, ChevronRight, ChevronDown, CheckCheck, Zap
} from 'lucide-react';

// ── Plan Option Definitions ──────────────────────────

interface PlanOption {
  id: '2_weeks' | '4_weeks' | '6_weeks' | '8_weeks';
  title: string;
  duration: string;
  dailyMinutes: number;
  totalDays: number;
  description: string;
  intensity: 'intensive' | 'normal' | 'light';
  color: string;
  bgColor: string;
  icon: any;
}

const PLAN_OPTIONS: PlanOption[] = [
  {
    id: '2_weeks',
    title: 'Intensif 2 semaines',
    duration: '14 jours',
    dailyMinutes: 180,
    totalDays: 14,
    description: 'Pour une révision accélérée. Idéal si vous avez déjà des bases solides.',
    intensity: 'intensive',
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50',
    icon: Zap,
  },
  {
    id: '4_weeks',
    title: 'Standard 4 semaines',
    duration: '28 jours',
    dailyMinutes: 90,
    totalDays: 28,
    description: 'Rythme équilibré recommandé. Couvre tout le syllabus confortablement.',
    intensity: 'normal',
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900/50',
    icon: Sparkles,
  },
  {
    id: '6_weeks',
    title: 'Détaillé 6 semaines',
    duration: '42 jours',
    dailyMinutes: 60,
    totalDays: 42,
    description: 'Pour les débutants. Permet d\'approfondir chaque chapitre sereinement.',
    intensity: 'normal',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50',
    icon: Layers,
  },
  {
    id: '8_weeks',
    title: 'Progressif 8 semaines',
    duration: '56 jours',
    dailyMinutes: 45,
    totalDays: 56,
    description: 'Rythme léger. Parfait pour étudier en parallèle d\'une activité professionnelle.',
    intensity: 'light',
    color: 'text-violet-600 dark:text-violet-400',
    bgColor: 'bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-900/50',
    icon: Calendar,
  },
];

// ── Task Type Config ─────────────────────────────────

const TASK_TYPE_CONFIG: Record<StudyPlanTask['type'], { icon: any; label: string; color: string }> = {
  read: { icon: BookOpen, label: 'Lecture', color: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30' },
  quiz: { icon: Brain, label: 'Quiz', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30' },
  flashcard: { icon: FileText, label: 'Flashcards', color: 'text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/30' },
  exam: { icon: Target, label: 'Examen', color: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30' },
  review: { icon: RotateCcw, label: 'Révision', color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-900/30' },
};

// ── Helper: Generate Tasks ───────────────────────────

function generatePlanTasks(planId: string, planType: PlanOption['id']): StudyPlanTask[] {
  const tasks: StudyPlanTask[] = [];
  let day = 1;
  const chs = [
    { id: 'ch1', days: 4 },
    { id: 'ch2', days: 3 },
    { id: 'ch3', days: 2 },
    { id: 'ch4', days: 5 },
    { id: 'ch5', days: 4 },
    { id: 'ch6', days: 1 },
  ];

  const multiplier = planType === '2_weeks' ? 0.5
    : planType === '6_weeks' ? 1.5
      : planType === '8_weeks' ? 2
        : 1;

  for (const ch of chs) {
    const daysForChapter = Math.max(1, Math.round(ch.days * multiplier));
    for (let d = 0; d < daysForChapter; d++) {
      const loSeed = ((day * 7 + d) % 3) + 1;
      const loId = `FL-${ch.id.replace('ch', '')}.${d + 1}.${loSeed}`;

      tasks.push({
        id: generateId(),
        planId,
        dayNumber: day,
        title: d === 0
          ? `Introduction au chapitre`
          : d === daysForChapter - 1
            ? `Révision et quiz du chapitre`
            : `Étude des objectifs`,
        description: `Travailler sur le chapitre — jour ${d + 1}/${daysForChapter}`,
        type: d === daysForChapter - 1 ? 'quiz' : (d % 3 === 0 ? 'read' : d % 3 === 1 ? 'flashcard' : 'review'),
        chapterId: ch.id,
        loId: d === 0 ? loId : null,
        estimatedMinutes: planType === '2_weeks' ? 60 : planType === '4_weeks' ? 45 : planType === '6_weeks' ? 30 : 25,
        status: 'pending',
        completedAt: null,
      });
    }
    day++;
  }

  // Final review & mock exam days
  for (let i = 0; i < Math.max(2, Math.round(2 * multiplier)); i++) {
    tasks.push({
      id: generateId(),
      planId,
      dayNumber: day,
      title: i === 0 ? 'Révision générale' : 'Examen blanc complet',
      description: i === 0
        ? 'Réviser tous les chapitres et consolider les points faibles'
        : 'Passer un examen blanc de 40 questions dans les conditions réelles (60 min)',
      type: i === 0 ? 'review' : 'exam',
      chapterId: null,
      loId: null,
      estimatedMinutes: i === 0 ? 60 : 60,
      status: 'pending',
      completedAt: null,
    });
    day++;
  }

  return tasks;
}

// ── Component ────────────────────────────────────────

export default function StudyPlanPage() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const studyPlans = useISTQBStore((s) => s.studyPlans);
  const activeStudyPlanId = useISTQBStore((s) => s.activeStudyPlanId);
  const setStudyPlan = useISTQBStore((s) => s.setStudyPlan);
  const setActiveStudyPlan = useISTQBStore((s) => s.setActiveStudyPlan);

  useEffect(() => {
    async function load() {
      try {
        const data = await import('@/data/seed/chapters.json');
        setChapters(data.default as Chapter[]);
      } catch (e) {
        console.error('Failed to load:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const activePlan = useMemo(() => {
    if (!activeStudyPlanId) return null;
    return studyPlans.find((sp) => sp.id === activeStudyPlanId) ?? null;
  }, [studyPlans, activeStudyPlanId]);

  // Group tasks by day
  const tasksByDay = useMemo(() => {
    if (!activePlan) return new Map<number, StudyPlanTask[]>();
    const map = new Map<number, StudyPlanTask[]>();
    for (const task of activePlan.tasks) {
      const list = map.get(task.dayNumber) ?? [];
      list.push(task);
      map.set(task.dayNumber, list);
    }
    return map;
  }, [activePlan]);

  const planProgress = useMemo(() => {
    if (!activePlan || activePlan.totalTasks === 0) return 0;
    return Math.round((activePlan.completedTasks / activePlan.totalTasks) * 100);
  }, [activePlan]);

  const totalDays = activePlan ? tasksByDay.size : 0;
  const completedDays = activePlan
    ? [...tasksByDay.entries()].filter(([_, tasks]) => tasks.every((t) => t.status === 'completed')).length
    : 0;

  // ── Handlers ───────────────────────────────────────

  const handleStartPlan = useCallback((option: PlanOption) => {
    const planId = generateId();
    const now = new Date();
    const startDate = now.toISOString().split('T')[0];
    const endDate = new Date(now.getTime() + option.totalDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const tasks = generatePlanTasks(planId, option.id);

    const newPlan: StudyPlan = {
      id: planId,
      userId: 'local',
      type: option.id,
      title: option.title,
      startDate,
      endDate,
      totalTasks: tasks.length,
      completedTasks: 0,
      status: 'active',
      tasks,
      createdAt: now.toISOString(),
    };

    setStudyPlan(newPlan);
    setActiveStudyPlan(planId);
  }, [setStudyPlan, setActiveStudyPlan]);

  const handleToggleTask = useCallback((taskId: string) => {
    if (!activePlan) return;
    const updatedTasks = activePlan.tasks.map((t) => {
      if (t.id !== taskId) return t;
      const isComplete = t.status === 'completed';
      return {
        ...t,
        status: isComplete ? 'pending' as const : 'completed' as const,
        completedAt: isComplete ? null : new Date().toISOString(),
      };
    });
    const completedCount = updatedTasks.filter((t) => t.status === 'completed').length;
    const allDone = completedCount === activePlan.totalTasks;

    setStudyPlan({
      ...activePlan,
      tasks: updatedTasks,
      completedTasks: completedCount,
      status: allDone ? 'completed' : 'active',
    });
  }, [activePlan, setStudyPlan]);

  const handleResetPlan = useCallback(() => {
    if (!activePlan) return;
    const resetTasks = activePlan.tasks.map((t) => ({
      ...t,
      status: 'pending' as const,
      completedAt: null,
    }));
    setStudyPlan({
      ...activePlan,
      tasks: resetTasks,
      completedTasks: 0,
      status: 'active' as const,
    });
  }, [activePlan, setStudyPlan]);

  const handleAbandonPlan = useCallback(() => {
    setActiveStudyPlan(null);
  }, [setActiveStudyPlan]);

  // ── Loading ────────────────────────────────────────

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  // ── Active Plan View ───────────────────────────────

  if (activePlan) {
    const planOption = PLAN_OPTIONS.find((o) => o.id === activePlan.type);
    const Icon = planOption?.icon ?? Calendar;

    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                {activePlan.title}
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Du {new Date(activePlan.startDate).toLocaleDateString('fr-FR')} au {new Date(activePlan.endDate).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleResetPlan}>
                <RotateCcw className="mr-1 h-4 w-4" />
                Réinitialiser
              </Button>
              <Button variant="ghost" size="sm" onClick={handleAbandonPlan}>
                Abandonner
              </Button>
            </div>
          </div>
        </div>

        {/* Progress */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                    Progression du plan
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {activePlan.completedTasks}/{activePlan.totalTasks} tâches · {completedDays}/{totalDays} jours
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{planProgress}%</p>
                <Badge variant={activePlan.status === 'completed' ? 'success' : 'warning'} className="text-xs">
                  {activePlan.status === 'completed' ? 'Terminé' : 'En cours'}
                </Badge>
              </div>
            </div>
            <Progress value={planProgress} />
          </CardContent>
        </Card>

        {/* Daily Tasks */}
        <div className="space-y-4">
          {[...tasksByDay.entries()]
            .sort(([a], [b]) => a - b)
            .map(([dayNumber, tasks]) => {
              const dayComplete = tasks.every((t) => t.status === 'completed');
              const dayProgress = Math.round((tasks.filter((t) => t.status === 'completed').length / tasks.length) * 100);
              const isExpanded = expandedDay === dayNumber;

              return (
                <Card key={dayNumber} className={`transition-all ${dayComplete ? 'opacity-70' : ''}`}>
                  <button
                    onClick={() => setExpandedDay(isExpanded ? null : dayNumber)}
                    className="flex w-full items-center justify-between p-4 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        dayComplete
                          ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {dayComplete ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                          Jour {dayNumber}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {tasks.length} tâche{tasks.length > 1 ? 's' : ''} · {dayProgress}% complété
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={dayProgress} className="hidden h-2 w-20 sm:block" />
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-slate-100 px-4 pb-4 pt-2 dark:border-slate-800">
                      <div className="space-y-2">
                        {tasks.map((task) => {
                          const config = TASK_TYPE_CONFIG[task.type];
                          const TaskIcon = config.icon;
                          const taskComplete = task.status === 'completed';

                          return (
                            <button
                              key={task.id}
                              onClick={() => handleToggleTask(task.id)}
                              className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                            >
                              {/* Checkbox */}
                              <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                                taskComplete
                                  ? 'border-emerald-500 bg-emerald-500 text-white'
                                  : 'border-slate-300 dark:border-slate-600'
                              }`}>
                                {taskComplete && <CheckCheck className="h-3.5 w-3.5" />}
                              </div>

                              {/* Type badge */}
                              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${config.color}`}>
                                <TaskIcon className="h-4 w-4" />
                              </div>

                              {/* Content */}
                              <div className="min-w-0 flex-1">
                                <p className={`text-sm font-medium ${
                                  taskComplete
                                    ? 'text-slate-400 line-through dark:text-slate-500'
                                    : 'text-slate-900 dark:text-slate-50'
                                }`}>
                                  {task.title}
                                </p>
                                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                                  {task.description}
                                </p>
                              </div>

                              {/* Meta */}
                              <div className="flex shrink-0 items-center gap-2 text-xs text-slate-400">
                                <Clock className="h-3 w-3" />
                                <span>{task.estimatedMinutes} min</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
        </div>
      </div>
    );
  }

  // ── Plan Selection View ────────────────────────────

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          Plan d&apos;étude
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Choisissez un plan structuré pour vous préparer à la certification CTFL
        </p>
      </div>

      {/* Plan Options */}
      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {PLAN_OPTIONS.map((option) => {
          const OptionIcon = option.icon;
          return (
            <Card
              key={option.id}
              className={`relative cursor-pointer transition-all hover:shadow-md ${option.bgColor}`}
            >
              <CardContent className="flex flex-col p-6">
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${option.bgColor}`}>
                  <OptionIcon className={`h-6 w-6 ${option.color}`} />
                </div>

                <h3 className="mb-1 text-lg font-bold text-slate-900 dark:text-slate-50">
                  {option.title}
                </h3>

                <div className="mb-3 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <Calendar className="h-4 w-4" />
                  <span>{option.duration}</span>
                  <span>·</span>
                  <Clock className="h-4 w-4" />
                  <span>{option.dailyMinutes} min/jour</span>
                </div>

                <p className="mb-4 flex-1 text-sm text-slate-600 dark:text-slate-300">
                  {option.description}
                </p>

                <div className="flex items-center justify-between">
                  <Badge variant={
                    option.intensity === 'intensive' ? 'destructive'
                      : option.intensity === 'light' ? 'secondary'
                        : 'default'
                  } className="text-xs">
                    {option.intensity === 'intensive' ? 'Intensif'
                      : option.intensity === 'light' ? 'Léger'
                        : 'Équilibré'}
                  </Badge>
                  <Button size="sm" onClick={() => handleStartPlan(option)}>
                    <Play className="mr-1 h-4 w-4" />
                    Commencer
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chapter Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="h-4 w-4 text-indigo-500" />
            Contenu du syllabus
          </CardTitle>
          <CardDescription>
            Les 6 chapitres du syllabus CTFL v4.0.1 couverts dans le plan d&apos;étude
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {chapters.sort((a, b) => a.order - b.order).map((ch) => {
              const totalLessons = ch.sections.reduce((sum, s) => sum + s.lessons.length, 0);
              return (
                <div key={ch.id} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-indigo-600 text-xs font-bold text-white">
                    {ch.order}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                      {ch.titleFr}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {ch.learningObjectives.length} objectifs · {totalLessons} leçons · {ch.durationMinutes} min
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {ch.durationMinutes} min
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-4 w-4 text-amber-500" />
            Conseils pour réussir
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              Suivez le plan quotidiennement — la régularité est plus efficace que les sessions intensives irrégulières.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              Après chaque chapitre, passez le quiz correspondant pour valider votre compréhension.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              Utilisez les flashcards pour la révision espacée et la mémorisation des termes clés.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              Passez au moins un examen blanc complet avant le jour J pour vous familiariser avec les conditions réelles.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
