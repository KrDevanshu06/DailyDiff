import { useState, useEffect, useCallback } from 'react';
import { Lightbulb, RefreshCw, Star, Clock, Code, FileText, Wrench, Zap, Copy, CheckCircle2 } from 'lucide-react';

interface TaskIdea {
  id: string;
  title: string;
  description: string;
  category: 'code' | 'docs' | 'refactor' | 'feature';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
  tags: string[];
}

interface MicroTaskGeneratorProps {
  targetRepo?: string;
}

const taskTemplates: TaskIdea[] = [
    {
      id: 'readme-update',
      title: 'Update README.md',
      description: 'Add installation instructions, usage examples, or improve documentation formatting',
      category: 'docs',
      difficulty: 'easy',
      estimatedTime: '5-10 min',
      tags: ['documentation', 'readme', 'quick-fix']
    },
    {
      id: 'add-comments',
      title: 'Add Code Comments',
      description: 'Add inline comments to explain complex logic or functions',
      category: 'code',
      difficulty: 'easy',
      estimatedTime: '10-15 min',
      tags: ['comments', 'documentation', 'code-quality']
    },
    {
      id: 'variable-rename',
      title: 'Improve Variable Names',
      description: 'Rename variables to be more descriptive and follow naming conventions',
      category: 'refactor',
      difficulty: 'easy',
      estimatedTime: '5-10 min',
      tags: ['refactoring', 'naming', 'cleanup']
    },
    {
      id: 'error-handling',
      title: 'Add Error Handling',
      description: 'Implement try-catch blocks or error checks in existing functions',
      category: 'code',
      difficulty: 'medium',
      estimatedTime: '15-20 min',
      tags: ['error-handling', 'robustness', 'best-practices']
    },
    {
      id: 'type-annotations',
      title: 'Add Type Annotations',
      description: 'Add TypeScript types or JSDoc type comments to improve code reliability',
      category: 'code',
      difficulty: 'medium',
      estimatedTime: '10-20 min',
      tags: ['types', 'typescript', 'documentation']
    },
    {
      id: 'config-file',
      title: 'Create Configuration File',
      description: 'Add .gitignore, .editorconfig, or other project configuration files',
      category: 'feature',
      difficulty: 'easy',
      estimatedTime: '5-10 min',
      tags: ['config', 'project-setup', 'tooling']
    },
    {
      id: 'function-extraction',
      title: 'Extract Helper Functions',
      description: 'Break down large functions into smaller, reusable helper functions',
      category: 'refactor',
      difficulty: 'medium',
      estimatedTime: '15-25 min',
      tags: ['refactoring', 'modularity', 'clean-code']
    },
    {
      id: 'add-tests',
      title: 'Write Unit Tests',
      description: 'Create basic unit tests for existing functions or components',
      category: 'code',
      difficulty: 'medium',
      estimatedTime: '20-30 min',
      tags: ['testing', 'quality-assurance', 'coverage']
    },
    {
      id: 'performance-optimization',
      title: 'Minor Performance Optimization',
      description: 'Optimize loops, reduce unnecessary operations, or improve algorithm efficiency',
      category: 'refactor',
      difficulty: 'hard',
      estimatedTime: '25-40 min',
      tags: ['performance', 'optimization', 'algorithms']
    },
    {
      id: 'ui-improvements',
      title: 'UI/UX Enhancements',
      description: 'Improve button styles, add hover effects, or enhance visual feedback',
      category: 'feature',
      difficulty: 'medium',
      estimatedTime: '15-30 min',
      tags: ['ui', 'ux', 'styling', 'user-experience']
    },
    {
      id: 'logging',
      title: 'Add Logging',
      description: 'Implement console.log statements or proper logging for debugging',
      category: 'code',
      difficulty: 'easy',
      estimatedTime: '5-15 min',
      tags: ['logging', 'debugging', 'monitoring']
    },
    {
      id: 'constants-extraction',
      title: 'Extract Constants',
      description: 'Move magic numbers and strings to named constants for better maintainability',
      category: 'refactor',
      difficulty: 'easy',
      estimatedTime: '10-15 min',
      tags: ['constants', 'maintainability', 'magic-numbers']
    }
];

const MicroTaskGenerator = ({ targetRepo }: MicroTaskGeneratorProps) => {
  const [currentIdeas, setCurrentIdeas] = useState<TaskIdea[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const generateRandomIdeas = useCallback(() => {
    setIsGenerating(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const shuffled = [...taskTemplates].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, 3);
      setCurrentIdeas(selected);
      setIsGenerating(false);
    }, 800);
  }, []);

  useEffect(() => {
    generateRandomIdeas();
  }, [generateRandomIdeas]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'code': return Code;
      case 'docs': return FileText;
      case 'refactor': return Wrench;
      case 'feature': return Zap;
      default: return Code;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'code': return 'text-blue-400';
      case 'docs': return 'text-green-400';
      case 'refactor': return 'text-orange-400';
      case 'feature': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-400/10';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'hard': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const copyTaskDescription = (task: TaskIdea) => {
    const description = `${task.title}\n\n${task.description}\n\nEstimated time: ${task.estimatedTime}\nTags: ${task.tags.join(', ')}`;
    navigator.clipboard.writeText(description);
    setCopiedId(task.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="card-professional rounded-xl sm:rounded-2xl p-6 sm:p-8 relative overflow-hidden">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl">
            <Lightbulb className="text-yellow-500 w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h2 className="heading-secondary text-xl sm:text-2xl">Micro Task Generator</h2>
            <p className="text-xs sm:text-sm text-muted-enhanced">AI-powered task suggestions</p>
          </div>
        </div>
        <button
          onClick={generateRandomIdeas}
          disabled={isGenerating}
          className="btn-secondary flex items-center gap-2 px-4 py-3 rounded-xl interactive-element disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
        >
          <RefreshCw className={`w-4 h-4 text-gray-400 ${isGenerating ? 'animate-spin' : ''}`} />
          <span className="text-white">New Ideas</span>
        </button>
      </div>

      {targetRepo && (
        <div className="mb-4 p-3 glass-morphism-light rounded-lg">
          <div className="text-xs text-gray-400 mb-1">Generating ideas for:</div>
          <div className="text-sm text-white font-medium">{targetRepo}</div>
        </div>
      )}

      <div className="space-y-3 sm:space-y-4">
        {isGenerating ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-800 rounded-lg"></div>
            ))}
          </div>
        ) : (
          currentIdeas.map((task, index) => {
            const CategoryIcon = getCategoryIcon(task.category);
            return (
              <div 
                key={task.id} 
                className="p-4 glass-morphism-light rounded-lg hover:bg-gray-700/30 transition-all gentle-hover group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-1">
                    <CategoryIcon className={`w-4 h-4 ${getCategoryColor(task.category)}`} />
                    <h3 className="font-semibold text-white text-sm">{task.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getDifficultyColor(task.difficulty)}`}>
                        {task.difficulty}
                      </span>
                      <div className="flex items-center gap-1 text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span className="text-[10px]">{task.estimatedTime}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => copyTaskDescription(task)}
                    className="p-2 opacity-0 group-hover:opacity-100 hover:bg-gray-600/50 rounded transition-all"
                    title="Copy task description"
                  >
                    {copiedId === task.id ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-gray-300 mb-3 leading-relaxed">
                  {task.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {task.tags.slice(0, 3).map((tag) => (
                      <span 
                        key={tag}
                        className="px-2 py-0.5 bg-gray-700/50 text-gray-300 rounded text-[9px] font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                    {task.tags.length > 3 && (
                      <span className="px-2 py-0.5 bg-gray-700/50 text-gray-400 rounded text-[9px]">
                        +{task.tags.length - 3}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-gray-400" />
                    <span className="text-[10px] text-gray-500">#{index + 1}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-800">
        <div className="flex items-start gap-2 text-xs text-gray-500">
          <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>
            These micro-tasks are designed to help you make meaningful daily commits. 
            Choose tasks that match your available time and energy level.
          </span>
        </div>
      </div>
    </div>
  );
};

export default MicroTaskGenerator;
